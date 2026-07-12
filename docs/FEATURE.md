# AI快讯 - 功能解读文档

> 生成日期：2026-07-13
> 阶段：⑤ /retro
> 阅读对象：新加入项目的开发者、QA、用户

> **如何使用本文档**：按用户故事（US-XXX）顺序阅读，每个故事都包含「PRD 描述 → 代码位置 → 操作步骤 → 验证方法」。

---

## 〇、快速跑起来

```bash
# 1. 安装 Node.js（版本 >= 18.0.0）
# 2. 安装依赖
cd ai-news
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问 http://localhost:5173

# 5. 运行单元测试
npm run test

# 6. 构建生产版本
npm run build

# 7. 预览生产版本
npm run preview
```

---

## 一、用户故事 US-001（浏览AI新闻时间轴）

### 1.1 PRD 描述
> 作为访客，我想要打开页面就能看到按时间顺序排列的AI新闻，以便快速了解最新动态

### 1.2 代码实现位置
- 接入层 / 前端：`src/components/timeline/Timeline.vue`
- 业务实现：`src/composables/useNews.ts` → `loadNews()`、`filterBySources()`
- 相关中间件/工具：`src/utils/format.ts` → `formatTime()`

### 1.3 完整操作步骤
1. 打开浏览器访问应用首页
2. 页面自动加载新闻数据（显示骨架屏）
3. 新闻加载完成后按时间倒序显示
4. 最新新闻在顶部，向下滚动查看历史新闻
5. 每条新闻左侧显示时间线和圆点标识

### 1.4 验证方法
```bash
# 启动开发服务器
npm run dev

# 打开浏览器访问 http://localhost:5173

# 预期：
# - 页面显示"AI快讯"标题
# - 新闻列表按时间倒序排列
# - 每条新闻显示标题、来源、相对时间
# - 最新新闻有呼吸灯动效
```

### 1.5 常见错误
| 错误 | 原因 | 解决 |
|---|---|---|
| 新闻列表为空 | news.json 加载失败 | 检查网络连接，确认 `public/data/news.json` 存在 |
| 页面显示骨架屏不消失 | 网络超时 | 检查网络连接，增加超时时间 |

---

## 二、用户故事 US-002（管理信息源）

### 2.1 PRD 描述
> 作为访客，我想要一键开关不同的信息源，以便过滤掉不感兴趣的内容

### 2.2 代码实现位置
- 接入层 / 前端：`src/components/settings/SourceList.vue`
- 业务实现：`src/composables/useNews.ts` → `filterBySources()`、`useStorage.ts` → `savePreferences()`
- 相关中间件/工具：`src/composables/useNews.ts` → `sources` 响应式数据

### 2.3 完整操作步骤
1. 点击页面右上角设置图标（⚙️）
2. 展开设置面板，找到「信息源」部分
3. 看到所有内置信息源列表
4. 点击开关按钮启用/禁用特定信息源
5. 新闻列表自动重新过滤

### 2.4 验证方法
```bash
# 启动开发服务器
npm run dev

# 在浏览器中：
# 1. 点击设置图标
# 2. 禁用某个信息源（如 arXiv）
# 3. 观察新闻列表中不再显示该来源的新闻
# 4. 重新启用该信息源
# 5. 观察新闻列表恢复显示该来源的新闻

# 预期：
# - 开关切换即时生效
# - 偏好自动保存到 localStorage
```

### 2.5 常见错误
| 错误 | 原因 | 解决 |
|---|---|---|
| 开关切换后不生效 | localStorage 写入失败 | 检查浏览器是否允许本地存储 |
| 信息源列表为空 | sources.json 加载失败 | 确认 `public/data/sources.json` 存在 |

---

## 三、用户故事 US-003（移动端体验）

### 3.1 PRD 描述
> 作为访客，我想要在手机上也能有流畅的浏览体验，以便随时刷新闻

