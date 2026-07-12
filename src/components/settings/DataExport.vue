<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { useToast } from '@/composables/useToast'

const { exportData, importData } = useStorage()
const { showSuccess, showError } = useToast()
const importText = ref('')
const showImport = ref(false)

async function handleExport() {
  const result = await exportData()
  if (result.success && result.data) {
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-news-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

async function handleImport() {
  try {
    const data = JSON.parse(importText.value)
    const result = await importData(data)
    if (result.success) {
      showSuccess('导入成功')
      importText.value = ''
      showImport.value = false
    } else {
      showError(result.message || '导入失败')
    }
  } catch {
    showError('数据格式错误')
  }
}
</script>

<template>
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">数据管理</h3>
    
    <div class="space-y-2">
      <button 
        @click="handleExport"
        class="flex items-center justify-between w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-xl">📤</span>
          <span class="text-sm text-gray-600 dark:text-gray-400">导出数据</span>
        </div>
        <span class="text-sm text-blue-500">下载</span>
      </button>

      <button 
        v-if="!showImport"
        @click="showImport = true"
        class="flex items-center justify-between w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-xl">📥</span>
          <span class="text-sm text-gray-600 dark:text-gray-400">导入数据</span>
        </div>
        <span class="text-sm text-blue-500">选择文件</span>
      </button>

      <div v-else class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        <textarea 
          v-model="importText"
          placeholder="粘贴 JSON 数据..."
          class="w-full h-24 p-2 text-sm rounded bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        ></textarea>
        <div class="flex gap-2 mt-2">
          <button 
            @click="showImport = false; importText = ''"
            class="flex-1 px-3 py-2 text-sm rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            取消
          </button>
          <button 
            @click="handleImport"
            class="flex-1 px-3 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>