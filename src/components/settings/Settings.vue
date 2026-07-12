<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SourceList from './SourceList.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import SoundSwitch from './SoundSwitch.vue'
import DataExport from './DataExport.vue'
import GeekMode from './GeekMode.vue'

const isOpen = ref(false)

function toggleSettings() {
  isOpen.value = !isOpen.value
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.settings-container')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({
  toggleSettings
})
</script>

<template>
  <div class="relative settings-container">
    <button 
      @click.stop="toggleSettings"
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <span class="text-xl">⚙️</span>
    </button>

    <Transition name="slide-down">
      <div 
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
      >
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">设置</h2>
        </div>

        <div class="p-4 space-y-6">
          <ThemeSwitch />
          <SoundSwitch />
          <SourceList />
          <DataExport />
          <GeekMode />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>