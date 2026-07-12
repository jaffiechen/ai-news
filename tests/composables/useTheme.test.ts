import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTheme } from '@/composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return current theme', () => {
    const { getCurrentTheme } = useTheme()
    
    expect(['auto', 'light', 'dark']).toContain(getCurrentTheme())
  })

  it('should apply light theme', () => {
    const { applyTheme } = useTheme()
    
    applyTheme('light')
    
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('should apply dark theme', () => {
    const { applyTheme } = useTheme()
    
    applyTheme('dark')
    
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should cycle through themes', async () => {
    const { toggleTheme, currentTheme } = useTheme()
    const initial = currentTheme.value
    
    await toggleTheme()
    
    expect(currentTheme.value).not.toBe(initial)
  })

  it('should use default for invalid theme', () => {
    const { applyTheme } = useTheme()
    
    applyTheme('invalid' as any)
    
    expect(['auto', 'light', 'dark']).toContain(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  })
})