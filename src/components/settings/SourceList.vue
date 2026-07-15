<script setup lang="ts">
import { computed } from 'vue'
import { useNews } from '@/composables/useNews'
import { useStorage } from '@/composables/useStorage'

const { sources } = useNews()
const { getPreferencesRef, savePreferences } = useStorage()

const preferences = getPreferencesRef()

const enabledSources = computed({
  get: () => preferences.value.enabledSources,
  set: (value) => {
    savePreferences({ enabledSources: value })
  }
})

function toggleSource(sourceId: string) {
  const current = enabledSources.value
  const updated = current.includes(sourceId)
    ? current.filter((id: string) => id !== sourceId)
    : [...current, sourceId]
  
  enabledSources.value = updated
}
</script>

<template>
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">信息源管理</h3>
    
    <div class="space-y-2 max-h-48 overflow-y-auto">
      <div 
        v-for="source in sources" 
        :key="source.id"
        class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ source.icon }}</span>
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ source.name }}</span>
            <span v-if="source.category" class="text-xs text-gray-400 ml-2">{{ source.category }}</span>
          </div>
        </div>
        
        <button 
          @click.stop="toggleSource(source.id)"
          class="group relative w-12 h-6 rounded-full transition-all duration-300"
          :class="enabledSources.includes(source.id) 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-md shadow-green-500/25' 
            : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'"
        >
          <span 
            class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center"
            :class="enabledSources.includes(source.id) 
              ? 'translate-x-6' 
              : 'translate-x-0.5'"
          >
            <span v-if="enabledSources.includes(source.id)" class="text-green-600 text-xs">✓</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
