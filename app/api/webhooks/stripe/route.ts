import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase/admin-server';
import { DocumentData } from 'firebase-admin/firestore';

// Mock types for development
type MockEvent = {
  type: string;
  data: {
    object: {
      id: string;
      status: string;
      metadata: {
        orderId: string;
      };
    };
  };
};

// Mock Stripe implementation for development
const mockStripe = {
  webhooks: {
    constructEvent: (body: string, signature: string, secret: string): MockEvent => ({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_mock_' + Date.now(),
          status: 'succeeded',
          metadata: {
            orderId: 'mock-order-id-' + Date.now(),
          },
        },
      },
    }),
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    // In Next.js 15, headers() returns the headers directly
    const headersList = headers();
    const signature = headersList.get('stripe-signature') || '';
    
    // Mock webhook verification for development
    let event: MockEvent;
    try {
      // In production, you would use the actual Stripe SDK
      // event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
      
      // For development, use the mock implementation
      event = mockStripe.webhooks.constructEvent(body, signature, 'mock_secret');
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // Handle payment intent succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
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
      
      const order = orderDoc.data() as {
        status?: string;
        eventId?: string;
      } | undefined;
      
      // Check if order is already paid
      if (order?.status === 'PAID' || order?.status === 'FULFILLED') {
        return NextResponse.json({ message: 'Order already processed' });
      }
      
      // Get event data to determine QR expiration
      const eventId = order?.eventId;
      if (!eventId) {
        return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
      }
      
      const eventRef = db.collection('events').doc(eventId);
      const eventDoc = await eventRef.get();
      
      if (!eventDoc.exists) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      
      const eventData = eventDoc.data() as {
        redeemTtlMinutes?: number;
      } | undefined;
      
      const redeemTtlMinutes = eventData?.redeemTtlMinutes || 20; // Default to 20 minutes
      
      // Generate JWT for QR code
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (redeemTtlMinutes * 60 * 1000));
      
      const qrJwt = jwt.sign(
        {
          orderId,
          eventId,
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
