import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNews } from '@/composables/useNews'

describe('useNews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should filter news by sources', () => {
    const { filterBySources, newsList } = useNews()
    newsList.value = [
      { id: '1', title: 'News 1', source: 'quantum-bit', pubDate: '2026-07-13T10:30:00Z' },
      { id: '2', title: 'News 2', source: 'arxiv', pubDate: '2026-07-13T09:30:00Z' },
      { id: '3', title: 'News 3', source: 'openai', pubDate: '2026-07-13T08:30:00Z' }
    ] as any
    
    const filtered = filterBySources(['quantum-bit', 'arxiv'])
    
    expect(filtered).toHaveLength(2)
    expect(filtered.every(n => ['quantum-bit', 'arxiv'].includes(n.source))).toBe(true)
  })

  it('should return all news when sources is empty', () => {
    const { filterBySources, newsList } = useNews()
    newsList.value = [
      { id: '1', title: 'News 1', source: 'quantum-bit', pubDate: '2026-07-13T10:30:00Z' }
    ] as any
    
    const filtered = filterBySources([])
    
    expect(filtered).toHaveLength(1)
  })

  it('should ignore invalid source IDs', () => {
    const { filterBySources, newsList } = useNews()
    newsList.value = [
      { id: '1', title: 'News 1', source: 'quantum-bit', pubDate: '2026-07-13T10:30:00Z' }
    ] as any
    
    const filtered = filterBySources(['nonexistent'])
    
    expect(filtered).toHaveLength(0)
  })
})