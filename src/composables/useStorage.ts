import { ref, computed, type Ref } from 'vue'
import type { News, Favorite, History, UserPreference, ApiResponse } from '@/types'
import { config } from '@/config'
import { success, error, ERROR_CODES } from '@/utils/response'

const FAVORITES_KEY = `${config.localStoragePrefix}-favorites`
const HISTORY_KEY = `${config.localStoragePrefix}-history`
const PREFERENCES_KEY = `${config.localStoragePrefix}-preferences`

const DEFAULT_PREFERENCES: UserPreference = {
  enabledSources: [],
  theme: 'auto',
  soundEnabled: false,
  lastUpdateTime: ''
}

const MAX_HISTORY = 100

function loadFavoritesFromStorage(): Favorite[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY)
    if (!data) return []
    return JSON.parse(data) as Favorite[]
  } catch {
    return []
  }
}

function loadHistoryFromStorage(): History[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    if (!data) return []
    return JSON.parse(data) as History[]
  } catch {
    return []
  }
}

function loadPreferencesFromStorage(): UserPreference {
  try {
    const data = localStorage.getItem(PREFERENCES_KEY)
    if (!data) return { ...DEFAULT_PREFERENCES }
    const parsed = JSON.parse(data) as Partial<UserPreference>
    return { ...DEFAULT_PREFERENCES, ...parsed }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

const favoritesRef = ref<Favorite[]>(loadFavoritesFromStorage())
const historyRef = ref<History[]>(loadHistoryFromStorage())
const preferencesRef = ref<UserPreference>(loadPreferencesFromStorage())

const favoriteIdSet = computed(() => new Set(favoritesRef.value.map(f => f.newsId)))
const historyIdSet = computed(() => new Set(historyRef.value.map(h => h.newsId)))

export function useStorage() {
  function getFavorites(): Favorite[] {
    return favoritesRef.value
  }

  function getHistory(): History[] {
    return historyRef.value
  }

  function addToHistory(news: News): ApiResponse<{ history: History[] }> {
    try {
      const history = historyRef.value
      const newItem: History = {
        newsId: news.id,
        title: news.title,
        link: news.url,
        source: news.source,
        readAt: new Date().toISOString()
      }
      const filtered = history.filter(h => h.newsId !== news.id)
      const updatedHistory = [newItem, ...filtered].slice(0, MAX_HISTORY)
      
      historyRef.value = updatedHistory
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
      return success({ history: updatedHistory })
    } catch (e) {
      console.error('[AI-News] Failed to add history:', e)
      return error(ERROR_CODES.STORAGE_FAILED, '添加历史记录失败')
    }
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
          link: news.url,
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
    return preferencesRef.value
  }

  function getPreferencesRef(): Ref<UserPreference> {
    return preferencesRef
  }

  function savePreferences(prefs: Partial<UserPreference>): ApiResponse<void> {
    try {
      const current = preferencesRef.value
      const updated = { ...current, ...prefs }
      preferencesRef.value = updated
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

  function resetHistory(): void {
    historyRef.value = []
    localStorage.removeItem(HISTORY_KEY)
  }

  function getNewFavoritesCount(): number {
    const total = favoritesRef.value.length
    const lastSeen = preferencesRef.value.lastSeenFavoritesCount || 0
    return Math.max(0, total - lastSeen)
  }

  function getNewHistoryCount(): number {
    const total = historyRef.value.length
    const lastSeen = preferencesRef.value.lastSeenHistoryCount || 0
    return Math.max(0, total - lastSeen)
  }

  function markFavoritesSeen(): void {
    savePreferences({ lastSeenFavoritesCount: favoritesRef.value.length })
  }

  function markHistorySeen(): void {
    savePreferences({ lastSeenHistoryCount: historyRef.value.length })
  }

  function isFavorite(newsId: string): boolean {
    return favoriteIdSet.value.has(newsId)
  }

  function isVisited(newsId: string): boolean {
    return historyIdSet.value.has(newsId)
  }

  return {
    getFavorites,
    getHistory,
    addToHistory,
    toggleFavorite,
    getPreferences,
    getPreferencesRef,
    savePreferences,
    exportData,
    importData,
    resetFavorites,
    resetHistory,
    getNewFavoritesCount,
    getNewHistoryCount,
    markFavoritesSeen,
    markHistorySeen,
    isFavorite,
    isVisited
  }
}