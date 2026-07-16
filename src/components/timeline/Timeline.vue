<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const flatDisplayNews = computed(() => {
  return props.newsList.slice(0, displayCount.value)
})

const hasMore = computed(() => displayCount.value < props.newsList.length)

const groupedDisplayNews = computed(() => {
  const groups: { date: string; news: News[] }[] = []
  let currentDate = ''
  
  flatDisplayNews.value.forEach(news => {
    const date = formatDate(news.published_at || news.first_seen_at)
    if (date !== currentDate) {
      currentDate = date
      groups.push({ date, news: [news] })
    } else {
      groups[groups.length - 1].news.push(news)
    }
  })
  
  return groups
})

function loadMore() {
  if (!hasMore.value) return
  const increment = Math.min(30, props.newsList.length - displayCount.value)
  if (increment > 0) {
    displayCount.value += increment
  }
}

function setupObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }

  if (!sentinelRef.value) return

  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry.isIntersecting) {
      loadMore()
    }
  }, {
    rootMargin: '400px 0px',
    threshold: 0.01
  })

  observer.observe(sentinelRef.value)
}

watch(() => props.newsList.length, () => {
  displayCount.value = Math.min(30, props.newsList.length)
})

watch(hasMore, (newVal) => {
  if (newVal) {
    setTimeout(setupObserver, 50)
  }
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
  window.scrollTo({ top: 0, behavior: 'smooth' })
  emit('refresh')
}

onMounted(() => {
  updateInterval = window.setInterval(checkUpdates, config.updateInterval)
  displayCount.value = Math.min(30, props.newsList.length)
  setTimeout(setupObserver, 200)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  if (observer) {
    observer.disconnect()
    observer = null
  }
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

      <template v-else>
        <template v-for="(group, groupIndex) in groupedDisplayNews" :key="group.date">
          <NewsCard 
            v-for="(news, newsIndex) in group.news" 
            :key="news.id"
            :news="news"
            :show-date="newsIndex === 0"
            :is-last="groupIndex === groupedDisplayNews.length - 1 && newsIndex === group.news.length - 1"
            :is-first-in-group="newsIndex === 0"
            :is-last-in-group="newsIndex === group.news.length - 1"
          />
        </template>

        <div 
          ref="sentinelRef"
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
      </template>
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
</style>
