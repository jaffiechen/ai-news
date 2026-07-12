<script setup lang="ts">import { ref, onMounted, onUnmounted } from 'vue';
import type { News, Source, ApiResponse } from '@/types';
import NewsCard from '@/components/cards/NewsCard.vue';
import SkeletonScreen from '@/components/common/SkeletonScreen.vue';
import { useSound } from '@/composables/useSound';
import { config } from '@/config';
const props = defineProps<{
 newsList: News[];
 sources: Source[];
 loading: boolean;
 checkForUpdates: () => Promise<ApiResponse<{ hasNew: boolean; count: number }>>;
 refreshNews: () => Promise<ApiResponse<{ news: News[]; total: number }>>;
}>();
const emit = defineEmits<{
 refresh: [
 ];
}>();
const { playNotification, detectBreakingNews } = useSound();
const hasNew = ref(false);
const newCount = ref(0);
const showUpdateBanner = ref(false);
let updateInterval: number | null = null;
async function checkUpdates() {
 const result = await props.checkForUpdates();
 if (result.success && result.data?.hasNew) {
 hasNew.value = true;
 newCount.value = result.data.count;
 showUpdateBanner.value = true;
 const breakingNews = props.newsList.find(n => detectBreakingNews(n).isBreaking);
 if (breakingNews) {
 playNotification();
 }
 }
}
async function handleRefresh() {
 showUpdateBanner.value = false;
 await props.refreshNews();
 emit('refresh');
}
onMounted(() => {
 updateInterval = window.setInterval(checkUpdates, config.updateInterval);
});
onUnmounted(() => {
 if (updateInterval) {
 clearInterval(updateInterval);
 }
});
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

    <div class="pt-16">
      <div v-if="loading" class="space-y-4">
        <SkeletonScreen v-for="i in 5" :key="i" />
      </div>

      <div v-else-if="newsList.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-lg font-medium">暂无新闻</p>
        <p class="text-sm">数据加载中，请稍后刷新</p>
      </div>

      <div v-else class="space-y-4">
        <NewsCard 
          v-for="(news, index) in newsList" 
          :key="news.id"
          :news="news"
          :sources="sources"
          :is-first="index === 0"
        />
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