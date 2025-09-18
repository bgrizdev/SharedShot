export type User = {
  id: string
  email: string
  name: string
  createdAt: string
}

export type AuthUser = {
  id: string
  email: string
  name: string
}

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  // This is a simple hash - in production use bcrypt or similar
  return btoa(password + 'salt123')
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function registerUser(email: string, password: string, name: string): { success: boolean; user?: User; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Server-side operation' }
  
  const users = getAllUsers()
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'User already exists' }
  }
  
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    createdAt: new Date().toISOString()
  }
  
  // Store user
  const updatedUsers = [...users, user]
  localStorage.setItem('users', JSON.stringify(updatedUsers))
  
  // Store password separately (hashed)
  const passwords = getPasswords()
  const hashedPassword = hashPassword(password)
  passwords[user.id] = hashedPassword
  localStorage.setItem('passwords', JSON.stringify(passwords))
  
  console.log('User registered:', { userId: user.id, email, hashedPassword })
  
  return { success: true, user }
}

export function loginUser(email: string, password: string): { success: boolean; user?: AuthUser; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Server-side operation' }
  
  const users = getAllUsers()
  const user = users.find(u => u.email === email)
  
  if (!user) {
    console.log('User not found:', email)
    return { success: false, error: 'User not found' }
  }
  
  const passwords = getPasswords()
  const storedHash = passwords[user.id]
  
  console.log('Login attempt:', { email, userId: user.id, hasStoredHash: !!storedHash })
  
  if (!storedHash || !verifyPassword(password, storedHash)) {
    console.log('Password verification failed')
    return { success: false, error: 'Invalid password' }
  }
  
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name
  }
  
  // Set current user session
  localStorage.setItem('currentUser', JSON.stringify(authUser))
  console.log('Login successful, user stored:', authUser)
  
  return { success: true, user: authUser }
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

export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('users')
  return raw ? JSON.parse(raw) : []
}

function getPasswords(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem('passwords')
  return raw ? JSON.parse(raw) : {}
}