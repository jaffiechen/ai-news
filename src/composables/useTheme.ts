import { ref } from 'vue'
import type { ApiResponse } from '@/types'
import { config } from '@/config'
import { success } from '@/utils/response'
import { useStorage } from './useStorage'

type ThemeMode = 'light' | 'dark' | 'auto'

const currentTheme = ref<ThemeMode>('auto')

export function useTheme() {
  const { getPreferences, savePreferences } = useStorage()

  function getCurrentTheme(): string {
    return currentTheme.value
  }

  function applyTheme(theme: string): void {
    const validThemes: ThemeMode[] = ['light', 'dark', 'auto']
    if (!validThemes.includes(theme as ThemeMode)) {
      theme = 'auto'
    }

    currentTheme.value = theme as ThemeMode

    let appliedTheme: 'light' | 'dark'
    if (theme === 'auto') {
      const hour = new Date().getHours()
      appliedTheme = hour >= config.themeAutoStartHour && hour < config.themeAutoEndHour ? 'light' : 'dark'
    } else {
      appliedTheme = theme as 'light' | 'dark'
    }

    document.documentElement.classList.toggle('dark', appliedTheme === 'dark')
  }

  async function toggleTheme(mode?: ThemeMode): Promise<ApiResponse<{ currentTheme: string }>> {
    const current = currentTheme.value
    
    if (!mode) {
      const themes: ThemeMode[] = ['auto', 'light', 'dark']
      const currentIndex = themes.indexOf(current)
      mode = themes[(currentIndex + 1) % themes.length]
    }

    applyTheme(mode)
    await savePreferences({ theme: mode })
    
    return success({ currentTheme: mode })
  }

  function initTheme(): void {
    const prefs = getPreferences()
    applyTheme(prefs.theme)
  }

  return {
    currentTheme,
    getCurrentTheme,
    applyTheme,
    toggleTheme,
    initTheme
  }
}