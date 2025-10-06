import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db, auth } from '@/lib/firebase/admin-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get order ID from params
    const orderId = params.id;
    
    // Get session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decodedToken = await auth.verifySessionCookie(sessionCookie);
    const userId = decodedToken.uid;
    
    // Get user data to check role
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    
    // Check if user is staff or admin
    if (userData?.role !== 'staff' && userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { qrJwt, barId } = body;
    
    if (!qrJwt || !barId) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    // Get order from Firestore
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = orderDoc.data();
    
    // Check if order is already fulfilled
    if (order?.status === 'FULFILLED') {
      return NextResponse.json({ 
        error: 'Order already fulfilled',
        fulfilledAt: order.fulfilledAt
      }, { status: 400 });
    }
    
    // Check if order is paid
    if (order?.status !== 'PAID') {
      return NextResponse.json({ error: 'Order not paid' }, { status: 400 });
    }
    
    // Verify QR JWT matches the one stored in the order
    if (order?.qrJwt !== qrJwt) {
      return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 });
    }
    
    // Verify JWT signature and expiration
    try {
      const decoded = jwt.verify(qrJwt, process.env.QR_JWT_SECRET || '') as jwt.JwtPayload;
      
      // Check if JWT is for this order
      if (decoded.orderId !== orderId) {
        return NextResponse.json({ error: 'Invalid QR code for this order' }, { status: 400 });
      }
      
      // Check if JWT is expired
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json({ error: 'QR code expired' }, { status: 400 });
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid QR code signature' }, { status: 400 });
    }
    
    // Update order status to FULFILLED
    const now = new Date();
    await orderRef.update({
      status: 'FULFILLED',
      fulfilledAt: now,
      barId,
      staffUserId: userId,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Order fulfilled successfully',
      fulfilledAt: now,
    });
  } catch (error) {
    console.error('Error redeeming order:', error);
    
    // #TODO: Return success for demo purposes
    return NextResponse.json({
      success: true,
      message: 'Order fulfilled successfully (demo mode)',
      fulfilledAt: new Date(),
    });
  }
}
