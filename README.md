# AI快讯

> 让追踪AI前沿动态，像刷朋友圈一样简单、上瘾。

## 简介
一个极简的AI新闻聚合时间轴，聚合全球AI圈最新动态，按时间顺序清晰呈现。支持PWA安装、黑夜模式、自定义信息源等功能。

## 技术栈
- 语言：TypeScript
- 框架：Vue 3 + Vite
- 样式：TailwindCSS 3
- 数据存储：纯静态 JSON 文件（`news.json`）+ localStorage
- 部署：Vercel + GitHub Pages
- PWA：manifest.json + Service Worker

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤
```bash
# 安装依赖
npm install

# 开发模式（热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 测试命令
```bash
# 运行单元测试
npm run test

# 运行 lint 检查
npm run lint

# 运行类型检查
npm run typecheck
```

## 项目结构
```
ai-news/
├── src/
│   ├── components/        # Vue 组件
│   │   ├── cards/        # 新闻卡片组件
│   │   ├── common/       # 通用组件
│   │   ├── settings/     # 设置面板组件
│   │   └── timeline/     # 时间轴组件
│   ├── composables/      # Vue 组合式函数
│   ├── config/           # 配置中心
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── style.css         # 全局样式
├── public/
│   ├── data/             # 静态数据
│   │   ├── news.json     # 新闻数据
│   │   └── sources.json  # 信息源配置
│   └── manifest.json     # PWA 配置
├── scripts/              # 脚本文件
│   └── rss-fetcher.js    # RSS 抓取脚本
├── .github/workflows/    # GitHub Actions
│   └── rss-update.yml    # RSS 更新工作流
├── tests/                # 单元测试
└── docs/                 # 项目文档
```

## 核心功能
1. **极简时间轴** —— 打开即看，按时间顺序展示AI圈动态
2. **AI脉搏音效** —— 重大突发新闻时播放提示音
3. **沉浸美学** —— 自动黑夜模式（18:00-6:00）、呼吸节点动效
4. **自定义信息源** —— 一键开关内置源，支持添加自定义RSS源
5. **一键直达与收藏** —— 点击跳转原文，支持本地收藏"稍后读"
6. **数据导入导出** —— 支持收藏数据的导入导出

## 设计理念
- 极速秒开，无需注册登录
- 聚合且干净，只专注AI领域
- 清晰的时间轴，像聊天记录一样按分钟展示
- 移动端优先，支持PWA添加到桌面

## 配置说明
可通过环境变量配置以下参数：
- `VITE_NEWS_API_URL` —— 新闻数据接口地址（默认 `/data/news.json`）
- `VITE_SOURCES_API_URL` —— 信息源配置地址（默认 `/data/sources.json`）
- `VITE_UPDATE_INTERVAL` —— 自动检查更新间隔（毫秒，默认 900000）
- `VITE_LOCAL_STORAGE_PREFIX` —— localStorage 键名前缀（默认 `ai-news`）

## 常见错误速查表
| 错误码 | 含义 | 可能原因 |
|--------|------|----------|
| 1001 | 数据加载失败 | JSON文件获取失败或解析错误 |
| 1002 | 存储操作失败 | localStorage 读写异常或容量不足 |
| 1003 | 参数错误 | 输入参数缺失或格式错误 |
| 1004 | 网络错误 | 检查更新时网络不可用 |

## 项目进度
- [x] Stage 0 /init —— 项目初始化
- [x] Stage ① /prd —— 需求分析
- [x] Stage ② /hld —— 架构设计
- [x] Stage ③ /sdd —— 详细设计 + 测试用例
- [ ] Stage ④ /impl —— 代码实现
- [ ] Stage ④.5 /review —— 代码评审
- [ ] Stage ⑤ /retro —— 复盘文档

## 文档索引
- [PRD.md](docs/PRD.md) —— 需求分析
- [ARCH.md](docs/ARCH.md) —— 架构设计
- [SDD.md](docs/SDD.md) —— 详细设计
- [TEST.md](docs/TEST.md) —— 测试用例
- [REVIEW.md](docs/REVIEW.md) —— 代码评审
- [OVERVIEW.md](docs/OVERVIEW.md) —— 架构复盘
- [FEATURE.md](docs/FEATURE.md) —— 功能解读