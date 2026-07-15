<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/utils/format'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { getHistory, resetHistory } = useStorage()
const { showSuccess } = useToast()
const showConfirmDialog = ref(false)

const historyList = ref(getHistory())

watch(() => props.modelValue, (val) => {
  if (val) {
    historyList.value = getHistory()
  }
})

function close() {
  emit('update:modelValue', false)
}

async function handleClear() {
  showConfirmDialog.value = true
}

function confirmClear() {
  resetHistory()
  historyList.value = []
  showSuccess('已清空阅读历史')
  showConfirmDialog.value = false
  close()
}

function cancelClear() {
  showConfirmDialog.value = false
}

function handleExport() {
  const data = {
    type: 'reading-history',
    exportedAt: new Date().toISOString(),
    count: historyList.value.length,
    items: historyList.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reading-history-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  showSuccess('导出成功')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2">
              <span class="text-xl">📖</span>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">阅读历史</h3>
              <span class="text-sm text-gray-500">({{ historyList.length }})</span>
            </div>
            <button 
              @click="close"
              class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
            >
              ✕
            </button>
          </div>

          <div class="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
            <button 
              @click="handleExport"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              📤 导出
            </button>
            <button 
              @click="handleClear"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              🗑️ 清空
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div v-if="historyList.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
              <div class="text-5xl mb-3">📭</div>
              <p class="text-sm">暂无阅读记录</p>
            </div>
            <div v-else class="divide-y divide-gray-100 dark:divide-gray-700/50">
              <a
                v-for="item in historyList"
                :key="item.newsId"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {{ item.title }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ item.source }}
                  </p>
                </div>
                <div class="flex-shrink-0 text-right">
                  <p class="text-xs text-gray-400 whitespace-nowrap">
                    {{ formatDateTime(item.readAt) }}
                  </p>
                  <span class="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    打开 →
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div 
        v-if="showConfirmDialog"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="cancelClear"
      >
        <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-6">
          <div class="text-center">
            <div class="text-5xl mb-4">⚠️</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">确认清空阅读历史？</h3>
            <p class="text-sm text-gray-500 mb-6">
              将删除 {{ historyList.length }} 条阅读记录<br>
              所有文章的已读标记将被移除<br>
              此操作无法恢复
            </p>
          </div>
          <div class="flex gap-3">
            <button 
              @click="cancelClear"
              class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button 
              @click="confirmClear"
              class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              确认清空
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>