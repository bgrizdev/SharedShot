

export type Event = {
  id: string
  name: string
  slug: string
  images: string[]
  ownerId: string
  collaborators: string[] // Array of user IDs who can add images
  createdAt: string
  isPublic: boolean // Whether the event can be viewed by anyone
}

export function addEvent(name: string, ownerId: string): Event {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  const id = crypto.randomUUID()
  const event = { 
    id, 
    name, 
    slug, 
    images: [], 
    ownerId,
    collaborators: [],
    createdAt: new Date().toISOString(),
    isPublic: true // Events are public by default for sharing
  }

  const existing = getAllEvents()
  const updated = [...existing, event]
  localStorage.setItem('events', JSON.stringify(updated))

  return event
}

export function addImageToEvent(slug: string, imageUrl: string): boolean {
  const events = getAllEvents()
  const eventIndex = events.findIndex(e => e.slug === slug)
  
  if (eventIndex === -1) return false
  
  events[eventIndex].images.push(imageUrl)
  localStorage.setItem('events', JSON.stringify(events))
  return true
}

export function addImagesToEvent(slug: string, imageUrls: string[]): boolean {
  const events = getAllEvents()
  const eventIndex = events.findIndex(e => e.slug === slug)
  
  if (eventIndex === -1) return false
  
  events[eventIndex].images.push(...imageUrls)
  localStorage.setItem('events', JSON.stringify(events))
  return true
}

export function removeImageFromEvent(slug: string, imageUrl: string): boolean {
  const events = getAllEvents()
  const eventIndex = events.findIndex(e => e.slug === slug)
  
  if (eventIndex === -1) return false
  
  events[eventIndex].images = events[eventIndex].images.filter(url => url !== imageUrl)
  localStorage.setItem('events', JSON.stringify(events))
  return true
}

export function deleteEvent(slug: string): boolean {
  const events = getAllEvents()
  const filteredEvents = events.filter(e => e.slug !== slug)
  
  if (filteredEvents.length === events.length) return false // Event not found
  
  localStorage.setItem('events', JSON.stringify(filteredEvents))
  return true
}

export function addCollaboratorToEvent(slug: string, userEmail: string): { success: boolean; error?: string } {
  const events = getAllEvents()
  const eventIndex = events.findIndex(e => e.slug === slug)
  
  if (eventIndex === -1) return { success: false, error: 'Event not found' }
  
  // Find user by email
  const users = getAllUsers()
  const user = users.find(u => u.email === userEmail)
  
  if (!user) return { success: false, error: 'User not found' }
  
  // Ensure collaborators array exists
  if (!events[eventIndex].collaborators) {
    events[eventIndex].collaborators = []
  }
  
  // Check if already a collaborator
  if (events[eventIndex].collaborators.includes(user.id)) {
    return { success: false, error: 'User is already a collaborator' }
  }
  
  events[eventIndex].collaborators.push(user.id)
  localStorage.setItem('events', JSON.stringify(events))
  return { success: true }
}

export function removeCollaboratorFromEvent(slug: string, userId: string): boolean {
  const events = getAllEvents()
  const eventIndex = events.findIndex(e => e.slug === slug)
  
  if (eventIndex === -1) return false
  
  // Ensure collaborators array exists
  if (!events[eventIndex].collaborators) {
    events[eventIndex].collaborators = []
  }
  
  events[eventIndex].collaborators = events[eventIndex].collaborators.filter(id => id !== userId)
  localStorage.setItem('events', JSON.stringify(events))
  return true
}

export function canUserEditEvent(event: Event, userId: string | null): boolean {
  if (!userId) return false
  return event.ownerId === userId || (event.collaborators && event.collaborators.includes(userId))
}

export function getUserEvents(userId: string): Event[] {
  const allEvents = getAllEvents()
  return allEvents.filter(event => 
    event.ownerId === userId || (event.collaborators && event.collaborators.includes(userId))
  )
}

// Import getAllUsers function (we need to add this)
function getAllUsers(): any[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('users')
  return raw ? JSON.parse(raw) : []
}

export function getAllEvents(): Event[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('events')
  return raw ? JSON.parse(raw) : []
}

export function getEventBySlug(slug: string): Event | undefined {
  const all = getAllEvents()
  return all.find((e) => e.slug === slug)
}
