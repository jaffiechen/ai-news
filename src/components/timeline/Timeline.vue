<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const groupedNews = computed(() => {
  const groups: Record<string, News[]> = {}
  props.newsList.forEach(news => {
    const date = formatDate(news.published_at || news.first_seen_at)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(news)
  })
  return Object.entries(groups).map(([date, news]) => ({ date, news }))
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
  emit('refresh')
}

onMounted(() => {
  updateInterval = window.setInterval(checkUpdates, config.updateInterval)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
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

      <div v-else class="relative">
        <div>
          <div v-for="(group, groupIndex) in groupedNews" :key="group.date">
            <NewsCard 
              v-for="(news, newsIndex) in group.news" 
              :key="news.id"
              :news="news"
              :show-date="newsIndex === 0"
              :is-last="groupIndex === groupedNews.length - 1 && newsIndex === group.news.length - 1"
              :is-first-in-group="newsIndex === 0"
              :is-last-in-group="newsIndex === group.news.length - 1"
            />
          </div>
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
</style>