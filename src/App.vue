<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Timeline from '@/components/timeline/Timeline.vue'
import Toast from '@/components/common/Toast.vue'
import ScrollProgress from '@/components/common/ScrollProgress.vue'
import FavoritesModal from '@/components/settings/FavoritesModal.vue'
import HistoryModal from '@/components/settings/HistoryModal.vue'
import SourceModal from '@/components/settings/SourceModal.vue'
import { useNews } from '@/composables/useNews'
import { useTheme } from '@/composables/useTheme'
import { useStorage } from '@/composables/useStorage'
import { useSound } from '@/composables/useSound'
import { useTranslate } from '@/composables/useTranslate'
import { formatDate, formatDateTime } from '@/utils/format'

const { 
  sources, 
  sites,
  sourcesBySite,
  loading, 
  filteredNews, 
  loadNews, 
  getSources, 
  checkForUpdates, 
  refreshNews,
  searchQuery,
  timeRange,
  selectedSite,
  selectedSource,
  stats,
  setSearchQuery,
  setTimeRange,
  setSite,
  setSource,
  preloadData
} = useNews()

const { initTheme, toggleTheme, currentTheme } = useTheme()
const { getFavorites, getHistory, getPreferences, savePreferences, getNewFavoritesCount, getNewHistoryCount, markFavoritesSeen, markHistorySeen } = useStorage()
const { playNotification } = useSound()
const { translateMode, toggleTranslateMode, initTranslateMode } = useTranslate()

const showFavorites = ref(false)
const showHistory = ref(false)
const showSourceModal = ref(false)
const soundEnabled = computed(() => getPreferences().soundEnabled)

const favoritesCount = computed(() => getFavorites().length)
const historyCount = computed(() => getHistory().length)
const newFavoritesCount = computed(() => getNewFavoritesCount())
const newHistoryCount = computed(() => getNewHistoryCount())

function handleToggleTheme() {
  toggleTheme()
}

async function handleToggleSound() {
  const prefs = getPreferences()
  const newState = !prefs.soundEnabled
  await savePreferences({ soundEnabled: newState })
  if (newState) {
    playNotification()
  }
}

function openSourceModal() {
  showSourceModal.value = true
}

const currentSiteName = computed(() => {
  if (!selectedSite.value) return ''
  const site = sites.value.find(s => s.id === selectedSite.value)
  return site?.name || ''
})

const currentSiteSources = computed(() => {
  if (!selectedSite.value) return []
  return Array.from(sourcesBySite.value[selectedSite.value] || [])
})

async function handleRefresh() {
  await refreshNews()
}

function openFavorites() {
  showFavorites.value = true
  markFavoritesSeen()
}

function openHistory() {
  showHistory.value = true
  markHistorySeen()
}

const themeIcon = computed(() => {
  return currentTheme.value === 'dark' ? '🌙' : '☀️'
})

const translateIcon = computed(() => {
  if (translateMode.value === 'zh') return '🇨🇳'
  if (translateMode.value === 'en') return '🇺🇸'
  return '🌐'
})

const translateTitle = computed(() => {
  if (translateMode.value === 'zh') return '中文标题'
  if (translateMode.value === 'en') return '英文标题'
  return '双语标题'
})

