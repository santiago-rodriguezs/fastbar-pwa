"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Flashlight, LogOut, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function StaffScannerPage() {
  const [selectedEvent, setSelectedEvent] = useState("1")
  const [selectedBar, setSelectedBar] = useState("bar-1")
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [scannedOrder, setScannedOrder] = useState<any>(null)

  const simulateScan = (status: "valid" | "expired" | "already-used") => {
    const mockOrders = {
      valid: {
        id: "FB-2024-0342",
        items: [
          { name: "Fernet con Coca", quantity: 2 },
          { name: "Cerveza Artesanal IPA", quantity: 1 },
          { name: "Tequila Shot", quantity: 3 },
        ],
        time: "23:45",
        status: "valid",
      },
      expired: {
        id: "FB-2024-0298",
        items: [{ name: "Mojito", quantity: 2 }],
        time: "22:10",
        status: "expired",
      },
      "already-used": {
        id: "FB-2024-0341",
        items: [{ name: "Cerveza", quantity: 2 }],
        time: "22:30",
        status: "already-used",
      },
    }

    setScannedOrder(mockOrders[status])
  }

  const handleDeliver = () => {
    setScannedOrder(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Scanner Staff</h1>
          <Button variant="ghost" size="icon" asChild className="h-10 w-10">
            <Link href="/staff/login">
              <LogOut className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Event & Bar Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Evento</label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Noche Electrónica</SelectItem>
                <SelectItem value="2">Sunset Rooftop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Barra</label>
            <Select value={selectedBar} onValueChange={setSelectedBar}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar-1">Barra 1</SelectItem>
                <SelectItem value="bar-2">Barra 2</SelectItem>
                <SelectItem value="bar-3">Barra 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Scanner View */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        {!scannedOrder ? (
          <>
            {/* Camera Placeholder */}
            <div className="relative mb-6 flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border-4 border-primary/50 bg-muted">
              <Camera className="h-24 w-24 text-muted-foreground" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 rounded-lg border-4 border-primary" />
              </div>
            </div>

            <p className="mb-6 text-center text-sm text-muted-foreground">Apuntá la cámara al código QR del cliente</p>

            {/* Flashlight Toggle */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => setFlashlightOn(!flashlightOn)}
              className={`h-12 bg-transparent ${flashlightOn ? "border-primary text-primary" : ""}`}
            >
              <Flashlight className="mr-2 h-5 w-5" />
              {flashlightOn ? "Apagar" : "Encender"} Linterna
            </Button>

            {/* Test Buttons (for demo) */}
            <div className="mt-8 w-full max-w-sm space-y-2">
              <p className="mb-2 text-center text-xs text-muted-foreground">Demo: Simular escaneo</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => simulateScan("valid")} className="bg-transparent">
                  Válido
                </Button>
                <Button variant="outline" size="sm" onClick={() => simulateScan("expired")} className="bg-transparent">
                  Expirado
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateScan("already-used")}
                  className="bg-transparent"
                >
                  Usado
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Scanned Order Details */}
            <div className="w-full max-w-sm">
              {scannedOrder.status === "valid" ? (
                <Alert className="mb-6 border-chart-2 bg-chart-2/10">
                  <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  <AlertDescription className="text-chart-2">Orden válida - Lista para entregar</AlertDescription>
                </Alert>
              ) : scannedOrder.status === "expired" ? (
                <Alert className="mb-6 border-destructive bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <AlertDescription className="text-destructive">
                    Orden expirada - No se puede entregar
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mb-6 border-destructive bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <AlertDescription className="text-destructive">Orden ya canjeada anteriormente</AlertDescription>
                </Alert>
              )}

              <div className="mb-6 rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="mb-1 font-mono text-xl font-bold text-card-foreground">{scannedOrder.id}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{scannedOrder.time}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Items:</p>
                  {scannedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-card-foreground">{item.name}</span>
                      <span className="font-semibold text-primary">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {scannedOrder.status === "valid" ? (
                <Button onClick={handleDeliver} size="lg" className="h-14 w-full text-base font-semibold neon-glow">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Marcar como Entregado
                </Button>
              ) : (
                <Button
                  onClick={() => setScannedOrder(null)}
                  variant="outline"
                  size="lg"
                  className="h-14 w-full bg-transparent"
                >
                  Escanear Otro QR
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
