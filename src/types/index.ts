export interface News {
  id: string
  site_id: string
  site_name: string
  source: string
  title: string
  title_zh?: string | null
  title_en?: string | null
  title_bilingual?: string
  url: string
  published_at: string | null
  first_seen_at: string
  last_seen_at: string
  summary?: string
  isBreaking?: boolean
  imageUrl?: string
}

export interface Source {
  id: string
  name: string
  icon?: string
  rssUrl?: string
  url?: string
  category?: string
  enabled?: boolean
  type?: 'rss' | 'html'
  selectors?: {
    list: string
    title: string
    link: string
    summary?: string
    date?: string
  }
}

export interface SiteStat {
  site_id: string
  site_name: string
  count: number
  raw_count: number
}

export interface LatestPayload {
  generated_at: string
  window_hours: number
  total_items: number
  total_items_ai_raw: number
  total_items_raw: number
  total_items_all_mode: number
  topic_filter: string
  archive_total: number
  site_count: number
  source_count: number
  site_stats: SiteStat[]
  items: News[]
}

export interface Favorite {
  newsId: string
  title: string
  link: string
  source: string
  savedAt: string
}

export interface History {
  newsId: string
  title: string
  link: string
  source: string
  readAt: string
}

export interface UserPreference {
  enabledSources: string[]
  theme: 'light' | 'dark' | 'auto'
  soundEnabled: boolean
  lastUpdateTime: string
  translateMode?: 'zh' | 'en' | 'bilingual'
  lastSeenFavoritesCount?: number
  lastSeenHistoryCount?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
