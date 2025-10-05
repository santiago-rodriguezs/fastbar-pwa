"use client";

import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SunMedium } from "lucide-react";
import { formatRemainingTime, getRemainingTimeInSeconds } from '@/lib/qr/qr-utils';

interface QrDisplayProps {
  qrSvg: string;
  expiresAt: Date;
}

export function QrDisplay({ qrSvg, expiresAt }: QrDisplayProps) {
  const [brightness, setBrightness] = useState(100);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate and update remaining time
  useEffect(() => {
    const calculateRemainingTime = () => {
      const seconds = getRemainingTimeInSeconds(expiresAt);
      setRemainingTime(seconds);
      setIsExpired(seconds <= 0);
    };

    // Calculate initial time
    calculateRemainingTime();

    // Update every second
    const interval = setInterval(calculateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Handle brightness change
  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0]);
    // Apply brightness to screen
    document.documentElement.style.filter = `brightness(${value[0]}%)`;
  };

  // Reset brightness when component unmounts
  useEffect(() => {
    return () => {
      document.documentElement.style.filter = 'brightness(100%)';
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
      {/* QR Code Display */}
      <Card className={`w-full ${isExpired ? 'opacity-50' : ''}`}>
        <CardContent className="p-6 flex flex-col items-center">
          {/* QR Code */}
          <div 
            className="bg-white p-4 rounded-lg shadow-sm w-full max-w-xs mx-auto"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          
          {/* Timer */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Código válido por:</p>
            <p className={`text-2xl font-mono font-bold ${remainingTime < 60 ? 'text-destructive' : ''}`}>
              {formatRemainingTime(remainingTime)}
            </p>
          </div>
          
          {isExpired && (
            <div className="mt-4 p-2 bg-destructive/10 text-destructive rounded-md text-center">
              <p className="font-semibold">¡Código expirado!</p>
              <p className="text-sm">Por favor, solicita un nuevo código</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brightness Control */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <SunMedium className="h-5 w-5 text-yellow-500" />
            <Slider
              value={[brightness]}
              onValueChange={handleBrightnessChange}
              min={50}
              max={150}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-10 text-right">{brightness}%</span>
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => handleBrightnessChange([150])}
          >
            Subir brillo al máximo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