### 3.2 代码实现位置
- 接入层 / 前端：所有组件均使用响应式设计
- 样式框架：TailwindCSS 响应式类（`sm:`、`md:`、`lg:`）
- PWA配置：`public/manifest.json`

### 3.3 完整操作步骤
1. 在手机浏览器中打开应用
2. 页面自动适配手机屏幕宽度
3. 可将应用添加到桌面（PWA）
4. 使用触摸手势滚动浏览新闻
5. 支持自动黑夜模式

### 3.4 验证方法
```bash
# 启动开发服务器
npm run dev

# 使用浏览器开发者工具模拟移动端：
# 1. 打开 Chrome DevTools (F12)
# 2. 点击设备模拟按钮（Ctrl+Shift+M）
# 3. 选择 iPhone 14/Android 等设备
# 4. 刷新页面

# 预期：
# - 页面布局自适应屏幕宽度
# - 字体大小适合手机阅读
# - 触摸交互流畅
```

### 3.5 常见错误
| 错误 | 原因 | 解决 |
|---|---|---|
| 无法添加到桌面 | PWA 配置不完整 | 检查 manifest.json 是否正确配置 |
| 页面元素错位 | 响应式断点设置不当 | 调整 TailwindCSS 断点类 |

---

## 四、用户故事 US-004（收藏新闻）

### 4.1 PRD 描述
> 作为访客，我想要将重要新闻标记为"稍后读"，以便有空时再查看

### 4.2 代码实现位置
- 接入层 / 前端：`src/components/cards/NewsCard.vue`
- 业务实现：`src/composables/useStorage.ts` → `toggleFavorite()`、`getFavorites()`
- 相关中间件/工具：`src/types/index.ts` → `Favorite` 类型

### 4.3 完整操作步骤
1. 在新闻卡片上找到收藏按钮（⭐）
2. 点击空心星星标记为收藏（变实心）
3. 再次点击取消收藏（变回空心）
4. 收藏数据自动保存到本地

### 4.4 验证方法
```bash
# 启动开发服务器
npm run dev

# 在浏览器中：
# 1. 打开开发者工具 → Application → Local Storage
# 2. 点击一条新闻的收藏按钮
# 3. 观察 localStorage 中 ai-news-favorites 是否更新
# 4. 刷新页面，收藏状态应保持

# 预期：
# - 收藏状态即时切换
# - 数据持久化保存
# - 刷新页面后状态不变
```

### 4.5 常见错误
| 错误 | 原因 | 解决 |
|---|---|---|
| 收藏不生效 | localStorage 容量不足 | 清理浏览器缓存 |
| 刷新后收藏丢失 | localStorage 读取失败 | 检查浏览器存储权限 |

---

## 五、用户故事 US-005（突发新闻音效提醒）

### 5.1 PRD 描述
> 作为访客，我想要在重大突发新闻时收到声音提醒，以便及时关注重要事件

### 5.2 代码实现位置
- 接入层 / 前端：`src/components/settings/SoundSwitch.vue`
- 业务实现：`src/composables/useSound.ts` → `playNotification()`、`detectBreakingNews()`
- 相关中间件/工具：`src/config/index.ts` → `breakingKeywords` 配置

### 5.3 完整操作步骤
1. 打开设置面板
2. 启用「音效提醒」开关
3. 当有新新闻且标题包含关键词时自动播放提示音
4. 关闭开关可停止音效

### 5.4 验证方法
```bash
# 启动开发服务器
npm run dev

# 在浏览器中：
# 1. 打开设置面板
# 2. 启用音效提醒
# 3. 打开浏览器控制台
# 4. 手动触发更新检查

# 预期：
# - 标题包含"发布"、"开源"等关键词时播放提示音
# - 音效开关控制是否播放
```

