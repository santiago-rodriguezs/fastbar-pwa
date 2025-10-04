"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, UserCog } from "lucide-react"

export default function StaffLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login
    setTimeout(() => {
      router.push("/staff/scanner")
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-border px-4 py-4">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Acceso Staff</h1>
      </header>

      {/* Form */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <UserCog className="h-8 w-8 text-primary" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-foreground">Staff Login</h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">Ingresá con tu cuenta de staff</p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <Label htmlFor="staff-email">Email</Label>
            <Input
              id="staff-email"
              type="email"
              placeholder="staff@fastbar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-password">Contraseña</Label>
            <Input
              id="staff-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-14 w-full text-base font-semibold neon-glow"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </main>
    </div>
  )
}
