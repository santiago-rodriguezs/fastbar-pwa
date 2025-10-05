"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BarChart3, Users, Calendar, ShoppingCart } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { auth } from '@/lib/firebase/client';
import { toast } from 'sonner';

// Dashboard stats interface
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  activeEvents: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  // Format currency
  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });
  };

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

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // #TODO: For demo purposes, use mock data
        // In a real app, we would fetch this from Firestore
        setStats({
          totalOrders: 156,
          totalRevenue: 12580000, // In cents (125,800.00)
          totalUsers: 423,
          activeEvents: 3,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Panel de Admin</h1>
        
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Admin Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user?.displayName?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-medium">{user?.displayName || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <h2 className="text-lg font-semibold mb-3">Estadísticas generales</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? '...' : stats.totalOrders}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Eventos activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? '...' : stats.activeEvents}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? '...' : formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <h2 className="text-lg font-semibold mb-3">Eventos recientes</h2>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <p className="font-medium">Demo Festival</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hoy</span>
                <span className="font-medium text-green-500">Activo</span>
              </div>
            </div>
            
            <div>
              <p className="font-medium">Fiesta de Halloween</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">31/10/2025</span>
                <span className="font-medium text-green-500">Activo</span>
              </div>
            </div>
            
            <div>
              <p className="font-medium">Concierto Rock</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">15/09/2025</span>
                <span className="font-medium text-muted-foreground">Finalizado</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="flex-1">Crear evento</Button>
        <Button variant="outline" className="flex-1">Ver reportes</Button>
      </div>
    </div>
  );
}
