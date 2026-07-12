export interface News {
  id: string
  title: string
  link: string
  source: string
  category?: string
  summary?: string
  pubDate: string
  isBreaking?: boolean
  imageUrl?: string
}

export interface Source {
  id: string
  name: string
  icon?: string
  rssUrl: string
  category?: string
  enabled?: boolean
}

export interface Favorite {
  newsId: string
  title: string
  link: string
  source: string
  savedAt: string
}

export interface UserPreference {
  enabledSources: string[]
  theme: 'light' | 'dark' | 'auto'
  soundEnabled: boolean
  lastUpdateTime: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}