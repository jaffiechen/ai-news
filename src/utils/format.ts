const dateCache = new Map<string, string>()
const hourCache = new Map<string, string>()
const dateTimeCache = new Map<string, string>()
const timeAgoCache = new Map<string, { value: string; timestamp: number }>()

function parseDate(dateString: string | Date): Date | null {
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

export function formatTime(dateString: string): string {
  const now = Date.now()
  const cached = timeAgoCache.get(dateString)
  if (cached && now - cached.timestamp < 60000) {
    return cached.value
  }

  const date = parseDate(dateString)
  if (!date) {
    const result = '未知时间'
    timeAgoCache.set(dateString, { value: result, timestamp: now })
    return result
  }

  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  let result: string
  if (minutes < 1) {
    result = '刚刚'
  } else if (minutes < 60) {
    result = `${minutes}分钟前`
  } else if (hours < 24) {
    result = `${hours}小时前`
  } else if (days < 7) {
    result = `${days}天前`
  } else {
    result = date.toLocaleDateString('zh-CN')
  }

  timeAgoCache.set(dateString, { value: result, timestamp: now })
  return result
}

export function formatDate(dateString: string | Date): string {
  const key = typeof dateString === 'string' ? dateString : dateString.toISOString()
  const cached = dateCache.get(key)
  if (cached) return cached

  const date = parseDate(dateString)
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const result = `${year}-${month}-${day}`

  dateCache.set(key, result)
  return result
}

export function formatHour(dateString: string): string {
  const cached = hourCache.get(dateString)
  if (cached) return cached

  const date = parseDate(dateString)
  if (!date) return ''

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const result = `${hours}:${minutes}`

  hourCache.set(dateString, result)
  return result
}

export function formatDateTime(dateString: string | Date): string {
  const key = typeof dateString === 'string' ? dateString : dateString.toISOString()
  const cached = dateTimeCache.get(key)
  if (cached) return cached

  const date = parseDate(dateString)
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const result = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

  dateTimeCache.set(key, result)
  return result
}
