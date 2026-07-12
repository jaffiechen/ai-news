# AI快讯 - 测试用例文档

> 生成日期：2026-07-13
> 阶段：③ /sdd
> 上游：SDD.md

> **使用说明**：所有用例采用 Given-When-Then 格式 + Vitest 测试代码。
> 测试前请确认服务已按 README 启动：`npm run dev`

---

## 〇、测试环境

| 项 | 值 |
|---|---|
| 入口地址 | http://localhost:5173 |
| 测试框架 | Vitest + Vue Test Utils |
| 测试工具 | npm run test |
| 测试顺序 | 工具函数 → Composable → 组件 |

---

## 一、API-001 useNews.loadNews()

### TC-001-01 正常路径 - 成功加载新闻数据
```typescript
describe('useNews', () => {
  it('should load news successfully', async () => {
    // Given
    vi.mock('axios', () => ({
      get: vi.fn().mockResolvedValue({
        data: [{ id: 'news-001', title: 'GPT-5发布', pubDate: '2026-07-13T10:30:00Z' }]
      })
    }))
    
    // When
    const { loadNews } = useNews()
    const result = await loadNews()
    
    // Then
    expect(result.success).toBe(true)
    expect(result.data?.news.length).toBe(1)
    expect(result.data?.news[0].title).toBe('GPT-5发布')
  })
})
```

### TC-001-02 边界 - 返回空数组
```typescript
it('should handle empty news list', async () => {
  // Given
  vi.mock('axios', () => ({
    get: vi.fn().mockResolvedValue({ data: [] })
  }))
  
  // When
  const { loadNews } = useNews()
  const result = await loadNews()
  
  // Then
  expect(result.success).toBe(true)
  expect(result.data?.news.length).toBe(0)
})
```

### TC-001-03 异常 - 网络错误
```typescript
it('should return error when network fails', async () => {
  // Given
  vi.mock('axios', () => ({
    get: vi.fn().mockRejectedValue(new Error('Network error'))
  }))
  
  // When
  const { loadNews } = useNews()
  const result = await loadNews()
  
  // Then
  expect(result.success).toBe(false)
  expect(result.error).toBe('1004')
})
```

---

## 二、API-002 useNews.filterBySources()

### TC-002-01 正常路径 - 过滤指定信息源
```typescript
describe('useNews', () => {
  it('should filter news by sources', () => {
    // Given
    const news = [
      { id: '1', title: 'News 1', source: 'quantum-bit' },
      { id: '2', title: 'News 2', source: 'arxiv' },
      { id: '3', title: 'News 3', source: 'openai' }
    ]
    
    // When
    const filtered = filterBySources(news, ['quantum-bit', 'arxiv'])
    
    // Then
    expect(filtered.length).toBe(2)
    expect(filtered.every(n => ['quantum-bit', 'arxiv'].includes(n.source))).toBe(true)
  })
})
```

### TC-002-02 边界 - 空数组返回全部
```typescript
it('should return all news when sources is empty', () => {
  // Given
  const news = [{ id: '1', title: 'News 1', source: 'quantum-bit' }]
  
  // When
  const filtered = filterBySources(news, [])
  
  // Then
  expect(filtered.length).toBe(1)
})
```

### TC-002-03 异常 - 无效信息源ID
```typescript
it('should ignore invalid source IDs', () => {
  // Given
  const news = [{ id: '1', title: 'News 1', source: 'quantum-bit' }]
  
  // When
  const filtered = filterBySources(news, ['nonexistent-source'])
  
  // Then
  expect(filtered.length).toBe(0)
})
```

---

## 三、API-003 useNews.checkForUpdates()

### TC-003-01 正常路径 - 有新消息
```typescript
describe('useNews', () => {
  it('should detect new updates', async () => {
    // Given
    vi.mock('axios', () => ({
      head: vi.fn().mockResolvedValue({
        headers: { 'last-modified': 'Mon, 13 Jul 2026 11:00:00 GMT' }
      })
    }))
    
    // When
    const { checkForUpdates } = useNews()
    const result = await checkForUpdates()
    
    // Then
    expect(result.success).toBe(true)
    expect(result.data?.hasNew).toBe(true)
  })
})
```

