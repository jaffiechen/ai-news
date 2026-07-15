# AI快讯 - 详细设计文档（SDD）

> 文档版本：v2.0.0
> 生成日期：2026-07-15
> 阶段：③ /sdd
> 上游：PRD.md + ARCH.md
> 下游：impl（代码实现）

---

## 〇、模块清单总览

| 模块 ID | 名称 | 路径 | 规模 | 优先级 |
|:-------:|:-----|:-----|:----:|:------:|
| M-001 | 配置中心 | `src/config/index.ts` | 小型 | P0 |
| M-002 | 数据访问层 | `src/composables/useNews.ts` | 中型 | P0 |
| M-003 | 存储服务 | `src/composables/useStorage.ts` | 中型 | P0 |
| M-004 | 主题服务 | `src/composables/useTheme.ts` | 小型 | P1 |
| M-005 | 音效服务 | `src/composables/useSound.ts` | 小型 | P1 |
| M-006 | 翻译服务 | `src/composables/useTranslate.ts` | 小型 | P0 |
| M-007 | 时间轴模块 | `src/components/timeline/Timeline.vue` | 中型 | P0 |
| M-008 | 新闻卡片模块 | `src/components/cards/NewsCard.vue` | 中型 | P0 |
| M-009 | 滚动进度条 | `src/components/common/ScrollProgress.vue` | 小型 | P1 |
| M-010 | 收藏弹窗 | `src/components/settings/FavoritesModal.vue` | 中型 | P1 |
| M-011 | 历史记录弹窗 | `src/components/settings/HistoryModal.vue` | 中型 | P1 |
| M-012 | 来源管理弹窗 | `src/components/settings/SourceModal.vue` | 中型 | P1 |
| M-013 | 设置面板 | `src/components/settings/Settings.vue` | 中型 | P1 |
| M-014 | 骨架屏 | `src/components/common/SkeletonScreen.vue` | 小型 | P1 |
| M-015 | 后端抓取主入口 | `scripts/fetcher/index.ts` | 大型 | P0 |
| M-016 | 抓取器集合 | `scripts/fetcher/fetchers/` | 大型 | P0 |
| M-017 | 过滤器 | `scripts/fetcher/filters/` | 中型 | P0 |
| M-018 | 翻译模块 | `scripts/fetcher/translate.ts` | 中型 | P0 |
| M-019 | 工具函数 | `scripts/fetcher/utils/` | 中型 | P0 |
| M-020 | CI/CD 工作流 | `.github/workflows/rss-update.yml` | 小型 | P1 |

---

## 一、模块 M-001 配置中心

### 1.1 配置项设计

| 配置项 | 类型 | 默认值 | 说明 |
|:-------|:-----|:-------|:-----|
| `newsApiUrl24h` | string | `/data/latest-24h.json` | 24 小时新闻数据接口 |
| `newsApiUrl7d` | string | `/data/latest-7d.json` | 7 天新闻数据接口 |
| `sourcesApiUrl` | string | `/data/sources.json` | 信息源配置地址 |
| `updateInterval` | number | 7200000 | 自动检查更新间隔（毫秒），默认 2 小时 |
| `breakingKeywords` | string[] | `['GPT-5', '发布', '开源', '重磅', '突破性', '首次', '里程碑']` | 突发新闻关键词 |
| `localStoragePrefix` | string | `ai-news` | localStorage 键名前缀 |
| `themeAutoStartHour` | number | 6 | 自动亮色模式开始时间（小时） |
| `themeAutoEndHour` | number | 18 | 自动亮色模式结束时间（小时） |
| `maxHistory` | number | 100 | 最大历史记录条数 |

### 1.2 边界条件
- 配置文件缺失时使用硬编码默认值
- `updateInterval` 最小值限制为 300000（5 分钟），防止频繁请求
- `maxHistory` 最小值限制为 10，避免过少无意义

---

## 二、模块 M-002 数据访问层（useNews）

### 2.1 接口签名

