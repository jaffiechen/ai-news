# AI快讯 - 详细设计文档（SDD）

> 生成日期：2026-07-13
> 阶段：③ /sdd
> 上游：PRD.md + ARCH.md
> 下游：impl（代码实现）

---

## 〇、模块清单总览

| 模块 ID | 名称 | 路径 | 规模预估 |
|---|---|---|---|
| M-001 | 配置中心 | `src/config/` | 小型 |
| M-002 | 数据访问层 | `src/composables/useNews.ts` | 中型 |
| M-003 | 应用入口 | `src/main.ts` | 小型 |
| M-004 | 统一响应 / 错误 | `src/utils/response.ts` | 小型 |
| M-005 | 存储服务 | `src/composables/useStorage.ts` | 中型 |
| M-006 | 音效服务 | `src/composables/useSound.ts` | 小型 |
| M-007 | 主题服务 | `src/composables/useTheme.ts` | 小型 |
| M-008 | 时间轴模块 | `src/components/timeline/` | 中型 |
| M-009 | 新闻卡片模块 | `src/components/cards/` | 中型 |
| M-010 | 设置面板模块 | `src/components/settings/` | 中型 |
| M-011 | PWA 配置 | `public/manifest.json` + `src/service-worker.ts` | 小型 |
| M-012 | RSS聚合工作流 | `.github/workflows/rss-update.yml` | 小型 |

---

## 一、模块 M-001 配置中心

### 1.1 配置项设计
| 配置项 | 类型 | 默认 | 说明 | 来源 |
|---|---|---|---|---|
| newsApiUrl | string | `/data/news.json` | 新闻数据接口地址 | 环境变量/配置文件 |
| sourcesApiUrl | string | `/data/sources.json` | 信息源配置地址 | 环境变量/配置文件 |
| updateInterval | number | 900000 | 自动检查更新间隔（毫秒），默认15分钟 | 配置文件 |
| breakingKeywords | string[] | `['GPT-5', '发布', '开源', '重磅', '突破性']` | 突发新闻关键词列表 | 配置文件 |
| localStoragePrefix | string | `ai-news` | localStorage键名前缀 | 配置文件 |
| themeAutoStartHour | number | 6 | 自动黑夜模式开始时间（小时） | 配置文件 |
| themeAutoEndHour | number | 18 | 自动黑夜模式结束时间（小时） | 配置文件 |

### 1.2 边界条件
- 配置文件缺失时使用硬编码默认值
- updateInterval 最小值限制为 60000（1分钟），防止频繁请求

---

## 二、模块 M-002 数据访问层

### 2.1 接口签名
```typescript
loadNews(): Promise<ApiResponse<{ news: News[]; total: number }>>
filterBySources(sources: string[]): News[]
checkForUpdates(): Promise<ApiResponse<{ hasNew: boolean; count: number }>>
getSources(): Promise<ApiResponse<Source[]>>
```

### 2.2 算法伪代码（loadNews）
```
输入：无
1. 记录开始时间
2. try:
3.     发起 HTTP GET 请求获取 news.json
4.     解析 JSON 响应
5.     按 pubDate 降序排序新闻列表
6.     返回 { success: true, data: { news: [...], total: count } }
7. except 网络错误 as e:
8.     记录日志 e
9.     返回 { success: false, error: '1004', message: '网络错误' }
10. except 解析错误 as e:
11.    记录日志 e
12.    返回 { success: false, error: '1001', message: '数据加载失败' }
13. finally:
14.    计算耗时，记录性能日志
```

### 2.3 算法伪代码（filterBySources）
```
输入：sources - 启用的信息源ID列表
1. 如果 sources 为空数组：返回全部新闻
2. 遍历新闻列表
3. 过滤出 source 字段在 sources 列表中的新闻
4. 返回过滤后的列表
```

### 2.4 算法伪代码（checkForUpdates）
```
输入：无
1. 获取本地存储的上次更新时间
2. try:
3.     发起 HTTP HEAD 请求获取 news.json 的 Last-Modified
4.     对比服务器时间与本地时间
5.     如果服务器时间更新：
6.         计算新新闻数量（可选：重新获取新闻列表对比）
7.         返回 { success: true, data: { hasNew: true, count: N } }
8.     否则：
9.         返回 { success: true, data: { hasNew: false, count: 0 } }
10. except:
11.    返回 { success: false, error: '1004', message: '检查更新失败' }
```

