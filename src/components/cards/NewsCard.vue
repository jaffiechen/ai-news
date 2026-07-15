<script setup lang="ts">
import { computed } from 'vue'
import type { News } from '@/types'
import { formatDate, formatHour } from '@/utils/format'
import { useStorage } from '@/composables/useStorage'
import { useTranslate } from '@/composables/useTranslate'

const props = defineProps<{
  news: News
  isLast?: boolean
  showDate?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
}>()

const { getFavorites, getHistory, toggleFavorite, addToHistory, isFavorite: checkFavorite, isVisited: checkVisited } = useStorage()
const { getDisplayTitle } = useTranslate()

const isFavorite = computed(() => checkFavorite(props.news.id))
const isVisited = computed(() => checkVisited(props.news.id))

function handleFavorite(e: Event) {
  e.stopPropagation()
  toggleFavorite(props.news)
}

function handleCardClick() {
  addToHistory(props.news)
  window.open(props.news.url, '_blank', 'noopener noreferrer')
}

const displayTitle = computed(() => {
  return getDisplayTitle(props.news)
})
</script>

<template>
  <div class="relative">
    <div 
      v-if="showDate" 
      class="flex items-center gap-2 mb-3 mt-6"
    >
      <div class="h-px flex-1 bg-gradient-to-r from-blue-400 to-transparent"></div>
      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ formatDate(news.published_at || news.first_seen_at) }}</span>
      <div class="h-px flex-1 bg-gradient-to-l from-blue-400 to-transparent"></div>
    </div>
    
    <div class="relative flex gap-3">
      <div class="flex-shrink-0 w-12 text-right pt-3">
        <span 
          class="text-sm font-medium" 
          :class="isVisited ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'"
        >
          {{ formatHour(news.published_at || news.first_seen_at) }}
        </span>
      </div>
      
      <div class="flex-shrink-0 relative w-6 flex justify-center">
        <div 
          v-if="!isFirstInGroup"
          class="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 transition-colors"
          :class="isVisited ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-300 dark:bg-blue-700/50'"
        ></div>
        <div 
          class="relative z-10 w-3 h-3 rounded-full transition-all duration-300 mt-3 group-hover:scale-125"
          :class="isVisited 
            ? 'bg-gray-400' 
            : 'bg-blue-500 shadow-sm shadow-blue-500/40 group-hover:bg-blue-600 group-hover:shadow-blue-600/50'"
        ></div>
        <div 
          v-if="!isLastInGroup"
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 transition-colors"
          :class="isVisited ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-300 dark:bg-blue-700/50'"
          style="top: 1.75rem; bottom: -1rem;"
        ></div>
      </div>
      
      <div 
      data-news-card
      @click="handleCardClick"
      class="flex-1 min-w-0 relative p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
        :class="isVisited 
          ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 opacity-70' 
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600/50'"
      >
        <div class="flex items-center gap-2 mb-2">
          <span 
            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full"
            :class="isVisited 
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' 
              : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'"
          >
            <span>{{ news.site_name }}</span>
          </span>
          <span 
            v-if="isVisited" 
            class="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium"
          >
            <span>✓</span>
            <span>已读</span>
          </span>
          <span 
            v-else 
            class="inline-flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 font-medium"
          >
            <span>●</span>
            <span>未读</span>
          </span>
        </div>
        
        <h3 
          class="text-base font-semibold mb-2 line-clamp-2 transition-colors leading-snug"
          :class="isVisited 
            ? 'text-gray-500 dark:text-gray-500' 
            : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'"
        >
          {{ displayTitle }}
        </h3>
        
        <p 
          v-if="news.summary" 
          class="text-sm line-clamp-2 leading-relaxed"
          :class="isVisited ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'"
        >
          {{ news.summary }}
        </p>
        
        <div class="flex items-center justify-between mt-3 pt-3 border-t" :class="isVisited ? 'border-gray-200 dark:border-gray-600' : 'border-gray-100 dark:border-gray-700/50'">
          <button 
            @click="handleFavorite"
            class="flex items-center gap-1.5 text-sm transition-colors"
            :class="isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'"
          >
            <span class="text-lg">{{ isFavorite ? '⭐' : '☆' }}</span>
            <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
          </button>
          
          <a 
            :href="news.url" 
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
            class="inline-flex items-center gap-1 text-sm font-medium transition-colors"
            :class="isVisited 
              ? 'text-gray-400 hover:text-gray-500' 
              : 'text-blue-500 hover:text-blue-600 dark:hover:text-blue-400'"
          >
            阅读全文
            <span class="text-xs">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
