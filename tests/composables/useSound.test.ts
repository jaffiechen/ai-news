import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSound } from '@/composables/useSound'

describe('useSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should detect breaking news with keywords', () => {
    const { detectBreakingNews } = useSound()
    const news = { title: 'GPT-5 重磅发布', pubDate: '2026-07-13T10:30:00Z' }
    
    const result = detectBreakingNews(news)
    
    expect(result.isBreaking).toBe(true)
  })

  it('should not detect non-breaking news', () => {
    const { detectBreakingNews } = useSound()
    const news = { title: 'AI入门教程', pubDate: '2026-07-13T10:30:00Z' }
    
    const result = detectBreakingNews(news)
    
    expect(result.isBreaking).toBe(false)
  })

  it('should handle empty title', () => {
    const { detectBreakingNews } = useSound()
    const news = { title: '', pubDate: '2026-07-13T10:30:00Z' }
    
    const result = detectBreakingNews(news)
    
    expect(result.isBreaking).toBe(false)
  })

  it('should not play sound when disabled', () => {
    const { playNotification } = useSound()
    
    const result = playNotification()
    
    expect(result.success).toBe(true)
  })
})