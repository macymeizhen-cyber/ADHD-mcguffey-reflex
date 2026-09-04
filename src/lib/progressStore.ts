import { supabase } from './supabase'

export interface StoredAttempt {
  id: string
  lesson_id: number
  accuracy: number
  speed: number
  mastered: boolean
  transcript: string
  attempt_duration_seconds: number
  attempted_at: string
}

export interface StoredStreak {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  total_focus_points: number
}

const LOCAL_ATTEMPTS_KEY = 'brainquest_local_attempts'
const LOCAL_STREAK_KEY = 'brainquest_local_streak'
const LOCAL_USER_KEY = 'brainquest_local_user'

export function isLocalMode(): boolean {
  return localStorage.getItem(LOCAL_USER_KEY) === 'guest'
}

export function enableLocalMode(): void {
  localStorage.setItem(LOCAL_USER_KEY, 'guest')
}

export function disableLocalMode(): void {
  localStorage.removeItem(LOCAL_USER_KEY)
}

function readLocalAttempts(): StoredAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ATTEMPTS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocalAttempts(attempts: StoredAttempt[]): void {
  localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(attempts))
}

function readLocalStreak(): StoredStreak {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STREAK_KEY) || 'null') ||
      { current_streak: 0, longest_streak: 0, last_activity_date: null, total_focus_points: 0 }
  } catch {
    return { current_streak: 0, longest_streak: 0, last_activity_date: null, total_focus_points: 0 }
  }
}

function writeLocalStreak(streak: StoredStreak): void {
  localStorage.setItem(LOCAL_STREAK_KEY, JSON.stringify(streak))
}

// --- Attempts ---
export async function saveAttempt(attempt: Omit<StoredAttempt, 'id' | 'attempted_at'>, userId?: string): Promise<{ error?: string }> {
  if (!isLocalMode()) {
    const { data: { user } } = await supabase.auth.getUser()
    const uid = userId || user?.id
    if (!uid) return { error: 'Not authenticated' }
    const { error } = await supabase.from('attempts').insert({
      ...attempt,
      user_id: uid,
      id: undefined,
      attempted_at: new Date().toISOString(),
    })
    if (error) return { error: error.message }
    return {}
  }

  const list = readLocalAttempts()
  list.unshift({
    ...attempt,
    id: crypto.randomUUID(),
    attempted_at: new Date().toISOString(),
  })
  writeLocalAttempts(list)
  return {}
}

export async function fetchAttempts(): Promise<{ data?: StoredAttempt[]; error?: string }> {
  if (!isLocalMode()) {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .order('attempted_at', { ascending: false })
    if (error) return { error: error.message }
    return { data: (data || []) as StoredAttempt[] }
  }

  return { data: readLocalAttempts() }
}

// --- Streaks ---
export async function fetchStreak(): Promise<{ data?: StoredStreak; error?: string }> {
  if (!isLocalMode()) {
    const { data, error } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak, last_activity_date, total_focus_points')
      .single()
    if (error) return { error: error.message }
    if (!data) return {}
    return { data: data as StoredStreak }
  }

  return { data: readLocalStreak() }
}

export async function updateStreak(patch: Partial<StoredStreak>): Promise<{ error?: string }> {
  if (!isLocalMode()) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { error } = await supabase
      .from('streaks')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
    if (error) return { error: error.message }
    return {}
  }

  const current = readLocalStreak()
  writeLocalStreak({ ...current, ...patch })
  return {}
}
