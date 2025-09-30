'use client'

import { useEffect, useState } from 'react'
import { getUserEvents, Event, deleteEvent } from '../../lib/eventStore'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'

function MyEventsContent() {
  const [events, setEvents] = useState<Event[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return
      
      const userEvents = await getUserEvents(user.id)
      setEvents(userEvents)
    }
    
    fetchEvents()
  }, [user])

  const handleDeleteEvent = async (eventSlug: string, eventName: string) => {
    if (confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      try {
        if (!user) return
        
        // Delete all images for this event (API will handle file cleanup)
        await fetch('/api/delete-event-images', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventSlug }),
        })

        // Delete event from database
        const success = await deleteEvent(eventSlug, user.id)
        
        if (success) {
          // Refresh events list
          const updatedEvents = await getUserEvents(user.id)
          setEvents(updatedEvents)
        }
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Events</h1>
        <Link href="/events/new">
          <Button>Create New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No events created yet.</p>
          <Link href="/events/new">
            <Button>Create Your First Event</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="relative border rounded-lg p-6 hover:shadow-lg transition-shadow group">
              <Link href={`/events/${event.slug}`} className="block">
                <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                <p className="text-sm text-gray-500 mb-4">/{event.slug}</p>

                {event.images && event.images.length > 0 ? (
                  <div className="mb-4">
                    <div className="aspect-video overflow-hidden rounded-md mb-2">
                      <img
                        src={event.images[0].url}
                        alt={`${event.name} preview`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {event.images.length} image{event.images.length > 1 ? 's' : ''}
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center mb-2">
                      <p className="text-gray-400 text-sm">No images yet</p>
                    </div>
                    <p className="text-sm text-gray-600">0 images</p>
                  </div>
                )}
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteEvent(event.slug, event.name)
                }}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                aria-label={`Delete ${event.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MyEventsPage() {
  return (
    <ProtectedRoute>
      <MyEventsContent />
    </ProtectedRoute>
  )
}