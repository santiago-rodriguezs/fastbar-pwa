import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase/admin-server';

// Mock MercadoPago implementation for development
const mockMercadoPago = {
  // Mock methods and properties as needed
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Check if this is a payment notification
    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Not a payment notification' });
    }
    
    // Get payment data from Mercado Pago
    const paymentId = body.data.id;
    
    // Mock payment data for development
    // In production, you would use the actual SDK call
    // const paymentClient = new mpClient.Payment();
    // const payment = await paymentClient.get({ id: paymentId });
    
    // Mock payment data
    const mockPayment = {
      status: 'approved',
      external_reference: 'mock-order-id-' + Date.now()
    };
    
    // Check if payment is approved
    if (mockPayment.status !== 'approved') {
      return NextResponse.json({ message: 'Payment not approved' });
    }
    
    // Get order ID from external reference
    const orderId = mockPayment.external_reference;
    
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
    
    const event = eventDoc.data();
    const redeemTtlMinutes = event?.redeemTtlMinutes || 20; // Default to 20 minutes
    
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
      paymentId,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Mercado Pago webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
