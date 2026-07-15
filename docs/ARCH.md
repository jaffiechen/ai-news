# AI快讯 - 系统架构设计文档（HLD）

> 文档版本：v2.0.0
> 生成日期：2026-07-15
> 阶段：② /hld
> 上游文档：PRD.md
> 下游文档：SDD.md + TEST.md

---

## 一、技术选型

### 1.1 技术栈选型矩阵

| 类别 | 选定方案 | 备选 1 | 备选 2 | 选定理由 |
|:-----|:---------|:-------|:-------|:---------|
| **核心语言** | TypeScript 5.4+ | JavaScript | Python | 前后端统一语言，类型安全，IDE 支持友好，全栈开发效率高 |
| **前端框架** | Vue 3.4 + Vite 5.2 | React 18 + Next.js | SvelteKit | 组合式 API 适合构建响应式 UI，Vite 构建速度快，HMR 体验好 |
| **样式框架** | TailwindCSS 3.4 | CSS Modules | UnoCSS | 原子化 CSS，快速构建现代化 UI，暗色模式原生支持 |
| **状态管理** | Vue Composables (Ref) | Pinia | Vuex | 轻量级，组合式函数天然适合本项目规模，无需额外依赖 |
| **数据抓取** | Node.js + tsx | Python + requests | Deno | 直接执行 TS 无需编译，与前端共享类型定义 |
| **数据存储** | 静态 JSON + localStorage | IndexedDB | Firebase | PRD 约束零服务器成本，静态 JSON 由 GitHub Actions 定时生成 |
| **RSS 解析** | rss-parser + fast-xml-parser | xml2js | cheerio | 成熟稳定，支持多种 RSS/Atom 格式，性能优异 |
| **HTML 解析** | Cheerio 1.2 | jsdom | puppeteer | jQuery 语法，轻量高效，服务端 DOM 解析 |
| **翻译服务** | Google Translate API | DeepL API | 百度翻译 API | 翻译质量高，支持自动检测语言，公共 API 无需 Key |
| **并发控制** | p-limit 6.1 | Promise.allSettled | 自研队列 | Promise 并发限制，简单易用，类型支持好 |
| **PWA 支持** | vite-plugin-pwa | Workbox | 手动配置 | Vite 生态插件，一键配置 Service Worker |
| **测试框架** | Vitest 1.5 | Jest | Mocha | Vite 原生支持，运行速度快，ESM 友好 |
| **部署平台** | Vercel + GitHub Pages | Netlify | Cloudflare Pages | 全球 CDN 加速，自动部署，免费额度充足 |
| **CI/CD** | GitHub Actions | GitLab CI | CircleCI | 与 GitHub 原生集成，免费定时任务，配置简单 |

> 💡 选型第一优先级：**零服务器成本优先**，其次是开发效率和性能要求。

---

## 二、系统架构总览

### 2.1 三层架构模型

