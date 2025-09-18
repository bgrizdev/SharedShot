'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, getCurrentUser, logoutUser } from '../lib/userStore'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = () => {
    const currentUser = getCurrentUser()
    console.log('AuthContext refreshUser called, currentUser:', currentUser)
    setUser(currentUser)
  }

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  useEffect(() => {
    refreshUser()
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}