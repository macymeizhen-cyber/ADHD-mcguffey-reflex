import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { LESSONS, getLessonById } from '../../data/lessons'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import ShadowReader from '../reading/ShadowReader'
import QuizModal from '../quiz/QuizModal'
import type { SpeechMetrics } from '../../hooks/useSpeechRecognition'

type Phase = 'intro' | 'shadow-reading' | 'results' | 'quiz' | 'final'

const difficultyConfig = {
  1: { label: 'Beginner', color: 'bg-green-100 text-green-700', icon: '🌱' },
  2: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700', icon: '🌿' },
  3: { label: 'Advanced', color: 'bg-red-100 text-red-700', icon: '🌳' },
}

export default function LessonPlayer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const lessonId = parseInt(id || '1', 10)
  const lesson = getLessonById(lessonId)

  const [phase, setPhase] = useState<Phase>('intro')
  const [metrics, setMetrics] = useState<SpeechMetrics | null>(null)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!lesson) navigate('/lessons')
  }, [lesson, navigate])

  if (!lesson) return null

  const config = difficultyConfig[lesson.difficulty]
  const prevLesson = LESSONS.find(l => l.lesson_order === lesson.lesson_order - 1)
  const nextLesson = LESSONS.find(l => l.lesson_order === lesson.lesson_order + 1)

  const handleShadowComplete = (m: SpeechMetrics) => {
    setMetrics(m)
    setPhase('results')
  }

  const handleQuizComplete = async (score: number) => {
    setQuizScore(score)
    setPhase('final')

    const mastered = (metrics?.accuracy || 0) >= 90 && score >= 80

    if (user && !saved) {
      setSaved(true)

      await supabase.from('attempts').insert({
        user_id: user.id,
        lesson_id: lessonId,
        accuracy: metrics?.accuracy || 0,
        speed: metrics?.speed || 0,
        mastered,
        transcript: metrics?.transcript || '',
        attempt_duration_seconds: metrics?.durationSeconds || 0,
      })

      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (streakData) {
        const today = new Date().toISOString().split('T')[0]
        const lastDate = streakData.last_activity_date
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        let newStreak = streakData.current_streak
        if (lastDate === today) {
          // Already practiced today
        } else if (lastDate === yesterday) {
          newStreak = streakData.current_streak + 1
        } else {
          newStreak = 1
        }

        const points = mastered ? 100 : Math.round((metrics?.accuracy || 0))

        await supabase.from('streaks').update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streakData.longest_streak),
          last_activity_date: today,
          total_focus_points: streakData.total_focus_points + points,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id)
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/lessons" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary font-medium mb-6">
        &#8592; Back to Lessons
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
          {config.icon} {config.label}
        </span>
        <span className="text-xs text-text-muted">Lesson {lesson.lesson_order}</span>
      </div>

      <h1 className="text-2xl font-extrabold text-text mb-6">{lesson.title}</h1>

      {phase === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-text mb-3">Read the passage carefully</h3>
            <div className="bg-gray-50 rounded-xl p-5 text-sm leading-relaxed text-text">
              {lesson.content}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-text mb-3">Anchor Phrases to Watch For</h3>
            <div className="flex flex-wrap gap-2">
              {lesson.anchor_phrases.map((phrase, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary-light/20 text-primary text-xs font-bold rounded-lg">
                  {phrase}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-primary-light/10 rounded-2xl p-5 border border-primary-light/30">
            <h3 className="font-bold text-primary mb-2">How Shadow Reading Works</h3>
            <ol className="text-sm text-text-muted space-y-1.5 list-decimal list-inside">
              <li>Listen to the model read the passage aloud</li>
              <li>When prompted, read the same passage yourself</li>
              <li>Your speech is compared to the original text</li>
              <li>You get scored on accuracy and speed</li>
              <li>Score 90%+ accuracy to master the lesson!</li>
            </ol>
          </div>

          <button
            onClick={() => setPhase('shadow-reading')}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all text-base"
          >
            Start Shadow Reading &#8594;
          </button>
        </div>
      )}

      {phase === 'shadow-reading' && (
        <ShadowReader content={lesson.content} onComplete={handleShadowComplete} />
      )}

      {phase === 'results' && metrics && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-text mb-4">Your Reading Results</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className={`text-3xl font-extrabold ${
                  metrics.accuracy >= 90 ? 'text-success' : metrics.accuracy >= 70 ? 'text-secondary' : 'text-danger'
                }`}>
                  {Math.round(metrics.accuracy)}%
                </div>
                <div className="text-xs text-text-muted font-medium mt-1">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-extrabold text-primary">{Math.round(metrics.speed)}</div>
                <div className="text-xs text-text-muted font-medium mt-1">Words/Min</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-extrabold text-secondary">{metrics.durationSeconds}s</div>
                <div className="text-xs text-text-muted font-medium mt-1">Duration</div>
              </div>
            </div>

            {metrics.transcript && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-bold text-text-muted mb-2">Your Transcript</h4>
                <p className="text-sm text-text italic">"{metrics.transcript}"</p>
              </div>
            )}

            {metrics.accuracy >= 90 ? (
              <div className="bg-green-50 text-success p-4 rounded-xl text-sm font-medium">
                &#11088; Outstanding! You've shown excellent accuracy. Ready for the quiz?
              </div>
            ) : metrics.accuracy >= 70 ? (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl text-sm font-medium">
                Good effort! You can try the quiz or read again to improve your score.
              </div>
            ) : (
              <div className="bg-red-50 text-danger p-4 rounded-xl text-sm font-medium">
                Keep practicing! Try listening to the model again and then reading once more.
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setPhase('shadow-reading'); setMetrics(null); setSaved(false) }}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-text font-bold rounded-xl transition-all text-sm"
            >
              Read Again
            </button>
            <button
              onClick={() => setPhase('quiz')}
              className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all text-sm"
            >
              Take Quiz &#8594;
            </button>
          </div>
        </div>
      )}

      {phase === 'quiz' && (
        <QuizModal
          questions={lesson.quiz_data}
          lessonTitle={lesson.title}
          onComplete={handleQuizComplete}
          onClose={() => setPhase('results')}
        />
      )}

      {phase === 'final' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="text-5xl mb-4 animate-bounce-in">
              {(metrics?.accuracy || 0) >= 90 && (quizScore || 0) >= 80 ? '🏆' : '📚'}
            </div>
            <h2 className="text-xl font-extrabold text-text mb-2">Lesson Complete!</h2>

            {(metrics?.accuracy || 0) >= 90 && (quizScore || 0) >= 80 && (
              <div className="inline-block px-4 py-2 bg-success/10 text-success rounded-full text-sm font-bold mb-4">
                &#11088; Lesson Mastered!
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-sm">
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="font-extrabold text-lg text-primary">{Math.round(metrics?.accuracy || 0)}%</div>
                <div className="text-text-muted">Reading Accuracy</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="font-extrabold text-lg text-secondary">{quizScore}%</div>
                <div className="text-text-muted">Quiz Score</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {prevLesson && (
              <Link
                to={`/lesson/${prevLesson.id}`}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-text font-bold rounded-xl transition-all text-sm text-center"
              >
                &#8592; Previous
              </Link>
            )}
            <button
              onClick={() => { setPhase('intro'); setMetrics(null); setQuizScore(null); setSaved(false) }}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-text font-bold rounded-xl transition-all text-sm"
            >
              Redo Lesson
            </button>
            {nextLesson && (
              <Link
                to={`/lesson/${nextLesson.id}`}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all text-sm text-center"
              >
                Next Lesson &#8594;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
