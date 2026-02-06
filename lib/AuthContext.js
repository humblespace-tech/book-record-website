import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.authenticated === true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const login = async (password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      setIsAdmin(true)
      return { success: true }
    }
    return { success: false, error: data.error || 'Login failed' }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
