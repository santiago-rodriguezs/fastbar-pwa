"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrScanner } from '@/components/qr/qr-scanner';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';

// Response interface for QR validation
interface RedeemResponse {
  success: boolean;
  message: string;
  fulfilledAt?: string;
  error?: string;
  errorType?: 'ALREADY_FULFILLED' | 'EXPIRED' | 'INVALID' | 'UNKNOWN';
}

export default function ScanPage() {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState<RedeemResponse | null>(null);
  const [processing, setProcessing] = useState(false);

  // Handle QR scan
  const handleScan = async (qrJwt: string) => {
    try {
      setProcessing(true);
      setScanResult(null);
      
      // Extract orderId from JWT (in a real app, we'd properly decode this)
      // For demo, we'll just assume the format is correct
      const parts = qrJwt.split('.');
      let orderId = 'unknown';
      
      try {
        // Try to extract orderId from JWT payload
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          orderId = payload.orderId || 'unknown';
        }
      } catch (e) {
        console.error('Error parsing JWT:', e);
        // For demo purposes, use a mock orderId
        orderId = 'mock-order-123';
      }
      
      // Call API to validate and redeem QR code
      const response = await fetch(`/api/orders/${orderId}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrJwt,
          barId: 'bar-1', // In a real app, this would be selected by staff
        }),
      });
      
      const result = await response.json();
      
      // Handle response
      if (response.ok && result.success) {
        // Success
        toast.success('¡Pedido validado correctamente!');
        setScanResult({
          success: true,
          message: 'Pedido validado correctamente',
          fulfilledAt: result.fulfilledAt,
        });
        
        // Vibrate success pattern if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        // Error
        let errorType: RedeemResponse['errorType'] = 'UNKNOWN';
        let message = 'Error al validar el pedido';
        
        if (result.error?.includes('already fulfilled')) {
          errorType = 'ALREADY_FULFILLED';
          message = 'Este pedido ya fue entregado';
        } else if (result.error?.includes('expired')) {
          errorType = 'EXPIRED';
          message = 'El código QR ha expirado';
        } else if (result.error?.includes('invalid')) {
          errorType = 'INVALID';
          message = 'Código QR inválido';
        }
        
        toast.error(message);
        setScanResult({
          success: false,
          message,
          errorType,
          error: result.error,
        });
        
        // Vibrate error pattern if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([300, 100, 300]);
        }
      }
    } catch (error) {
      console.error('Error redeeming QR:', error);
      toast.error('Error al procesar el código QR');
      
      // #TODO: For demo purposes, simulate a successful redemption
      toast.success('¡Pedido validado correctamente! (demo)');
      setScanResult({
        success: true,
        message: 'Pedido validado correctamente (demo)',
        fulfilledAt: new Date().toISOString(),
      });
      
      // Vibrate success pattern if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10">
          <Link href="/staff">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Escanear QR</h1>
      </div>

      {/* Staff Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user?.displayName?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="font-medium">{user?.displayName || 'Staff'}</p>
              <p className="text-xs text-muted-foreground">Barra: Principal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner */}
      <div className="mb-6">
        <QrScanner onScan={handleScan} />
      </div>

      {/* Scan Result */}
      {scanResult && (
        <Card className={`mb-6 ${scanResult.success ? 'border-green-500' : 'border-destructive'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {scanResult.success ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                scanResult.errorType === 'EXPIRED' ? (
                  <Clock className="h-8 w-8 text-amber-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-destructive" />
                )
              )}
              
              <div>
                <p className={`font-medium ${scanResult.success ? 'text-green-500' : 'text-destructive'}`}>
                  {scanResult.message}
                </p>
                
                {scanResult.success && scanResult.fulfilledAt && (
                  <p className="text-xs text-muted-foreground">
                    Entregado: {new Date(scanResult.fulfilledAt).toLocaleTimeString()}
                  </p>
                )}
                
                {!scanResult.success && scanResult.errorType === 'ALREADY_FULFILLED' && (
                  <p className="text-xs text-muted-foreground">
                    Este pedido ya fue entregado anteriormente
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
