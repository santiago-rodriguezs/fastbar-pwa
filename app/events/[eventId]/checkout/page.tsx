"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react"

export default function CheckoutPage({ params }: { params: { eventId: string } }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"mercadopago" | "applepay" | null>(null)

  const handlePayment = async (method: "mercadopago" | "applepay") => {
    setSelectedMethod(method)
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      router.push(`/events/${params.eventId}/order-confirmed`)
    }, 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild className="h-10 w-10" disabled={isProcessing}>
            <Link href={`/events/${params.eventId}/cart`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Método de Pago</h1>
        </div>
      </header>

      {/* Payment Methods */}
      <main className="flex-1 px-4 py-6">
        <div className="mb-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Seleccioná tu método de pago</h2>

          <div className="space-y-3">
            {/* Mercado Pago */}
            <button
              onClick={() => !isProcessing && handlePayment("mercadopago")}
              disabled={isProcessing}
              className="flex w-full items-center gap-4 rounded-lg border-2 border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:bg-card/80 disabled:opacity-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00b1ea]/10">
                <CreditCard className="h-6 w-6 text-[#00b1ea]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">Mercado Pago</h3>
                <p className="text-sm text-muted-foreground">Tarjetas, efectivo y más</p>
              </div>
              {isProcessing && selectedMethod === "mercadopago" && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </button>

            {/* Apple Pay */}
            <button
              onClick={() => !isProcessing && handlePayment("applepay")}
              disabled={isProcessing}
              className="flex w-full items-center gap-4 rounded-lg border-2 border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:bg-card/80 disabled:opacity-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground/10">
                <Smartphone className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">Apple Pay</h3>
                <p className="text-sm text-muted-foreground">Pago rápido y seguro</p>
              </div>
              {isProcessing && selectedMethod === "applepay" && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold">Importante:</span> Al finalizar el pago recibirás un código QR que deberás
            mostrar en la barra para retirar tu pedido.
          </p>
        </div>
      </main>

      {/* Order Summary */}
      <div className="border-t border-border bg-background px-4 py-4">
        <div className="mb-4 flex justify-between">
          <span className="text-sm text-muted-foreground">Total a pagar</span>
          <span className="text-xl font-bold text-primary">$9,800</span>
        </div>
      </div>
    </div>
  )
}
