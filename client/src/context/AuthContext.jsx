import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import api from '../utils/api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        localStorage.setItem('gs_access_token', session.access_token)
        fetchWorkerProfile()
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user)
          localStorage.setItem('gs_access_token', session.access_token)
          fetchWorkerProfile()
        } else {
          setUser(null)
          setWorker(null)
          localStorage.removeItem('gs_access_token')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchWorkerProfile = async () => {
    try {
      const res = await api.get('/api/workers/me')
      setWorker(res.data)
    } catch (err) {
      // Profile may not exist yet (new signup)
      console.log('No worker profile found:', err.message)
    }
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setWorker(null)
    localStorage.removeItem('gs_access_token')
  }

  const createWorkerProfile = async (profileData) => {
    try {
      const res = await api.post('/api/workers/profile', profileData)
      setWorker(res.data)
      return res.data
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create profile')
    }
  }

  const value = {
    user,
    worker,
    loading,
    signUp,
    signIn,
    signOut,
    createWorkerProfile,
    fetchWorkerProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
