import { useState } from 'react'
import type { QuizQuestion } from '../../types'

interface QuizModalProps {
  questions: QuizQuestion[]
  lessonTitle: string
  onComplete: (score: number) => void
  onClose: () => void
}

export default function QuizModal({ questions, lessonTitle, onComplete, onClose }: QuizModalProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)

  const question = questions[currentQ]
  const isLastQuestion = currentQ === questions.length - 1

  const handleSelect = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    const isCorrect = index === question.correctIndex
    setAnswers([...answers, isCorrect])

    setTimeout(() => {
      if (isLastQuestion) {
        const finalAnswers = [...answers, isCorrect]
        const score = Math.round((finalAnswers.filter(Boolean).length / questions.length) * 100)
        setShowResult(true)
        setTimeout(() => onComplete(score), 2000)
      } else {
        setCurrentQ(currentQ + 1)
        setSelected(null)
      }
    }, 1000)
  }

  const score = answers.length > 0 ? Math.round((answers.filter(Boolean).length / answers.length) * 100) : 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full animate-bounce-in">
        {!showResult ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-text text-lg">Quiz: {lessonTitle}</h3>
                <p className="text-xs text-text-muted mt-1">
                  Question {currentQ + 1} of {questions.length}
                </p>
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-text text-lg p-2">
                &#10005;
              </button>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>

            <h4 className="font-bold text-text mb-4 text-base">{question.question}</h4>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                let buttonClass = 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all '
                if (selected === null) {
                  buttonClass += 'border-gray-200 bg-white hover:border-primary-light hover:bg-primary-light/5 text-text cursor-pointer'
                } else if (index === question.correctIndex) {
                  buttonClass += 'border-success bg-green-50 text-success'
                } else if (index === selected && selected !== question.correctIndex) {
                  buttonClass += 'border-danger bg-red-50 text-danger'
                } else {
                  buttonClass += 'border-gray-200 bg-gray-50 text-text-muted'
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={selected !== null}
                    className={buttonClass}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">
              {score >= 90 ? '🎉' : score >= 70 ? '👍' : '💪'}
            </div>
            <h3 className="font-extrabold text-2xl text-text mb-2">
              {score}%
            </h3>
            <p className="text-text-muted font-medium">
              {score >= 90 ? 'Excellent! You nailed it!' : score >= 70 ? 'Great job! Keep practicing!' : 'Good effort! Try the lesson again to improve!'}
            </p>
            <div className="mt-4 flex gap-1 justify-center">
              {answers.map((correct, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    correct ? 'bg-success text-white' : 'bg-danger text-white'
                  }`}
                >
                  {correct ? '✓' : '✗'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
