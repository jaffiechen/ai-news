# 更新日志

所有重要的变更都会记录在这个文件中。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

---

## [2.7.0] - 2026-07-16

### ⚡ 优化
- **归档体积优化**：归档仅保留 AI 相关内容，自动过滤非 AI 数据，archive.json 体积从 65MB 降至 11MB（减少 83%）
  - 归档条目数：133,631 → 24,015（-82%）
  - 保留 20 天归档周期不变
  - 每次抓取后自动清理非 AI 历史数据
  - 不影响前端 24h/7d 视图展示

---

## [2.6.0] - 2026-07-16

### ✨ 新增
- **AI今日热榜（aihot）**：新增 AI 今日热榜数据源，聚合 400+ 条 AI 领域热门资讯
- **BestBlogs 技术周刊**：新增 BestBlogs 技术周刊数据源，精选优质技术博客内容

### 🐛 修复
- **TechURLs 抓取失败**：修复域名错误（techurls.xyz → techurls.com），解决数据源概览中 TechURLs 显示红色叉号的问题

### 🗑️ 移除
- **AIHub 抓取器**：移除实现简陋且已被更优质源替代的 aihub.ts
- **旧版 RSS 抓取器**：移除 rss.ts，统一使用 opml-rss.ts 管理 RSS 订阅

### ⚡ 优化
- **AIbase 抓取器重构**：重写 aibase.ts，使用更精准的选择器提取新闻标题和发布时间
- **数据源概览弹窗**：更新 SITE_INFO 配置，修正多个站点的官方 URL 和描述信息
- **抓取器对齐**：全面对齐 ai-news-aggregator 项目的 fetchers 实现，确保代码质量和功能一致性

---

## [2.5.0] - 2026-07-16

### ✨ 新增
- **TopHub 数据源集成**：新增 TopHub 今日热榜数据源，聚合 10 个 AI/科技相关订阅源
  - Readhub · AI
  - 开源中国 · 热门资讯
  - 36氪 · 24小时热榜
  - 掘金 · 人工智能本周最热
  - 量子位 · 每日最新
  - Product Hunt · 今日新产品
  - GitHub · Trending Today
  - 机器之心 · 文章库
  - 少数派 · 热门文章 / #应用推荐
- **数据源管理**：SourceModal 中新增 TopHub 站点描述和官方链接

### 🐛 修复
- **乱码检测误判**：修复 `hasMojibakeNoise` 函数将合法字符「·」（U+00B7）误判为乱码的问题，改为仅检测 `\ufffd`（替换字符），确保 TopHub 等含中文间隔号的来源能正常通过过滤
- **无效数据过滤**：新增 AI HubToday 过期域名（Page Fallback）的过滤规则，自动移除标题含 "Click here to enter" 或来源含 "Page Fallback" 的无效数据

### ⚡ 优化
- **TopHub 关键词过滤**：优化 `tophubAllowKeywords` 配置，精准匹配 AI/科技类来源，结合内容级 AI 关键词实现双重过滤

---

## [2.4.0] - 2026-07-16

### ✨ 新增
- 页面副标题：新增「实时追踪 AI 领域最新动态」副标题，PC 端和移动端均显示

### 🎨 界面优化
- **顶部布局重构**：
  - PC 端和移动端统一为上下两行布局
  - 第一行：左侧 Logo + 标题 + 副标题，右侧功能图标组
  - 第二行：左侧时间切换（24h/7天），右侧更新时间
- **功能图标调整**：
  - 移动端显示 5 个图标：收藏、历史、声音、翻译、主题
  - PC 端显示 5 个图标：收藏、历史、声音、翻译、主题
  - 移除顶部来源管理图标（入口保留在统计卡片中）
- **统计卡片改版**：
  - PC 端：三列横向布局（总数 / 来源数 / 筛选数）
  - 移动端：2x2 网格布局，筛选数单独占一行
  - 背景改为浅灰色，与导航区分层
  - 来源卡片可点击跳转来源管理
- **滚动进度条优化**：
  - 位置右移：移动端 `right-1`、PC 端 `right-6`，避免遮挡新闻内容
  - 尺寸响应式：移动端缩小按钮和进度条尺寸
  - 文字缩小：百分比和序号在移动端使用 10px 字体

### 📱 移动端优化
- 声音和翻译按钮在移动端常驻显示（之前隐藏）
- 标题字号自适应：移动端 `text-base`，PC 端 `text-xl`
- 副标题文字省略，避免换行
- 全局间距响应式调整，小屏更紧凑

---

## [2.3.0] - 2026-07-16

### 🐛 修复
- **数据不显示 Bug**：修复旧用户偏好 `enabledSources` 与新数据源不匹配导致全部新闻被过滤的问题，检测到无匹配时自动重置偏好
- **时间过滤 Bug**：`filterByTimeRange` 中 `published_at` 为空时改用 `first_seen_at` 兜底，避免大量新闻被误过滤
- **构建错误**：修复 `HistoryModal.vue` 中 `showConfirm` 不存在、`App.vue` 中 `refreshing` 未定义的 TypeScript 编译错误
- **GitHub Pages 路径问题**：使用 `import.meta.env.BASE_URL` 自动适配子路径数据加载，解决 Pages 部署后无数据问题

