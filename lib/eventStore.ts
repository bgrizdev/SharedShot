export type Event = {
  id: string
  name: string
  slug: string
  ownerId: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  images: EventImage[]
  collaborators: EventCollaborator[]
  owner: { id: string; name: string; email: string }
}

export type EventImage = {
  id: string
  url: string
  filename: string
  createdAt: Date
}

export type EventCollaborator = {
  id: string
  user: { id: string; name: string; email: string }
}

export async function addEvent(name: string, ownerId: string): Promise<Event | null> {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, ownerId }),
    })

    const result = await response.json()

    if (result.success) {
      return result.event
    }

    return null
  } catch (error) {
    console.error('Error creating event:', error)
    return null
  }
}

export async function getUserEvents(userId: string): Promise<Event[]> {
  try {
    const response = await fetch(`/api/events?userId=${userId}`)
    const result = await response.json()

    if (result.success) {
      return result.events
    }

    return []
  } catch (error) {
    console.error('Error fetching user events:', error)
    return []
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const response = await fetch(`/api/events/${slug}`)
    const result = await response.json()

    if (result.success) {
      return result.event
    }

    return null
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export async function addImagesToEvent(slug: string, imageUrls: string[]): Promise<boolean> {
  try {
    const response = await fetch(`/api/events/${slug}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrls }),
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error adding images to event:', error)
    return false
  }
}

export async function removeImageFromEvent(slug: string, imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/events/${slug}/images`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error removing image from event:', error)
    return false
  }
}

export async function deleteEvent(slug: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/events/${slug}?userId=${userId}`, {
      method: 'DELETE',
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error deleting event:', error)
    return false
  }
}

export async function addCollaboratorToEvent(slug: string, userEmail: string, requesterId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/events/${slug}/collaborators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail, requesterId }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error adding collaborator:', error)
    return { success: false, error: 'Failed to add collaborator' }
  }
}

export function canUserEditEvent(event: Event, userId: string | null): boolean {
  if (!userId) return false
  return event.ownerId === userId || event.collaborators.some(collab => collab.user.id === userId)
}