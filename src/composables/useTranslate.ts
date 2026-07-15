import { ref } from 'vue'
import type { ApiResponse } from '@/types'
import { success } from '@/utils/response'
import { useStorage } from './useStorage'

export type TranslateMode = 'zh' | 'en' | 'bilingual'

const translateMode = ref<TranslateMode>('zh')

export function useTranslate() {
  const { getPreferences, savePreferences } = useStorage()

  function getTranslateMode(): TranslateMode {
    return translateMode.value
  }

  function setTranslateMode(mode: TranslateMode): void {
    translateMode.value = mode
    savePreferences({ translateMode: mode })
  }

  function toggleTranslateMode(): void {
    const modes: TranslateMode[] = ['zh', 'bilingual', 'en']
    const currentIndex = modes.indexOf(translateMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setTranslateMode(modes[nextIndex])
  }

  function getDisplayTitle(news: { title: string; title_zh?: string | null; title_en?: string | null; title_bilingual?: string }): string {
    const mode = translateMode.value
    if (mode === 'zh' && news.title_zh) {
      return news.title_zh
    }
    if (mode === 'en' && news.title_en) {
      return news.title_en
    }
    if (mode === 'bilingual' && news.title_bilingual) {
      return news.title_bilingual
    }
    return news.title_zh || news.title_bilingual || news.title
  }

  function initTranslateMode(): void {
    const prefs = getPreferences()
    if (prefs.translateMode) {
      translateMode.value = prefs.translateMode as TranslateMode
    }
  }

  return {
    translateMode,
    getTranslateMode,
    setTranslateMode,
    toggleTranslateMode,
    getDisplayTitle,
    initTranslateMode
  }
}
