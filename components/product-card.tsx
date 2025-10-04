"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  category: string
  popular: boolean
  image: string
}

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    setIsAdding(true)
    onAddToCart()
    setTimeout(() => setIsAdding(false), 300)
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {product.popular && (
          <Badge className="absolute right-2 top-2 bg-primary/90 text-primary-foreground">Popular</Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-card-foreground">{product.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-primary">${product.price}</p>
          <Button
            size="icon"
            onClick={handleAdd}
            disabled={isAdding}
            className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
