# AI快讯 - 部署文档（DEPLOY）

> 文档版本：v2.1.0
> 生成日期：2026-07-16
> 阶段：⑤.5 /deploy
> 技术栈：Vite + Vue3 + Node.js + GitHub Actions + GitHub Pages

---

## 一、部署架构总览

### 1.1 架构图

```
                    ┌─────────────────┐
                    │   GitHub Repo   │
                    │  (源代码仓库)   │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
  ┌────────▼────────┐  ┌────▼─────┐  ┌────────▼────────┐
  │  RSS Update     │  │  Push    │  │  Manual Trigger │
  │  (每小时定时)    │  │  代码提交 │  │  (手动触发)      │
  └────────┬────────┘  └────┬─────┘  └────────┬────────┘
           │                │                 │
           └────────────────┼─────────────────┘
                            │
                   ┌────────▼────────┐
                   │  Deploy Pages   │
                   │  (构建+部署)     │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │  GitHub Pages   │
                   │  (静态站点)      │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │  用户浏览器      │
                   │  (PWA 支持)     │
                   └─────────────────┘
```

### 1.2 工作流说明

| 工作流 | 触发条件 | 频率 | 作用 |
|:-------|:---------|:----:|:-----|
| `rss-update.yml` | 定时 + 手动 | 每小时 | 抓取新闻数据，提交回仓库 |
| `deploy-pages.yml` | Push + 手动 | 触发式 | 构建前端，部署到 GitHub Pages |

### 1.3 部署方式对比

| 部署方式 | 适用场景 | 推荐度 | 自动更新 |
|:---------|:---------|:------:|:--------:|
| GitHub Pages（推荐） | 个人项目、完全免费 | ⭐⭐⭐⭐⭐ | ✅ 每小时 |
| Vercel | 个人项目、快速上线 | ⭐⭐⭐⭐ | ✅ 每小时 |
| Netlify | 个人项目 | ⭐⭐⭐⭐ | ✅ 每小时 |
| Nginx + VPS | 自建服务器 | ⭐⭐ | ❌ 手动 |

---

## 二、GitHub Pages 部署（推荐）

### 2.1 前置条件

- [ ] 拥有 GitHub 账号
- [ ] 项目代码已推送到 GitHub 仓库
- [ ] 仓库已启用 GitHub Actions

### 2.2 自动更新原理

1. **数据更新**：`rss-update.yml` 工作流每小时运行一次，抓取最新新闻数据，提交到仓库
2. **自动部署**：数据提交触发 `deploy-pages.yml` 工作流，重新构建并部署到 GitHub Pages
3. **用户访问**：访问 `https://<username>.github.io/<repo-name>/` 看到最新内容

### 2.3 配置步骤

#### 步骤 1：启用 GitHub Pages

1. 进入 GitHub 仓库 → **Settings** → **Pages**
2. 在 **Build and deployment** 中：
   - **Source** 选择 **GitHub Actions**
3. 保存设置

#### 步骤 2：配置 Actions 权限

1. 进入仓库 **Settings** → **Actions** → **General**
2. 在 **Workflow permissions** 中选择：
   - ✅ **Read and write permissions**
3. 点击 **Save**

#### 步骤 3：手动触发首次部署

1. 进入仓库 **Actions** 页面
2. 选择 **部署到 GitHub Pages** 工作流
3. 点击 **Run workflow** → 选择分支 → **Run workflow**
4. 等待部署完成

#### 步骤 4：验证访问

部署成功后，访问：
```
https://jaffiechen.github.io/ai-news/
```

### 2.4 定时更新配置

项目已内置每小时自动更新：

```yaml
# .github/workflows/rss-update.yml
on:
  schedule:
    - cron: '0 * * * *'  # 每小时整点执行
  workflow_dispatch:        # 支持手动触发
```

**修改更新频率**：编辑 `rss-update.yml` 中的 cron 表达式

| 频率 | cron 表达式 |
|:----|:------------|
| 每小时 | `0 * * * *` |
| 每 2 小时 | `0 */2 * * *` |
| 每 30 分钟 | `*/30 * * * *` |
| 每天 8 点 | `0 8 * * *` |

> ⚠️ **注意**：GitHub Actions 的定时任务可能有几分钟延迟，属于正常现象。

### 2.5 手动触发更新

1. 进入仓库 **Actions** 页面
2. 选择 **RSS 数据更新** 工作流
3. 点击 **Run workflow** → 选择分支 → **Run workflow**

---

## 三、Vercel 部署（备选）

### 3.1 前置条件

- [ ] 拥有 GitHub 账号
- [ ] 拥有 Vercel 账号（可使用 GitHub 登录）
- [ ] 项目代码已推送到 GitHub 仓库

### 3.2 部署步骤

#### 步骤 1：导入项目