### TC-003-02 边界 - 无新消息
```typescript
it('should return no updates when data is up to date', async () => {
  // Given
  vi.mock('axios', () => ({
    head: vi.fn().mockResolvedValue({
      headers: { 'last-modified': 'Mon, 13 Jul 2026 10:00:00 GMT' }
    })
  }))
  
  // When
  const { checkForUpdates } = useNews()
  const result = await checkForUpdates()
  
  // Then
  expect(result.success).toBe(true)
  expect(result.data?.hasNew).toBe(false)
})
```

### TC-003-03 异常 - 检查失败
```typescript
it('should return error when check fails', async () => {
  // Given
  vi.mock('axios', () => ({
    head: vi.fn().mockRejectedValue(new Error('Network error'))
  }))
  
  // When
  const { checkForUpdates } = useNews()
  const result = await checkForUpdates()
  
  // Then
  expect(result.success).toBe(false)
  expect(result.error).toBe('1004')
})
```

---

## 四、API-004 useStorage.getFavorites()

### TC-004-01 正常路径 - 返回收藏列表
```typescript
describe('useStorage', () => {
  it('should return favorites list', () => {
    // Given
    const mockFavorites = [{ newsId: '1', title: 'News 1', savedAt: '2026-07-13' }]
    vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockFavorites))
    
    // When
    const { getFavorites } = useStorage()
    const result = getFavorites()
    
    // Then
    expect(result.length).toBe(1)
    expect(result[0].newsId).toBe('1')
  })
})
```

### TC-004-02 边界 - 空收藏列表
```typescript
it('should return empty array when no favorites', () => {
  // Given
  vi.spyOn(localStorage, 'getItem').mockReturnValue(null)
  
  // When
  const { getFavorites } = useStorage()
  const result = getFavorites()
  
  // Then
  expect(result.length).toBe(0)
})
```

### TC-004-03 异常 - localStorage 读取失败
```typescript
it('should handle localStorage error', () => {
  // Given
  vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
    throw new Error('Storage error')
  })
  
  // When
  const { getFavorites } = useStorage()
  const result = getFavorites()
  
  // Then
  expect(result.length).toBe(0)
})
```

---

## 五、API-005 useStorage.toggleFavorite()

### TC-005-01 正常路径 - 添加收藏
```typescript
describe('useStorage', () => {
  it('should add news to favorites', () => {
    // Given
    vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify([]))
    const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
    
    // When
    const { toggleFavorite } = useStorage()
    const result = toggleFavorite({ id: '1', title: 'News 1', link: 'http://example.com', source: 'test' })
    
    // Then
    expect(result.success).toBe(true)
    expect(mockSetItem).toHaveBeenCalled()
    expect(result.data?.favorites.length).toBe(1)
  })
})
```

### TC-005-02 边界 - 取消收藏
```typescript
it('should remove news from favorites', () => {
  // Given
  const existing = [{ newsId: '1', title: 'News 1', savedAt: '2026-07-13' }]
  vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existing))
  const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
  
  // When
  const { toggleFavorite } = useStorage()
  const result = toggleFavorite({ id: '1', title: 'News 1', link: 'http://example.com', source: 'test' })
  
  // Then
  expect(result.success).toBe(true)
  expect(result.data?.favorites.length).toBe(0)
})
```

### TC-005-03 异常 - localStorage 容量不足
```typescript
it('should return error when storage is full', () => {
  // Given
  vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify([]))
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
    throw new Error('Quota exceeded')
  })
  
  // When
  const { toggleFavorite } = useStorage()
  const result = toggleFavorite({ id: '1', title: 'News 1', link: 'http://example.com', source: 'test' })
  
  // Then
  expect(result.success).toBe(false)
  expect(result.error).toBe('1002')
})
```

---

