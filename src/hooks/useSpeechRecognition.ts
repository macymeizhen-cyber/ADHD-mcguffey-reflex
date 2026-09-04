import { useState, useEffect, useRef } from 'react';

// Browser-native Web Speech API type declarations (no external dependency)
type SpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { readonly transcript: string };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechRecognitionProps {
  targetText: string;
  onResult?: (result: { accuracy: number; speed: number; transcript: string }) => void;
}

export function useSpeechRecognition({ targetText, onResult }: UseSpeechRecognitionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('您的浏览器不支持语音识别，请使用 Chrome、Edge 或 Safari');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
        const targetWords = targetText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const spokenWords = finalTranscript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        
        let correctWords = 0;
        for (let i = 0; i < Math.min(targetWords.length, spokenWords.length); i++) {
          if (targetWords[i] === spokenWords[i]) {
            correctWords++;
          }
        }
        const accuracy = targetWords.length > 0 ? (correctWords / targetWords.length) * 100 : 0;
        
        const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
        const speed = elapsedSeconds > 0 ? (spokenWords.length / elapsedSeconds) * 60 : 0;
        
        if (onResult) {
          onResult({
            accuracy: Math.round(accuracy),
            speed: Math.round(speed),
            transcript: finalTranscript
          });
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('请允许浏览器访问麦克风权限，然后重试');
      } else if (event.error === 'no-speech') {
        setError('没有检测到语音，请确保麦克风正常工作');
      } else {
        setError(`语音识别错误: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [targetText, onResult]);

  const startRecording = () => {
    setError(null);
    setTranscript('');
    if (!recognitionRef.current) {
      setError('语音识别未初始化，请刷新页面重试');
      return;
    }
    try {
      startTimeRef.current = Date.now();
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('无法启动麦克风，请检查权限设置');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // 忽略
      }
    }
    setIsRecording(false);
  };

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    isSupported: !!recognitionRef.current
  };
}

// Legacy type export for backward compatibility
export interface SpeechMetrics {
  accuracy: number;
  speed: number;
  transcript: string;
  durationSeconds: number;
}
