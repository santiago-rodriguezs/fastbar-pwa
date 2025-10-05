"use client";

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScanLine, FlashlightIcon, Vibrate } from "lucide-react";
import { toast } from 'sonner';

interface QrScannerProps {
  onScan: (qrJwt: string) => Promise<void>;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-reader';

  // Initialize scanner
  useEffect(() => {
    scannerRef.current = new Html5Qrcode(scannerDivId);

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Start scanning
  const startScanner = async () => {
    try {
      if (!scannerRef.current) return;

      const qrCodeSuccessCallback = async (decodedText: string) => {
        try {
          // Vibrate if supported
          if ('vibrate' in navigator) {
            navigator.vibrate(200);
          }
          
          // Stop scanning while processing
          await scannerRef.current?.stop();
          setScanning(false);
          
          // Process QR code
          await onScan(decodedText);
        } catch (error) {
          console.error('Error processing QR code:', error);
          toast.error('Error al procesar el código QR');
          
          // Restart scanning
          startScanner();
        }
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback
      );
      
      setScanning(true);
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      toast.error('No se pudo iniciar el escáner. Verifica los permisos de cámara.');
      
      // #TODO: For demo purposes, simulate a successful scan
      if (process.env.NODE_ENV !== 'production') {
        setTimeout(() => {
          if ('vibrate' in navigator) {
            navigator.vibrate(200);
          }
          onScan('demo.mock.jwt');
        }, 3000);
      }
    }
  };

  // Stop scanning
  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        setScanning(false);
        setTorchOn(false);
      }
    } catch (error) {
      console.error('Error stopping QR scanner:', error);
    }
  };

  // Toggle flashlight
  const toggleTorch = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.toggleFlash();
        setTorchOn(!torchOn);
        toast.success(torchOn ? 'Linterna apagada' : 'Linterna encendida');
      }
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      toast.error('No se pudo controlar la linterna');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardContent className="p-4">
          {/* Scanner container */}
          <div className="relative">
            <div 
              id={scannerDivId} 
              className="w-full h-[300px] bg-black/10 rounded-lg overflow-hidden"
            />
            
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                <ScanLine className="h-16 w-16 text-primary mb-4" />
                <p className="text-white text-center px-4">
                  Presiona "Iniciar escaneo" para leer códigos QR
                </p>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex gap-2 mt-4">
            {scanning ? (
              <Button 
                variant="destructive" 
                className="flex-1" 
                onClick={stopScanner}
              >
                Detener escaneo
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="flex-1" 
                onClick={startScanner}
              >
                Iniciar escaneo
              </Button>
            )}
            
            <Button 
              variant={torchOn ? "secondary" : "outline"} 
              onClick={toggleTorch}
              disabled={!scanning}
            >
              <FlashlightIcon className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          <Vibrate className="h-4 w-4" /> 
          El dispositivo vibrará al escanear un código
        </p>
      </div>
    </div>
  );
}
