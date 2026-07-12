<script setup lang="ts">
import { computed } from 'vue'
import type { News, Source } from '@/types'
import { formatTime } from '@/utils/format'
import { useStorage } from '@/composables/useStorage'

const props = defineProps<{
  news: News
  sources: Source[]
  isFirst?: boolean
  isLast?: boolean
}>()

const { getFavorites, toggleFavorite } = useStorage()

const sourceInfo = computed(() => {
  return props.sources.find(s => s.id === props.news.source)
})

const isFavorite = computed(() => {
  const favorites = getFavorites()
  return favorites.some(f => f.newsId === props.news.id)
})

function handleFavorite() {
  toggleFavorite(props.news)
}
</script>

<template>
  <div 
    class="relative flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
    :class="{ 'animate-breathe': isFirst }"
  >
    <div class="flex-shrink-0 relative">
      <div 
        v-if="!isLast"
        class="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-200 dark:bg-gray-700"
      ></div>
      <div 
        class="relative z-10 w-3 h-3 rounded-full bg-blue-500 transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-125"
        :class="{ 'animate-breathe': isFirst }"
      ></div>
    </div>
    
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(news.pubDate) }}</span>
        <span 
          v-if="sourceInfo" 
          class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        >
          <span>{{ sourceInfo.icon }}</span>
          <span>{{ sourceInfo.name }}</span>
        </span>
      </div>
      
      <h3 class="text-base font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {{ news.title }}
      </h3>
      
      <p v-if="news.summary" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {{ news.summary }}
      </p>
      
      <div class="flex items-center justify-between mt-3">
        <button 
          @click.prevent="handleFavorite"
          class="flex items-center gap-1 text-sm text-gray-400 hover:text-yellow-500 transition-colors"
          :class="{ 'text-yellow-500': isFavorite }"
        >
          <span>{{ isFavorite ? '⭐' : '☆' }}</span>
          <span>{{ isFavorite ? '已收藏' : '稍后读' }}</span>
        </button>
        
        <a 
          :href="news.link" 
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          查看原文 →
        </a>
      </div>
    </div>
  </div>
</template>