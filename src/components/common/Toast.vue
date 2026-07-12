<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, showToast, showSuccess, showError, showInfo } = useToast()

defineExpose({
  showToast,
  showSuccess,
  showError,
  showInfo
})
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg min-w-[240px] max-w-[320px]"
        :class="{
          'bg-green-500 text-white': toast.type === 'success',
          'bg-red-500 text-white': toast.type === 'error',
          'bg-gray-800 text-white': toast.type === 'info'
        }"
      >
        <span v-if="toast.type === 'success'" class="text-xl">✓</span>
        <span v-else-if="toast.type === 'error'" class="text-xl">✕</span>
        <span v-else class="text-xl">ℹ</span>
        <span class="text-sm font-medium">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>