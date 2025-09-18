'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addEvent } from '../../../lib/eventStore'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { useAuth } from '../../../contexts/AuthContext'

function CreateEventContent() {
  const [eventName, setEventName] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    const event = addEvent(eventName, user.id)
    router.push(`/events/${event.slug}`)
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="">Create a New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Event Name</Label>
          <Input
            id="name"
            placeholder="e.g. Lake Trip 2025"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <Button type="submit" className=''>Create Event</Button>
      </form>
    </div>
  )
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <CreateEventContent />
    </ProtectedRoute>
  )
}
