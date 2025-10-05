"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine, LogOut, BarChart3 } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { auth } from '@/lib/firebase/client';
import { toast } from 'sonner';

// Order status type
type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';

// Order summary interface
interface OrderSummary {
  fulfilled: number;
  pending: number;
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    fulfilled: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast.success('Sesión cerrada correctamente');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // Fetch order summary
  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        setLoading(true);
        
        // #TODO: For demo purposes, use mock data
        // In a real app, we would fetch this from Firestore
        setOrderSummary({
          fulfilled: 24,
          pending: 8,
        });
      } catch (error) {
        console.error('Error fetching order summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderSummary();
  }, []);

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Panel de Staff</h1>
        
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Staff Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user?.displayName?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="font-medium">{user?.displayName || 'Staff'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-3">Acciones rápidas</h2>
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <Button asChild className="w-full flex items-center gap-2 justify-center">
              <Link href="/staff/scan">
                <ScanLine className="h-5 w-5" />
                Escanear QR
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <h2 className="text-lg font-semibold mb-3">Estadísticas de hoy</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pedidos entregados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? '...' : orderSummary.fulfilled}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? '...' : orderSummary.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Events */}
      <h2 className="text-lg font-semibold mb-3">Eventos activos</h2>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Demo Festival</p>
              <p className="text-sm text-muted-foreground">Hoy</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/staff/scan">
                <ScanLine className="h-4 w-4 mr-2" />
                Escanear
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
