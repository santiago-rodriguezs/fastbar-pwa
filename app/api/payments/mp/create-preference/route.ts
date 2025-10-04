import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mercadopago from 'mercadopago';
import { db, auth } from '@/lib/firebase/admin';

// Initialize Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedToken = await auth.verifySessionCookie(sessionCookie);
    const userId = decodedToken.uid;
    
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
    
    const event = eventDoc.data();
    
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
      paymentProvider: 'mp',
      status: 'PENDING_PAYMENT',
      createdAt: new Date(),
    });
    
    // Create Mercado Pago preference
    const preference = {
      items: products.map(product => ({
        id: product.id,
        title: product.name,
        quantity: product.qty,
        unit_price: product.priceCents / 100, // Convert cents to currency units
        currency_id: 'ARS', // Change according to your country
      })),
      external_reference: orderRef.id,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderRef.id}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderRef.id}`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mp`,
    };
    
    const response = await mercadopago.preferences.create(preference);
    
    return NextResponse.json({
      preferenceId: response.body.id,
      init_point: response.body.init_point,
      orderId: orderRef.id,
    });
  } catch (error) {
    console.error('Error creating MP preference:', error);
    
    // #TODO: Return mock data for demo purposes
    const mockPreference = { 
      id: "mock_pref_123", 
      init_point: "/mock/payment",
      orderId: "mock-order-123"
    };
    
    return NextResponse.json(mockPreference);
  }
}