## 六、API-006 useStorage.getPreferences()

### TC-006-01 正常路径 - 返回用户偏好
```typescript
describe('useStorage', () => {
  it('should return user preferences', () => {
    // Given
    const mockPrefs = { enabledSources: ['arxiv'], theme: 'dark', soundEnabled: true }
    vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockPrefs))
    
    // When
    const { getPreferences } = useStorage()
    const result = getPreferences()
    
    // Then
    expect(result.theme).toBe('dark')
    expect(result.soundEnabled).toBe(true)
  })
})
```

### TC-006-02 边界 - 返回默认偏好
```typescript
it('should return default preferences when none stored', () => {
  // Given
  vi.spyOn(localStorage, 'getItem').mockReturnValue(null)
  
  // When
  const { getPreferences } = useStorage()
  const result = getPreferences()
  
  // Then
  expect(result.theme).toBe('auto')
  expect(result.soundEnabled).toBe(false)
})
```

### TC-006-03 异常 - 数据格式错误
```typescript
it('should return defaults when data is corrupted', () => {
  // Given
  vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid json')
  
  // When
  const { getPreferences } = useStorage()
  const result = getPreferences()
  
  // Then
  expect(result.theme).toBe('auto')
})
```

---

## 七、API-007 useStorage.savePreferences()

### TC-007-01 正常路径 - 保存偏好
```typescript
describe('useStorage', () => {
  it('should save preferences', () => {
    // Given
    const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
    
    // When
    const { savePreferences } = useStorage()
    const result = savePreferences({ theme: 'dark', soundEnabled: true })
    
    // Then
    expect(result.success).toBe(true)
    expect(mockSetItem).toHaveBeenCalled()
  })
})
```

### TC-007-02 边界 - 部分更新
```typescript
it('should update only provided fields', () => {
  // Given
  const existing = { enabledSources: ['arxiv'], theme: 'auto', soundEnabled: false }
  vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existing))
  const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
  
  // When
  const { savePreferences } = useStorage()
  const result = savePreferences({ theme: 'dark' })
  
  // Then
  expect(result.success).toBe(true)
})
```

### TC-007-03 异常 - 存储失败
```typescript
it('should return error when save fails', () => {
  // Given
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
    throw new Error('Storage error')
  })
  
  // When
  const { savePreferences } = useStorage()
  const result = savePreferences({ theme: 'dark' })
  
  // Then
  expect(result.success).toBe(false)
  expect(result.error).toBe('1002')
})
```

---

## 八、API-008 useStorage.exportData()

### TC-008-01 正常路径 - 导出数据
```typescript
describe('useStorage', () => {
  it('should export all data', () => {
    // Given
    const mockFavorites = [{ newsId: '1', title: 'News 1' }]
    const mockPrefs = { theme: 'auto' }
    vi.spyOn(localStorage, 'getItem')
      .mockImplementation((key) => 
        key === 'ai-news-favorites' ? JSON.stringify(mockFavorites) : JSON.stringify(mockPrefs)
      )
    
    // When
    const { exportData } = useStorage()
    const result = exportData()
    
    // Then
    expect(result.success).toBe(true)
    expect(result.data?.favorites.length).toBe(1)
    expect(result.data?.preferences.theme).toBe('auto')
  })
})
```

### TC-008-02 边界 - 空数据导出
```typescript
it('should export empty data when nothing stored', () => {
  // Given
  vi.spyOn(localStorage, 'getItem').mockReturnValue(null)
  
  // When
  const { exportData } = useStorage()
  const result = exportData()
  
  // Then
  expect(result.success).toBe(true)
  expect(result.data?.favorites.length).toBe(0)
})
```

### TC-008-03 异常 - 读取失败
```typescript
it('should handle read error gracefully', () => {
  // Given
  vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
    throw new Error('Storage error')
  })
  
  // When
  const { exportData } = useStorage()
  const result = exportData()
  
  // Then
  expect(result.success).toBe(true)
  expect(result.data?.favorites.length).toBe(0)
})
```

