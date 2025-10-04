import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, QrCode, CreditCard } from "lucide-react"

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 neon-glow">
          <Zap className="h-10 w-10 text-primary" />
        </div>

        <h1 className="mb-4 text-balance font-sans text-5xl font-bold leading-tight tracking-tight text-foreground">
          FastBar
        </h1>

        <p className="mb-2 text-pretty text-xl font-medium text-foreground">Comprá sin fila.</p>
        <p className="mb-2 text-pretty text-xl font-medium text-foreground">Pagá desde tu cel.</p>
        <p className="mb-12 text-pretty text-xl font-medium text-primary">Mostrá el QR y listo.</p>

        {/* Features */}
        <div className="mb-12 grid w-full max-w-md gap-4">
          <div className="flex items-start gap-4 rounded-lg bg-card p-4 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-card-foreground">Pago rápido</h3>
              <p className="text-sm text-muted-foreground">Mercado Pago o Apple Pay</p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg bg-card p-4 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-card-foreground">Sin esperas</h3>
              <p className="text-sm text-muted-foreground">Recibí tu QR al instante</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex w-full max-w-md flex-col gap-3">
          <Button asChild size="lg" className="h-14 text-base font-semibold neon-glow">
            <Link href="/events">Continuar con Google</Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-14 text-base font-semibold bg-transparent">
            <Link href="/login">Email y contraseña</Link>
          </Button>
        </div>

        {/* PWA Install Hint */}
        <div className="mt-8 rounded-lg border border-border bg-card/50 p-4">
          <p className="text-sm text-muted-foreground">
            💡 <span className="font-medium text-foreground">Tip:</span> Añadí FastBar a tu pantalla de inicio para
            acceso rápido
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/staff/login" className="hover:text-foreground">
            Acceso Staff
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  )
}