### 2.5 边界条件清单
- [ ] news.json 返回空数组 → 返回空列表，不报错
- [ ] 网络超时（10秒）→ 返回错误码1004
- [ ] JSON格式错误 → 返回错误码1001
- [ ] sources 参数为空 → 返回全部新闻
- [ ] sources 参数包含不存在的ID → 忽略无效ID

---

## 三、模块 M-003 应用入口

### 3.1 初始化流程伪代码
```
1. 导入 Vue 3 和根组件 App.vue
2. 导入全局样式 style.css
3. 初始化 Vue 应用实例
4. 配置路由（如需要）
5. 挂载到 #app 元素
6. 初始化 PWA Service Worker
7. 加载用户偏好设置
8. 根据偏好设置主题
```

### 3.2 边界条件
- DOM 中无 #app 元素 → 控制台报错，不启动
- Service Worker 注册失败 → 记录日志，继续启动

---

## 四、模块 M-004 统一响应 / 错误

### 4.1 响应结构定义
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### 4.2 错误码对照表
| 错误码 | 含义 | HTTP状态码（如适用） |
|---|---|---|
| 0 | 成功 | 200 |
| 1001 | 数据加载失败 | 500 |
| 1002 | 存储操作失败 | 500 |
| 1003 | 参数错误 | 400 |
| 1004 | 网络错误 | 0 |

### 4.3 错误处理流程
```
1. 捕获异常
2. 根据异常类型映射到错误码
3. 记录日志
4. 返回标准化错误响应
```

---

## 五、模块 M-005 存储服务

### 5.1 接口签名
```typescript
getFavorites(): Favorite[]
toggleFavorite(news: News): ApiResponse<{ favorites: Favorite[] }>
getPreferences(): UserPreference
savePreferences(prefs: Partial<UserPreference>): ApiResponse<void>
exportData(): ApiResponse<{ favorites: Favorite[]; preferences: UserPreference }>
importData(data: { favorites: Favorite[]; preferences: UserPreference }): ApiResponse<void>
```

### 5.2 算法伪代码（toggleFavorite）
```
输入：news - 新闻对象
1. 获取当前收藏列表
2. 检查该新闻是否已在收藏中
3. 如果已收藏：
4.     从列表中移除该新闻
5. 否则：
6.     创建新的 Favorite 对象（newsId, title, link, source, savedAt）
7.     添加到收藏列表
8. 序列化并保存到 localStorage
9. 返回更新后的收藏列表
```

### 5.3 算法伪代码（importData）
```
输入：data - 导入的数据对象
1. 校验数据格式：
2.     favorites 必须是数组
3.     preferences 必须包含 theme 字段
4. 如果格式错误：返回错误码1003
5. try:
6.     将数据序列化并保存到 localStorage
7.     返回 { success: true }
8. except:
9.     返回 { success: false, error: '1002', message: '导入失败' }
```

### 5.4 边界条件清单
- [ ] localStorage 容量不足 → 返回错误码1002
- [ ] 导入数据格式错误 → 返回错误码1003
- [ ] 收藏列表为空 → 返回空数组
- [ ] preferences 缺失 → 返回默认偏好配置

---

## 六、模块 M-006 音效服务

### 6.1 接口签名
```typescript
playNotification(): ApiResponse<void>
detectBreakingNews(news: News): { isBreaking: boolean }
```

### 6.2 算法伪代码（detectBreakingNews）
```
输入：news - 新闻对象
1. 获取配置中的 breakingKeywords 列表
2. 将新闻标题转换为小写
3. 遍历 breakingKeywords：
4.     如果标题包含任意关键词：
5.         返回 { isBreaking: true }
6. 返回 { isBreaking: false }
```

### 6.3 算法伪代码（playNotification）
```
输入：无
1. 检查用户偏好中 soundEnabled 是否为 true
2. 如果未启用：返回 { success: false, message: '音效未开启' }
3. 创建 AudioContext
4. 生成"叮咚"提示音（频率约800Hz，时长0.3秒）
5. 播放音效
6. 返回 { success: true }
```

