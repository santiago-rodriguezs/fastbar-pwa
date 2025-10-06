"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, QrCode } from "lucide-react";
import Link from 'next/link';

// Mock order data
const mockOrder = {
  id: 'mock-order-123',
  status: 'COMPLETED',
  createdAt: new Date().toISOString(),
  items: [
    { productId: 'product-1', name: 'Cerveza Rubia', priceCents: 800, qty: 2 },
    { productId: 'product-3', name: 'Gin Tonic', priceCents: 1200, qty: 1 },
  ],
  subtotalCents: 2800,
  eventName: 'Demo Festival',
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState(mockOrder);

  // Format price in local currency
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto p-4 flex items-center justify-center min-h-screen">
        <p className="text-center text-muted-foreground">Cargando pedido...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10">
          <Link href="/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Detalle del pedido</h1>
      </div>

      {/* Order Status */}
      <Card className="mb-6">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">¡Pedido confirmado!</h2>
          <p className="text-muted-foreground mb-4">Tu pedido ha sido procesado correctamente.</p>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status === 'COMPLETED' ? 'Completado' : 
             order.status === 'PENDING_PAYMENT' ? 'Pendiente de pago' : 
             order.status === 'CANCELLED' ? 'Cancelado' : order.status}
          </div>
        </CardContent>
      </Card>

      {/* Order Info */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Información del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Número de pedido:</span>
            <span className="font-medium">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Evento:</span>
            <span>{order.eventName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item.productId} className="py-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Cantidad: {item.qty}</p>
                  </div>
                  <span>{formatPrice(item.priceCents * item.qty)}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">{formatPrice(order.subtotalCents)}</span>
        </CardFooter>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/orders/mock-order-123/qr" className="flex items-center gap-2 justify-center">
            <QrCode className="h-5 w-5" />
            Ver código QR para retirar
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/events">
            Volver a la tienda
          </Link>
        </Button>
      </div>
    </div>
  );
}