```
┌─────────────────────────────────────────────────────────────────────┐
│                      接入层 / 表现层 (Presentation Layer)                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Vue 3 SPA + PWA                                    │    │
│  │  ┌──────────┬──────────┬──────────┬──────────┐      │    │
│  │  │  Header  │ Timeline │ NewsCard │ Settings │ ...  │      │    │
│  │  └──────────┴──────────┴──────────┴──────────┘      │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  Composables: useNews / useStorage / ...    │      │    │
│  │  │  useTheme / useSound / useTranslate        │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  └─────────────────────────────┬───────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTP GET (静态资源 + JSON 数据)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      静态资源层 / CDN                                │
│  Vercel Edge Network / GitHub Pages CDN                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  public/data/                                             │    │
│  │    ├── latest-24h.json      (24h AI 新闻，每2h更新)        │    │
│  │    ├── latest-7d.json       (7天 AI 新闻)                 │    │
│  │    ├── archive.json         (完整归档数据)                    │    │
│  │    ├── opml-feeds.json      (OPML 订阅源)                   │    │
│  │    ├── source-status.json   (数据源状态)                     │    │
│  │    └── title-zh-cache.json (翻译缓存)                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ GitHub Actions (定时触发)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      数据处理层 / 后端                            │
│  GitHub Actions Runner (Node.js)                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  scripts/fetcher/                                          │    │
│  │    ├── index.ts           (主入口 + 业务编排)              │    │
│  │    ├── fetchers/          (13 个平台抓取器)                 │    │
│  │    ├── filters/           (AI 过滤 + 去重)                  │    │
│  │    ├── translate.ts      (Google 翻译)                     │    │
│  │    └── utils/            (工具函数集合)                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 核心设计原则

1. **无服务器架构 (Serverless First)**：所有动态逻辑在构建时完成，运行时纯静态
2. **关注点分离 (SoC)**：抓取、过滤、翻译、输出各阶段独立，便于测试和维护
3. **渐进式增强**：基础功能无 JS 可用，JS 加载后增强体验
4. **本地优先**：用户数据（收藏、历史、偏好）全部存储在浏览器本地
5. **容错设计**：单个数据源失败不影响整体，优雅降级

---

## 三、后端数据处理架构

### 3.1 数据抓取管道 (Fetch Pipeline)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  数据采集    │ →  │  数据清洗    │ →  │  内容过滤    │ →  │  去重合并    │
│  (13 平台)  │    │  (标准化)    │    │  (AI 相关)   │    │  (标题+URL) │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                   │
                                                                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  输出静态文件 │ ←  │  翻译增强    │ ←  │  双语字段生成 │ ←  │  日期校验    │
│  (JSON)     │    │  (Google)    │    │  (zh/en/双) │    │  (未来日期) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 3.2 抓取器架构 (Fetcher Architecture)

采用**模板方法模式 + 策略模式**，所有抓取器继承基类，实现统一接口：

```typescript
// 基类: BaseFetcher
//   ├── BuzzingFetcher
//   ├── NewsNowFetcher
//   ├── TopHubFetcher
//   ├── InfoFlowFetcher (Iris)
//   ├── ZeliFetcher
//   ├── TechUrlsFetcher
//   ├── OpmlRssFetcher
//   ├── WechatRssFetcher
//   ├── AIbaseFetcher
//   ├── AIHubTodayFetcher
//   ├── XinzhiyuanFetcher (新智元)
//   ├── YouTubeFetcher
//   └── WaytoagiFetcher
```

### 3.3 翻译模块架构

```
┌─────────────────────────────────────────────────────────┐
│                   翻译模块                            │
├─────────────────────────────────────────────────────────┤
│  Google Translate API (translate.googleapis.com          │
│  ┌───────────────────────────────────────────────┐    │
│  │  输入：英文标题                               │    │
│  │  输出：中文标题 + 缓存到 title-zh-cache.json │    │
│  │  限流：maxNewTranslations (默认 80 条/次)  │    │
│  │  超时：12 秒/条                             │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**翻译策略**：
- 中文标题：直接使用，无需翻译
- 英文标题：调用 Google 翻译 API 转为中文
- 缓存机制：已翻译标题缓存到 JSON 文件，避免重复翻译
- 限流保护：每次运行最多翻译 N 条新标题，避免 API 限流

---

## 四、前端架构设计

### 4.1 组件架构 (Component Architecture)

```
App.vue
├── Header (顶部导航 + 筛选栏)
│   ├── 时间切换 (24h / 7天)
│   ├── 收藏按钮 (带新增计数徽章)
│   ├── 历史按钮 (带新增计数徽章)
│   ├── 音效开关
│   ├── 翻译切换 (中/双/英)
│   └── 主题切换 (亮/暗)
├── StatsBar (数据统计卡片)
├── SearchBar (搜索框)
├── FilterBar (平台筛选标签)
├── Timeline (时间轴容器)
│   └── NewsCard (新闻卡片) × N
│       ├── 来源标签
│       ├── 已读标记
│       ├── 标题 (支持双语切换)
│       ├── 收藏按钮
│       └── 阅读全文
├── ScrollProgress (滚动进度条 - 可交互)
├── FavoritesModal (收藏弹窗)
├── HistoryModal (历史记录弹窗)
├── SourceModal (来源管理弹窗)
├── Settings (设置面板)
└── SkeletonScreen (骨架屏加载)
```

### 4.2 组合式函数 (Composables)

| 模块 | 文件 | 职责 |
|:-----|:-----|:-----|
| useNews | `src/composables/useNews.ts` | 新闻数据加载、筛选、更新检测 |
| useStorage | `src/composables/useStorage.ts` | 收藏、历史、偏好的本地存储 |
| useTheme | `src/composables/useTheme.ts` | 主题切换（亮/暗/自动） |
| useSound | `src/composables/useSound.ts` | 音效播放、突发新闻检测 |
| useTranslate | `src/composables/useTranslate.ts` | 翻译模式切换、标题显示逻辑 |

### 4.3 状态管理策略

采用**轻量级组合式函数**方案，不引入额外状态管理库：

- **全局状态**：通过 Composables 中的 `ref` 单例模式（模块级变量）
- **组件状态**：组件内部 `ref` / `computed`
- **持久化状态**：localStorage + Composables 封装
- ** props / 事件**：父子组件通信

---

## 五、数据模型设计

### 5.1 核心数据结构

```typescript
// 新闻条目
interface News {
  id: string;                    // SHA-1 哈希唯一标识
  site_id: string;                // 聚合平台 ID
  site_name: string;            // 聚合平台名称
  source: string;               // 具体来源
  title: string;                 // 原始标题
  title_zh: string | null;      // 中文标题
  title_en: string | null;       // 英文标题
  title_bilingual: string;       // 双语标题
  url: string;                   // 原文链接
  published_at: string;         // 发布时间 (ISO 8601)
  first_seen_at: string;      // 首次抓取时间
  last_seen_at: string;       // 最后出现时间
}

// 用户偏好
interface UserPreference {
  enabledSources: string[];      // 启用的来源列表
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  translateMode: 'zh' | 'en' | 'bilingual';
  lastSeenFavoritesCount: number;  // 上次查看收藏数
  lastSeenHistoryCount: number;   // 上次查看历史数
}

// 收藏条目
interface Favorite {
  newsId: string;
  title: string;
  link: string;
  source: string;
  savedAt: string;
}

// 历史记录
interface History {
  newsId: string;
  title: string;
  link: string;
  source: string;
  readAt: string;
}
```

### 5.2 存储键设计

| 键名前缀 | 存储内容 | 说明 |
|:---------|:---------|:-----|
| `ai-news-favorites` | 收藏列表 | JSON 数组 |
| `ai-news-history` | 阅读历史 | JSON 数组（最多100条） |
| `ai-news-preferences` | 用户偏好 | JSON 对象 |

---

## 六、CI/CD 架构

### 6.1 自动化工作流

```
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflows                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  schedule   │ → │  fetch data   │ → │  deploy   │ │
│  │  (每2小时) │    │  (抓取+翻译)  │    │  (部署)     │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  cron: 0 */2 * * *   npm run fetch     GitHub Pages    │
│                      tsx scripts/       Vercel        │
│                      fetcher/index.ts    Deployment    │
│                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 部署架构

- **生产环境**：Vercel（全球 CDN，自动部署）
- **备用环境**：GitHub Pages（静态托管）
- **数据更新**：GitHub Actions 每 2 小时运行一次抓取脚本
- **缓存策略**：Service Worker + HTTP 缓存

---

## 七、性能优化策略

### 7.1 前端性能

| 优化项 | 策略 | 预期效果 |
|:-------|:-----|:---------|
| 首屏加载 | Vite 构建 + 代码分割 + CDN 加速 | ≤ 2 秒 |
| 滚动性能 | 虚拟滚动？（当前直接渲染，1000 条以内性能可接受） | 60 FPS |
| 图片优化 | 不加载第三方图片，仅文字内容 | 减少带宽 |
| PWA 缓存 | Service Worker 缓存静态资源 | 离线可访问 |
| 数据预加载 | 加载 24h 后后台预加载 7d 数据 | 切换无延迟 |

### 7.2 后端性能

| 优化项 | 策略 | 预期效果 |
|:-------|:-----|:---------|
| 并发控制 | p-limit 限制并发数为 5 | 避免被限流 |
| 翻译缓存 | title-zh-cache.json 持久化缓存 | 避免重复翻译 |
| 日期校验 | 未来日期自动修正为抓取时间 | 数据准确性 |
| 去重算法 | 标题 + URL 双重去重 | 减少冗余内容 |

---

## 八、安全与隐私设计

### 8.1 安全考量

1. **XSS 防护**：所有用户输入（标题等）通过 Vue 模板自动转义
2. **CSP**：Content Security Policy 限制脚本来源
3. **HTTPS**：全站 HTTPS，混合内容阻止
4. **无用户数据上传**：所有用户数据本地存储，不上传服务器

### 8.2 隐私保护

1. **零数据收集**：不收集任何用户个人信息
2. **本地存储**：收藏、历史、偏好全部存 localStorage
3. **无第三方追踪**：无 Google Analytics 等追踪脚本
4. **翻译隐私**：翻译通过公共 API，不关联用户身份

---

## 九、扩展性分析

### 9.1 新增数据源

新增信息源只需：
1. 继承 `BaseFetcher` 基类
2. 实现 `fetch()` 方法
3. 在 `createAllFetchers()` 中注册

### 9.2 新增翻译服务

可替换为其他翻译 API（百度、有道、DeepL），只需实现相同接口：
```typescript
interface Translator {
  translateToZhCN(text: string): Promise<string | null>;
}
```

### 9.3 前端功能扩展

组合式函数架构便于新增功能模块：
- 新增 composable 函数 → 新增功能逻辑
- 新增组件 → 新增 UI 展示
- 无需修改现有代码