```typescript
interface UseNewsReturn {
  news: Ref<News[]>;                    // 新闻列表
  stats: Ref<NewsStats | null>;        // 统计数据
  loading: Ref<boolean>;                // 加载状态
  error: Ref<string | null>;            // 错误信息
  timeRange: Ref<'24h' | '7d'>;          // 时间范围
  totalItems: Ref<number>;              // 总条数
  
  loadNews(): Promise<void>;             // 加载新闻
  setTimeRange(range: '24h' | '7d'): void;  // 设置时间范围
  filterBySources(sources: string[]): News[];  // 按来源筛选
  searchNews(keyword: string): News[];  // 搜索新闻
  checkForUpdates(): Promise<boolean>;  // 检查更新
  preload7dData(): Promise<void>;       // 预加载 7 天数据
}
```

### 2.2 核心算法

#### 2.2.1 数据加载流程
```
输入：timeRange ('24h' | '7d')
输出：void（更新 news ref）

1. 设置 loading = true
2. 构造 URL：timeRange === '24h' ? newsApiUrl24h : newsApiUrl7d
3. fetch 请求 JSON 数据
4. 解析数据，提取 items 数组
5. 按 published_at 降序排序
6. 更新 news ref
7. 更新 stats 统计数据
8. 设置 loading = false
9. 异常处理：设置 error，loading = false
```

#### 2.2.2 更新检测算法
```
输入：无
输出：boolean（是否有更新）

1. 获取当前最新新闻的 last_seen_at
2. 请求数据接口（仅 header，或轻量请求）
3. 对比返回数据的 generated_at
4. 若新数据时间更新，则返回 true
```

### 2.3 数据结构

```typescript
interface NewsStats {
  totalItems: number;
  totalItemsRaw: number;
  siteCount: number;
  sourceCount: number;
  generatedAt: string;
  siteStats: SiteStat[];
}

interface SiteStat {
  site_id: string;
  site_name: string;
  count: number;
  raw_count: number;
}
```

---

## 三、模块 M-003 存储服务（useStorage）

### 3.1 接口签名

```typescript
interface UseStorageReturn {
  // 收藏
  getFavorites(): Favorite[];
  toggleFavorite(news: News): ApiResponse<{ favorites: Favorite[] }>;
  getNewFavoritesCount(): number;
  markFavoritesSeen(): void;
  resetFavorites(): void;
  
  // 历史记录
  getHistory(): History[];
  addToHistory(news: News): ApiResponse<{ history: History[] }>;
  getNewHistoryCount(): number;
  markHistorySeen(): void;
  resetHistory(): void;
  
  // 偏好设置
  getPreferences(): UserPreference;
  savePreferences(prefs: Partial<UserPreference>): ApiResponse<void>;
  
  // 数据导入导出
  exportData(): ApiResponse<{ favorites: Favorite[]; preferences: UserPreference }>;
  importData(data: { favorites: Favorite[]; preferences: UserPreference }): ApiResponse<void>;
}
```

### 3.2 存储键设计

| 键名 | 存储内容 | 数据结构 |
|:-----|:---------|:---------|
| `{prefix}-favorites` | 收藏列表 | `Favorite[]` |
| `{prefix}-history` | 阅读历史 | `History[]` |
| `{prefix}-preferences` | 用户偏好 | `UserPreference` |

### 3.3 新增计数逻辑

```
新增收藏数 = 当前收藏总数 - lastSeenFavoritesCount
新增历史数 = 当前历史总数 - lastSeenHistoryCount

点击收藏按钮打开弹窗时：
  更新 lastSeenFavoritesCount = 当前收藏总数
  
点击历史按钮打开弹窗时：
  更新 lastSeenHistoryCount = 当前历史总数
```

### 3.4 边界条件
- 历史记录超过 `maxHistory` 条时，自动删除最旧的记录
- 收藏无数量限制（受 localStorage 容量限制）
- 数据损坏（JSON 解析失败）时，返回空数组/默认值

---

## 四、模块 M-006 翻译服务（useTranslate）

### 4.1 接口签名

