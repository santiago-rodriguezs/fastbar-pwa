"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode } from "lucide-react";
import Link from 'next/link';

export default function OrderQrPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Mock QR SVG
  const mockQrSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="100%" height="100%" fill="white" />
      <rect x="50" y="50" width="200" height="200" fill="none" stroke="black" stroke-width="2" />
      <rect x="75" y="75" width="150" height="150" fill="none" stroke="black" stroke-width="8" />
      <rect x="100" y="100" width="100" height="100" fill="none" stroke="black" stroke-width="16" />
      <text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle" dominant-baseline="middle">
        DEMO QR CODE
      </text>
    </svg>
  `;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto p-4 flex items-center justify-center min-h-screen">
        <p className="text-center text-muted-foreground">Generando código QR...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10">
          <Link href="/orders/mock-order-123">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Código QR</h1>
      </div>

      {/* QR Code */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Escanea para retirar tu pedido</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="bg-white p-4 rounded-lg shadow-sm" dangerouslySetInnerHTML={{ __html: mockQrSvg }} />
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <p className="text-muted-foreground text-sm">
            Muestra este código QR en la barra para retirar tu pedido
          </p>
        </CardFooter>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button asChild variant="outline">
          <Link href="/orders/mock-order-123">
            Volver a detalles del pedido
          </Link>
        </Button>
        <Button asChild>
          <Link href="/events">
            Volver a la tienda
          </Link>
        </Button>
      </div>
    </div>
  );
}