1. 登录 [vercel.com](https://vercel.com)
2. 点击 **Add New...** → **Project**
3. 选择对应的 GitHub 仓库
4. 点击 **Import**

#### 步骤 2：配置项目

```
Framework Preset:  Vite
Build Command:      npm run build
Output Directory:   dist
Install Command:    npm install
Root Directory:     ./
```

#### 步骤 3：部署

点击 **Deploy** 按钮，等待部署完成。

### 3.3 自动部署触发条件

- `main` / `master` 分支有新提交 → 自动部署生产环境
- GitHub Actions 每小时更新数据 → 触发重新部署

---

## 四、GitHub Actions 工作流详解

### 4.1 数据更新工作流（rss-update.yml）

**功能**：定时抓取新闻数据，生成 JSON，提交回仓库

**执行步骤**：
1. 检出代码
2. 设置 Node.js 20（带 npm 缓存）
3. 安装依赖（`npm ci`）
4. 执行数据抓取（`npm run fetch`）
5. 提交 `public/data/` 目录的变更
6. 推送到远程仓库

### 4.2 Pages 部署工作流（deploy-pages.yml）

**功能**：构建前端项目，部署到 GitHub Pages

**执行步骤**：
1. 检出代码
2. 设置 Node.js 20（带 npm 缓存）
3. 安装依赖（`npm ci`）
4. 构建项目（`npm run build`，设置 `GITHUB_PAGES=true`）
5. 配置 Pages
6. 上传构建产物
7. 部署到 GitHub Pages

### 4.3 环境变量

| 变量 | 用途 | 位置 |
|:-----|:-----|:-----|
| `GITHUB_PAGES` | 标记 GitHub Pages 部署，设置 base 路径 | deploy-pages.yml |
| `TZ` | 时区设置（Asia/Shanghai） | rss-update.yml |

> 本项目无需额外密钥，所有数据均来自公开 RSS 源。

---

## 五、本地构建与测试

### 5.1 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行单元测试
npm run test
```

### 5.2 本地构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建产物位于 `dist/` 目录。

### 5.3 本地运行数据抓取

```bash
# 运行抓取脚本
npm run fetch

# 指定时间窗口（小时）
npx tsx scripts/fetcher/index.ts --window-hours 48
```

---

## 六、PWA 部署注意事项

### 6.1 Service Worker 要求

- 必须通过 HTTPS 访问（GitHub Pages 默认支持）
- Service Worker 文件必须与页面同源
- 首次访问后注册 Service Worker

### 6.2 缓存策略

项目使用 Vite PWA 插件，默认策略：
- **静态资源**：Cache-First（缓存优先）
- **API/JSON 数据**：Network-First（网络优先）
- **HTML 页面**：Network-First

### 6.3 GitHub Pages 路径说明

部署到 GitHub Pages 时，项目路径为 `/ai-news/`，已通过 `vite.config.ts` 中的 `base` 配置自动适配。

---

## 七、监控与运维

### 7.1 检查数据更新状态

1. 进入 GitHub 仓库 **Actions** 页面
2. 查看 **RSS 数据更新** 工作流的运行记录
3. 确认最近一次运行成功

### 7.2 验证数据时效性

检查 `public/data/latest-24h.json` 中的 `generated_at` 字段，确认数据时间在预期范围内。

### 7.3 常见问题排查

#### 问题 1：数据不更新

**可能原因：**
- GitHub Actions 工作流失败
- 所有数据源都抓取失败
- 工作流无写入权限

**排查步骤：**
1. 检查 Actions 页面是否有失败记录
2. 查看失败日志，定位具体错误
3. 确认 Workflow permissions 设置为 Read and write

#### 问题 2：页面不更新

**可能原因：**
- 数据提交后 Pages 部署工作流未触发
- 浏览器缓存了旧版本
- PWA Service Worker 缓存

**排查步骤：**
1. 检查 Pages 部署工作流是否成功运行
2. 硬刷新页面（Ctrl + Shift + R）
3. 检查 PWA 更新提示

#### 问题 3：翻译不生效

**可能原因：**
- GitHub Actions 环境无法访问 Google 翻译 API
- 翻译配额用尽

**排查步骤：**
1. 查看抓取日志中的翻译统计
2. 确认 Actions 运行环境可以访问外网

---

## 八、回滚方案

### 8.1 GitHub Pages 回滚

GitHub Pages 部署历史保留在 Actions 中，可通过 Git 回滚：

```bash
# 查看提交历史
git log --oneline

# 回滚到指定提交（创建新提交，不修改历史）
git revert <commit-hash>

# 推送到远程触发重新部署
git push
```

### 8.2 数据回滚

如数据出现问题，可手动触发重新抓取：
1. 进入 GitHub Actions
2. 运行 **RSS 数据更新** 工作流
3. 等待新数据生成并自动部署

### 8.3 Vercel 回滚（如使用 Vercel）

Vercel 保留所有部署历史：
1. 进入项目 **Deployments** 页面
2. 找到要回滚的版本
3. 点击右侧 **...** → **Promote to Production**

---

## 九、部署检查清单

部署上线前请确认：

- [ ] `npm run build` 构建成功，无错误
- [ ] `npm run preview` 预览正常
- [ ] 页面首屏加载正常
- [ ] 24h / 7 天数据切换正常
- [ ] 收藏功能正常（localStorage）
- [ ] 历史记录功能正常
- [ ] 暗色模式切换正常
- [ ] 移动端响应式布局正常
- [ ] GitHub Pages Source 设置为 GitHub Actions
- [ ] Actions Workflow permissions 设置为 Read and write
- [ ] RSS 更新工作流手动触发成功
- [ ] Pages 部署工作流手动触发成功
- [ ] 部署 URL 可以正常访问
- [ ] PWA 可正常安装

---

## 十、版本历史

| 版本 | 日期 | 变更 | 作者 |
|:-----|:-----|:-----|:-----|
| v2.1.0 | 2026-07-16 | 新增 GitHub Pages 部署方案，优化 Actions 配置 | AI |
| v2.0.0 | 2026-07-15 | 首次部署文档，Vercel 方案 | AI |
