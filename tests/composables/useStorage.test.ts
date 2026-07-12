import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useStorage } from '@/composables/useStorage'

describe('useStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { resetFavorites } = useStorage()
    resetFavorites()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return empty favorites when none stored', () => {
    const { getFavorites } = useStorage()
    expect(getFavorites()).toEqual([])
  })

  it('should add news to favorites', () => {
    const { toggleFavorite, getFavorites } = useStorage()
    const news = { id: 'news-001', title: 'Test News', link: 'http://example.com', source: 'test' }
    
    const result = toggleFavorite(news)
    
    expect(result.success).toBe(true)
    expect(getFavorites()).toHaveLength(1)
    expect(getFavorites()[0].newsId).toBe('news-001')
  })

  it('should remove news from favorites', () => {
    const { toggleFavorite, getFavorites } = useStorage()
    const news = { id: 'news-001', title: 'Test News', link: 'http://example.com', source: 'test' }
    
    toggleFavorite(news)
    const result = toggleFavorite(news)
    
    expect(result.success).toBe(true)
    expect(getFavorites()).toHaveLength(0)
  })

  it('should return default preferences when none stored', () => {
    const { getPreferences } = useStorage()
    const prefs = getPreferences()
    
    expect(prefs.theme).toBe('auto')
    expect(prefs.soundEnabled).toBe(false)
  })

  it('should save preferences', () => {
    const { savePreferences, getPreferences } = useStorage()
    
    const result = savePreferences({ theme: 'dark', soundEnabled: true })
    
    expect(result.success).toBe(true)
    const prefs = getPreferences()
    expect(prefs.theme).toBe('dark')
    expect(prefs.soundEnabled).toBe(true)
  })

  it('should export data', () => {
    const { exportData } = useStorage()
    
    const result = exportData()
    
    expect(result.success).toBe(true)
    expect(result.data?.favorites).toBeDefined()
    expect(result.data?.preferences).toBeDefined()
  })

  it('should import valid data', () => {
    const { importData, getFavorites, getPreferences } = useStorage()
    const data = {
      favorites: [{ newsId: 'news-001', title: 'Test', link: 'http://example.com', source: 'test', savedAt: '2026-07-13' }],
      preferences: { enabledSources: ['arxiv'], theme: 'dark', soundEnabled: false, lastUpdateTime: '' }
    }
    
    const result = importData(data)
    
    expect(result.success).toBe(true)
    expect(getFavorites()).toHaveLength(1)
    expect(getPreferences().theme).toBe('dark')
  })

  it('should reject invalid import data', () => {
    const { importData } = useStorage()
    const invalidData = { favorites: 'not-an-array', preferences: {} }
    
    const result = importData(invalidData as any)
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('1003')
  })
})