---

## 九、API-009 useStorage.importData()

### TC-009-01 正常路径 - 导入数据
```typescript
describe('useStorage', () => {
  it('should import data successfully', () => {
    // Given
    const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
    const importData = {
      favorites: [{ newsId: '1', title: 'News 1' }],
      preferences: { theme: 'dark' }
    }
    
    // When
    const { importData: importFn } = useStorage()
    const result = importFn(importData)
    
    // Then
    expect(result.success).toBe(true)
    expect(mockSetItem).toHaveBeenCalledTimes(2)
  })
})
```

### TC-009-02 边界 - 空数据导入
```typescript
it('should handle empty import data', () => {
  // Given
  const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
  
  // When
  const { importData: importFn } = useStorage()
  const result = importFn({ favorites: [], preferences: { theme: 'auto' } })
  
  // Then
  expect(result.success).toBe(true)
})
```

### TC-009-03 异常 - 数据格式错误
```typescript
it('should return error for invalid data format', () => {
  // Given
  const invalidData = { favorites: 'not-an-array', preferences: {} }
  
  // When
  const { importData: importFn } = useStorage()
  const result = importFn(invalidData)
  
  // Then
  expect(result.success).toBe(false)
  expect(result.error).toBe('1003')
})
```

---

## 十、API-010 useSound.playNotification()

### TC-010-01 正常路径 - 播放音效
```typescript
describe('useSound', () => {
  it('should play notification sound', () => {
    // Given
    const mockPrefs = { soundEnabled: true }
    vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockPrefs))
    
    // When
    const { playNotification } = useSound()
    const result = playNotification()
    
    // Then
    expect(result.success).toBe(true)
  })
})
```

### TC-010-02 边界 - 音效未开启
```typescript
it('should not play when sound is disabled', () => {
  // Given
  const mockPrefs = { soundEnabled: false }
  vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockPrefs))
  
  // When
  const { playNotification } = useSound()
  const result = playNotification()
  
  // Then
  expect(result.success).toBe(false)
  expect(result.message).toBe('音效未开启')
})
```

### TC-010-03 异常 - 浏览器不支持 AudioContext
```typescript
it('should handle browser without AudioContext', () => {
  // Given
  const mockPrefs = { soundEnabled: true }
  vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockPrefs))
  global.AudioContext = undefined as any
  
  // When
  const { playNotification } = useSound()
  const result = playNotification()
  
  // Then
  expect(result.success).toBe(false)
})
```

---

## 十一、API-011 useSound.detectBreakingNews()

### TC-011-01 正常路径 - 检测到突发新闻
```typescript
describe('useSound', () => {
  it('should detect breaking news', () => {
    // Given
    const news = { title: 'GPT-5 重磅发布', pubDate: '2026-07-13T10:30:00Z' }
    
    // When
    const { detectBreakingNews } = useSound()
    const result = detectBreakingNews(news)
    
    // Then
    expect(result.isBreaking).toBe(true)
  })
})
```

### TC-011-02 边界 - 未检测到突发新闻
```typescript
it('should not detect non-breaking news', () => {
  // Given
  const news = { title: 'AI入门教程', pubDate: '2026-07-13T10:30:00Z' }
  
  // When
  const { detectBreakingNews } = useSound()
  const result = detectBreakingNews(news)
  
  // Then
  expect(result.isBreaking).toBe(false)
})
```

### TC-011-03 异常 - 空标题
```typescript
it('should handle empty title', () => {
  // Given
  const news = { title: '', pubDate: '2026-07-13T10:30:00Z' }
  
  // When
  const { detectBreakingNews } = useSound()
  const result = detectBreakingNews(news)
  
  // Then
  expect(result.isBreaking).toBe(false)
})
```

---

## 十二、API-012 useTheme.toggleTheme()

