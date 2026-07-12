# AI快讯 - 系统架构设计文档（HLD）

> 生成日期：2026-07-13
> 阶段：② /hld
> 上游文档：PRD.md
> 下游文档：SDD.md + TEST.md

---

## 一、技术选型（带备选对比）

> 行按项目实际需要增减；每行必须有「选定理由」，理由对照 PRD 的约束与目标。

| 类别 | 选定方案 | 备选 1 | 备选 2 | 选定理由 |
|---|---|---|---|---|
| 语言 / 运行时 | TypeScript | JavaScript | Dart | PRD要求高性能、可维护，TypeScript提供类型安全，团队熟悉度高 |
| 主框架 | Vue 3 + Vite | React + Next.js | SvelteKit | /init阶段已确定，Vue 3组合式API适合构建响应式UI，Vite构建速度快，符合PRD加载≤2秒的要求 |
| 样式框架 | TailwindCSS 3 | CSS Modules | UnoCSS | 快速构建现代化UI，支持深色模式，配合Vue组件开发效率高 |
| 数据存储 | 纯静态JSON + localStorage | IndexedDB | Firebase | PRD约束零服务器成本，静态JSON由GitHub Actions定时生成，localStorage存储用户偏好 |
| RSS聚合方案 | GitHub Actions定时构建 | 第三方RSS代理服务 | Cloudflare Worker | 无后端架构下，GitHub Actions免费定时拉取RSS并生成news.json，无额外成本 |
| PWA支持 | Vite PWA Plugin | Workbox手动配置 | Next.js PWA | Vite生态插件，一键配置Service Worker和manifest，符合PRD的PWA安装需求 |
| 部署 / 运行 | Vercel + GitHub Pages | Netlify | Cloudflare Pages | /init阶段已确定，Vercel全球CDN加速，符合PRD"全球访问快"的要求，免费额度充足 |

> 💡 选型第一优先级由项目约束决定（成本优先），其次是团队熟悉度和性能要求。

---

## 二、系统架构图（ASCII）

