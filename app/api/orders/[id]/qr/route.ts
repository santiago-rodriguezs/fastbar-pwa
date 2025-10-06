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
    
    // TODO: Allow unauthenticated access for demo purposes
    let userId = 'demo-user';
    
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (sessionCookie) {
      try {
        // Verify session
        const decodedToken = await auth.verifySessionCookie(sessionCookie);
        userId = decodedToken.uid;
      } catch (error) {
        console.log('Session verification failed, using demo user');
      }
    }
    
    // Get order from Firestore
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = orderDoc.data();
    
    // TODO: Skip ownership check for demo purposes
    // For production, uncomment the following check
    /*
    if (order?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    */
    
    // TODO: Skip payment status check for demo purposes
    // For production, uncomment the following check
    /*
    if (order?.status !== 'PAID') {
      return NextResponse.json({ error: 'Order not paid' }, { status: 400 });
    }
    */
    
    // TODO: Skip QR JWT check for demo purposes
    // For production, uncomment the following check
    /*
    if (!order?.qrJwt) {
      return NextResponse.json({ error: 'QR not generated' }, { status: 400 });
    }
    */
    
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
