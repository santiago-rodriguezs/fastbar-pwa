import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, auth } from '@/lib/firebase/admin-server';

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    // TODO: Allow unauthenticated requests for demo purposes
    let userId = 'demo-user';
    
    if (sessionCookie) {
      try {
        // Verify session
        const decodedToken = await auth.verifySessionCookie(sessionCookie);
        userId = decodedToken.uid;
      } catch (error) {
        console.log('Session verification failed, using demo user');
      }
    }
    
    // Parse request body
    const body = await request.json();
    const { eventId, items } = body;
    
    if (!eventId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    // Get event data
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Get product details for each item
    const productPromises = items.map(async (item: { productId: string, qty: number }) => {
      const productDoc = await db.collection('events').doc(eventId)
        .collection('products').doc(item.productId).get();
      
      if (!productDoc.exists) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      const product = productDoc.data();
      return {
        ...product,
        id: productDoc.id,
        qty: item.qty,
      };
    });
    
    const products = await Promise.all(productPromises);
    
    // Calculate total
    const subtotalCents = products.reduce((total, product) => {
      return total + (product.priceCents * product.qty);
    }, 0);
    
    // Create order in Firestore
    const orderRef = await db.collection('orders').add({
      userId,
      eventId,
      items: products.map(product => ({
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        qty: product.qty,
      })),
      subtotalCents,
      status: 'PENDING_PAYMENT',
      createdAt: new Date(),
    });
    
    return NextResponse.json({
      orderId: orderRef.id,
      subtotalCents,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    // #TODO: Return mock data for demo purposes
    return NextResponse.json({
      orderId: 'mock-order-789',
      subtotalCents: 1500,
    });
  }
}
