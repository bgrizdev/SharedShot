'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { user } = useAuth()
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to SharedShot</h1>
        <p className="text-xl text-gray-600 mb-8">
          Group photo sharing made simple
        </p>
        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/events/new">
                <Button size="lg">Create Your First Event</Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="lg">View My Events</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </>
          )}</div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 py-12">
        <div className="text-center">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📸</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Easy Upload</h3>
          <p className="text-gray-600">
            Upload multiple photos at once with automatic optimization for web
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Event Organization</h3>
          <p className="text-gray-600">
            Create events and organize all your photos in one place
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Fast & Simple</h3>
          <p className="text-gray-600">
            No complicated setup - just create an event and start sharing
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-6 mb-4">
              <span className="text-3xl font-bold text-blue-600">1</span>
            </div>
            <h4 className="font-semibold mb-2">Create an Event</h4>
            <p className="text-sm text-gray-600">
              Give your event a name and get a unique page for all photos
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-6 mb-4">
              <span className="text-3xl font-bold text-green-600">2</span>
            </div>
            <h4 className="font-semibold mb-2">Upload Photos</h4>
            <p className="text-sm text-gray-600">
              Add multiple photos at once - they'll be optimized automatically
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-6 mb-4">
              <span className="text-3xl font-bold text-purple-600">3</span>
            </div>
            <h4 className="font-semibold mb-2">Manage & View</h4>
            <p className="text-sm text-gray-600">
              View all your photos in a beautiful gallery and manage your events
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}