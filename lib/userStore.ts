export type User = {
  id: string
  email: string
  name: string
  createdAt: Date
}

export type AuthUser = {
  id: string
  email: string
  name: string
}

export async function registerUser(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed' }
  }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()
    
    if (result.success && result.user) {
      // Store session in localStorage
      localStorage.setItem('currentUser', JSON.stringify(result.user))
    }
    
    return result
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('currentUser')
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('currentUser')
  return stored ? JSON.parse(stored) : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await fetch('/api/users/by-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const result = await response.json()
    
    if (result.success) {
      return result.user
    }
    
    return null
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}