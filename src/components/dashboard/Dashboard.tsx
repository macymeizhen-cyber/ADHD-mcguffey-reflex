import { useAuth } from '../../contexts/AuthContext'
import { LESSONS } from '../../data/lessons'
import LessonCard from './LessonCard'
import StreakBadge from '../gamification/StreakBadge'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface ProgressData {
  mastered_count: number
  attempted_count: number
  avg_accuracy: number
  avg_speed: number
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [recentAttempts, setRecentAttempts] = useState<{ lesson_id: number; accuracy: number; mastered: boolean }[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<0 | 1 | 2 | 3>(0)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const { data: progressData } = await supabase
        .from('attempts')
        .select('lesson_id, accuracy, speed, mastered')
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false })

      if (progressData) {
        const masteredLessons = new Set(progressData.filter(a => a.mastered).map(a => a.lesson_id))
        const attemptedLessons = new Set(progressData.map(a => a.lesson_id))
        const accuracySum = progressData.reduce((s, a) => s + (a.accuracy || 0), 0)
        const speedSum = progressData.reduce((s, a) => s + (a.speed || 0), 0)
        const count = progressData.length || 1

        setProgress({
          mastered_count: masteredLessons.size,
          attempted_count: attemptedLessons.size,
          avg_accuracy: Math.round((accuracySum / count) * 100) / 100,
          avg_speed: Math.round((speedSum / count) * 100) / 100,
        })

        const latestByLesson = new Map<number, { lesson_id: number; accuracy: number; speed: number; mastered: boolean }>()
        for (const attempt of progressData) {
          if (!latestByLesson.has(attempt.lesson_id)) {
            latestByLesson.set(attempt.lesson_id, attempt)
          }
        }
        setRecentAttempts(Array.from(latestByLesson.values()))
      }
    }

    fetchData()
  }, [user])

  const totalLessons = LESSONS.length
  const masteredCount = progress?.mastered_count || 0
  const attemptedCount = progress?.attempted_count || 0
  const avgAccuracy = progress?.avg_accuracy || 0

  const filteredLessons = selectedDifficulty === 0
    ? LESSONS
    : LESSONS.filter(l => l.difficulty === selectedDifficulty)

  const getMasteryForLesson = (lessonId: number) => {
    const attempt = recentAttempts.find(a => a.lesson_id === lessonId)
    return attempt?.mastered || false
  }

  const getAccuracyForLesson = (lessonId: number) => {
    const attempt = recentAttempts.find(a => a.lesson_id === lessonId)
    return attempt?.accuracy
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-text">
          Welcome back, {profile?.username || 'Reader'}!
        </h1>
        <p className="text-text-muted text-sm mt-1">Keep up your reading streak!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-extrabold text-primary">{masteredCount}/{totalLessons}</div>
          <div className="text-sm text-text-muted font-medium mt-1">Lessons Mastered</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: `${(masteredCount / totalLessons) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-extrabold text-secondary">{attemptedCount}</div>
          <div className="text-sm text-text-muted font-medium mt-1">Lessons Attempted</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-extrabold text-success">{avgAccuracy}%</div>
          <div className="text-sm text-text-muted font-medium mt-1">Avg Accuracy</div>
          <div className="text-xs text-text-muted mt-2">
            {Math.round(progress?.avg_speed || 0)} words/min
          </div>
        </div>

        <StreakBadge />
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-sm font-semibold text-text-muted">Difficulty:</span>
        {[
          { value: 0, label: 'All', color: 'bg-gray-100 text-gray-600' },
          { value: 1, label: 'Beginner', color: 'bg-green-100 text-green-700' },
          { value: 2, label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
          { value: 3, label: 'Advanced', color: 'bg-red-100 text-red-700' },
        ].map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => setSelectedDifficulty(value as 0 | 1 | 2 | 3)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedDifficulty === value
                ? 'bg-primary text-white shadow-md'
                : `${color} hover:shadow-sm`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map(lesson => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            mastered={getMasteryForLesson(lesson.id)}
            lastAccuracy={getAccuracyForLesson(lesson.id)}
          />
        ))}
      </div>
    </div>
  )
}
