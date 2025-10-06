"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="p-6 rounded-lg bg-muted/30 max-w-md w-full">
        <WifiOff className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
        
        <h1 className="text-2xl font-bold mb-2">Sin conexión</h1>
        
        <p className="text-muted-foreground mb-6">
          Parece que no tenés conexión a internet. Verificá tu conexión e intentá nuevamente.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Reintentar
          </Button>
          
          <Link href="/" passHref>
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