### 6.4 边界条件清单
- [ ] 用户浏览器不支持 AudioContext → 静默失败
- [ ] 关键词列表为空 → 返回 isBreaking: false
- [ ] 新闻标题为空 → 返回 isBreaking: false

---

## 七、模块 M-007 主题服务

### 7.1 接口签名
```typescript
toggleTheme(mode?: 'light' | 'dark' | 'auto'): ApiResponse<{ currentTheme: string }>
getCurrentTheme(): string
applyTheme(theme: string): void
```

### 7.2 算法伪代码（toggleTheme）
```
输入：mode - 主题模式，可选
1. 如果 mode 未提供：
2.     当前主题循环切换（auto → light → dark → auto）
3. 否则：
4.     使用传入的 mode
5. 保存到用户偏好
6. 应用主题到 DOM
7. 返回 { success: true, data: { currentTheme: mode } }
```

### 7.3 算法伪代码（applyTheme）
```
输入：theme - 主题名称
1. 如果 theme 为 'auto'：
2.     获取当前时间（小时）
3.     如果时间在 6-18 之间：应用 light
4.     否则：应用 dark
5. 否则：
6.     直接应用 theme
7. 给 <html> 标签添加对应类名
```

### 7.4 边界条件清单
- [ ] 无效的 theme 值 → 使用默认值 'auto'
- [ ] 时间判断边界（6:00 和 18:00）→ 包含边界值

---

## 八、模块 M-008 时间轴模块

### 8.1 组件结构
```
Timeline.vue
├── TimelineHeader.vue    # 顶部横幅、下拉刷新
├── TimelineLine.vue      # 左侧时间线
└── TimelineItem.vue      # 新闻卡片节点（循环渲染）
```

### 8.2 TimelineItem 算法伪代码
```
输入：news - 单条新闻对象，isFirst - 是否为第一条
1. 如果 isFirst：
2.     添加呼吸灯动画类名
3. 获取信息源配置，查找图标和名称
4. 渲染新闻卡片：
5.     左侧圆点（呼吸效果如适用）
6.     时间标签（格式化后的相对时间）
7.     标题和摘要
8.     来源标识
9.     收藏按钮
```

### 8.3 下拉刷新算法伪代码
```
1. 监听 touchstart/touchmove/touchend 事件
2. 计算下拉距离
3. 如果下拉距离 > 阈值（如100px）：
4.     显示加载动画
5.     触发刷新新闻数据
6.     刷新完成后回弹
```

---

## 九、模块 M-009 新闻卡片模块

### 9.1 组件结构
```
NewsCard.vue
├── card-header           # 时间 + 来源
├── card-body             # 标题 + 摘要 + 图片
└── card-footer           # 收藏按钮 + 跳转链接
```

### 9.2 收藏按钮交互伪代码
```
1. 检查该新闻是否已收藏
2. 如果已收藏：显示实心星星
3. 如果未收藏：显示空心星星
4. 点击时：
5.     调用 toggleFavorite
6.     更新按钮状态
7.     添加点击动画效果
```

---

## 十、模块 M-010 设置面板模块

### 10.1 组件结构
```
Settings.vue
├── SourceList.vue       # 信息源开关列表
├── ThemeSwitch.vue      # 主题切换
├── SoundSwitch.vue      # 音效开关
├── DataExport.vue       # 数据导出导入
└── GeekMode.vue         # 极客模式（长按触发）
```

### 10.2 信息源开关算法伪代码
```
输入：sourceId - 信息源ID
1. 获取当前用户偏好中的 enabledSources
2. 如果 sourceId 已在列表中：
3.     移除该ID
4. 否则：
5.     添加该ID
6. 保存更新后的偏好
7. 触发新闻列表重新过滤
```

### 10.3 极客模式算法伪代码
```
1. 监听 mousedown/touchstart 事件
2. 启动计时器（3秒）
3. 显示长按进度条
4. 如果在3秒内释放（mouseup/touchend）：
5.     取消计时器
6.     进度条归零
7. 如果3秒后仍按住：
8.     显示极客模式弹窗
9.     允许粘贴JSON配置代码
10. 解析JSON并验证格式
11. 如果格式正确：引导用户提交PR
```