### TC-012-01 正常路径 - 切换主题
```typescript
describe('useTheme', () => {
  it('should toggle theme to dark', () => {
    // Given
    const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
    
    // When
    const { toggleTheme } = useTheme()
    const result = toggleTheme('dark')
    
    // Then
    expect(result.success).toBe(true)
    expect(result.data?.currentTheme).toBe('dark')
  })
})
```

### TC-012-02 边界 - 自动模式切换
```typescript
it('should cycle through themes when no mode provided', () => {
  // Given
  const mockPrefs = { theme: 'auto' }
  vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockPrefs))
  const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
  
  // When
  const { toggleTheme } = useTheme()
  const result = toggleTheme()
  
  // Then
  expect(result.success).toBe(true)
})
```

### TC-012-03 异常 - 无效主题值
```typescript
it('should use default when invalid theme provided', () => {
  // Given
  const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
  
  // When
  const { toggleTheme } = useTheme()
  const result = toggleTheme('invalid' as any)
  
  // Then
  expect(result.success).toBe(true)
  expect(result.data?.currentTheme).toBe('auto')
})
```

---

## 十三、API-013 utils.formatTime()

### TC-013-01 正常路径 - 格式化相对时间
```typescript
describe('utils', () => {
  it('should format time correctly', () => {
    // Given
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString()
    
    // When
    const result = formatTime(oneMinuteAgo)
    
    // Then
    expect(result).toBe('1分钟前')
  })
})
```

### TC-013-02 边界 - 刚刚发布
```typescript
it('should return "刚刚" for very recent', () => {
  // Given
  const justNow = new Date().toISOString()
  
  // When
  const result = formatTime(justNow)
  
  // Then
  expect(result).toBe('刚刚')
})
```

### TC-013-03 异常 - 无效日期格式
```typescript
it('should handle invalid date', () => {
  // Given
  const invalidDate = 'invalid-date'
  
  // When
  const result = formatTime(invalidDate)
  
  // Then
  expect(result).toBe('未知时间')
})
```

---

## 十四、API-014 HTTP GET /data/news.json

### TC-014-01 正常路径 - 返回新闻数据
```bash
curl -s http://localhost:5173/data/news.json | head -c 500
```
预期：返回 JSON 数组，包含新闻对象

### TC-014-02 边界 - 空数据
```bash
# 测试空文件情况
curl -s http://localhost:5173/data/news.json
```
预期：返回 `[]`

### TC-014-03 异常 - 文件不存在
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/data/missing.json
```
预期：返回 404

---

## 十五、API-015 HTTP GET /data/sources.json

### TC-015-01 正常路径 - 返回信息源数据
```bash
curl -s http://localhost:5173/data/sources.json | head -c 500
```
预期：返回 JSON 数组，包含信息源对象

### TC-015-02 边界 - 空数据源
```bash
curl -s http://localhost:5173/data/sources.json
```
预期：返回 `[]`

### TC-015-03 异常 - 文件不存在
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/data/missing.json
```
预期：返回 404

---

## 三、覆盖率矩阵

| 接口 | 正常用例 | 边界用例 | 异常用例 | 总数 |
|---|---|---|---|---|
| API-001 | 1 | 1 | 1 | 3 |
| API-002 | 1 | 1 | 1 | 3 |
| API-003 | 1 | 1 | 1 | 3 |
| API-004 | 1 | 1 | 1 | 3 |
| API-005 | 1 | 1 | 1 | 3 |
| API-006 | 1 | 1 | 1 | 3 |
| API-007 | 1 | 1 | 1 | 3 |
| API-008 | 1 | 1 | 1 | 3 |
| API-009 | 1 | 1 | 1 | 3 |
| API-010 | 1 | 1 | 1 | 3 |
| API-011 | 1 | 1 | 1 | 3 |
| API-012 | 1 | 1 | 1 | 3 |
| API-013 | 1 | 1 | 1 | 3 |
| API-014 | 1 | 1 | 1 | 3 |
| API-015 | 1 | 1 | 1 | 3 |
| **合计** | 15 | 15 | 15 | **45** |

---

## 四、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-07-13 | 初稿 | AI-TL |