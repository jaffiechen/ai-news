<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { News, ApiResponse } from '@/types'
import NewsCard from '@/components/cards/NewsCard.vue'
import SkeletonScreen from '@/components/common/SkeletonScreen.vue'
import { useSound } from '@/composables/useSound'
import { config } from '@/config'
import { formatDate } from '@/utils/format'

const props = defineProps<{
  newsList: News[]
  loading: boolean
  checkForUpdates: () => Promise<ApiResponse<{ hasNew: boolean; count: number }>>
  refreshNews: () => Promise<ApiResponse<{ news: News[]; total: number }>>
}>()

const emit = defineEmits<{
  refresh: []
}>()

const { playNotification, detectBreakingNews } = useSound()

const hasNew = ref(false)
const newCount = ref(0)
const showUpdateBanner = ref(false)
let updateInterval: number | null = null

const displayCount = ref(30)
const scrollContainer = ref<HTMLElement | null>(null)
let rafId: number | null = null

const groupedNews = computed(() => {
  const displayItems = props.newsList.slice(0, displayCount.value)
  const groups: Record<string, News[]> = {}
  displayItems.forEach(news => {
    const date = formatDate(news.published_at || news.first_seen_at)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(news)
  })
  return Object.entries(groups).map(([date, news]) => ({ date, news }))
})

const hasMore = computed(() => displayCount.value < props.newsList.length)

function handleScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    const el = scrollContainer.value
    if (!el || !hasMore.value) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < 500) {
      const increment = Math.min(30, props.newsList.length - displayCount.value)
      if (increment > 0) {
        displayCount.value += increment
      }
    }
  })
}

watch(() => props.newsList.length, () => {
  displayCount.value = Math.min(30, props.newsList.length)
})

async function checkUpdates() {
  const result = await props.checkForUpdates()
  if (result.success && result.data?.hasNew) {
    hasNew.value = true
    newCount.value = result.data.count
    showUpdateBanner.value = true
    const breakingNews = props.newsList.find(n => detectBreakingNews(n).isBreaking)
    if (breakingNews) {
      playNotification()
    }
  }
}

async function handleRefresh() {
  showUpdateBanner.value = false
  await props.refreshNews()
  displayCount.value = Math.min(30, props.newsList.length)
  emit('refresh')
}

function scrollToTop() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  updateInterval = window.setInterval(checkUpdates, config.updateInterval)
  displayCount.value = Math.min(30, props.newsList.length)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
})

defineExpose({
  scrollContainer,
  scrollToTop
})
</script>

<template>
  <div class="relative">
    <Transition name="slide">
      <div 
        v-if="showUpdateBanner"
        @click="handleRefresh"
        class="fixed top-0 left-0 right-0 z-50 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center cursor-pointer shadow-lg"
      >
        <span class="font-medium">有 {{ newCount }} 条新动态</span>
        <span class="ml-2 text-sm opacity-80">点击查看 →</span>
      </div>
    </Transition>

    <div>
      <div v-if="loading" class="space-y-4">
        <SkeletonScreen v-for="i in 5" :key="i" />
      </div>

      <div v-else-if="newsList.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-lg font-medium">暂无新闻</p>
        <p class="text-sm">数据加载中，请稍后刷新</p>
      </div>

      <div 
        v-else 
        ref="scrollContainer"
        @scroll="handleScroll"
        class="timeline-scroll relative"
      >
        <div>
          <div v-for="(group, groupIndex) in groupedNews" :key="group.date">
            <div 
              class="flex items-center gap-2 mb-3"
              :class="groupIndex === 0 ? 'mt-2' : 'mt-6'"
            >
              <div class="h-px flex-1 bg-gradient-to-r from-blue-400 to-transparent"></div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ group.date }}</span>
              <div class="h-px flex-1 bg-gradient-to-l from-blue-400 to-transparent"></div>
            </div>
            <NewsCard 
              v-for="(news, newsIndex) in group.news" 
              :key="news.id"
              :news="news"
              :show-date="false"
              :is-last="groupIndex === groupedNews.length - 1 && newsIndex === group.news.length - 1"
              :is-first-in-group="newsIndex === 0"
              :is-last-in-group="newsIndex === group.news.length - 1"
            />
          </div>
        </div>

        <div 
          v-if="hasMore" 
          class="py-6 text-center text-gray-400 text-sm"
        >
          <div class="flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>加载中... ({{ displayCount }}/{{ newsList.length }})</span>
          </div>
        </div>
        <div 
          v-else-if="newsList.length > 0" 
          class="py-8 text-center text-gray-400 text-sm"
        >
          <p>— 已经到底啦，共 {{ newsList.length }} 条资讯 —</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.timeline-scroll {
  height: calc(100vh - 320px);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
}

.timeline-scroll::-webkit-scrollbar {
  width: 4px;
}

.timeline-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.timeline-scroll::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.timeline-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}
</style>