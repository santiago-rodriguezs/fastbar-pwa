"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, DollarSign, ShoppingBag } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const HOURLY_SALES = [
  { hour: "20:00", orders: 12, revenue: 34500 },
  { hour: "21:00", orders: 28, revenue: 78200 },
  { hour: "22:00", orders: 45, revenue: 125600 },
  { hour: "23:00", orders: 62, revenue: 178900 },
  { hour: "00:00", orders: 58, revenue: 165400 },
  { hour: "01:00", orders: 41, revenue: 118700 },
  { hour: "02:00", orders: 23, revenue: 67800 },
]

const TOP_PRODUCTS = [
  { name: "Fernet con Coca", sold: 156, revenue: 390000 },
  { name: "Cerveza Artesanal IPA", sold: 142, revenue: 255600 },
  { name: "Tequila Shot", sold: 98, revenue: 147000 },
  { name: "Mojito", sold: 87, revenue: 243600 },
  { name: "Cerveza Lager", sold: 76, revenue: 121600 },
]

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const totalRevenue = HOURLY_SALES.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = HOURLY_SALES.reduce((sum, item) => sum + item.orders, 0)
  const avgOrderValue = Math.round(totalRevenue / totalOrders)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="h-10 w-10">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Noche Electrónica - Hoy</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <main className="flex-1 px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="settings">Ajustes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-chart-2">+12.5%</span> vs semana pasada
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Órdenes</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">Hoy</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">${avgOrderValue}</div>
                    <p className="text-xs text-muted-foreground">Por orden</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Hourly Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Órdenes por Hora</CardTitle>
                <CardDescription>Actividad del evento en tiempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={HOURLY_SALES}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Productos</CardTitle>
                <CardDescription>Más vendidos del evento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {TOP_PRODUCTS.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sold} vendidos</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-primary">${product.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gestión de Productos</CardTitle>
                <CardDescription>Administrá el catálogo y precios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TOP_PRODUCTS.slice(0, 3).map((product) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">${(product.revenue / product.sold).toFixed(0)}</p>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full bg-transparent">
                  Ver Todos los Productos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Listas de Precios</CardTitle>
                <CardDescription>Configurá precios por evento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">Lista Estándar</p>
                      <p className="text-sm text-muted-foreground">Precios regulares</p>
                    </div>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Editar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">Lista Happy Hour</p>
                      <p className="text-sm text-muted-foreground">20% descuento</p>
                    </div>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuración del Evento</CardTitle>
                <CardDescription>Ajustes generales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Horario del Evento</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      defaultValue="20:00"
                      className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <input
                      type="time"
                      defaultValue="03:00"
                      className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Validez del QR (minutos)</label>
                  <input
                    type="number"
                    defaultValue="20"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Tiempo que el cliente tiene para canjear su orden</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Límite de órdenes por usuario</label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <Button className="w-full neon-glow">Guardar Cambios</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estado del Evento</CardTitle>
                <CardDescription>Control de disponibilidad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Evento Activo</p>
                    <p className="text-sm text-muted-foreground">Los clientes pueden hacer pedidos</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-chart-2/10 text-chart-2 hover:bg-chart-2/20">
                    Activo
                  </Button>
                </div>
                <Button variant="destructive" className="w-full">
                  Finalizar Evento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