onMounted(async () => {
  initTheme()
  initTranslateMode()
  await Promise.all([loadNews(), getSources()])
  preloadData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <Toast />
    <ScrollProgress :total="filteredNews.length" />
    
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5 sm:gap-3">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-500/30 flex-shrink-0">
              AI
            </div>
            <div class="min-w-0">
              <h1 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">AI 资讯聚合</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                实时追踪 AI 领域最新动态
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
            <button 
              @click="openFavorites"
              class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              title="收藏"
            >
              <span class="text-base sm:text-lg">⭐</span>
              <span v-if="newFavoritesCount > 0" class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ newFavoritesCount > 99 ? '99+' : newFavoritesCount }}
              </span>
            </button>
            <button 
              @click="openHistory"
              class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              title="历史记录"
            >
              <span class="text-base sm:text-lg">📖</span>
              <span v-if="newHistoryCount > 0" class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ newHistoryCount > 99 ? '99+' : newHistoryCount }}
              </span>
            </button>
            <button 
              @click="handleToggleSound"
              class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :title="soundEnabled ? '关闭声音提醒' : '开启声音提醒'"
            >
              <span class="text-base sm:text-lg">{{ soundEnabled ? '🔔' : '🔕' }}</span>
            </button>
            <button 
              @click="toggleTranslateMode"
              class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :title="translateTitle"
            >
              <span class="text-base sm:text-lg">{{ translateIcon }}</span>
            </button>
            <button 
              @click="handleToggleTheme"
              class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="切换主题"
            >
              <span class="text-base sm:text-lg">{{ themeIcon }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <div class="flex items-center gap-1">
            <button
              @click="setTimeRange('24h')"
              class="px-2.5 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
              :class="timeRange === '24h' 
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
            >
              24h
            </button>
            <button
              @click="setTimeRange('7d')"
              class="px-2.5 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
              :class="timeRange === '7d' 
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
            >
              7天
            </button>
          </div>
          
          <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>⏱</span>
            <span>更新于 {{ formatDateTime(stats.generatedAt) }}</span>
            <span class="hidden sm:inline text-gray-300 dark:text-gray-600">·</span>
            <span class="hidden sm:inline">{{ stats.windowHours }}h</span>
          </p>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2.5 sm:p-3 border border-gray-100 dark:border-gray-700">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <div class="flex items-center gap-2">
              <div class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex-shrink-0">
                <span class="text-sm">📄</span>
              </div>
              <div class="text-xs sm:text-sm min-w-0">
                <span class="text-gray-500 dark:text-gray-400">{{ stats.windowHours }}h</span>
                <span class="mx-0.5 font-semibold text-gray-900 dark:text-white">{{ filteredNews.length.toLocaleString() }}</span>
                <span class="text-gray-500 dark:text-gray-400">条</span>
              </div>
            </div>

            <button 
              @click="openSourceModal"
              class="flex items-center gap-2 hover:opacity-70 transition-opacity text-left"
            >
              <div class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex-shrink-0">
                <span class="text-sm">🌐</span>
              </div>
              <div class="text-xs sm:text-sm min-w-0">
                <span class="font-semibold text-gray-900 dark:text-white">{{ stats.sourceCount }}</span>
                <span class="mx-0.5 text-gray-500 dark:text-gray-400">个来源</span>
                <span class="text-blue-500 text-xs hidden sm:inline">详情 →</span>
              </div>
            </button>

            <div class="col-span-2 sm:col-span-1 flex items-center gap-2">
              <div class="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex-shrink-0">
                <span class="text-sm">✨</span>
              </div>
              <div class="text-xs sm:text-sm min-w-0">
                <span class="text-gray-500 dark:text-gray-400">从</span>
                <span class="mx-0.5 font-semibold text-gray-900 dark:text-white">{{ (stats.siteStats.reduce((sum, s) => sum + s.raw_count, 0) || 0).toLocaleString() }}</span>
                <span class="text-gray-500 dark:text-gray-400">条筛选</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 mb-3 sm:mb-4">
        <div class="relative mb-3 sm:mb-4">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            :value="searchQuery"
            @input="(e) => setSearchQuery((e.target as HTMLInputElement).value)"
            type="text"
            placeholder="搜索资讯标题、来源..."
            class="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        
        <div class="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <button
            @click="setSite('')"
            class="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 flex-shrink-0"
            :class="!selectedSite 
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          >
            全部
          </button>
          <button
            v-for="site in sites"
            :key="site.id"
            @click="setSite(site.id)"
            class="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 flex-shrink-0"
            :class="selectedSite === site.id 
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          >
            {{ site.name }} <span class="text-xs opacity-70">({{ site.count }})</span>
          </button>
        </div>
        
        <div v-if="currentSiteName && currentSiteSources.length" class="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ currentSiteName }} - 订阅源筛选:</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              @click="setSource('')"
              class="px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 flex-shrink-0"
              :class="!selectedSource 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
            >
              全部
            </button>
            <button
              v-for="source in currentSiteSources"
              :key="source"
              @click="setSource(selectedSource === source ? '' : source)"
              class="px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 flex-shrink-0"
              :class="selectedSource === source 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'"
            >
              {{ source }}
            </button>
          </div>
        </div>
      </div>

      <Timeline 
        :news-list="filteredNews"
        :loading="loading"
        :check-for-updates="checkForUpdates"
        :refresh-news="refreshNews"
        @refresh="handleRefresh"
      />
    </main>

    <footer class="py-8 text-center text-sm text-gray-400">
      <p>追踪AI前沿动态，像刷朋友圈一样简单</p>
    </footer>

    <FavoritesModal v-model="showFavorites" />
    <HistoryModal v-model="showHistory" />
    <SourceModal 
      v-model="showSourceModal" 
      :site-stats="stats.siteStats"
      :source-count="stats.sourceCount"
      :window-hours="stats.windowHours"
    />
  </div>
</template>
