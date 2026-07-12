<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Timeline from '@/components/timeline/Timeline.vue'
import Settings from '@/components/settings/Settings.vue'
import Toast from '@/components/common/Toast.vue'
import { useNews } from '@/composables/useNews'
import { useTheme } from '@/composables/useTheme'

const { sources, loading, filteredNews, loadNews, getSources, checkForUpdates, refreshNews } = useNews()
const { initTheme } = useTheme()

const refreshing = ref(false)

async function handleRefresh() {
  refreshing.value = true
  await refreshNews()
  refreshing.value = false
}

onMounted(async () => {
  initTheme()
  await Promise.all([loadNews(), getSources()])
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <Toast />
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🤖</span>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">AI快讯</h1>
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            @click="handleRefresh"
            :disabled="refreshing"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span :class="{ 'animate-spin': refreshing }">🔄</span>
          </button>
          <Settings />
        </div>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-6">
      <Timeline 
        :news-list="filteredNews"
        :sources="sources"
        :loading="loading"
        :check-for-updates="checkForUpdates"
        :refresh-news="refreshNews"
        @refresh="handleRefresh"
      />
    </main>

    <footer class="py-8 text-center text-sm text-gray-400">
      <p>追踪AI前沿动态，像刷朋友圈一样简单</p>
    </footer>
  </div>
</template>