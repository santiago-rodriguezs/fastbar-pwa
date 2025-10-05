"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, Wallet } from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';

// Cart item interface
interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
}

// Mock cart data
const mockCartItems: CartItem[] = [
  { productId: 'product-1', name: 'Cerveza Rubia', priceCents: 800, qty: 2 },
  { productId: 'product-3', name: 'Gin Tonic', priceCents: 1200, qty: 1 },
];

// Mock event data
const mockEvent = {
  id: 'demo-event',
  name: 'Demo Festival',
};

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [loading, setLoading] = useState(false);

  // Calculate subtotal
  const subtotalCents = cartItems.reduce((total, item) => {
    return total + (item.priceCents * item.qty);
  }, 0);

  // Format price in local currency
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });
  };

  // Update item quantity
  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    
    setCartItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, qty: newQty } : item
    ));
  };

  // Remove item from cart
  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
    toast.success('Producto eliminado del carrito');
  };

  // Check if Apple Pay is available
  const isApplePayAvailable = () => {
    return (
      typeof window !== 'undefined' &&
      window.navigator.userAgent.includes('Safari') &&
      window.navigator.userAgent.includes('iPhone')
    );
  };

  // Handle Mercado Pago checkout
  const handleMercadoPagoCheckout = async () => {
    try {
      setLoading(true);
      
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: mockEvent.id,
          items: cartItems.map(item => ({
            productId: item.productId,
            qty: item.qty,
          })),
        }),
      });
      
      if (!orderResponse.ok) {
        throw new Error('Error creating order');
      }
      
      const { orderId } = await orderResponse.json();
      
      // Create Mercado Pago preference
      const mpResponse = await fetch('/api/payments/mp/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: mockEvent.id,
          items: cartItems.map(item => ({
            productId: item.productId,
            qty: item.qty,
          })),
        }),
      });
      
      if (!mpResponse.ok) {
        throw new Error('Error creating Mercado Pago preference');
      }
      
      const { preferenceId, init_point } = await mpResponse.json();
      
      // Redirect to Mercado Pago checkout
      window.location.href = init_point;
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('Error al procesar el pago');
      
      // #TODO: For demo purposes, redirect to a mock order page
      router.push('/orders/mock-order-123');
    } finally {
      setLoading(false);
    }
  };

  // Handle Apple Pay checkout
  const handleApplePayCheckout = async () => {
    try {
      setLoading(true);
      
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: mockEvent.id,
          items: cartItems.map(item => ({
            productId: item.productId,
            qty: item.qty,
          })),
        }),
      });
      
      if (!orderResponse.ok) {
        throw new Error('Error creating order');
      }
      
      const { orderId } = await orderResponse.json();
      
      // Create Stripe payment intent
      const stripeResponse = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: subtotalCents,
          currency: 'usd',
          eventId: mockEvent.id,
          items: cartItems.map(item => ({
            productId: item.productId,
            qty: item.qty,
          })),
        }),
      });
      
      if (!stripeResponse.ok) {
        throw new Error('Error creating Stripe payment intent');
      }
      
      const { clientSecret } = await stripeResponse.json();
      
      // #TODO: Initialize Apple Pay session with Stripe
      // This would normally use the Stripe.js library
      
      // For demo purposes, just redirect to the order page
      router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error processing Apple Pay:', error);
      toast.error('Error al procesar el pago con Apple Pay');
      
      // #TODO: For demo purposes, redirect to a mock order page
      router.push('/orders/mock-order-456');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10">
          <Link href="/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Tu pedido</h1>
      </div>

      {/* Event Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="font-semibold">{mockEvent.name}</h2>
        </CardContent>
      </Card>

      {/* Cart Items */}
      {cartItems.length > 0 ? (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {cartItems.map((item) => (
                <li key={item.productId} className="py-3">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{item.name}</span>
                    <span>{formatPrice(item.priceCents * item.qty)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.qty - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.qty}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.qty + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatPrice(subtotalCents)}</span>
          </CardFooter>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Tu carrito está vacío</p>
            <Button asChild className="mt-4">
              <Link href="/events">Ver eventos</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Options */}
      {cartItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Método de pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full flex items-center gap-2 justify-center"
              onClick={handleMercadoPagoCheckout}
              disabled={loading}
            >
              <Wallet className="h-5 w-5" />
              Pagar con Mercado Pago
            </Button>
            
            {isApplePayAvailable() && (
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 justify-center"
                onClick={handleApplePayCheckout}
                disabled={loading}
              >
                <CreditCard className="h-5 w-5" />
                Pagar con Apple Pay
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
