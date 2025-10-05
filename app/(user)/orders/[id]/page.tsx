"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrDisplay } from '@/components/qr/qr-display';
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';

// Order status type
type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';

// Order item interface
interface OrderItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
}

// Order interface
interface Order {
  id: string;
  userId: string;
  eventId: string;
  items: OrderItem[];
  subtotalCents: number;
  paymentProvider: 'mp' | 'stripe';
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  fulfilledAt?: string;
  qrJwt?: string;
  qrExpiresAt?: string;
}

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format price in local currency
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });
  };

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Fetch order data from API
        const orderRes = await fetch(`/api/orders/${id}`);
        
        if (!orderRes.ok) {
          throw new Error('Error fetching order');
        }
        
        const orderData = await orderRes.json();
        setOrder(orderData);
        
        // If order is paid, fetch QR code
        if (orderData.status === 'PAID') {
          try {
            const qrRes = await fetch(`/api/orders/${id}/qr`);
            
            if (!qrRes.ok) {
              throw new Error('Error fetching QR code');
            }
            
            const qrSvg = await qrRes.text();
            setQrSvg(qrSvg);
            
            toast.success('¡Pago aprobado! Mostrá este QR para recibir tu pedido');
          } catch (qrError) {
            console.error('Error fetching QR:', qrError);
            
            // #TODO: For demo purposes, show a mock QR
            setQrSvg(`
              <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
                <rect width="100%" height="100%" fill="white" />
                <text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle">
                  QR demo – #TODO integrate qrcode lib
                </text>
                <rect x="50" y="100" width="200" height="100" fill="none" stroke="black" stroke-width="2" />
              </svg>
            `);
          }
        }
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('No se pudo cargar el pedido');
        
        // #TODO: For demo purposes, set mock order data
        const mockOrder: Order = {
          id: id as string,
          userId: 'demo-user',
          eventId: 'demo-event',
          items: [
            { productId: 'product-1', name: 'Cerveza Rubia', priceCents: 800, qty: 2 },
            { productId: 'product-3', name: 'Gin Tonic', priceCents: 1200, qty: 1 },
          ],
          subtotalCents: 2800,
          paymentProvider: 'mp',
          status: 'PAID',
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          qrExpiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        };
        
        setOrder(mockOrder);
        
        // Mock QR SVG
        setQrSvg(`
          <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
            <rect width="100%" height="100%" fill="white" />
            <text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle">
              QR demo – #TODO integrate qrcode lib
            </text>
            <rect x="50" y="100" width="200" height="100" fill="none" stroke="black" stroke-width="2" />
          </svg>
        `);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg">Cargando pedido...</p>
      </div>
    );
  }

  // Show error state
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-destructive">{error || 'Pedido no encontrado'}</p>
        <Button asChild className="mt-4">
          <Link href="/orders">Volver a mis pedidos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10">
          <Link href="/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Pedido #{id.substring(0, 8)}</h1>
      </div>

      {/* Order Status */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Estado del pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {order.status === 'PAID' && (
              <>
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span className="font-medium text-green-500">Pago aprobado</span>
              </>
            )}
            {order.status === 'FULFILLED' && (
              <>
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span className="font-medium text-green-500">Pedido entregado</span>
              </>
            )}
            {order.status === 'PENDING_PAYMENT' && (
              <span className="font-medium text-amber-500">Pendiente de pago</span>
            )}
            {order.status === 'EXPIRED' && (
              <span className="font-medium text-destructive">Expirado</span>
            )}
            {order.status === 'CANCELLED' && (
              <span className="font-medium text-destructive">Cancelado</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code (if paid) */}
      {order.status === 'PAID' && qrSvg && order.qrExpiresAt && (
        <div className="mb-6">
          <QrDisplay 
            qrSvg={qrSvg} 
            expiresAt={new Date(order.qrExpiresAt)} 
          />
        </div>
      )}

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Detalle del pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {order.items.map((item, index) => (
              <li key={index} className="py-2 flex justify-between">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">x{item.qty}</span>
                </div>
                <span>{formatPrice(item.priceCents * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Order Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Información</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fecha de compra:</dt>
              <dd>{new Date(order.createdAt).toLocaleString()}</dd>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fecha de pago:</dt>
                <dd>{new Date(order.paidAt).toLocaleString()}</dd>
              </div>
            )}
            {order.fulfilledAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fecha de entrega:</dt>
                <dd>{new Date(order.fulfilledAt).toLocaleString()}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Método de pago:</dt>
              <dd>
                {order.paymentProvider === 'mp' ? 'Mercado Pago' : 'Apple Pay'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
