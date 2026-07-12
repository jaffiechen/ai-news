import { describe, it, expect } from 'vitest'
import { formatTime } from '@/utils/format'

describe('formatTime', () => {
  it('should format time as "刚刚" for very recent', () => {
    const now = new Date().toISOString()
    expect(formatTime(now)).toBe('刚刚')
  })

  it('should format time as "X分钟前"', () => {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    expect(formatTime(oneMinuteAgo)).toBe('1分钟前')
  })

  it('should format time as "X小时前"', () => {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    expect(formatTime(oneHourAgo)).toBe('1小时前')
  })

  it('should format time as "X天前"', () => {
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString()
    expect(formatTime(oneDayAgo)).toBe('1天前')
  })

  it('should handle invalid date', () => {
    expect(formatTime('invalid-date')).toBe('未知时间')
  })
})