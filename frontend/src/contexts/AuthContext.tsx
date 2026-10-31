import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { api } from '../services/api'

export interface User {
  id: number
  email: string
  fullName: string
  role: 'USER' | 'ADMIN'
  organizationId?: number
  organizationName?: string
  organizationStatus?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string, role?: 'USER' | 'ADMIN') => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// ─── Demo Credentials ─────────────────────────────────
// These bypass the API entirely for frontend-only testing.
const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'user@medishare.health': {
    password: 'demo1234',
    user: {
      id: 1,
      email: 'user@medishare.health',
      fullName: 'Dr. Eleanor Vance',
      role: 'USER',
      organizationId: 1,
      organizationName: 'Metro General Hospital',
      organizationStatus: 'VERIFIED',
    },
  },
  'admin@medishare.health': {
    password: 'admin1234',
    user: {
      id: 99,
      email: 'admin@medishare.health',
      fullName: 'Chief Compliance Officer',
      role: 'ADMIN',
    },
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    // Check demo session first
    const demoUser = localStorage.getItem('medishare_demo_user')
    if (demoUser) {
      try {
        setUser(JSON.parse(demoUser))
      } catch {
        localStorage.removeItem('medishare_demo_user')
      }
      setLoading(false)
      return
    }

    const token = localStorage.getItem('medishare_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch {
      localStorage.removeItem('medishare_token')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string, _role?: 'USER' | 'ADMIN') => {
    // Check demo credentials first
    const demo = DEMO_ACCOUNTS[email.toLowerCase()]
    if (demo && demo.password === password) {
      // If a role filter was requested, check it matches
      if (_role && demo.user.role !== _role) {
        throw { response: { data: { message: `This account does not have ${_role} access. Use the correct portal.` } } }
      }
      localStorage.setItem('medishare_demo_user', JSON.stringify(demo.user))
      setUser(demo.user)
      return
    }

    // Fall through to real API
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { token, user: userData } = data
      localStorage.setItem('medishare_token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
    } catch (err) {
      // If backend isn't running, provide a helpful message
      if ((err as { code?: string })?.code === 'ERR_NETWORK') {
        throw { response: { data: { message: 'Backend not connected. Use demo credentials: user@medishare.health / demo1234 (user) or admin@medishare.health / admin1234 (admin)' } } }
      }
      throw err
    }
  }

  const logout = async () => {
    // If demo session
    if (localStorage.getItem('medishare_demo_user')) {
      localStorage.removeItem('medishare_demo_user')
      setUser(null)
      return
    }

    try {
      await api.post('/auth/logout')
    } catch {/* ignore */} finally {
      localStorage.removeItem('medishare_token')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
