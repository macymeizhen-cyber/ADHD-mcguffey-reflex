import { Link } from 'react-router-dom'
import type { Lesson } from '../../types'

const difficultyColors = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-red-100 text-red-700',
}

const difficultyLabels = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
}

export default function LessonCard({ lesson, mastered, lastAccuracy }: {
  lesson: Lesson
  mastered: boolean
  lastAccuracy?: number
}) {
  return (
    <Link
      to={`/lesson/${lesson.id}`}
      className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-light transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[lesson.difficulty]}`}>
          {difficultyLabels[lesson.difficulty]}
        </span>
        {mastered && (
          <span className="text-lg" title="Mastered">&#11088;</span>
        )}
      </div>
      <h3 className="font-bold text-text group-hover:text-primary transition-colors mb-2">
        {lesson.title}
      </h3>
      <p className="text-xs text-text-muted line-clamp-2 mb-3">
        {lesson.content.substring(0, 100)}...
      </p>
      {lastAccuracy !== undefined && (
        <div className="flex items-center gap-2 mt-auto">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                lastAccuracy >= 90 ? 'bg-success' : lastAccuracy >= 70 ? 'bg-secondary' : 'bg-danger'
              }`}
              style={{ width: `${lastAccuracy}%` }}
            />
          </div>
          <span className="text-xs font-bold text-text-muted">{Math.round(lastAccuracy)}%</span>
        </div>
      )}
    </Link>
  )
}
