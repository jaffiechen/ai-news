import { ref } from 'vue'

interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<ToastMessage[]>([])
let idCounter = 0

export function useToast() {
  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const id = ++idCounter
    toasts.value.push({ id, message, type })
    
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index >= 0) {
        toasts.value.splice(index, 1)
      }
    }, duration)
  }

  function showSuccess(message: string): void {
    showToast(message, 'success')
  }

  function showError(message: string): void {
    showToast(message, 'error')
  }

  function showInfo(message: string): void {
    showToast(message, 'info')
  }

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo
  }
}