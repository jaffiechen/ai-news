<script setup lang="ts">
import { ref } from 'vue'
import SourceList from './SourceList.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import SoundSwitch from './SoundSwitch.vue'
import DataExport from './DataExport.vue'
import GeekMode from './GeekMode.vue'

const isOpen = ref(false)

function toggleSettings() {
  isOpen.value = !isOpen.value
}

defineExpose({
  toggleSettings
})
</script>

<template>
  <div class="relative">
    <button 
      @click="toggleSettings"
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <span class="text-xl">⚙️</span>
    </button>

    <Transition name="fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="isOpen = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">设置</h2>
            <button 
              @click="isOpen = false"
              class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span>✕</span>
            </button>
          </div>

          <div class="p-4 space-y-6">
            <ThemeSwitch />
            <SoundSwitch />
            <SourceList />
            <DataExport />
            <GeekMode />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>