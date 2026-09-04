import { useState, useEffect } from 'react'
import { fetchStreak } from '../../lib/progressStore'

export default function StreakBadge() {
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [focusPoints, setFocusPoints] = useState(0)

  useEffect(() => {
    const fetchStreakData = async () => {
      const { data } = await fetchStreak()

      if (data) {
        setStreak(data.current_streak)
        setLongestStreak(data.longest_streak)
        setFocusPoints(data.total_focus_points)
      }
    }

    fetchStreakData()
  }, [])

  const streakLevel = streak >= 7 ? 'fire' : streak >= 3 ? 'star' : streak > 0 ? 'spark' : 'none'

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">
          {streakLevel === 'fire' ? '🔥' : streakLevel === 'star' ? '⭐' : streakLevel === 'spark' ? '✨' : '📖'}
        </span>
        <div className="text-3xl font-extrabold text-secondary">{streak}</div>
      </div>
      <div className="text-sm text-text-muted font-medium">Day Streak</div>
      {longestStreak > 0 && (
        <div className="text-xs text-text-muted mt-1">Best: {longestStreak} days</div>
      )}
      {focusPoints > 0 && (
        <div className="text-xs text-secondary font-bold mt-1">{focusPoints} Focus Points</div>
      )}
    </div>
  )
}
