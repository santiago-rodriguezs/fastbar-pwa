"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Minus, Plus, Trash2, CreditCard } from "lucide-react"

const MOCK_CART_ITEMS = [
  {
    id: "1",
    name: "Fernet con Coca",
    price: 2500,
    quantity: 2,
  },
  {
    id: "2",
    name: "Cerveza Artesanal IPA",
    price: 1800,
    quantity: 1,
  },
  {
    id: "5",
    name: "Tequila Shot",
    price: 1500,
    quantity: 3,
  },
]

export default function CartPage({ params }: { params: { eventId: string } }) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS)

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + tax

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild className="h-10 w-10">
            <Link href={`/events/${params.eventId}/catalog`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Tu Pedido</h1>
        </div>
      </header>

      {/* Cart Items */}
      <main className="flex-1 px-4 py-6">
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold text-card-foreground">{item.name}</h3>
                  <p className="text-lg font-bold text-primary">${item.price}</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 rounded-full"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 rounded-full"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Tu carrito está vacío</h3>
            <p className="mb-4 text-sm text-muted-foreground">Agregá productos para continuar</p>
            <Button asChild variant="outline">
              <Link href={`/events/${params.eventId}/catalog`}>Ver Catálogo</Link>
            </Button>
          </div>
        )}
      </main>

      {/* Checkout Summary */}
      {cartItems.length > 0 && (
        <div className="border-t border-border bg-background px-4 py-6">
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">${subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-medium text-foreground">${tax}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-lg">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-primary">${total}</span>
            </div>
          </div>

          <Button
            asChild
            size="lg"
            className="mb-3 h-14 w-full text-base font-semibold neon-glow"
            onClick={() => router.push(`/events/${params.eventId}/checkout`)}
          >
            <Link href={`/events/${params.eventId}/checkout`}>Continuar al Pago</Link>
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Al finalizar obtendrás un QR para canjear en barra
          </p>
        </div>
      )}
    </div>
  )
}
