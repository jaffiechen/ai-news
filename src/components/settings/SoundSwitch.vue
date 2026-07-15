<script setup lang="ts">
import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'

const { getPreferencesRef, savePreferences } = useStorage()

const preferences = getPreferencesRef()

const soundEnabled = computed({
  get: () => preferences.value.soundEnabled,
  set: (value) => {
    savePreferences({ soundEnabled: value })
  }
})
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
        @click.stop="soundEnabled = !soundEnabled"
        class="group relative w-14 h-7 rounded-full transition-all duration-300"
        :class="soundEnabled 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30' 
          : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'"
      >
        <span 
          class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center"
          :class="soundEnabled 
            ? 'translate-x-7 scale-110' 
            : 'translate-x-0.5'"
        >
          <span v-if="soundEnabled" class="text-blue-600 text-sm">🔔</span>
          <span v-else class="text-gray-400 text-sm">🔕</span>
        </span>
      </button>
    </div>
  </div>
</template>
