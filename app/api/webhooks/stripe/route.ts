import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase/admin';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature') || '';
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // Handle payment intent succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;
      
      if (!orderId) {
        return NextResponse.json({ error: 'No order ID found' }, { status: 400 });
      }
      
      // Get order from Firestore
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();
      
      if (!orderDoc.exists) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      const order = orderDoc.data();
      
      // Check if order is already paid
      if (order?.status === 'PAID' || order?.status === 'FULFILLED') {
        return NextResponse.json({ message: 'Order already processed' });
      }
      
      // Get event data to determine QR expiration
      const eventRef = db.collection('events').doc(order?.eventId);
      const eventDoc = await eventRef.get();
      
      if (!eventDoc.exists) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      
      const eventData = eventDoc.data();
      const redeemTtlMinutes = eventData?.redeemTtlMinutes || 20; // Default to 20 minutes
      
      // Generate JWT for QR code
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (redeemTtlMinutes * 60 * 1000));
      
      const qrJwt = jwt.sign(
        {
          orderId,
          eventId: order?.eventId,
          exp: Math.floor(expiresAt.getTime() / 1000),
        },
        process.env.QR_JWT_SECRET || ''
      );
      
      // Update order status to PAID
      await orderRef.update({
        status: 'PAID',
        paidAt: now,
        qrJwt,
        qrExpiresAt: expiresAt,
        paymentId: paymentIntent.id,
      });
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
