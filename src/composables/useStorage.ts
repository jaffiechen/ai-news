import { ref } from 'vue'
import type { News, Favorite, UserPreference, ApiResponse } from '@/types'
import { config } from '@/config'
import { success, error, ERROR_CODES } from '@/utils/response'

const FAVORITES_KEY = `${config.localStoragePrefix}-favorites`
const PREFERENCES_KEY = `${config.localStoragePrefix}-preferences`

const DEFAULT_PREFERENCES: UserPreference = {
  enabledSources: ['quantum-bit', 'arxiv', 'openai', 'techweb', 'hacker-news'],
  theme: 'auto',
  soundEnabled: false,
  lastUpdateTime: ''
}

function loadFavoritesFromStorage(): Favorite[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY)
    if (!data) return []
    return JSON.parse(data) as Favorite[]
  } catch {
    return []
  }
}

const favoritesRef = ref<Favorite[]>(loadFavoritesFromStorage())

export function useStorage() {
  function getFavorites(): Favorite[] {
    return favoritesRef.value
  }

  function toggleFavorite(news: News): ApiResponse<{ favorites: Favorite[] }> {
    try {
      const favorites = favoritesRef.value
      const index = favorites.findIndex(f => f.newsId === news.id)
      
      let updatedFavorites: Favorite[]
      if (index >= 0) {
        updatedFavorites = favorites.filter(f => f.newsId !== news.id)
      } else {
        updatedFavorites = [...favorites, {
          newsId: news.id,
          title: news.title,
          link: news.link,
          source: news.source,
          savedAt: new Date().toISOString()
        }]
      }
      
      favoritesRef.value = updatedFavorites
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
      return success({ favorites: updatedFavorites })
    } catch (e) {
      console.error('[AI-News] Failed to toggle favorite:', e)
      return error(ERROR_CODES.STORAGE_FAILED, '收藏操作失败')
    }
  }

  function getPreferences(): UserPreference {
    try {
      const data = localStorage.getItem(PREFERENCES_KEY)
      if (!data) return DEFAULT_PREFERENCES
      const parsed = JSON.parse(data) as Partial<UserPreference>
      return { ...DEFAULT_PREFERENCES, ...parsed }
    } catch {
      return DEFAULT_PREFERENCES
    }
  }

  function savePreferences(prefs: Partial<UserPreference>): ApiResponse<void> {
    try {
      const current = getPreferences()
      const updated = { ...current, ...prefs }
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated))
      return success()
    } catch (e) {
      console.error('[AI-News] Failed to save preferences:', e)
      return error(ERROR_CODES.STORAGE_FAILED, '保存偏好失败')
    }
  }

  function exportData(): ApiResponse<{ favorites: Favorite[]; preferences: UserPreference }> {
    try {
      const favorites = getFavorites()
      const preferences = getPreferences()
      return success({ favorites, preferences })
    } catch (e) {
      console.error('[AI-News] Failed to export data:', e)
      return error(ERROR_CODES.STORAGE_FAILED, '导出数据失败')
    }
  }

  function importData(data: { favorites: Favorite[]; preferences: UserPreference }): ApiResponse<void> {
    if (!Array.isArray(data.favorites) || !data.preferences || !data.preferences.theme) {
      return error(ERROR_CODES.PARAM_ERROR, '数据格式错误')
    }

    try {
      favoritesRef.value = data.favorites
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites))
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data.preferences))
      return success()
    } catch (e) {
      console.error('[AI-News] Failed to import data:', e)
      return error(ERROR_CODES.STORAGE_FAILED, '导入数据失败')
    }
  }

  function resetFavorites(): void {
    favoritesRef.value = []
    localStorage.removeItem(FAVORITES_KEY)
  }

  return {
    getFavorites,
    toggleFavorite,
    getPreferences,
    savePreferences,
    exportData,
    importData,
    resetFavorites
  }
}