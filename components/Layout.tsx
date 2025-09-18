'use client'

import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-6 border-r">
        <nav className="space-y-4">
          <div className="font-bold text-lg">SharedShot</div>
          
          {user ? (
            <>
              <div className="text-sm text-gray-600 pb-2 border-b">
                Welcome, {user.name}
              </div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/events/new">Create Event</Link></li>
                <li><Link href="/events">My Events</Link></li>
              </ul>
              <div className="pt-4">
                <Button 
                  onClick={logout} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <ul className="space-y-2 text-sm">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/login">Sign In</Link></li>
                <li><Link href="/register">Create Account</Link></li>
              </ul>
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
