import type { News, ApiResponse } from '@/types'
import { config } from '@/config'
import { success, error } from '@/utils/response'
import { useStorage } from './useStorage'

export function useSound() {
  const { getPreferences } = useStorage()

  function detectBreakingNews(news: News): { isBreaking: boolean } {
    if (!news.title) {
      return { isBreaking: false }
    }

    const title = news.title.toLowerCase()
    const keywords = config.breakingKeywords.map(k => k.toLowerCase())
    
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        return { isBreaking: true }
      }
    }
    
    return { isBreaking: false }
  }

  function playNotification(): ApiResponse<void> {
    const prefs = getPreferences()
    if (!prefs.soundEnabled) {
      return success()
    }

    try {
      if (!('AudioContext' in window)) {
        console.warn('[AI-News] AudioContext not supported')
        return success()
      }

      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)

      return success()
    } catch (e) {
      console.error('[AI-News] Failed to play notification:', e)
      return error('1002', '播放音效失败')
    }
  }

  return {
    detectBreakingNews,
    playNotification
  }
}