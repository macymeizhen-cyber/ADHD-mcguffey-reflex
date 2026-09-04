import { useState, useCallback, useEffect, useRef } from 'react'
import { useSpeechRecognition, type SpeechMetrics } from '../../hooks/useSpeechRecognition'

interface ShadowReaderProps {
  content: string
  onComplete: (metrics: SpeechMetrics) => void
}

type ReaderState = 'ready' | 'model-reading' | 'user-reading' | 'completed' | 'no-speech-support'

export default function ShadowReader({ content, onComplete }: ShadowReaderProps) {
  const { interimTranscript, isSupported, startListening, stopListening, getMetrics, reset } = useSpeechRecognition()
  const [state, setState] = useState<ReaderState>(isSupported ? 'ready' : 'no-speech-support')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [modelProgress, setModelProgress] = useState(0)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const words = content.split(/\s+/)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      window.speechSynthesis.cancel()
    }
  }, [])

  const speakWord = useCallback((word: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.85
      utterance.pitch = 1.0
      utterance.lang = 'en-US'

      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()

      window.speechSynthesis.speak(utterance)
      speechSynthRef.current = utterance
    })
  }, [])

  const startModelReading = useCallback(async () => {
    setState('model-reading')
    setCurrentWordIndex(0)
    reset()

    for (let i = 0; i < words.length; i++) {
      setCurrentWordIndex(i)
      setModelProgress(((i + 1) / words.length) * 100)
      await speakWord(words[i])
    }

    setModelProgress(100)
  }, [words, speakWord, reset])

  const handleStartUserReading = useCallback(async () => {
    setState('user-reading')
    reset()
    startListening()
  }, [startListening, reset])

  const handleStopAndScore = useCallback(() => {
    stopListening()
    window.setTimeout(() => {
      const metrics = getMetrics(content)
      setState('completed')
      onComplete(metrics)
    }, 350)
  }, [stopListening, getMetrics, content, onComplete])

  const handleRestart = useCallback(() => {
    reset()
    setState('ready')
    setCurrentWordIndex(0)
    setModelProgress(0)
    window.speechSynthesis.cancel()
  }, [reset])

  if (state === 'no-speech-support') {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-4">🎤</div>
        <h3 className="font-bold text-text mb-2">Speech Recognition Not Available</h3>
        <p className="text-sm text-text-muted mb-4">
          Your browser does not support the Web Speech API. Please try Chrome, Edge, or Safari.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-left">
          <p className="text-xs text-text-muted font-medium mb-2">For now, you can still read along:</p>
          <div className="text-sm text-text leading-relaxed">{content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="font-bold text-text mb-2">Shadow Reading</h3>
        <p className="text-xs text-text-muted">
          Listen to the model, then read aloud to practice!
        </p>
      </div>

      {/* Reading Display */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 min-h-[140px]">
        <div className="text-base leading-relaxed">
          {words.map((word, i) => {
            let className = 'transition-all duration-150 inline '
            if (state === 'model-reading') {
              if (i < currentWordIndex) className += 'text-text-muted '
              else if (i === currentWordIndex) className += 'text-primary font-bold bg-primary-light/20 rounded px-1 '
              else className += 'text-gray-300 '
            } else if (state === 'user-reading') {
              className += 'text-text '
            } else {
              className += 'text-text '
            }
            return (
              <span key={i} className={className}>
                {word}{' '}
              </span>
            )
          })}
        </div>
        {state === 'user-reading' && interimTranscript && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-text-muted font-medium">Hearing: </span>
            <span className="text-sm text-primary italic">{interimTranscript}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {state === 'model-reading' && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span>Model reading...</span>
            <span>{Math.round(modelProgress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${modelProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 justify-center">
        {state === 'ready' && (
          <button
            onClick={startModelReading}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2"
          >
            <span>▶</span> Listen to Model
          </button>
        )}

        {state === 'model-reading' && (
          <button
            onClick={() => {
              window.speechSynthesis.cancel()
              handleStartUserReading()
            }}
            className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2"
          >
            <span>🎤</span> Your Turn to Read!
          </button>
        )}

        {state === 'user-reading' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-success text-sm font-medium">
              <div className="w-3 h-3 bg-danger rounded-full animate-pulse" />
              Listening...
            </div>
            <button
              onClick={handleStopAndScore}
              className="px-6 py-3 bg-danger hover:bg-red-600 text-white font-bold rounded-xl transition-all text-sm"
            >
              Stop & Score
            </button>
          </div>
        )}

        {state === 'completed' && (
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-text font-bold rounded-xl transition-all text-sm"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