### 5.5 常见错误
| 错误 | 原因 | 解决 |
|---|---|---|
| 无音效播放 | 浏览器不支持 AudioContext | 使用支持的浏览器（Chrome/Safari） |
| 音效一直播放 | 关键词配置过宽泛 | 修改 `breakingKeywords` 配置 |

---

## 六、用户故事 US-006（极客模式）

### 6.1 PRD 描述
> 作为访客，我想要自定义添加RSS信息源，以便获取更多小众内容

### 6.2 代码实现位置
- 接入层 / 前端：`src/components/settings/GeekMode.vue`
- 业务实现：`src/composables/useToast.ts` → `showSuccess()`、`showError()`
- 相关中间件/工具：`src/types/index.ts` → `Source` 类型

### 6.3 完整操作步骤
1. 在设置面板中找到「极客模式」
2. 长按按钮3秒（显示进度条）
3. 进度条满后进入极客模式
4. 粘贴JSON配置代码
5. 点击验证按钮检查格式
6. 格式正确则提示提交PR

### 6.4 验证方法
```bash
# 启动开发服务器
npm run dev

# 在浏览器中：
# 1. 打开设置面板
# 2. 长按"极客模式"按钮3秒
# 3. 观察进度条动画
# 4. 进入极客模式后粘贴有效JSON
# 5. 点击验证

# 预期：
# - 长按进度条正确显示
# - 有效JSON显示成功提示
# - 无效JSON显示错误提示
```

### 6.5 常见错误
| 错误 | 原因 | 解决 |
|---|---|---|
| 进度条不动 | 鼠标事件未触发 | 使用 mousedown 而非 click |
| JSON验证失败 | 格式错误 | 检查JSON语法 |

---

## 七、用户故事 US-007（数据导入导出）

### 7.1 PRD 描述
> 作为访客，我想要导出/导入收藏数据，以便更换设备后迁移内容

### 7.2 代码实现位置
- 接入层 / 前端：`src/components/settings/DataExport.vue`
- 业务实现：`src/composables/useStorage.ts` → `exportData()`、`importData()`
- 相关中间件/工具：`src/composables/useToast.ts` → `showSuccess()`、`showError()`

### 7.3 完整操作步骤
1. 打开设置面板，找到「数据管理」
2. 点击「导出数据」下载 JSON 文件
3. 在新设备上点击「导入数据」
4. 粘贴 JSON 内容并点击导入
5. 数据导入成功后自动刷新

### 7.4 验证方法
```bash
# 启动开发服务器
npm run dev

# 在浏览器中：
# 1. 添加几条收藏
# 2. 导出数据（下载 JSON 文件）
# 3. 清除浏览器数据
# 4. 导入刚才下载的 JSON 文件
# 5. 观察收藏是否恢复

# 预期：
# - 导出文件包含 favorites 和 preferences
# - 导入后数据完整恢复
# - 格式错误时有提示
```

### 7.5 常见错误
| 错误 | 原因 | 解决 |
|---|---|---|
| 导入失败 | JSON 格式错误 | 检查文件内容是否完整 |
| 导出文件为空 | 无收藏数据 | 添加收藏后再导出 |

---

## 八、核心工具 / 基础设施解读

### 8.1 数据访问入口（useNews）
- **路径**：`src/composables/useNews.ts`
- **作用**：管理新闻数据的加载、过滤和更新检测
- **调用方**：`App.vue`、`Timeline.vue`
- **示例**：
```typescript
const { newsList, filteredNews, loading, loadNews, filterBySources, checkForUpdates } = useNews()

// 加载新闻
await loadNews()

// 按信息源过滤
const filtered = filterBySources(['quantum-bit', 'arxiv'])

// 检查更新
const result = await checkForUpdates()
```

