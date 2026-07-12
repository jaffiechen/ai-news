# AI快讯 - 部署文档

> 生成日期：2026-07-13
> 阶段：⑤.5 /deploy

---

## 一、部署信息

| 项 | 值 |
|---|---|
| 平台 | Vercel（推荐）/ Netlify / GitHub Pages |
| URL | {{部署后填写}} |
| 部署日期 | 2026-07-13 |
| 代码仓库 | https://github.com/jaffiechen/ai-news.git |

---

## 二、选型理由

### 推荐：Vercel
- **技术栈匹配**：Vite 官方推荐平台，零配置自动识别 Vue + Vite 项目
- **免费额度**：每月 100GB 流量，无限构建，足够个人项目使用
- **部署体验**：连接 GitHub 仓库后自动部署，每次 push 自动触发构建
- **CDN 加速**：全球边缘节点，访问速度快
- **PWA 支持**：完美支持 Service Worker 和 manifest.json

### 备选：Netlify
- 同样支持静态站点，配置简单
- 免费额度：每月 100GB 流量，无限带宽
- 支持自定义域名和 HTTPS

### 备选：GitHub Pages
- **完全免费**：无流量限制，适合开源项目
- 需要配置 GitHub Actions 进行构建
- 自定义域名支持

---

## 三、部署步骤（Vercel，推荐）

### Step 1：准备工作

```bash
# 1. 确保项目已提交到 GitHub
cd ai-news
git add .
git commit -m "🚀 准备部署 AI快讯"
git push origin main

# 2. 验证构建是否成功
npm run build

# 确认 dist/ 目录已生成
ls dist/
```

### Step 2：注册 / 登录 Vercel

> ⚠️ 以下步骤需要用户手动完成身份验证

1. 打开 https://vercel.com/
2. 使用 GitHub 账号登录（推荐）
3. 完成注册流程

### Step 3：关联代码仓库

1. 在 Vercel 控制台点击「Add New Project」
2. 选择「Import Git Repository」
3. 选择 GitHub 仓库 `jaffiechen/ai-news`
4. 点击「Import」

### Step 4：配置部署

Vercel 会自动检测项目配置，通常无需手动修改：

| 配置项 | 值 | 说明 |
|---|---|---|
| Framework | Vue | 自动识别 |
| Build Command | `npm run build` | 自动识别 |
| Output Directory | `dist` | 自动识别 |
| Node.js Version | 18.x | 推荐 |

**环境变量（如需要）：**

| 变量名 | 默认值 | 说明 |
|---|---|---|
| VITE_NEWS_API_URL | `/data/news.json` | 新闻数据接口地址 |
| VITE_SOURCES_API_URL | `/data/sources.json` | 信息源配置地址 |
| VITE_UPDATE_INTERVAL | `900000` | 更新间隔（毫秒） |

点击「Deploy」开始部署

### Step 5：等待部署完成

Vercel 会自动完成：
1. 拉取代码
2. 安装依赖
3. 构建项目
4. 部署到 CDN

部署完成后会显示：
- 部署 URL（如 `https://ai-news-xxxx.vercel.app`）
- 部署状态（Production Ready）

---

## 四、部署步骤（GitHub Pages，免费）

### Step 1：创建 GitHub Actions 工作流

```bash
# 创建工作流文件
mkdir -p .github/workflows
touch .github/workflows/deploy.yml
```

写入以下内容到 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Step 2：配置 GitHub Pages

1. 打开 GitHub 仓库设置
2. 进入「Pages」页面
3. 在「Source」中选择「GitHub Actions」
4. 保存设置

### Step 3：推送代码触发部署

```bash
git add .github/workflows/deploy.yml
git commit -m "🚀 添加 GitHub Pages 部署工作流"
git push origin main
```

部署完成后访问：`https://jaffiechen.github.io/ai-news/`

---

## 五、环境变量 / 敏感信息

| 变量 | 用途 | 默认值 | 存储位置 |
|---|---|---|---|
| VITE_NEWS_API_URL | 新闻数据接口地址 | `/data/news.json` | 平台环境变量 |
| VITE_SOURCES_API_URL | 信息源配置地址 | `/data/sources.json` | 平台环境变量 |
| VITE_UPDATE_INTERVAL | 自动更新间隔（毫秒） | `900000` (15分钟) | 平台环境变量 |
| VITE_LOCAL_STORAGE_PREFIX | localStorage 键名前缀 | `ai-news` | 平台环境变量 |

⚠️ **绝对不要把密钥/密码提交到 git！**

本项目为纯前端架构，无敏感凭据需要存储。

---

## 六、访问与验证

### 健康检查

```bash
# 访问首页
curl -I https://your-vercel-url.vercel.app/

# 预期返回：
# HTTP/2 200
# content-type: text/html

# 检查新闻数据接口
curl https://your-vercel-url.vercel.app/data/news.json

# 预期返回：
# [{ "id": "...", "title": "...", ... }]
```

### 业务验证

1. 打开浏览器访问部署 URL
2. 验证以下功能：
   - ✅ 新闻列表正常显示
   - ✅ 信息源开关正常工作
   - ✅ 收藏功能正常
   - ✅ 主题切换正常
   - ✅ 可以添加到桌面（PWA）

---

## 七、回滚方案

### 方案 1：通过 Vercel UI

```bash
# 1. 打开 Vercel 控制台
# 2. 进入项目页面
# 3. 点击「Deployments」标签
# 4. 找到上一版本
# 5. 点击「...」→「Redeploy」或「Rollback」
```

### 方案 2：通过 Git

```bash
# 回滚到上一版本
git revert HEAD
git push origin main

# Vercel 会自动重新部署回滚后的代码
```

### 方案 3：手动回滚（GitHub Pages）

```bash
# 删除 gh-pages 分支
git push origin --delete gh-pages

# 重新部署特定版本
git checkout <commit-hash>
git push origin HEAD:gh-pages
```

---

## 八、常见错误

| 错误 | 原因 | 解决 |
|---|---|---|
| 构建失败：`Cannot find module` | Node.js 版本不兼容 | 在 Vercel 配置中设置 Node.js 版本为 18.x |
| 部署成功但页面空白 | 路由模式问题 | 确认使用 history 模式，Vercel 自动处理 |
| Service Worker 不生效 | HTTPS 未启用 | Vercel/GitHub Pages 默认启用 HTTPS，确保使用 https 访问 |
| 新闻数据加载失败 | 路径问题 | 确认 `public/data/news.json` 存在，检查 API URL 配置 |
| PWA 无法安装 | manifest 配置错误 | 检查 manifest.json 中 icons 路径是否正确 |

---

## 九、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-07-13 | 首次部署文档 | AI-DevOps |