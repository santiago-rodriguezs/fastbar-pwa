"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Event interface
interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  active: boolean;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Fetch active events from Firestore
        const eventsQuery = query(
          collection(db, 'events'),
          where('active', '==', true)
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        
        if (eventsSnapshot.empty) {
          // No events found, use mock data
          const mockEvents: Event[] = [
            {
              id: 'demo-event',
              name: 'Fiesta aniversario safari',
              date: new Date('2025-10-31T20:00:00'),
              location: 'JET',
              active: true,
            },
            {
              id: 'demo-event-2',
              name: 'Agustin Giri Savage',
              date: new Date('2025-10-31T22:00:00'),
              location: 'BNN',
              active: true,
            },
          ];
          
          setEvents(mockEvents);
        } else {
          // Map Firestore documents to Event objects
          const fetchedEvents = eventsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              date: data.date.toDate(),
              location: data.location,
              active: data.active,
            };
          });
          
          setEvents(fetchedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        
        // #TODO: Use mock data for demo purposes
        const mockEvents: Event[] = [
          {
            id: 'demo-event',
            name: 'Fiesta aniversario safari',
            date: new Date('2025-10-31T20:00:00'),
            location: 'JET',
            active: true,
          },
          {
            id: 'demo-event-2',
            name: 'Agustin Giri Savage',
            date: new Date('2025-10-31T22:00:00'),
            location: 'BNN',
            active: true,
          },
        ];
        
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Eventos</h1>
        
        {user && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/orders">Mis pedidos</Link>
          </Button>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <p className="text-center py-8">Cargando eventos...</p>
      ) : events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-4 pb-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/events/${event.id}/products`}>
                    Ver productos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No hay eventos disponibles</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
