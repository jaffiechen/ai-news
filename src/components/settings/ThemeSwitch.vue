<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, toggleTheme } = useTheme()

const themeLabel = computed(() => {
  const labels: Record<string, string> = {
    auto: '自动',
    light: '浅色',
    dark: '深色'
  }
  return labels[currentTheme.value] || '自动'
})
</script>

<template>
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">主题</h3>
    
    <button 
      @click="toggleTheme()"
      class="flex items-center justify-between w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <div class="flex items-center gap-2">
        <span class="text-xl">🎨</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">当前主题</span>
      </div>
      <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ themeLabel }}</span>
    </button>
  </div>
</template>