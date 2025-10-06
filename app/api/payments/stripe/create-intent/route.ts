import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, auth } from '@/lib/firebase/admin-server';

// Mock Stripe implementation for development
const mockStripe = {
  paymentIntents: {
    create: async (options: any) => ({
      client_secret: 'mock_secret_' + Date.now(),
      id: 'pi_mock_' + Date.now(),
    }),
  },
};

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedToken = await auth.verifySessionCookie(sessionCookie);
    const userId = decodedToken.uid;
    
    // Parse request body
    const body = await request.json();
    const { amount, currency = 'usd', eventId, items } = body;
    
    if (!amount || !eventId || !items || !Array.isArray(items) || items.length === 0) {
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
      paymentProvider: 'stripe',
      status: 'PENDING_PAYMENT',
      createdAt: new Date(),
    });
    
    // Create Stripe payment intent
    const paymentIntent = await mockStripe.paymentIntents.create({
      amount: subtotalCents,
      currency,
      metadata: {
        orderId: orderRef.id,
        userId,
        eventId,
      },
    });
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderRef.id,
    });
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    
    // #TODO: Return mock data for demo purposes
    const mockPaymentIntent = { 
      id: "pi_mock", 
      client_secret: "mock_secret",
      orderId: "mock-order-456"
    };
    
    return NextResponse.json(mockPaymentIntent);
  }
}
