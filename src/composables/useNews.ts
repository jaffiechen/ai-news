import { ref, computed } from 'vue'
import type { News, Source, SiteStat, ApiResponse, LatestPayload } from '@/types'
import { config } from '@/config'
import { success, error, ERROR_CODES } from '@/utils/response'
import { useStorage } from './useStorage'

const newsList = ref<News[]>([])
const sources = ref<Source[]>([])
const siteStats = ref<SiteStat[]>([])
const loading = ref(false)

const searchQuery = ref('')
const timeRange = ref<'24h' | '7d'>('24h')
const selectedSite = ref('')
const selectedSource = ref('')

const preloadedData = ref<{ '24h'?: LatestPayload; '7d'?: LatestPayload }>({})

export function useNews() {
  const { getPreferences, savePreferences } = useStorage()

  async function loadNews(range: '24h' | '7d' = '24h'): Promise<ApiResponse<{ news: News[]; total: number; stats: SiteStat[] }>> {
    const startTime = performance.now()
    loading.value = true
    
    try {
      const fileName = range === '24h' ? 'latest-24h.json' : 'latest-7d.json'
      const response = await fetch(`${config.newsApiUrl}/${fileName}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json() as LatestPayload
      preloadedData.value[range] = data
      
      newsList.value = data.items.sort((a, b) => {
        const timeA = a.published_at ? new Date(a.published_at).getTime() : 0
        const timeB = b.published_at ? new Date(b.published_at).getTime() : 0
        return timeB - timeA
      })
      
      siteStats.value = data.site_stats || []
      
      const endTime = performance.now()
      console.warn(`[AI-News] News loaded in ${(endTime - startTime).toFixed(2)}ms`)
      
      return success({ news: newsList.value, total: newsList.value.length, stats: siteStats.value })
    } catch (e) {
      console.error('[AI-News] Failed to load news:', e)
      return error(ERROR_CODES.DATA_LOAD_FAILED, '数据加载失败')
    } finally {
      loading.value = false
    }
  }

  async function preloadData() {
    if (preloadedData.value['7d']) return
    
    try {
      const fileName = 'latest-7d.json'
      const response = await fetch(`${config.newsApiUrl}/${fileName}`)
      if (response.ok) {
        const data = await response.json() as LatestPayload
        preloadedData.value['7d'] = data
        console.log('[AI-News] 7d data preloaded')
      }
    } catch (e) {
      console.warn('[AI-News] Failed to preload 7d data:', e)
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

  function filterBySources(items: News[]): News[] {
    const prefs = getPreferences()
    if (!prefs.enabledSources || prefs.enabledSources.length === 0) {
      return items
    }
    return items.filter(n => prefs.enabledSources.includes(n.source))
  }

  function filterByTimeRange(news: News[], range: '24h' | '7d' | 'all'): News[] {
    if (range === 'all') return news
    
    const now = new Date()
    const cutoff = range === '24h' 
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return news.filter(n => {
      if (!n.published_at) return false
      return new Date(n.published_at) >= cutoff
    })
  }

  function filterBySearch(news: News[], query: string): News[] {
    if (!query.trim()) return news
    const lowerQuery = query.toLowerCase()
    return news.filter(n => 
      n.title.toLowerCase().includes(lowerQuery) ||
      (n.title_zh && n.title_zh.toLowerCase().includes(lowerQuery)) ||
      n.source.toLowerCase().includes(lowerQuery) ||
      n.site_name.toLowerCase().includes(lowerQuery)
    )
  }

  function filterBySite(news: News[], siteId: string): News[] {
    if (!siteId) return news
    return news.filter(n => n.site_id === siteId)
  }

  function filterBySingleSource(news: News[], sourceName: string): News[] {
    if (!sourceName) return news
    return news.filter(n => n.source === sourceName)
  }

  const sites = computed(() => {
    return siteStats.value.map(s => ({ id: s.site_id, name: s.site_name, count: s.count }))
  })

  const sourcesBySite = computed(() => {
    const groups: Record<string, Set<string>> = {}
    newsList.value.forEach(n => {
      if (!groups[n.site_id]) groups[n.site_id] = new Set()
      groups[n.site_id].add(n.source)
    })
    return groups
  })

  const filteredNews = computed(() => {
    let result = newsList.value
    
    result = filterBySources(result)
    result = filterByTimeRange(result, timeRange.value)
    result = filterBySearch(result, searchQuery.value)
    result = filterBySite(result, selectedSite.value)
    result = filterBySingleSource(result, selectedSource.value)
    
    return result
  })

  const stats = computed(() => {
    const prefs = getPreferences()
    const enabledNews = filterBySources(newsList.value)
    
    return {
      totalNews: enabledNews.length,
      totalSources: siteStats.value.length,
      siteStats: siteStats.value,
      generatedAt: preloadedData.value[timeRange.value]?.generated_at || '',
      windowHours: preloadedData.value[timeRange.value]?.window_hours || 24,
      sourceCount: preloadedData.value[timeRange.value]?.source_count || 0
    }
  })

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setTimeRange(range: '24h' | '7d') {
    timeRange.value = range
    if (preloadedData.value[range]) {
      newsList.value = preloadedData.value[range]!.items
      siteStats.value = preloadedData.value[range]!.site_stats
    } else {
      loadNews(range)
    }
    selectedSite.value = ''
    selectedSource.value = ''
    preloadData()
  }

  function setSite(siteId: string) {
    selectedSite.value = siteId
    selectedSource.value = ''
  }

  function setSource(sourceName: string) {
    selectedSource.value = sourceName
  }

  function resetFilters() {
    searchQuery.value = ''
    timeRange.value = '24h'
    selectedSite.value = ''
    selectedSource.value = ''
  }

  async function checkForUpdates(): Promise<ApiResponse<{ hasNew: boolean; count: number }>> {
    try {
      const fileName = timeRange.value === '7d' ? 'latest-7d.json' : 'latest-24h.json'
      const response = await fetch(`${config.newsApiUrl}/${fileName}`, { method: 'HEAD' })
      const lastModified = response.headers.get('last-modified')
      
      const prefs = getPreferences()
      const hasNew = prefs.lastUpdateTime !== lastModified
      
      if (hasNew) {
        const newResponse = await fetch(`${config.newsApiUrl}/${fileName}`)
        const newData = await newResponse.json() as LatestPayload
        const newCount = newData.items.filter(n => 
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
    const result = await loadNews(timeRange.value === '7d' ? '7d' : '24h')
    if (result.success) {
      const fileName = timeRange.value === '7d' ? 'latest-7d.json' : 'latest-24h.json'
      const response = await fetch(`${config.newsApiUrl}/${fileName}`, { method: 'HEAD' })
      const lastModified = response.headers.get('last-modified')
      await savePreferences({ lastUpdateTime: lastModified || '' })
    }
    return result
  }

  return {
    newsList,
    sources,
    siteStats,
    sites,
    sourcesBySite,
    loading,
    filteredNews,
    searchQuery,
    timeRange,
    selectedSite,
    selectedSource,
    stats,
    loadNews,
    getSources,
    preloadData,
    checkForUpdates,
    refreshNews,
    setSearchQuery,
    setTimeRange,
    setSite,
    setSource,
    resetFilters
  }
}
