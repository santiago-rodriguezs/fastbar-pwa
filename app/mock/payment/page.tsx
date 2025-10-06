"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function MockPaymentPage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate payment processing delay
    const timer = setTimeout(() => {
      // Redirect directly to the QR page after 3 seconds
      router.push('/orders/mock-order-123/qr');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">¡Pago procesado!</h1>
          <p className="text-muted-foreground mb-6">
            Tu pago está siendo procesado. Serás redirigido automáticamente...
          </p>
          <Button 
            className="w-full" 
            onClick={() => router.push('/orders/mock-order-123/qr')}
          >
            Ver mi código QR
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
