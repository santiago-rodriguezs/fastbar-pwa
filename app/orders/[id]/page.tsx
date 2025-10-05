"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Sun, Wallet } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [timeRemaining, setTimeRemaining] = useState(15 * 60)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild className="h-10 w-10">
            <Link href="/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Orden {params.id}</h1>
            <p className="text-xs text-muted-foreground">Noche Electrónica</p>
          </div>
        </div>
      </header>

      {/* QR Code */}
      <main className="flex-1 px-6 py-8">
        <div className="flex flex-col items-center">
          <div className="mb-4 rounded-2xl bg-white p-8 shadow-lg">
            <QRCodeSVG value={`FASTBAR:${params.id}:8472`} size={240} level="H" includeMargin={false} />
          </div>

          <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/10 text-primary">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente de entrega
          </Badge>

          <div className="mb-6 rounded-lg border border-border bg-card p-4 text-center">
            <p className="mb-1 text-sm text-muted-foreground">Tiempo restante</p>
            <p className="font-mono text-3xl font-bold text-foreground">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <Button variant="outline" size="lg" className="h-12 w-full bg-transparent">
              <Sun className="mr-2 h-5 w-5" />
              Subir Brillo
            </Button>

            <Button variant="outline" size="lg" className="h-12 w-full bg-transparent">
              <Wallet className="mr-2 h-5 w-5" />
              Añadir a Wallet
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