```typescript
type TranslateMode = 'zh' | 'en' | 'bilingual';

interface UseTranslateReturn {
  translateMode: Ref<TranslateMode>;
  
  getTranslateMode(): TranslateMode;
  setTranslateMode(mode: TranslateMode): void;
  toggleTranslateMode(): void;          // 循环切换：zh → bilingual → en → zh
  getDisplayTitle(news: News): string;  // 获取显示标题
  initTranslateMode(): void;            // 从 localStorage 初始化
}
```

### 4.2 标题显示优先级

| 模式 | 优先级顺序 |
|:-----|:-----------|
| `zh`（中文） | `title_zh` → `title_bilingual` → `title` |
| `en`（英文） | `title_en` → `title` |
| `bilingual`（双语） | `title_bilingual` → `title_zh` → `title` |

### 4.3 切换逻辑
```
toggleTranslateMode():
  modes = ['zh', 'bilingual', 'en']
  currentIndex = modes.indexOf(translateMode.value)
  nextIndex = (currentIndex + 1) % modes.length
  setTranslateMode(modes[nextIndex])
```

---

## 五、模块 M-009 滚动进度条（ScrollProgress）

### 5.1 组件 Props
无 Props，纯展示 + 交互组件。

### 5.2 交互逻辑

#### 5.2.1 进度计算
```
scrollProgress = scrollY / (scrollHeight - clientHeight)
progressPercent = Math.round(scrollProgress * 100)
```

#### 5.2.2 点击跳转
```
handleProgressClick(e):
  rect = progressBar.getBoundingClientRect()
  clickY = e.clientY - rect.top
  percent = 1 - (clickY / rect.height)   // 底部是 0%，顶部是 100%
  targetScrollTop = percent * (scrollHeight - clientHeight)
  window.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
```

#### 5.2.3 拖拽跳转
```
mousedown:
  isDragging = true
  记录起始位置
  绑定 mousemove + mouseup 事件

mousemove (dragging):
  计算当前位置百分比
  实时更新 scrollTop（behavior: 'auto'）
  更新进度条 UI（关闭 transition 动画）

mouseup:
  isDragging = false
  移除事件监听
  恢复 transition 动画
```

### 5.3 显示/隐藏逻辑
- 滚动距离 > 100px 时显示
- 顶部时隐藏

---

## 六、模块 M-015 后端抓取主入口

### 6.1 处理流程总览

```
main():
  1. 加载 archive（历史归档）
  2. 修复 archive 中的未来日期
  3. 创建所有抓取器实例
  4. 并发执行所有抓取器（p-limit 限流）
  5. 合并所有原始数据
  6. 标准化处理（日期修正、URL 规范化）
  7. AI 相关性过滤
  8. 标题 + URL 去重
  9. 添加双语翻译字段
  10. 生成 24h / 7d 输出文件
  11. 更新 archive 归档
  12. 保存翻译缓存
  13. 输出统计信息
```

### 6.2 日期校验逻辑

```typescript
// 对每条新闻进行日期校验
let publishedAt = raw.publishedAt;
if (publishedAt && publishedAt.getTime() > now.getTime() + 60 * 60 * 1000) {
  // 发布时间超过当前时间 1 小时，视为无效日期
  // 使用抓取时间作为发布时间
  publishedAt = now;
}

// 对 archive 中已有数据也进行校验
for (const item of archive.values()) {
  if (item.published_at) {
    const pubDate = parseISO(item.published_at);
    if (pubDate && pubDate.getTime() > now.getTime() + 60 * 60 * 1000) {
      item.published_at = toISOString(now)!;
    }
  }
}
```

### 6.3 命令行参数

| 参数 | 缩写 | 默认值 | 说明 |
|:-----|:-----|:-------|:-----|
| `--window-hours` | `-w` | 24 | 时间窗口（小时） |
| `--translate-max-new` | - | 80 | 单次最大新翻译条数 |
| `--output-dir` | `-o` | `public/data` | 输出目录 |
| `--opml` | - | `feeds/follow.opml` | OPML 文件路径 |

---

## 七、模块 M-018 翻译模块

### 7.1 翻译流程

