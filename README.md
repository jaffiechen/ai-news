# AI快讯

> 让追踪AI前沿动态，像刷朋友圈一样简单、上瘾。

## 简介
一个极简的AI新闻聚合时间轴，聚合全球AI圈最新动态，按时间顺序清晰呈现。支持PWA安装、黑夜模式、自定义信息源等功能。

## 技术栈
- 语言：TypeScript
- 框架：Vue 3 + Vite
- 样式：TailwindCSS 3
- 数据存储：纯静态 JSON 文件（`news.json`）
- 部署：Vercel + GitHub Pages
- PWA：manifest.json + Service Worker

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目进度
- [x] Stage 0 /init —— 项目初始化
- [ ] Stage ① /prd —— 需求分析
- [ ] Stage ② /hld —— 架构设计
- [ ] Stage ③ /sdd —— 详细设计 + 测试用例
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

## 核心功能
1. **极简时间轴** —— 打开即看，按时间顺序展示AI圈动态
2. **AI脉搏音效** —— 重大突发新闻时播放提示音
3. **沉浸美学** —— 自动黑夜模式、呼吸节点动效
4. **自定义信息源** —— 一键开关内置源，支持添加自定义RSS源
5. **一键直达与收藏** —— 点击跳转原文，支持本地收藏"稍后读"

## 设计理念
- 极速秒开，无需注册登录
- 聚合且干净，只专注AI领域
- 清晰的时间轴，像聊天记录一样按分钟展示
- 移动端优先，支持PWA添加到桌面