```
┌─────────────────────────────────────────────────────────────────┐
│                        接入层 / 客户端                            │
│  Web Browser (Chrome/Safari/Edge) + PWA App                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Vue 3 Components:                                          │ │
│  │  Timeline / NewsCard / Settings / Header / SkeletonScreen   │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────────────┘
                              │ HTTP GET (静态资源)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       静态资源层                                  │
│  Vercel CDN / GitHub Pages                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  public/                                                    │ │
│  │    ├── data/news.json        (新闻数据，每15分钟更新)         │ │
│  │    ├── data/sources.json     (信息源配置)                     │ │
│  │    ├── manifest.json         (PWA配置)                       │ │
│  │    └── sw.js                 (Service Worker)                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬─────────────────────────────────────┘
                              │ GitHub Actions (定时构建)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据更新层                                   │
│  GitHub Actions Workflow                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  定时任务 (每15分钟):                                        │ │
│  │    1. 拉取各RSS源                                           │ │
│  │    2. 合并去重                                              │ │
│  │    3. 生成news.json                                         │ │
│  │    4. 自动commit并push                                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、模块划分

| 模块名 | 路径 | 职责 | 对外接口 |
|---|---|---|---|
| 应用入口 | `src/main.ts` | 初始化Vue应用、注册组件、配置路由 | 无 |
| 根组件 | `src/App.vue` | 全局布局、主题切换、状态管理 | 无 |
| 时间轴模块 | `src/components/timeline/` | 新闻列表展示、时间线渲染、呼吸节点动效 | `loadNews()`, `refreshNews()` |
| 新闻卡片模块 | `src/components/cards/` | 单条新闻展示、收藏按钮、来源标识 | `toggleFavorite(id)` |
| 设置面板模块 | `src/components/settings/` | 信息源管理、主题切换、音效开关 | `toggleSource(id)`, `toggleTheme()`, `toggleSound()` |
| 数据服务 | `src/composables/useNews.ts` | 加载新闻数据、过滤新闻、检测更新 | `loadNews()`, `filterBySources()`, `checkForUpdates()` |
| 存储服务 | `src/composables/useStorage.ts` | localStorage操作封装、数据导入导出 | `get(key)`, `set(key, value)`, `exportData()`, `importData()` |
| 音效服务 | `src/composables/useSound.ts` | 音效播放、突发新闻检测 | `playNotification()`, `detectBreakingNews()` |
| 工具函数 | `src/utils/` | 时间格式化、关键词匹配、类型定义 | `formatTime()`, `matchKeywords()` |
| 静态数据 | `public/data/` | news.json新闻数据、sources.json信息源配置 | HTTP GET |

> 模块划分覆盖所有P0功能：时间轴(F-001)、无刷新更新(F-002)、信息源管理(F-003)、PWA安装(F-004)、自适应布局(F-005)

---

## 四、数据模型

> 本项目为纯前端架构，数据分为三类：静态JSON数据、用户偏好数据、收藏数据。

### 4.1 ER关系示意

```
News(新闻) ──(N:1) Source(信息源)
Favorite(收藏) ──(N:1) News(新闻)
UserPreference(用户偏好) ──(1:1) Visitor(访客)
```

### 4.2 核心实体设计

#### 实体：News（新闻）- 存储于 `public/data/news.json`
| 字段 | 类型 | 约束 | 含义 |
|---|---|---|---|
| id | string | 唯一 | 新闻唯一标识 |
| title | string | 非空 | 新闻标题 |
| link | string | 非空 | 原文链接 |
| source | string | 非空 | 信息源标识 |
| category | string | | 分类标签 |
| summary | string | | 摘要内容 |
| pubDate | string | 非空 | 发布时间（ISO格式） |
| isBreaking | boolean | 默认false | 是否重大突发 |
| imageUrl | string | | 配图URL |

#### 实体：Source（信息源）- 存储于 `public/data/sources.json`
| 字段 | 类型 | 约束 | 含义 |
|---|---|---|---|
| id | string | 唯一 | 信息源唯一标识 |
| name | string | 非空 | 显示名称 |
| icon | string | | 图标emoji或URL |
| rssUrl | string | 非空 | RSS订阅地址 |
| category | string | | 分类 |
| enabled | boolean | 默认true | 是否启用 |

#### 实体：Favorite（收藏）- 存储于 localStorage `ai-news-favorites`
| 字段 | 类型 | 约束 | 含义 |
|---|---|---|---|
| newsId | string | 唯一 | 关联新闻ID |
| title | string | 非空 | 新闻标题 |
| link | string | 非空 | 原文链接 |
| source | string | 非空 | 信息源 |
| savedAt | string | 非空 | 收藏时间 |

#### 实体：UserPreference（用户偏好）- 存储于 localStorage `ai-news-preferences`
| 字段 | 类型 | 约束 | 含义 |
|---|---|---|---|
| enabledSources | string[] | | 启用的信息源ID列表 |
| theme | string | 默认'auto' | 主题：'light'/'dark'/'auto' |
| soundEnabled | boolean | 默认false | 是否启用音效 |
| lastUpdateTime | string | | 上次检查更新时间 |

### 4.3 索引/键策略
- `news.json`：按 `pubDate` 降序排列，前端按需加载
- `sources.json`：按 `id` 索引，支持快速查找
- localStorage：使用固定键名 `ai-news-favorites` 和 `ai-news-preferences`

---

## 五、接口契约清单（前端函数签名）

> 本项目为纯前端架构，接口形态为Composable函数和工具函数，覆盖所有P0需求。

| 编号 | 调用方式 | 标识（函数名） | 鉴权 | 角色 | 输入示例 | 输出示例 |
|---|---|---|---|---|---|---|
| API-001 | 函数调用 | `useNews().loadNews()` | 否 | 全部 | `{}` | `{ news: [...], total: 100 }` |
| API-002 | 函数调用 | `useNews().filterBySources(sources)` | 否 | 全部 | `['quantum-bit', 'arxiv']` | `{ filteredNews: [...] }` |
| API-003 | 函数调用 | `useNews().checkForUpdates()` | 否 | 全部 | `{}` | `{ hasNew: true, count: 5 }` |
| API-004 | 函数调用 | `useStorage().getFavorites()` | 否 | 全部 | `{}` | `[{ newsId: 'xxx', ... }]` |
| API-005 | 函数调用 | `useStorage().toggleFavorite(news)` | 否 | 全部 | `{ id: 'xxx', title: '...' }` | `{ success: true, favorites: [...] }` |
| API-006 | 函数调用 | `useStorage().getPreferences()` | 否 | 全部 | `{}` | `{ enabledSources: [...], theme: 'auto' }` |
| API-007 | 函数调用 | `useStorage().savePreferences(prefs)` | 否 | 全部 | `{ enabledSources: [...], theme: 'dark' }` | `{ success: true }` |
| API-008 | 函数调用 | `useStorage().exportData()` | 否 | 全部 | `{}` | `{ favorites: [...], preferences: {...} }` |
| API-009 | 函数调用 | `useStorage().importData(data)` | 否 | 全部 | `{ favorites: [...], preferences: {...} }` | `{ success: true }` |
| API-010 | 函数调用 | `useSound().playNotification()` | 否 | 全部 | `{}` | `{ success: true }` |
| API-011 | 函数调用 | `useSound().detectBreakingNews(news)` | 否 | 全部 | `{ title: 'GPT-5发布', ... }` | `{ isBreaking: true }` |
| API-012 | 函数调用 | `useTheme().toggleTheme(mode)` | 否 | 全部 | `'dark'` | `{ currentTheme: 'dark' }` |
| API-013 | 函数调用 | `utils.formatTime(date)` | 否 | 全部 | `'2026-07-13T10:30:00Z'` | `'10分钟前'` |
| API-014 | HTTP GET | `/data/news.json` | 否 | 全部 | `{}` | `[{ id: '...', title: '...', ... }]` |
| API-015 | HTTP GET | `/data/sources.json` | 否 | 全部 | `{}` | `[{ id: '...', name: '...', ... }]` |

### 5.1 统一返回/错误约定

前端函数统一返回结构：
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### 5.2 错误码/错误类型对照表

| 标识 | 含义 | 触发场景 |
|---|---|---|
| 0 | 成功 | 业务正常完成 |
| 1001 | 数据加载失败 | JSON文件获取失败或解析错误 |
| 1002 | 存储操作失败 | localStorage读写异常 |
| 1003 | 参数错误 | 输入参数缺失或格式错误 |
| 1004 | 网络错误 | 检查更新时网络不可用 |

---

## 六、本地开发流程

> 命令按所选技术栈填写，必须可直接复制执行。

### 6.1 环境准备

```bash
# 安装Node.js（版本 >= 18.0.0）
# 安装依赖
npm install

# 安装Vite和TailwindCSS（已在package.json中）
```

### 6.2 启动方式

```bash
# 开发模式（热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 6.3 自测命令

```bash
# 运行单元测试
npm run test

# 运行lint检查
npm run lint

# 运行类型检查
npm run typecheck
```

---

## 七、安全设计

> 以下是通用安全维度，按项目技术栈给出具体应对措施。

| 风险 | 应对措施 |
|---|---|
| 注入（XSS） | 使用Vue模板自动转义；第三方内容在渲染前进行安全过滤；禁止innerHTML直接插入用户数据 |
| 凭据泄露 | 无用户凭据；所有配置均为公开静态文件；localStorage仅存储用户偏好和收藏 |
| 会话泄露 | 无会话系统；无登录机制；数据仅存储在用户本地浏览器 |
| 越权访问 | 无权限系统；所有功能对所有访客开放 |
| 敏感配置 | 无敏感配置；所有配置文件均为公开信息 |
| RSS源安全 | RSS数据由GitHub Actions在服务端拉取，避免前端跨域问题；对RSS内容进行安全过滤 |
| PWA缓存安全 | Service Worker使用HTTPS；缓存策略采用network-first确保获取最新数据 |

---

## 八、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-07-13 | 初稿 | AI-SA |