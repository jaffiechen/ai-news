# AI快讯 · 追踪AI前沿动态

> 让追踪AI前沿动态，像刷朋友圈一样简单、上瘾。

<p align="center">
  <a href="#-核心功能">功能</a> •
  <a href="#-在线体验">在线体验</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-部署方案">部署</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-项目文档">文档</a>
</p>

---

## ✨ 核心功能

### 📰 极简时间轴
打开即看，按时间顺序清晰呈现全球AI圈最新动态。像聊天记录一样按分钟展示，信息密度高，扫一眼就能掌握全局。

### 🌐 双语标题
自动翻译英文标题为中文，中英对照阅读无压力。支持 20+ 个AI新闻源，覆盖学界、业界、创投全维度。

### 🌙 沉浸美学
- **自动暗色模式**：跟随系统或定时切换（18:00 - 6:00）
- **呼吸节点动效**：时间节点微动效，阅读不枯燥
- **移动端优先**：完美适配手机、平板、桌面

### 🔊 AI脉搏音效
重大突发新闻时播放提示音，不错过任何重要动态。可随时开关，免打扰。

### ⚙️ 自定义信息源
- 一键开关内置的 20+ 个AI新闻源
- 支持添加自定义 RSS 订阅源
- 按来源筛选，聚焦你关心的领域

### 🔖 收藏与历史
- 一键收藏"稍后读"，本地存储永不丢失
- 阅读历史自动记录，回溯方便
- 支持数据导入导出，换设备无缝迁移

### 📱 PWA 渐进式应用
- 支持添加到桌面，像原生 App 一样使用
- 离线缓存，没网也能看已加载的内容
- 秒级启动，体验媲美原生

### ⏰ 自动更新
GitHub Actions 每小时自动抓取最新数据，页面实时刷新，永远不落后。

---

## 🚀 在线体验

### GitHub Pages（推荐）
👉 **https://jaffiechen.github.io/ai-news/**

> 完全免费，每小时自动更新数据

---

## ⚡ 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 本地开发

```bash
# 克隆项目
git clone https://github.com/jaffiechen/ai-news.git
cd ai-news

# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev

# 运行单元测试
npm run test

# 运行类型检查
npm run typecheck
```

### 构建与预览

```bash
# 构建生产版本
npm run build

# 本地预览构建结果
npm run preview
```

### 数据抓取

```bash
# 抓取最新新闻数据
npm run fetch

# 指定时间窗口（小时）
npx tsx scripts/fetcher/index.ts --window-hours 48
```

---

## 📦 部署方案

### 方案一：GitHub Pages（推荐，免费）

项目已内置完整的 GitHub Actions 配置，**零成本自动部署 + 每小时更新数据**。

#### 部署步骤

1. **Fork 本仓库**到你的 GitHub 账号

2. **启用 GitHub Pages**
   - 进入仓库 `Settings` → `Pages`
   - Source 选择 **GitHub Actions**

3. **配置 Actions 权限**
   - 进入 `Settings` → `Actions` → `General`
   - Workflow permissions 选择 **Read and write permissions**
   - 点击 Save

4. **手动触发首次部署**
   - 进入 `Actions` → 选择「部署到 GitHub Pages」
   - 点击 `Run workflow`

完成后访问：`https://<你的用户名>.github.io/ai-news/`

#### 自动更新机制

| 工作流 | 触发方式 | 频率 | 作用 |
|:---|:---|:---:|:---|
| `rss-update.yml` | 定时 + 手动 | 每小时 | 抓取新闻数据，提交回仓库 |
| `deploy-pages.yml` | Push + 手动 | 触发式 | 构建前端，部署到 GitHub Pages |

> 💡 数据更新后会自动触发 Pages 重新部署，用户看到的永远是最新内容。

### 方案二：Vercel（备选，更快）

1. 点击按钮一键部署：

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjaffiechen%2Fai-news)

2. 配置项目：
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. 点击 Deploy，等待完成

> Vercel 同样支持 Git 推送自动部署，配合 GitHub Actions 数据更新，效果与 Pages 一致，但全球访问速度更快。

---

## 🛠 技术栈

### 前端
| 技术 | 版本 | 用途 |
|:---|:---|:---|
| Vue | ^3.4 | 渐进式前端框架 |
| Vite | ^5.2 | 构建工具，极速开发体验 |
| TypeScript | ^5.4 | 类型安全 |
| Tailwind CSS | ^3.4 | 原子化 CSS 框架 |
| Vite PWA | ^0.19 | PWA 支持 |

### 后端 / 脚本
| 技术 | 版本 | 用途 |
|:---|:---|:---|
| Node.js | >= 18 | 运行环境 |
| tsx | ^4.19 | TypeScript 直接运行 |
| commander | ^12.1 | CLI 参数解析 |
| rss-parser | ^3.13 | RSS 解析 |
| cheerio | ^1.2 | HTML 解析 |
| p-limit | ^6.1 | 并发控制 |
| dayjs | ^1.11 | 日期处理 |

### 测试
| 技术 | 版本 | 用途 |
|:---|:---|:---|
| Vitest | ^1.5 | 单元测试框架 |
| @vue/test-utils | ^2.4 | Vue 组件测试 |
| jsdom | ^29.1 | DOM 模拟 |

### DevOps
| 技术 | 用途 |
|:---|:---|
| GitHub Actions | CI/CD，定时数据抓取 + 自动部署 |
| GitHub Pages | 静态站点托管 |

---

## 📁 项目结构

