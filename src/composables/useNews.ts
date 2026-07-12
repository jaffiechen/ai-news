import { ref, computed } from 'vue'
import type { News, Source, ApiResponse } from '@/types'
import { config } from '@/config'
import { success, error, ERROR_CODES } from '@/utils/response'
import { useStorage } from './useStorage'

const newsList = ref<News[]>([])
const sources = ref<Source[]>([])
const loading = ref(false)

export function useNews() {
  const { getPreferences, savePreferences } = useStorage()

  async function loadNews(): Promise<ApiResponse<{ news: News[]; total: number }>> {
    const startTime = performance.now()
    loading.value = true
    
    try {
      const response = await fetch(config.newsApiUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json() as News[]
      newsList.value = data.sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
      
      const endTime = performance.now()
      console.warn(`[AI-News] News loaded in ${(endTime - startTime).toFixed(2)}ms`)
      
      return success({ news: newsList.value, total: newsList.value.length })
    } catch (e) {
      console.error('[AI-News] Failed to load news:', e)
      return error(ERROR_CODES.DATA_LOAD_FAILED, '数据加载失败')
    } finally {
      loading.value = false
    }
  }

  async function getSources(): Promise<ApiResponse<Source[]>> {
    try {
      const response = await fetch(config.sourcesApiUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      sources.value = await response.json() as Source[]
      return success(sources.value)
    } catch (e) {
      console.error('[AI-News] Failed to load sources:', e)
      return error(ERROR_CODES.DATA_LOAD_FAILED, '信息源加载失败')
    }
  }

  function filterBySources(sourceIds: string[]): News[] {
    if (!sourceIds || sourceIds.length === 0) {
      return newsList.value
    }
    return newsList.value.filter(news => sourceIds.includes(news.source))
  }

  const filteredNews = computed(() => {
    const prefs = getPreferences()
    return filterBySources(prefs.enabledSources)
  })

  async function checkForUpdates(): Promise<ApiResponse<{ hasNew: boolean; count: number }>> {
    try {
      const response = await fetch(config.newsApiUrl, { method: 'HEAD' })
      const lastModified = response.headers.get('last-modified')
      
      const prefs = getPreferences()
      const hasNew = prefs.lastUpdateTime !== lastModified
      
      if (hasNew) {
        const newResponse = await fetch(config.newsApiUrl)
        const newData = await newResponse.json() as News[]
        const newCount = newData.filter(n => 
          !newsList.value.some(existing => existing.id === n.id)
        ).length
        
        return success({ hasNew: true, count: newCount })
      }
      
      return success({ hasNew: false, count: 0 })
    } catch (e) {
      console.error('[AI-News] Failed to check updates:', e)
      return error(ERROR_CODES.NETWORK_ERROR, '检查更新失败')
    }
  }

  async function refreshNews(): Promise<ApiResponse<{ news: News[]; total: number }>> {
    const result = await loadNews()
    if (result.success) {
      const response = await fetch(config.newsApiUrl, { method: 'HEAD' })
      const lastModified = response.headers.get('last-modified')
      await savePreferences({ lastUpdateTime: lastModified || '' })
    }
    return result
  }

  return {
    newsList,
    sources,
    loading,
    filteredNews,
    loadNews,
    getSources,
    filterBySources,
    checkForUpdates,
    refreshNews
  }
}