### 📱 移动端优化
- 顶部导航响应式改造：移动端隐藏声音/翻译按钮，只保留 4 个核心按钮（收藏、历史、主题 + 时间切换）
- 时间切换（24h/7天）独立一行，避免与图标按钮拥挤
- 统计卡片移动端改为上下两行布局（第一行：总数+来源，第二行：筛选数）
- 标签按钮缩小间距和字号，增加一屏显示数量
- 新闻卡片缩小内边距和字体，提升信息密度
- 时间轴时间列宽度优化，给内容区域更多空间
- 全局 `px-4` → `px-3 sm:px-4`、`py-4` → `py-3 sm:py-4` 等响应式间距调整

### 📝 文档
- 新增 CHANGELOG.md 更新日志文件
- 更新 README.md，润色并补充部署方案、技术栈详解、FAQ 等内容
- 更新 DEPLOY.md 部署文档

---

## [2.2.0] - 2026-07-16

### ✨ 新增
- **GitHub Pages 自动部署**：新增 `deploy-pages.yml` 工作流，push 到 master 自动构建部署
- **RSS 数据自动更新**：新增 `rss-update.yml` 工作流，每小时自动抓取数据并提交
- **数据更新触发部署**：RSS 更新工作流完成后自动触发 Pages 重新部署
- **部署文档**：新增 `docs/DEPLOY.md`，包含 GitHub Pages 和 Vercel 双方案部署指南

### ⚡ 性能优化
- **翻译并发控制**：使用 `p-limit` 实现并发数为 3 的翻译请求队列，替代顺序执行，性能提升约 3 倍
- **收藏/已读判断优化**：用 Set 数据结构替代数组遍历，`isFavorite()` 和 `isVisited()` 从 O(n) 降为 O(1)
- **addToHistory 去重优化**：合并 `findIndex` + `filter` 两次遍历为单次 `filter` + 拼接
- **日期函数复用**：抽取公共 `parseDate` 函数，消除 `formatDate`/`formatHour`/`getRelativeTime` 中的重复日期校验逻辑

### 🐛 修复
- **filterBySources 空实现**：补全基于用户偏好的来源过滤逻辑，与 SDD 定义保持一致
- **ScrollProgress DOM 耦合**：新增 `total` prop 支持父组件传入总数，用 `data-news-card` 替代脆弱的 CSS 类名选择器

### 🔧 配置更新
- 升级 GitHub Actions Node.js 版本从 20 到 22
- 升级 `actions/checkout` 和 `actions/setup-node` 至 v4
- Vite `base` 配置为 `'/ai-news/'`，支持 GitHub Pages 子路径部署
- 新增 RSS 工作流 `actions: write` 权限，用于触发部署工作流

---

## [2.1.0] - 2026-07-15

### ✨ 新增功能
- **AI 资讯聚合**：聚合 162 个信息源，覆盖 13 个站点
- **时间范围切换**：支持 24 小时 / 7 天两种视图切换
- **全文搜索**：支持按标题、来源搜索新闻
- **多维筛选**：按站点筛选、按订阅源筛选二级筛选
- **收藏功能**：收藏感兴趣的新闻，支持收藏列表查看
- **历史记录**：自动记录阅读历史，已读状态区分
- **主题切换**：支持浅色/深色主题，自动保存偏好
- **翻译模式**：中文/英文/双语三种标题展示模式
- **声音提醒**：新资讯到达时声音提醒开关
- **滚动进度条**：右侧滚动位置进度指示器

### 🎨 界面设计
- 时间轴布局展示新闻，清晰直观
- 毛玻璃效果顶部导航栏
- 卡片式新闻展示，已读/未读状态区分
- 响应式设计，适配桌面端和移动端
- 平滑过渡动画和交互动效

### 🔧 技术栈
- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite 5
- **样式方案**：Tailwind CSS 3
- **状态管理**：Vue Composition API + Composables
- **本地存储**：localStorage（收藏、历史、偏好）
- **数据抓取**：Node.js + RSS 解析 + AI 翻译
- **部署方案**：静态站点，支持 GitHub Pages / Vercel

### 📚 项目文档
- `docs/PRD.md` - 产品需求文档
- `docs/ARCH.md` - 系统架构设计
- `docs/SDD.md` - 详细设计文档
- `docs/TEST.md` - 测试用例
- `docs/REVIEW.md` - 代码评审报告
- `docs/OVERVIEW.md` - 架构复盘
- `docs/FEATURE.md` - 功能解读

---

[2.3.0]: https://github.com/jaffiechen/ai-news/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/jaffiechen/ai-news/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/jaffiechen/ai-news/releases/tag/v2.1.0
