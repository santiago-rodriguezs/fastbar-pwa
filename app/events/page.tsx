"use client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ChevronRight } from "lucide-react"

const MOCK_EVENTS = [
  {
    id: "1",
    name: "Noche Electrónica",
    date: "Sábado 15 Mar",
    time: "23:00",
    location: "Club Central",
    status: "active",
  },
  {
    id: "2",
    name: "Sunset Rooftop",
    date: "Viernes 21 Mar",
    time: "19:00",
    location: "Sky Bar",
    status: "active",
  },
  {
    id: "3",
    name: "Festival de Verano",
    date: "Domingo 23 Mar",
    time: "18:00",
    location: "Parque Norte",
    status: "upcoming",
  },
]

export default function EventsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-6">
        <h1 className="text-2xl font-bold text-foreground">Eventos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Seleccioná un evento para comenzar</p>
      </header>

      {/* Events List */}
      <main className="flex-1 px-6 py-6">
        <div className="grid gap-4">
          {MOCK_EVENTS.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}/catalog`}
              className="group block rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-card/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-card-foreground">{event.name}</h2>
                    {event.status === "active" && (
                      <Badge variant="default" className="bg-primary/20 text-primary">
                        Activo
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {event.date} • {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {MOCK_EVENTS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No hay eventos disponibles</h3>
            <p className="text-sm text-muted-foreground">Volvé más tarde para ver nuevos eventos</p>
          </div>
        )}
      </main>
    </div>
  )
}
