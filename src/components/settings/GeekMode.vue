<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'

const { showSuccess, showError } = useToast()
const showGeekMode = ref(false)
const jsonConfig = ref('')
const pressStartTime = ref<number | null>(null)
const longPressTimer = ref<number | null>(null)
const pressProgress = ref(0)

function handleMouseDown() {
  pressStartTime.value = Date.now()
  longPressTimer.value = window.setInterval(() => {
    const elapsed = Date.now() - (pressStartTime.value || 0)
    pressProgress.value = Math.min(elapsed / 3000 * 100, 100)
    if (pressProgress.value >= 100) {
      showGeekMode.value = true
      resetLongPress()
    }
  }, 50)
}

function handleMouseUp() {
  resetLongPress()
}

function handleMouseLeave() {
  resetLongPress()
}

function resetLongPress() {
  if (longPressTimer.value) {
    clearInterval(longPressTimer.value)
    longPressTimer.value = null
  }
  pressStartTime.value = null
  pressProgress.value = 0
}

function handleSubmit() {
  try {
    JSON.parse(jsonConfig.value)
    showSuccess('配置格式验证通过！\n请前往 GitHub 提交 PR')
  } catch {
    showError('JSON 格式错误')
  }
}
</script>

<template>
  <div>
    <div class="relative">
      <button 
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        @touchstart.prevent="handleMouseDown"
        @touchend="handleMouseUp"
        class="flex items-center justify-between w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-xl">🧑‍💻</span>
          <span class="text-sm text-gray-600 dark:text-gray-400">极客模式</span>
          <span class="text-xs text-gray-400">长按3秒</span>
        </div>
        
        <div 
          v-if="pressProgress > 0"
          class="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-lg transition-all duration-75"
          :style="{ width: `${pressProgress}%` }"
        ></div>
      </button>
    </div>

    <Transition name="fade">
      <div v-if="showGeekMode" class="mt-3 p-3 rounded-lg bg-gray-900 text-green-400 font-mono text-xs">
        <div class="flex items-center justify-between mb-2">
          <span>极客模式 - 配置 JSON</span>
          <button 
            @click="showGeekMode = false"
            class="text-white hover:text-gray-300"
          >✕</button>
        </div>
        
        <textarea 
          v-model="jsonConfig"
          placeholder='{"id": "custom-source", "name": "...", "rssUrl": "..."}'
          class="w-full h-32 p-2 text-sm rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        ></textarea>
        
        <button 
          @click="handleSubmit"
          class="w-full mt-2 px-3 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          验证并提交
        </button>
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