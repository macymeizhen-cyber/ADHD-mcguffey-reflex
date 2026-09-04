import { LESSONS } from '../data/lessons'
import { Link } from 'react-router-dom'

const difficultyConfig = {
  1: { label: 'Beginner', color: 'bg-green-100 text-green-700', emoji: '🌱' },
  2: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700', emoji: '🌿' },
  3: { label: 'Advanced', color: 'bg-red-100 text-red-700', emoji: '🌳' },
}

export default function LessonsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-text mb-2">All Lessons</h1>
      <p className="text-sm text-text-muted mb-8">30 lessons from foundational phonics to advanced comprehension</p>

      {[1, 2, 3].map(diff => (
        <div key={diff} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{difficultyConfig[diff as 1|2|3].emoji}</span>
            <h2 className="text-lg font-extrabold text-text">
              Level {diff}: {difficultyConfig[diff as 1|2|3].label}
            </h2>
          </div>
          <div className="space-y-3">
            {LESSONS.filter(l => l.difficulty === diff).map(lesson => (
              <Link
                key={lesson.id}
                to={`/lesson/${lesson.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-light transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-light/20 text-primary rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0">
                    {lesson.lesson_order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      {lesson.content.substring(0, 80)}...
                    </p>
                  </div>
                  <div className="text-xs text-text-muted shrink-0">
                    {lesson.quiz_data.length} questions
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