---

## 十一、模块 M-011 PWA 配置

### 11.1 manifest.json 配置项
| 配置项 | 值 | 说明 |
|---|---|---|
| name | AI快讯 | 应用名称 |
| short_name | AI快讯 | 短名称 |
| description | 追踪AI前沿动态 | 应用描述 |
| start_url | / | 启动路径 |
| display | standalone | 独立应用模式 |
| background_color | #ffffff | 背景色 |
| theme_color | #3b82f6 | 主题色 |
| icons | [] | 图标数组（多尺寸） |

### 11.2 Service Worker 缓存策略
```
1. 安装阶段：缓存核心静态资源（HTML、CSS、JS、图标）
2. 激活阶段：清理旧缓存
3. fetch 事件：
4.     如果是 API 请求（/data/*）：network-first
5.     如果是静态资源：cache-first
6.     如果离线且缓存命中：返回缓存
7.     如果离线且缓存未命中：返回离线页面
```

---

## 十二、模块 M-012 RSS聚合工作流

### 12.1 工作流配置
```yaml
name: RSS 更新
on:
  schedule:
    - cron: '*/15 * * * *'  # 每15分钟执行一次
  workflow_dispatch:        # 手动触发

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - 检出代码
      - 安装依赖（Node.js）
      - 执行 RSS 抓取脚本
      - 提交并推送变更
```

### 12.2 RSS抓取算法伪代码
```
1. 读取 sources.json 获取所有信息源列表
2. 遍历每个信息源：
3.     发起 HTTP GET 请求获取 RSS Feed
4.     解析 RSS XML
5.     提取新闻条目（标题、链接、发布时间、摘要）
6.     转换为统一格式的 News 对象
7. 合并所有新闻条目
8. 去重（按链接或标题）
9. 按 pubDate 降序排序
10. 保留最近 500 条新闻
11. 写入 news.json
```

---

## 十三、数据初始化（schema / seed 草案）

### 13.1 news.json 种子结构
```json
[
  {
    "id": "news-001",
    "title": "GPT-5 发布预览版",
    "link": "https://example.com/news/1",
    "source": "openai",
    "category": "产品发布",
    "summary": "OpenAI 正式发布 GPT-5 预览版，支持多模态理解",
    "pubDate": "2026-07-13T10:30:00Z",
    "isBreaking": true,
    "imageUrl": "https://example.com/image.jpg"
  }
]
```

### 13.2 sources.json 初始信息源（至少10个）
```json
[
  {"id": "quantum-bit", "name": "量子位", "icon": "📰", "rssUrl": "...", "category": "中文媒体"},
  {"id": "arxiv", "name": "arXiv", "icon": "📄", "rssUrl": "...", "category": "学术"},
  {"id": "openai", "name": "OpenAI", "icon": "🤖", "rssUrl": "...", "category": "公司"},
  {"id": "techweb", "name": "TechWeb", "icon": "💻", "rssUrl": "...", "category": "中文媒体"},
  {"id": "hacker-news", "name": "Hacker News", "icon": "🔷", "rssUrl": "...", "category": "社区"},
  {"id": "github-trending", "name": "GitHub Trending", "icon": "🐙", "rssUrl": "...", "category": "开源"},
  {"id": "ai-bot-news", "name": "AI Bot News", "icon": "🔮", "rssUrl": "...", "category": "媒体"},
  {"id": "towards-ai", "name": "Towards AI", "icon": "📚", "rssUrl": "...", "category": "学术"},
  {"id": "machine-learning", "name": "Machine Learning", "icon": "📊", "rssUrl": "...", "category": "学术"},
  {"id": "venturebeat", "name": "VentureBeat", "icon": "📈", "rssUrl": "...", "category": "媒体"}
]
```

### 13.3 localStorage 默认偏好
```json
{
  "enabledSources": ["quantum-bit", "arxiv", "openai", "techweb", "hacker-news"],
  "theme": "auto",
  "soundEnabled": false,
  "lastUpdateTime": ""
}
```

---

## 十四、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-07-13 | 初稿 | AI-TL |