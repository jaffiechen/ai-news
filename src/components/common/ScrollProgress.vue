<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = withDefaults(defineProps<{
  total?: number
}>(), {
  total: undefined
})

const scrollProgress = ref(0)
const isVisible = ref(false)
const domTotalItems = ref(0)
const currentIndex = ref(0)
const isDragging = ref(false)
const progressBarRef = ref<HTMLElement | null>(null)

const progressPercent = computed(() => Math.round(scrollProgress.value * 100))
const totalItems = computed(() => props.total ?? domTotalItems.value)

function handleScroll() {
  if (isDragging.value) return
  
  const scrollTop = window.scrollY
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  const scrollable = scrollHeight - clientHeight

  if (scrollable > 0) {
    scrollProgress.value = Math.min(1, Math.max(0, scrollTop / scrollable))
  }

  isVisible.value = scrollTop > 100

  const cards = document.querySelectorAll('[data-news-card]')
  if (cards.length > 0) {
    domTotalItems.value = cards.length
    const viewportMiddle = scrollTop + clientHeight / 2
    let closestIndex = 0
    let closestDistance = Infinity
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect()
      const cardMiddle = rect.top + rect.height / 2 + scrollTop
      const distance = Math.abs(cardMiddle - viewportMiddle)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    currentIndex.value = closestIndex + 1
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToBottom() {
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
}

function scrollToPercent(percent: number) {
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  const scrollable = scrollHeight - clientHeight
  const targetScrollTop = percent * scrollable
  window.scrollTo({ top: targetScrollTop, behavior: isDragging.value ? 'auto' : 'smooth' })
}

function handleProgressClick(e: MouseEvent) {
  if (!progressBarRef.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const clickY = e.clientY - rect.top
  const percent = 1 - (clickY / rect.height)
  scrollProgress.value = Math.min(1, Math.max(0, percent))
  scrollToPercent(scrollProgress.value)
}

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true
  handleProgressClick(e)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value || !progressBarRef.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const moveY = e.clientY - rect.top
  const percent = 1 - (moveY / rect.height)
  scrollProgress.value = Math.min(1, Math.max(0, percent))
  scrollToPercent(scrollProgress.value)
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function handleTouchStart(e: TouchEvent) {
  isDragging.value = true
  const touch = e.touches[0]
  const event = new MouseEvent('click', { clientX: touch.clientX, clientY: touch.clientY })
  handleProgressClick(event)
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || !progressBarRef.value) return
  const touch = e.touches[0]
  const rect = progressBarRef.value.getBoundingClientRect()
  const moveY = touch.clientY - rect.top
  const percent = 1 - (moveY / rect.height)
  scrollProgress.value = Math.min(1, Math.max(0, percent))
  scrollToPercent(scrollProgress.value)
}

function handleTouchEnd() {
  isDragging.value = false
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="isVisible"
      class="fixed right-1 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 sm:gap-3"
    >
      <button
        @click="scrollToTop"
        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-110"
        title="回到顶部"
      >
        <span class="text-xs sm:text-sm">↑</span>
      </button>

      <div 
        ref="progressBarRef"
        class="relative w-2 sm:w-3 h-32 sm:h-40 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden group"
        @click="handleProgressClick"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
      >
        <div 
          class="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-full transition-all duration-150"
          :style="{ height: `${progressPercent}%` }"
          :class="{ 'transition-none': isDragging }"
        ></div>
        <div 
          class="absolute left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white dark:bg-gray-200 rounded-full shadow-md border-2 border-blue-500 transition-all duration-150 opacity-0 group-hover:opacity-100"
          :style="{ bottom: `calc(${progressPercent}% - 6px)` }"
          :class="{ 'opacity-100': isDragging, 'transition-none': isDragging }"
        ></div>
      </div>

      <div class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {{ progressPercent }}%
      </div>

      <div v-if="totalItems > 0" class="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
        {{ currentIndex }}/{{ totalItems }}
      </div>

      <button
        @click="scrollToBottom"
        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-110"
        title="跳到底部"
      >
        <span class="text-xs sm:text-sm">↓</span>
      </button>
    </div>
  </Transition>
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
