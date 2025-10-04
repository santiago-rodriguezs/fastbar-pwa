"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Sun, Wallet, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export default function OrderConfirmedPage({ params }: { params: { eventId: string } }) {
  const [timeRemaining, setTimeRemaining] = useState(20 * 60) // 20 minutes in seconds
  const [showDetails, setShowDetails] = useState(false)

  const orderNumber = "FB-2024-0342"
  const pin = "8472"

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const handleBrightness = () => {
    // Placeholder for brightness control
    alert("Función de brillo activada")
  }

  const handleAddToWallet = () => {
    // Placeholder for wallet integration
    alert("Agregar a Wallet (próximamente)")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-6 text-center">
        <div className="mb-2 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Pedido Confirmado</h1>
        <p className="mt-1 text-sm text-muted-foreground">Mostrá este QR en la barra</p>
      </header>

      {/* QR Code */}
      <main className="flex-1 px-6 py-8">
        <div className="mb-6 flex flex-col items-center">
          {/* QR Code Container */}
          <div className="mb-4 rounded-2xl bg-white p-8 shadow-lg">
            <QRCodeSVG value={`FASTBAR:${orderNumber}:${pin}`} size={240} level="H" includeMargin={false} />
          </div>

          {/* Order Info */}
          <div className="mb-4 text-center">
            <p className="mb-1 text-sm text-muted-foreground">Orden</p>
            <p className="mb-3 font-mono text-2xl font-bold text-foreground">{orderNumber}</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">PIN:</p>
              <p className="font-mono text-xl font-bold text-primary">{pin}</p>
            </div>
          </div>

          {/* Status Badge */}
          <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/10 text-primary">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente de entrega
          </Badge>

          {/* Timer */}
          <div className="mb-6 rounded-lg border border-border bg-card p-4 text-center">
            <p className="mb-1 text-sm text-muted-foreground">Tiempo de validez</p>
            <p className="font-mono text-3xl font-bold text-foreground">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-sm space-y-3">
            <Button onClick={handleBrightness} variant="outline" size="lg" className="h-12 w-full bg-transparent">
              <Sun className="mr-2 h-5 w-5" />
              Subir Brillo
            </Button>

            <Button onClick={handleAddToWallet} variant="outline" size="lg" className="h-12 w-full bg-transparent">
              <Wallet className="mr-2 h-5 w-5" />
              Añadir a Wallet
            </Button>
          </div>
        </div>

        {/* Order Details Toggle */}
        <div className="mx-auto max-w-sm">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-card/80"
          >
            <span className="font-semibold text-card-foreground">Ver Detalles del Pedido</span>
            {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3 rounded-lg border border-border bg-card p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fernet con Coca x2</span>
                <span className="font-medium text-foreground">$5,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cerveza Artesanal IPA x1</span>
                <span className="font-medium text-foreground">$1,800</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tequila Shot x3</span>
                <span className="font-medium text-foreground">$4,500</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary">$11,300</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="border-t border-border px-6 py-4">
        <Button asChild variant="outline" size="lg" className="h-12 w-full bg-transparent">
          <Link href="/orders">Ver Mis Órdenes</Link>
        </Button>
      </div>
    </div>
  )
}
