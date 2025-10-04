"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, CheckCircle2, XCircle, Package } from "lucide-react"

const MOCK_ORDERS = [
  {
    id: "FB-2024-0342",
    eventName: "Noche Electrónica",
    date: "Hoy, 23:45",
    total: 11300,
    status: "pending",
    items: 6,
  },
  {
    id: "FB-2024-0341",
    eventName: "Noche Electrónica",
    date: "Hoy, 22:30",
    total: 5600,
    status: "delivered",
    items: 3,
  },
  {
    id: "FB-2024-0298",
    eventName: "Sunset Rooftop",
    date: "Vie 14 Mar, 20:15",
    total: 8900,
    status: "delivered",
    items: 4,
  },
  {
    id: "FB-2024-0156",
    eventName: "Festival de Verano",
    date: "Dom 9 Mar, 19:00",
    total: 3200,
    status: "expired",
    items: 2,
  },
]

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/50",
  },
  ready: {
    label: "Lista",
    icon: Package,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    borderColor: "border-chart-2/50",
  },
  delivered: {
    label: "Entregada",
    icon: CheckCircle2,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    borderColor: "border-chart-2/50",
  },
  expired: {
    label: "Expirada",
    icon: XCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-border",
  },
}

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild className="h-10 w-10">
            <Link href="/events">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Mis Órdenes</h1>
        </div>
      </header>

      {/* Orders List */}
      <main className="flex-1 px-4 py-6">
        {MOCK_ORDERS.length > 0 ? (
          <div className="space-y-4">
            {MOCK_ORDERS.map((order) => {
              const config = statusConfig[order.status as keyof typeof statusConfig]
              const StatusIcon = config.icon

              return (
                <Link
                  key={order.id}
                  href={order.status === "pending" || order.status === "ready" ? `/orders/${order.id}` : "#"}
                  className={`block rounded-lg border ${config.borderColor} bg-card p-4 transition-all ${
                    order.status === "pending" || order.status === "ready"
                      ? "hover:border-primary/50 hover:bg-card/80"
                      : "opacity-75"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="mb-1 font-mono text-sm font-semibold text-card-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.eventName}</p>
                    </div>
                    <Badge variant="outline" className={`${config.bgColor} ${config.color} ${config.borderColor}`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>{order.date}</p>
                      <p>{order.items} items</p>
                    </div>
                    <p className="text-xl font-bold text-primary">${order.total.toLocaleString()}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No tenés órdenes</h3>
            <p className="mb-4 text-sm text-muted-foreground">Tus pedidos aparecerán aquí</p>
            <Button asChild variant="outline">
              <Link href="/events">Ver Eventos</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
