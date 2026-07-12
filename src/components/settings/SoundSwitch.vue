<script setup lang="ts">
import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'

const { getPreferences, savePreferences } = useStorage()

const soundEnabled = computed(() => getPreferences().soundEnabled)

function toggleSound() {
  savePreferences({ soundEnabled: !soundEnabled.value })
}
</script>

<template>
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">音效</h3>
    
    <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
      <div class="flex items-center gap-2">
        <span class="text-xl">🔊</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">声音提醒</span>
        <span class="text-xs text-gray-400">重大突发时播放提示音</span>
      </div>
      
      <button 
        @click="toggleSound"
        class="relative w-10 h-6 rounded-full transition-colors"
        :class="soundEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'"
      >
        <span 
          class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
          :class="soundEnabled ? 'translate-x-5' : 'translate-x-1'"
        ></span>
      </button>
    </div>
  </div>
</template>