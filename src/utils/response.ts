import type { ApiResponse } from '@/types'

export function success<T>(data?: T): ApiResponse<T> {
  return { success: true, data }
}

export function error<T>(errorCode: string, message: string): ApiResponse<T> {
  console.error(`[AI-News] Error ${errorCode}: ${message}`)
  return { success: false, error: errorCode, message }
}

export const ERROR_CODES = {
  DATA_LOAD_FAILED: '1001',
  STORAGE_FAILED: '1002',
  PARAM_ERROR: '1003',
  NETWORK_ERROR: '1004'
}