### 8.2 存储服务（useStorage）
- **路径**：`src/composables/useStorage.ts`
- **作用**：封装 localStorage 操作，提供收藏和偏好管理
- **调用方**：`NewsCard.vue`、`SourceList.vue`、`DataExport.vue`
- **示例**：
```typescript
const { getFavorites, toggleFavorite, getPreferences, savePreferences, exportData, importData } = useStorage()

// 切换收藏
toggleFavorite(news)

// 获取偏好
const prefs = getPreferences()

// 保存偏好
savePreferences({ theme: 'dark' })

// 导出数据
const result = await exportData()

// 导入数据
await importData({ favorites: [], preferences: {...} })
```

### 8.3 统一响应 / 错误（response）
- **路径**：`src/utils/response.ts`
- **作用**：标准化所有函数的返回结构，统一错误码
- **调用方**：所有 composables
- **示例**：
```typescript
import { success, error, ERROR_CODES } from '@/utils/response'

// 成功响应
return success({ data: {...} })

// 错误响应
return error(ERROR_CODES.STORAGE_FAILED, '操作失败')
```

---

## 九、接口完整清单

| 编号 | 调用方式 | 标识 | 验证示例 |
|---|---|---|---|
| API-001 | 函数调用 | `useNews().loadNews()` | 见 §1.4 |
| API-002 | 函数调用 | `useNews().filterBySources(sources)` | 见 §2.4 |
| API-003 | 函数调用 | `useNews().checkForUpdates()` | 见 §5.4 |
| API-004 | 函数调用 | `useStorage().getFavorites()` | 见 §4.4 |
| API-005 | 函数调用 | `useStorage().toggleFavorite(news)` | 见 §4.4 |
| API-006 | 函数调用 | `useStorage().getPreferences()` | 见 §2.4 |
| API-007 | 函数调用 | `useStorage().savePreferences(prefs)` | 见 §2.4 |
| API-008 | 函数调用 | `useStorage().exportData()` | 见 §7.4 |
| API-009 | 函数调用 | `useStorage().importData(data)` | 见 §7.4 |
| API-010 | 函数调用 | `useSound().playNotification()` | 见 §5.4 |
| API-011 | 函数调用 | `useSound().detectBreakingNews(news)` | 见 §5.4 |
| API-012 | 函数调用 | `useTheme().toggleTheme(mode)` | 设置面板切换主题 |
| API-013 | 函数调用 | `utils.formatTime(date)` | 新闻卡片显示相对时间 |
| API-014 | HTTP GET | `/data/news.json` | 静态数据接口 |
| API-015 | HTTP GET | `/data/sources.json` | 静态数据接口 |

---

## 十、数据结构速查

### 10.1 News（新闻）
```typescript
interface News {
  id: string           // 唯一标识
  title: string        // 标题
  link: string         // 原文链接
  source: string       // 信息源标识
  category?: string    // 分类标签
  summary?: string     // 摘要
  pubDate: string      // 发布时间（ISO格式）
  isBreaking?: boolean // 是否重大突发
  imageUrl?: string    // 配图URL
}
```

### 10.2 Source（信息源）
```typescript
interface Source {
  id: string       // 唯一标识
  name: string     // 显示名称
  icon?: string    // 图标emoji
  rssUrl: string   // RSS订阅地址
  category?: string// 分类
  enabled?: boolean// 是否启用
}
```

### 10.3 Favorite（收藏）
```typescript
interface Favorite {
  newsId: string   // 关联新闻ID
  title: string    // 新闻标题
  link: string     // 原文链接
  source: string   // 信息源
  savedAt: string  // 收藏时间
}
```

### 10.4 UserPreference（用户偏好）
```typescript
interface UserPreference {
  enabledSources: string[]    // 启用的信息源ID列表
  theme: 'light' | 'dark' | 'auto'  // 主题模式
  soundEnabled: boolean       // 是否启用音效
  lastUpdateTime: string      // 上次更新时间
}
```

---

## 十一、版本历史

| 版本 | 日期 | 变更 | 作者 |
|---|---|---|---|
| v1.0 | 2026-07-13 | 初稿 | AI-SA |