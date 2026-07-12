# AI快讯 - 架构复盘文档

> 生成日期：2026-07-13
> 阶段：⑤ /retro
> 阅读对象：新加入项目的开发者、Code Reviewer、技术 Leader

---

## 一、实际架构图（基于代码重画）

```
┌─────────────────────────────────────────────────────────────────┐
│  接入层 / 客户端                                                  │
│  Web Browser (Chrome/Safari/Edge) + PWA App                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Vue 3 Components:                                          │ │
│  │  App.vue (根组件)                                            │ │
│  │    ├── Timeline.vue (时间轴)                                 │ │
│  │    │   ├── NewsCard.vue (新闻卡片)                           │ │
│  │    │   └── SkeletonScreen.vue (骨架屏)                       │ │
│  │    ├── Settings.vue (设置面板)                               │ │
│  │    │   ├── SourceList.vue (信息源开关)                       │ │
│  │    │   ├── ThemeSwitch.vue (主题切换)                        │ │
│  │    │   ├── SoundSwitch.vue (音效开关)                        │ │
│  │    │   ├── DataExport.vue (数据导入导出)                     │ │
│  │    │   └── GeekMode.vue (极客模式)                          │ │
│  │    └── Toast.vue (提示组件)                                  │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────────────┘
                              │ HTTP GET (静态资源)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       静态资源层                                  │
│  Vercel CDN / GitHub Pages                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  public/                                                    │ │
│  │    ├── data/news.json        (新闻数据)                      │ │
│  │    ├── data/sources.json     (信息源配置)                     │ │
│  │    └── manifest.json         (PWA配置)                       │ │
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

┌─────────────────────────────────────────────────────────────────┐
│  业务 / 服务层 (composables)                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  useNews.ts      - 新闻数据加载、过滤、更新检测                │ │
│  │  useStorage.ts   - localStorage操作、数据导入导出             │ │
│  │  useSound.ts     - 音效播放、突发新闻检测                     │ │
│  │  useTheme.ts     - 主题切换、自动黑夜模式                     │ │
│  │  useToast.ts     - Toast提示服务                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  工具层:                                                     │ │
│  │  config/index.ts    - 配置中心                               │ │
│  │  types/index.ts     - TypeScript类型定义                     │ │
│  │  utils/response.ts  - 统一响应与错误封装                      │ │
│  │  utils/format.ts    - 时间格式化工具                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、实际技术选型 vs ARCH.md 设计

| 类别 | ARCH.md 设计 | 实际实现 | 差异原因 |
|---|---|---|---|
| 语言 / 运行时 | TypeScript | TypeScript 5.4.21 | 一致 |
| 主框架 | Vue 3 + Vite | Vue 3.5.13 + Vite 5.4.21 | 一致 |
| 样式框架 | TailwindCSS 3 | TailwindCSS 3 | 一致 |
| 数据存储 | 纯静态JSON + localStorage | 纯静态JSON + localStorage | 一致 |
| RSS聚合方案 | GitHub Actions定时构建 | GitHub Actions定时构建 | 一致 |
| PWA支持 | Vite PWA Plugin | Vite PWA Plugin 0.19.8 | 一致，自动生成sw.js |
| 部署 / 运行 | Vercel + GitHub Pages | Vercel + GitHub Pages | 一致 |

---

## 三、模块清单（实际文件路径）

| 模块名 | 路径 | 规模 | 职责 | 入口 |
|---|---|---|---|---|
| 配置中心 | `src/config/index.ts` | 22行 | 集中管理配置项，支持环境变量覆盖 | `import { config } from '@/config'` |
| 类型定义 | `src/types/index.ts` | 42行 | 定义所有核心数据类型和接口 | `import type { News } from '@/types'` |
| 统一响应 | `src/utils/response.ts` | 24行 | 标准化响应结构和错误码 | `import { success, error } from '@/utils/response'` |
| 时间格式化 | `src/utils/format.ts` | 20行 | 时间格式化工具函数 | `import { formatTime } from '@/utils/format'` |
| 应用入口 | `src/main.ts` | 5行 | 初始化Vue应用 | `npm run dev` |
| 根组件 | `src/App.vue` | 62行 | 全局布局、主题初始化、数据加载 | 挂载到 #app |
| 数据访问层 | `src/composables/useNews.ts` | 86行 | 加载新闻、过滤、检测更新 | `useNews()` |
| 存储服务 | `src/composables/useStorage.ts` | 118行 | localStorage操作、导入导出 | `useStorage()` |
| 音效服务 | `src/composables/useSound.ts` | 48行 | 音效播放、突发新闻检测 | `useSound()` |
| 主题服务 | `src/composables/useTheme.ts` | 63行 | 主题切换、自动黑夜模式 | `useTheme()` |
| Toast服务 | `src/composables/useToast.ts` | 34行 | Toast提示服务 | `useToast()` |
| 时间轴模块 | `src/components/timeline/Timeline.vue` | 112行 | 新闻列表展示、更新提示、刷新 | `<Timeline />` |
| 新闻卡片模块 | `src/components/cards/NewsCard.vue` | 70行 | 单条新闻展示、收藏按钮 | `<NewsCard />` |
| 设置面板模块 | `src/components/settings/Settings.vue` | 50行 | 设置面板入口 | `<Settings />` |
| 信息源列表 | `src/components/settings/SourceList.vue` | 56行 | 信息源开关管理 | 嵌套在Settings |
| 主题切换 | `src/components/settings/ThemeSwitch.vue` | 50行 | 主题模式切换 | 嵌套在Settings |
| 音效开关 | `src/components/settings/SoundSwitch.vue` | 42行 | 音效开关控制 | 嵌套在Settings |
| 数据导入导出 | `src/components/settings/DataExport.vue` | 90行 | 收藏数据导入导出 | 嵌套在Settings |
| 极客模式 | `src/components/settings/GeekMode.vue` | 113行 | 长按进入极客模式、JSON配置 | 嵌套在Settings |
| 骨架屏 | `src/components/common/SkeletonScreen.vue` | 40行 | 加载时骨架屏展示 | 嵌套在Timeline |
| Toast组件 | `src/components/common/Toast.vue` | 68行 | 全局Toast提示展示 | `<Toast />` |
| PWA配置 | `public/manifest.json` | 30行 | PWA应用配置 | Vite PWA Plugin |
| 静态数据 | `public/data/news.json` | 动态生成 | 新闻数据 | HTTP GET /data/news.json |
| 信息源配置 | `public/data/sources.json` | 静态 | 信息源列表 | HTTP GET /data/sources.json |
| RSS工作流 | `.github/workflows/rss-update.yml` | 40行 | 定时更新新闻数据 | GitHub Actions |
| 单元测试 | `tests/` | 5个文件 | 测试核心功能 | `npm run test` |

---

## 四、关键设计决策（Why 文档）

### 4.1 为什么选择纯静态前端架构？
选项：A) 纯静态前端 + GitHub Actions 定时更新 B) 后端服务 + 数据库 C) Serverless 函数
选择 A 的理由：项目约束要求零服务器成本，纯静态架构部署免费（Vercel/GitHub Pages），GitHub Actions 提供免费的定时任务执行能力。放弃 B/C 的原因是需要服务器成本，且本项目无复杂业务逻辑需要后端处理。

### 4.2 为什么使用 Vue 3 Composables 而非状态管理库？
选项：A) Vue 3 Composition API (Composables) B) Pinia C) Vuex
选择 A 的理由：项目规模适中，Composables 提供足够的状态管理能力，且代码更轻量化、更易于理解。Pinia/Vuex 对于本项目来说过于重量级，增加了不必要的复杂度。

### 4.3 为什么使用 localStorage 存储用户数据？
选项：A) localStorage B) IndexedDB C) Firebase
选择 A 的理由：localStorage API 简单易用，对于用户偏好和收藏数据（小数据量）完全够用。IndexedDB 过于复杂，Firebase 需要后端服务且有成本。项目约束要求零服务器成本，所有数据必须存储在用户本地。

### 4.4 为什么用 Vite PWA Plugin 自动生成 Service Worker？
选项：A) Vite PWA Plugin 自动生成 B) Workbox 手动配置 C) 手写 Service Worker
选择 A 的理由：Vite PWA Plugin 提供一键配置，自动生成 Service Worker 和 precache 策略，开发效率高且不易出错。手动配置 Workbox 或手写 Service Worker 容易出错且维护成本高。

### 4.5 为什么采用组件化 + Composables 的分层架构？
选项：A) 组件化 + Composables B) 单文件组件 + 全局状态 C) 类组件 + Mixins
选择 A 的理由：Vue 3 Composition API 的 Composables 模式提供了更好的代码复用和逻辑组织方式，每个 Composable 专注于单一职责，组件只负责 UI 渲染，职责分离清晰。

---

## 五、与 SDD.md 的偏差清单

| 偏差项 | SDD 设计 | 实际实现 | 是否影响 P0 功能 |
|---|---|---|---|
| 时间轴组件结构 | Timeline.vue → TimelineHeader.vue / TimelineLine.vue / TimelineItem.vue | Timeline.vue 直接使用 NewsCard.vue | 否，功能正常 |
| Service Worker | 手动创建 src/service-worker.ts | Vite PWA Plugin 自动生成 | 否，功能正常 |
| 新增 Toast 组件 | SDD 未定义 | 创建了 Toast.vue 和 useToast.ts | 否，增强用户体验 |

---

## 六、可改进项（按 ROI 排序）

| 改进项 | 优先级 | 工作量 | 收益 |
|---|---|---|---|
| 添加下拉刷新功能 | P1 | 中等 | 移动端体验提升 |
| 实现新闻搜索功能 | P2 | 中等 | 用户可快速定位新闻 |
| 添加多语言支持 | P2 | 较大 | 国际化支持 |
| 优化首屏加载性能 | P1 | 小 | 加载速度提升 |
| 添加 E2E 测试 | P2 | 较大 | 回归测试覆盖 |

---

## 七、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-07-13 | 初稿 | AI-SA |