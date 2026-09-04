import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Lesson } from '../types'

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLessons = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('lessons')
      .select('*')
      .order('lesson_order', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setLessons(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  return { lessons, loading, error, refetch: fetchLessons }
}
