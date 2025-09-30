'use client'

import { useEffect, useState } from 'react'
import { getEventBySlug, Event, addImagesToEvent, removeImageFromEvent, canUserEditEvent, addCollaboratorToEvent } from '../../../lib/eventStore'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Share2, UserPlus } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import Link from 'next/link'

function EventContent() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const fetchEvent = async () => {
      const slug = params?.slug?.toString()
      if (slug) {
        const found = await getEventBySlug(slug)
        setEvent(found)
      }
    }
    
    fetchEvent()
  }, [params])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files)
    }
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0 || !event) return

    setUploading(true)
    try {
      const formData = new FormData()

      // Append all selected files
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file)
      })
      formData.append('eventSlug', event.slug)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()

        // Update database with all uploaded images
        await addImagesToEvent(event.slug, result.imageUrls)

        // Refresh event data
        const updatedEvent = await getEventBySlug(event.slug)
        setEvent(updatedEvent)

        // Reset form
        setSelectedFiles(null)
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!event) return

    try {
      // Delete the physical file
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (response.ok) {
        // Remove from database only if file deletion succeeded
        await removeImageFromEvent(event.slug, imageUrl)

        // Refresh event data
        const updatedEvent = await getEventBySlug(event.slug)
        setEvent(updatedEvent)
      } else {
        console.error('Failed to delete file from server')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const handleInviteUser = async () => {
    if (!event || !inviteEmail.trim() || !user) return

    try {
      const result = await addCollaboratorToEvent(event.slug, inviteEmail.trim(), user.id)
      
      if (result.success) {
        setInviteMessage('User invited successfully!')
        setInviteEmail('')
        // Refresh event data
        const updatedEvent = await getEventBySlug(event.slug)
        setEvent(updatedEvent)
      } else {
        setInviteMessage(result.error || 'Failed to invite user')
      }
    } catch (error) {
      setInviteMessage('Failed to invite user')
    }
    
    setTimeout(() => setInviteMessage(''), 3000)
  }

  const copyShareLink = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl)
    setInviteMessage('Share link copied to clipboard!')
    setTimeout(() => setInviteMessage(''), 3000)
  }

  if (!event) {
    return <div className="text-red-600">Event not found.</div>
  }

  const canEdit = user && canUserEditEvent(event, user.id)
  const isOwner = user && event.ownerId === user.id

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        
        {/* Share and Invite Controls */}
        <div className="flex gap-2">
          <Button onClick={copyShareLink} variant="outline" size="sm">
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
          {isOwner && (
            <Button 
              onClick={() => setShowInviteForm(!showInviteForm)} 
              variant="outline" 
              size="sm"
            >
              <UserPlus size={16} className="mr-2" />
              Invite
            </Button>
          )}
        </div>
      </div>

      {/* Invite Form */}
      {showInviteForm && isOwner && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">Invite Collaborator</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleInviteUser}>Invite</Button>
          </div>
          {inviteMessage && (
            <p className="mt-2 text-sm text-green-600">{inviteMessage}</p>
          )}
        </div>
      )}

      {/* Upload Section - Only show if user can edit */}
      {canEdit ? (
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Choose Images</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>
          {selectedFiles && selectedFiles.length > 0 && (
            <p className="text-sm text-gray-600">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </p>
          )}
          <Button
            onClick={handleUpload}
            disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles?.length || 0} Image${selectedFiles?.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
      ) : !user ? (
        <div className="mb-8 p-6 border rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Want to add photos?</h2>
          <p className="text-gray-600 mb-4">
            Create an account to upload and share photos to this event.
          </p>
          <div className="space-x-2">
            <Link href="/register">
              <Button>Create Account</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 border rounded-lg bg-yellow-50">
          <h2 className="text-xl font-semibold mb-4">View Only</h2>
          <p className="text-gray-600">
            You can view photos in this event, but only the event creator and invited collaborators can add new photos.
          </p>
        </div>
      )}

      {/* Event Info */}
      {(isOwner || event.collaborators.length > 0) && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Event Details</h3>
          {isOwner && (
            <p className="text-sm text-gray-600 mb-1">
              You are the owner of this event
            </p>
          )}
          {event.collaborators.length > 0 && (
            <p className="text-sm text-gray-600">
              {event.collaborators.length} collaborator{event.collaborators.length > 1 ? 's' : ''} can add photos
            </p>
          )}
        </div>
      )}

      {/* Images Gallery */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Event Images ({event.images.length})</h2>
        {event.images.length === 0 ? (
          <p className="text-gray-500">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {event.images.map((image, index) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border group">
                <img
                  src={image.url}
                  alt={`Event image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                {canEdit && (
                  <button
                    onClick={() => handleDeleteImage(image.url)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    aria-label="Delete image"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventPage() {
  return <EventContent />
}
