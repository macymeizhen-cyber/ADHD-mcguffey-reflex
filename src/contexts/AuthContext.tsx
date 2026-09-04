import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { enableLocalMode, disableLocalMode, isLocalMode } from '../lib/progressStore'
import type { Profile } from '../types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  localMode: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string }>
  signInAnonymously: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [localMode, setLocalMode] = useState(false)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }, [])

  useEffect(() => {
    setLocalMode(isLocalMode())
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message }
  }

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) return { error: error.message }
    return {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const ensureGuestProfile = useCallback(async (userId: string, username?: string) => {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('id', userId)
    if (count === 0) {
      await supabase.from('profiles').insert({ id: userId, username: username || 'Guest Reader' })
    }

    const { count: streakCount } = await supabase
      .from('streaks')
      .select('user_id', { count: 'exact', head: true })
      .eq('user_id', userId)
    if (streakCount === 0) {
      await supabase.from('streaks').insert({ user_id: userId })
    }
  }, [])

  const signInAnonymously = useCallback(async () => {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      enableLocalMode()
      setLocalMode(true)
      return { error: error.message }
    }
    disableLocalMode()
    setLocalMode(false)
    if (data.user) {
      await ensureGuestProfile(data.user.id)
    }
    return {}
  }, [ensureGuestProfile])

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, localMode, signIn, signUp, signInAnonymously, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
