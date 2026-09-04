import { useState, useRef, useCallback, useEffect } from 'react'
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export interface TranscriptSegment {
  text: string
  timestamp: number
}

export interface SpeechMetrics {
  accuracy: number
  speed: number
  transcript: string
  durationSeconds: number
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const startTimeRef = useRef<number>(0)
  const segmentsRef = useRef<TranscriptSegment[]>([])
  const transcriptRef = useRef('')

  const commitTranscript = useCallback((newTranscript: string) => {
    transcriptRef.current = newTranscript
    setTranscript(newTranscript)
  }, [])

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognitionAPI)
  }, [])

  const getMetrics = useCallback((targetText: string): SpeechMetrics => {
    const duration = (Date.now() - startTimeRef.current) / 1000
    const currentTranscript = transcriptRef.current
    const wordsSpoken = currentTranscript.split(/\s+/).filter(Boolean).length
    const speed = duration > 0 ? (wordsSpoken / duration) * 60 : 0

    const targetWords = targetText.toLowerCase().split(/\s+/).filter(Boolean)
    const spokenWords = currentTranscript.toLowerCase().split(/\s+/).filter(Boolean)

    let matches = 0
    const usedIndices = new Set<number>()

    for (const spoken of spokenWords) {
      for (let i = 0; i < targetWords.length; i++) {
        if (!usedIndices.has(i) && spoken === targetWords[i]) {
          matches++
          usedIndices.add(i)
          break
        }
      }
    }

    const accuracy = targetWords.length > 0 ? (matches / targetWords.length) * 100 : 0

    return {
      accuracy: Math.round(accuracy * 100) / 100,
      speed: Math.round(speed * 100) / 100,
      transcript: currentTranscript,
      durationSeconds: Math.round(duration),
    }
  }, [])

  const startListening = useCallback((lang = 'en-US') => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
          segmentsRef.current.push({
            text: result[0].transcript,
            timestamp: Date.now(),
          })
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        const combined = (transcriptRef.current + ' ' + final).trim()
        commitTranscript(combined)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    commitTranscript('')
    setInterimTranscript('')
    segmentsRef.current = []
    startTimeRef.current = Date.now()
    recognition.start()
    setIsListening(true)
  }, [commitTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const reset = useCallback(() => {
    commitTranscript('')
    setInterimTranscript('')
    segmentsRef.current = []
  }, [commitTranscript])

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    getMetrics,
    reset,
  }
}
