"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

// Order status type
type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';

// Order interface
interface Order {
  id: string;
  userId: string;
  eventId: string;
  eventName?: string;
  subtotalCents: number;
  status: OrderStatus;
  createdAt: Date;
  paidAt?: Date;
  fulfilledAt?: Date;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Format price in local currency
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Get status badge
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <div className="flex items-center gap-1 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Pagado</span>
          </div>
        );
      case 'FULFILLED':
        return (
          <div className="flex items-center gap-1 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Entregado</span>
          </div>
        );
      case 'PENDING_PAYMENT':
        return (
          <div className="flex items-center gap-1 text-amber-500">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Pendiente</span>
          </div>
        );
      case 'EXPIRED':
      case 'CANCELLED':
        return (
          <div className="flex items-center gap-1 text-destructive">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-medium">
              {status === 'EXPIRED' ? 'Expirado' : 'Cancelado'}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        if (!user?.uid) {
          return;
        }
        
        // Fetch orders from Firestore
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        
        if (ordersSnapshot.empty) {
          // No orders found, use mock data
          const mockOrders: Order[] = [
            {
              id: 'mock-order-1',
              userId: user.uid,
              eventId: 'demo-event',
              eventName: 'Demo Festival',
              subtotalCents: 2800,
              status: 'PAID',
              createdAt: new Date(),
              paidAt: new Date(),
            },
            {
              id: 'mock-order-2',
              userId: user.uid,
              eventId: 'demo-event',
              eventName: 'Demo Festival',
              subtotalCents: 1200,
              status: 'FULFILLED',
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
              paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
              fulfilledAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
            },
            {
              id: 'mock-order-3',
              userId: user.uid,
              eventId: 'demo-event-2',
              eventName: 'Fiesta de Halloween',
              subtotalCents: 1800,
              status: 'PENDING_PAYMENT',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
          ];
          
          setOrders(mockOrders);
        } else {
          // Map Firestore documents to Order objects
          const fetchedOrders = await Promise.all(
            ordersSnapshot.docs.map(async (doc) => {
              const data = doc.data();
              
              // Fetch event name
              let eventName = 'Evento';
              try {
                const eventDoc = await db.collection('events').doc(data.eventId).get();
                if (eventDoc.exists) {
                  eventName = eventDoc.data()?.name || 'Evento';
                }
              } catch (e) {
                console.error('Error fetching event name:', e);
              }
              
              return {
                id: doc.id,
                userId: data.userId,
                eventId: data.eventId,
                eventName,
                subtotalCents: data.subtotalCents,
                status: data.status,
                createdAt: data.createdAt.toDate(),
                paidAt: data.paidAt ? data.paidAt.toDate() : undefined,
                fulfilledAt: data.fulfilledAt ? data.fulfilledAt.toDate() : undefined,
              };
            })
          );
          
          setOrders(fetchedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        
        // #TODO: Use mock data for demo purposes
        if (user?.uid) {
          const mockOrders: Order[] = [
            {
              id: 'mock-order-1',
              userId: user.uid,
              eventId: 'demo-event',
              eventName: 'Demo Festival',
              subtotalCents: 2800,
              status: 'PAID',
              createdAt: new Date(),
              paidAt: new Date(),
            },
            {
              id: 'mock-order-2',
              userId: user.uid,
              eventId: 'demo-event',
              eventName: 'Demo Festival',
              subtotalCents: 1200,
              status: 'FULFILLED',
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
              paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
              fulfilledAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
            },
            {
              id: 'mock-order-3',
              userId: user.uid,
              eventId: 'demo-event-2',
              eventName: 'Fiesta de Halloween',
              subtotalCents: 1800,
              status: 'PENDING_PAYMENT',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
          ];
          
          setOrders(mockOrders);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10">
          <Link href="/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Mis pedidos</h1>
      </div>

      {/* Orders List */}
      {loading ? (
        <p className="text-center py-8">Cargando pedidos...</p>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <Link href={`/orders/${order.id}`} className="block">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{order.eventName || 'Evento'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-muted-foreground">
                      Pedido #{order.id.substring(0, 8)}
                    </p>
                    <p className="font-semibold">{formatPrice(order.subtotalCents)}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No tenés pedidos</p>
            <Button asChild className="mt-4">
              <Link href="/events">Ver eventos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
