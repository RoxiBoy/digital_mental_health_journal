export interface User {
  id: string
  email: string
  displayName: string
  group: "adaptive" | "control"
  consentGiven: boolean
  createdAt: string
}

export interface JournalEntry {
  _id: string
  userId: string
  content: string
  sentiment?: string
  emotion?: string
  sentimentScore?: number
  moodRating?: number
  createdAt: string
  typingSpeed?: number
  wordCount?: number
}

export interface Feedback {
  _id: string
  userId: string
  journalEntryId: string
  feedbackText: string
  feedbackType?: string
  ruleTriggered?: string
  createdAt: string
}

export interface MoodSurvey {
  _id: string
  userId: string
  period?: string
  depressionScore?: number
  anxietyScore?: number
  wellBeingScore?: number
  emotionalRegulationScore?: number
  createdAt: string
}

export interface EngagementMetric {
  _id: string
  userId: string
  sessionDate: string
  entriesWritten: number
  avgEntryLength?: number
  timeSpent?: number
  appOpens?: number
}