```
addBilingualFields(itemsAi, itemsAll, cache, maxNew):
  1. 从 itemsAll 中收集所有中文标题（按 URL 索引）
  2. 遍历每条新闻：
     a. 如果是中文标题，直接填充 title_zh
     b. 如果是英文标题：
        - 先从 zhByUrl 查找（同 URL 的中文标题）
        - 再从 cache 查找（历史翻译缓存）
        - 都没有且允许翻译时，调用 Google API
  3. 生成 title_bilingual = "中文 / 英文"
  4. 更新翻译缓存
  5. 返回结果
```

### 7.2 Google 翻译 API 调用

```
API: https://translate.googleapis.com/translate_a/single
参数:
  - client: gtx
  - sl: auto (源语言自动检测)
  - tl: zh-CN (目标语言)
  - dt: t (翻译)
  - q: 待翻译文本

返回格式:
  [
    [
      [翻译片段1, 原文片段1, ...],
      [翻译片段2, 原文片段2, ...],
      ...
    ],
    ...
  ]

组装翻译结果:
  将所有翻译片段拼接起来
```

### 7.3 性能优化
- **缓存机制**：已翻译标题持久化到 `title-zh-cache.json`
- **限流保护**：每次最多翻译 N 条新标题
- **超时控制**：单条翻译超时 12 秒
- **批量处理**：逐条顺序调用，避免并发限流

---

## 八、模块 M-017 过滤器

### 8.1 AI 相关性过滤

基于关键词匹配的过滤算法：
- 匹配 AI / 机器学习 / 深度学习相关关键词
- 支持中英文混合关键词
- 标题命中关键词即视为 AI 相关

### 8.2 去重算法

基于「标题相似度 + URL」的双重去重：
1. **URL 规范化**：去除 tracking 参数，统一协议和域名大小写
2. **标题去重**：标题完全相同（忽略大小写和首尾空格）
3. **优先级**：保留首次出现的条目

---

## 九、前端组件树数据流

### 9.1 数据流图

```
                    App.vue
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    useNews()    useStorage()   useTranslate()
         │             │             │
         ├─────────────┴─────────────┤
         ▼             ▼             ▼
    Timeline     FavoritesModal   NewsCard
       │              │              │
       ▼              ▼              ▼
    NewsCard     HistoryModal   ScrollProgress
```

### 9.2 响应式更新机制

- 翻译模式变化 → `getDisplayTitle` computed 自动更新 → 所有 NewsCard 标题更新
- 收藏变化 → `newFavoritesCount` computed 自动更新 → 徽章数字更新
- 主题变化 → `document.documentElement.classList` 切换 → 全局样式更新

---

## 十、错误处理策略

### 10.1 前端错误处理

| 场景 | 处理方式 | 用户感知 |
|:-----|:---------|:---------|
| 数据加载失败 | 显示错误提示，提供重试按钮 | 错误文案 + 重试按钮 |
| 网络超时 | 显示加载中，超时后提示 | 骨架屏 → 错误提示 |
| localStorage 满 | 捕获异常，静默失败 | 无感知（功能降级） |
| 翻译模式切换 | 即时切换，无网络请求 | 标题立即变化 |

### 10.2 后端错误处理

| 场景 | 处理方式 |
|:-----|:---------|
| 单个数据源抓取失败 | 记录日志，跳过该源，继续其他源 |
| 翻译 API 失败 | 返回 null，保留英文原文 |
| 部分 RSS 源失败 | 记录错误，继续其他源 |
| 写入文件失败 | 抛出异常，终止运行 |

---

## 十一、性能优化点

### 11.1 前端性能
1. **虚拟滚动**：1000 条以内直接渲染，超过可考虑虚拟列表
2. **computed 缓存**：翻译标题、筛选结果用 computed 缓存
3. **事件节流**：滚动事件使用 `{ passive: true }` 优化
4. **图片懒加载**：暂未使用图片，预留空间

### 11.2 后端性能
1. **并发控制**：p-limit 限制并发数为 5
2. **翻译缓存**：避免重复翻译相同标题
3. **流式处理**：边抓取边处理，内存友好
4. **增量更新**：基于 archive 归档，只处理新数据
