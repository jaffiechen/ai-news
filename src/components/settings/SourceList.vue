<script setup lang="ts">
import { computed } from 'vue'
import { useNews } from '@/composables/useNews'
import { useStorage } from '@/composables/useStorage'

const { sources } = useNews()
const { getPreferences, savePreferences } = useStorage()

const enabledSources = computed(() => getPreferences().enabledSources)

function toggleSource(sourceId: string) {
  const current = enabledSources.value
  const updated = current.includes(sourceId)
    ? current.filter(id => id !== sourceId)
    : [...current, sourceId]
  
  savePreferences({ enabledSources: updated })
}
</script>

<template>
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">信息源管理</h3>
    
    <div class="space-y-2 max-h-48 overflow-y-auto">
      <div 
        v-for="source in sources" 
        :key="source.id"
        class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg">{{ source.icon }}</span>
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ source.name }}</span>
          <span v-if="source.category" class="text-xs text-gray-400">{{ source.category }}</span>
        </div>
        
        <button 
          @click="toggleSource(source.id)"
          class="relative w-10 h-6 rounded-full transition-colors"
          :class="enabledSources.includes(source.id) ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'"
        >
          <span 
            class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
            :class="enabledSources.includes(source.id) ? 'translate-x-5' : 'translate-x-1'"
          ></span>
        </button>
      </div>
    </div>
  </div>
</template>