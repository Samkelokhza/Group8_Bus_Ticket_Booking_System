import { createContext, useState, useEffect } from 'react'
import api from '../api/axios'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/auth/me/', { headers: { Authorization: Bearer  } })
        .then(res => { setUser(res.data); setLoading(false) })
        .catch(() => { localStorage.clear(); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const userRes = await api.get('/auth/me/', { headers: { Authorization: Bearer  } })
    setUser(userRes.data)
    return userRes.data
  }

  const register = async (userData) => {
    await api.post('/auth/register/', userData)
    return login(userData.username, userData.password)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  const isAdmin = user?.roles?.includes('Admin')

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
