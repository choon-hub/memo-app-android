export type WorkoutCategory = 'chest' | 'back' | 'legs'

export type DailyNew = {
  id: string
  title: string
  content: string
  created_at: string
}

export type Topic = {
  id: string
  content: string
  persons: string[]
  created_at: string
}

export type WorkoutRecord = {
  id: string
  category: WorkoutCategory
  menu: string
  intensity: number
  reps: number
  created_at: string
}

export type SortOrder = 'asc' | 'desc'
