import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = async (username, password) => {
    const { data } = await axios.post('http://localhost:8000/api/auth/login/', { username, password })
    localStorage.setItem('access', data.access)
    setUser(data.user)   // we'll need to fetch user after login
    return data
  }

  const register = async (formData) => {
    await axios.post('http://localhost:8000/api/auth/register/', formData)
  }

  const logout = () => {
    localStorage.removeItem('access')
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      axios.get('http://localhost:8000/api/auth/me/', { headers: { Authorization: `Bearer ${token}` }})
        .then(res => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)