```
ai-news/
├── src/                          # 前端源码
│   ├── components/               # Vue 组件
│   │   ├── cards/                # 新闻卡片
│   │   ├── common/               # 通用组件（Toast、进度条等）
│   │   ├── settings/             # 设置面板（主题、音源、收藏等）
│   │   └── timeline/             # 时间轴组件
│   ├── composables/              # 组合式函数
│   │   ├── useNews.ts            # 新闻数据加载与筛选
│   │   ├── useStorage.ts         # 本地存储（收藏/历史/偏好）
│   │   ├── useTheme.ts           # 主题切换
│   │   ├── useSound.ts           # 音效控制
│   │   └── useTranslate.ts       # 翻译状态管理
│   ├── config/                   # 配置中心
│   ├── types/                    # TypeScript 类型定义
│   ├── utils/                    # 工具函数
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 入口文件
│   └── style.css                 # 全局样式
├── scripts/
│   └── fetcher/                  # 数据抓取脚本
│       ├── fetchers/             # 各数据源抓取器（20+ 个）
│       ├── filters/              # 过滤器（去重、AI相关判断）
│       ├── utils/                # 工具函数
│       ├── translate.ts          # 标题翻译（Google Translate）
│       └── index.ts              # 主入口
├── public/
│   ├── data/                     # 静态数据（JSON）
│   │   ├── latest-24h.json       # 24小时数据
│   │   ├── latest-7d.json        # 7天数据
│   │   ├── archive.json          # 历史归档
│   │   ├── sources.json          # 信息源配置
│   │   └── source-status.json    # 数据源状态
│   ├── icons/                    # PWA 图标
│   └── manifest.json             # PWA 配置
├── .github/
│   └── workflows/                # GitHub Actions
│       ├── rss-update.yml        # 每小时数据更新
│       └── deploy-pages.yml      # GitHub Pages 部署
├── tests/                        # 单元测试
└── docs/                         # 项目文档
```

---

## 🎯 设计理念

### 极速秒开
- 纯静态页面，首屏加载 < 1s
- 无需注册登录，打开即用
- PWA 缓存，二次访问秒开

### 聚合且干净
- 只专注 AI 领域，信息不杂乱
- 20+ 优质源覆盖学界、业界、创投
- 智能去重，同一条新闻只显示一次

### 清晰的时间轴
- 像聊天记录一样按分钟展示
- 呼吸节点动效，阅读不枯燥
- 进度指示器，随时知道看到哪了

### 移动端优先
- 响应式设计，手机体验最佳
- PWA 支持，添加到桌面像原生 App
- 触控友好，滑动流畅

---

## 📊 内置数据源

| 分类 | 数据源 |
|:---|:---|
| 综合 | AI Hub、AI Hub Today、NewsNow、Buzzing |
| 学术 | arXiv（通过 RSS） |
| 媒体 | 机器之心、新智元、量子位、InfoQ |
| 公司 | OpenAI、Google DeepMind、Meta AI |
| 社区 | GitHub Trending、Hacker News（AI相关） |
| 视频 | YouTube（AI频道） |
| 微信 | 各类AI公众号（通过 RSS） |
| 自定义 | 支持添加任意 RSS 源 |

> 完整列表见 [sources.json](public/data/sources.json)

---

## 🔧 配置说明

### 前端配置

可通过环境变量配置以下参数：

| 变量 | 说明 | 默认值 |
|:---|:---|:---|
| `VITE_NEWS_API_URL` | 新闻数据接口地址 | `/data/news.json` |
| `VITE_SOURCES_API_URL` | 信息源配置地址 | `/data/sources.json` |
| `VITE_UPDATE_INTERVAL` | 自动检查更新间隔（毫秒） | `900000`（15分钟） |
| `VITE_LOCAL_STORAGE_PREFIX` | localStorage 键名前缀 | `ai-news` |

### 抓取脚本配置

见 [scripts/fetcher/config.ts](scripts/fetcher/config.ts)，可配置：
- 各数据源开关
- 时间窗口大小
- 并发数
- 翻译开关

---

## 📝 常见问题

### Q: 数据多久更新一次？
A: GitHub Actions 每小时整点自动抓取一次。你也可以在 Actions 页面手动触发。

### Q: 翻译功能为什么不生效？
A: 翻译使用 Google 翻译免费 API，需要服务器能访问外网。GitHub Actions 环境可以正常访问。

### Q: 收藏的数据存在哪里？
A: 所有用户数据（收藏、历史、偏好）都存储在浏览器的 localStorage 中，不上传到任何服务器。

### Q: 可以添加自己的 RSS 源吗？
A: 可以！在设置面板中找到「信息源」，点击「添加自定义源」即可。

### Q: 如何修改更新频率？
A: 编辑 `.github/workflows/rss-update.yml` 中的 cron 表达式。参考 [DEPLOY.md](docs/DEPLOY.md) 中的说明。

---

## 📚 项目文档

完整的项目文档在 `docs/` 目录下：

| 文档 | 说明 |
|:---|:---|
| [PRD.md](docs/PRD.md) | 产品需求文档 |
| [ARCH.md](docs/ARCH.md) | 架构设计 |
| [SDD.md](docs/SDD.md) | 详细设计 + 接口定义 |
| [TEST.md](docs/TEST.md) | 测试用例 |
| [REVIEW.md](docs/REVIEW.md) | 代码评审报告 |
| [OVERVIEW.md](docs/OVERVIEW.md) | 架构复盘 |
| [FEATURE.md](docs/FEATURE.md) | 功能解读 |
| [DEPLOY.md](docs/DEPLOY.md) | 部署文档（详细版） |
| [添加新闻源指南.md](docs/添加新闻源指南.md) | 如何添加新的数据源 |

---

## 🤝 贡献

欢迎贡献代码、报告 Bug 或提出建议！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

---

## 📄 许可证

MIT License. 详情见 [LICENSE](LICENSE) 文件。

---

<p align="center">
  <sub>如果觉得不错，点个 ⭐ Star 支持一下吧！</sub>
</p>
