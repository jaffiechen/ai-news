import { ref } from 'vue'
import type { ApiResponse } from '@/types'
import { success } from '@/utils/response'
import { useStorage } from './useStorage'

type ThemeMode = 'light' | 'dark'

const currentTheme = ref<ThemeMode>('light')

export function useTheme() {
  const { getPreferences, savePreferences } = useStorage()

  function getCurrentTheme(): string {
    return currentTheme.value
  }

  function applyTheme(theme: string): void {
    const validThemes: ThemeMode[] = ['light', 'dark']
    if (!validThemes.includes(theme as ThemeMode)) {
      theme = 'light'
    }

    currentTheme.value = theme as ThemeMode
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }

  async function toggleTheme(): Promise<ApiResponse<{ currentTheme: string }>> {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(newTheme)
    await savePreferences({ theme: newTheme })
    return success({ currentTheme: newTheme })
  }

  function initTheme(): void {
    const prefs = getPreferences()
    let theme = prefs.theme
    if (theme === 'auto') {
      theme = 'light'
    }
    applyTheme(theme)
  }

  return {
    currentTheme,
    getCurrentTheme,
    applyTheme,
    toggleTheme,
    initTheme
  }
}
