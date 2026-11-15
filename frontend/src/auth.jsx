import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { api } from './api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) { setMe(null); setLoading(false) }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    api.me()
      .then((m) => { if (!cancelled) setMe(m) })
      .catch(() => { if (!cancelled) setError('Could not reach the server. It may be waking up, try again in a moment.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    try { await api.recordLogin() } catch { /* non-fatal */ }
  }
  const signup = async (fullName, email, password, phone) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone } } })
    if (error) throw error
    if (data.session) { try { await api.recordLogin() } catch { /* non-fatal */ } }
    return data
  }
  const logout = () => supabase.auth.signOut()
  const refreshMe = () => api.me().then(setMe)

  return (
    <AuthContext.Provider value={{ session, me, loading, error, login, signup, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}
