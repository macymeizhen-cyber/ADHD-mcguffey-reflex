export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export interface Lesson {
  id: number
  title: string
  content: string
  anchor_phrases: string[]
  difficulty: 1 | 2 | 3
  lesson_order: number
  quiz_data: QuizQuestion[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

export interface Attempt {
  id: string
  user_id: string
  lesson_id: number
  accuracy: number
  speed: number
  mastered: boolean
  transcript: string
  attempt_duration_seconds: number
  attempted_at: string
}

export interface Streak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  total_focus_points: number
  updated_at: string
}

export interface UserProgress {
  user_id: string
  mastered_count: number
  attempted_count: number
  avg_accuracy: number
  avg_speed: number
}
