import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as qrcode from 'qrcode';
import jwt from 'jsonwebtoken';
import { db, auth } from '@/lib/firebase/admin-server';

export async function GET(
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
    
    // Verify session
    const decodedToken = await auth.verifySessionCookie(sessionCookie);
    const userId = decodedToken.uid;
    
    // Get order from Firestore
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = orderDoc.data();
    
    // Check if user owns the order
    if (order?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if order is paid
    if (order?.status !== 'PAID') {
      return NextResponse.json({ error: 'Order not paid' }, { status: 400 });
    }
    
    // Check if QR JWT exists
    if (!order?.qrJwt) {
      return NextResponse.json({ error: 'QR not generated' }, { status: 400 });
    }
    
    // Generate QR code as SVG
    const qrSvg = await qrcode.toString(order.qrJwt, {
      type: 'svg',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    
    // Return SVG
    return new NextResponse(qrSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    
    // #TODO: Return mock QR for demo purposes
    const mockQrSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <rect width="100%" height="100%" fill="white" />
        <text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle">
          QR demo – #TODO integrate qrcode lib
        </text>
        <rect x="50" y="100" width="200" height="100" fill="none" stroke="black" stroke-width="2" />
      </svg>
    `;
    
    return new NextResponse(mockQrSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }
}
