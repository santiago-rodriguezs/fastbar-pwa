"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, ShoppingCart } from "lucide-react"
import { ProductCard } from "@/components/product-card"

const CATEGORIES = ["Todos", "Tragos", "Cervezas", "Sin alcohol", "Shots", "Snacks"]

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Fernet con Coca",
    price: 2500,
    category: "Tragos",
    popular: true,
    image: "/fernet-cocktail-dark.jpg",
  },
  {
    id: "2",
    name: "Cerveza Artesanal IPA",
    price: 1800,
    category: "Cervezas",
    popular: true,
    image: "/craft-beer-glass.jpg",
  },
  {
    id: "3",
    name: "Mojito",
    price: 2800,
    category: "Tragos",
    popular: false,
    image: "/mojito-cocktail.jpg",
  },
  {
    id: "4",
    name: "Agua Mineral",
    price: 800,
    category: "Sin alcohol",
    popular: false,
    image: "/reusable-water-bottle.png",
  },
  {
    id: "5",
    name: "Tequila Shot",
    price: 1500,
    category: "Shots",
    popular: true,
    image: "/tequila-shot.jpg",
  },
  {
    id: "6",
    name: "Papas Fritas",
    price: 1200,
    category: "Snacks",
    popular: false,
    image: "/crispy-french-fries.png",
  },
]

export default function CatalogPage({ params }: { params: { eventId: string } }) {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItems, setCartItems] = useState(0)

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild className="h-10 w-10">
            <Link href="/events">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Noche Electrónica</h1>
            <p className="text-xs text-muted-foreground">Club Central</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="overflow-x-auto px-4 pb-4">
          <div className="flex gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "shrink-0 bg-primary text-primary-foreground"
                    : "shrink-0 bg-transparent"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="flex-1 px-4 py-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={() => setCartItems((prev) => prev + 1)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No se encontraron productos</h3>
            <p className="text-sm text-muted-foreground">Intentá con otra búsqueda</p>
          </div>
        )}
      </main>

      {/* Fixed Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Button asChild size="lg" className="h-14 w-full text-base font-semibold neon-glow">
          <Link href={`/events/${params.eventId}/cart`}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Ver Carrito {cartItems > 0 && `(${cartItems})`}
          </Link>
        </Button>
      </div>
    </div>
  )
}
