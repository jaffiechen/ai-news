# AI快讯 - 项目协作规则

## 命名规范

### 文件命名
- 使用 kebab-case（短横线连接）
- 组件文件：`NewsCard.vue`、`Timeline.vue`（PascalCase）
- 工具函数：`formatTime.ts`、`storage.ts`
- 数据文件：`news.json`、`sources.json`

### 变量命名
- 使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 组件 props 使用 camelCase，模板中使用 kebab-case

### 组件命名
- 使用 PascalCase
- 目录下的组件使用目录名前缀：`timeline/TimelineItem.vue`

## 代码风格

### Vue 3
- 使用 `<script setup>` 语法
- 组件导入使用路径别名 `@/`
- props 定义使用 `defineProps<{...}>()`
- emit 定义使用 `defineEmits<{...}>()`

### TypeScript
- 始终为函数参数和返回值添加类型
- 使用 `interface` 定义数据结构
- 使用 `type` 定义联合类型或别名
- 避免使用 `any`，使用 `unknown` 替代

### TailwindCSS
- 使用 `cn` 工具函数组合类名
- 保持类名顺序：布局 → 间距 → 排版 → 颜色 → 其他
- 复杂样式提取到 `<style scoped>` 或组件库

## 目录结构

```
src/
├── components/          # 通用组件
│   ├── layout/          # 布局组件
│   └── ui/              # UI 组件
├── composables/         # 组合式函数
├── data/                # 静态数据
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
├── App.vue              # 根组件
├── main.ts              # 入口文件
└── style.css            # 全局样式
```

## 错误处理

- 使用 try-catch 包裹异步操作
- 网络请求失败时显示友好提示
- 数据加载失败时显示骨架屏
- 日志使用 `console.warn` / `console.error`，不使用 `console.log`

## 提交规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <description>

<body>

<footer>
```

### type 类型
- `feat`：新功能
- `fix`：修复 Bug
- `docs`：文档更新
- `style`：代码风格（不影响功能）
- `refactor`：重构
- `test`：测试
- `chore`：构建/工具/配置

### 示例
```
feat(timeline): 添加呼吸节点动效

- 最新新闻节点添加 CSS 呼吸灯动画
- 使用 TailwindCSS 自定义动画类
```

## 开发流程

1. 创建分支：`feature/xxx` 或 `fix/xxx`
2. 提交代码：遵循提交规范
3. 创建 PR：关联 Issue，描述变更内容
4. Code Review：等待审核通过
5. 合并：使用 Squash Merge

## 性能优化

- 使用 `v-memo` 优化长列表渲染
- 图片使用懒加载
- 组件按需引入
- 生产构建启用压缩

## 测试规范

- 组件测试：覆盖核心交互逻辑
- 工具函数测试：覆盖边界情况
- E2E 测试：覆盖用户关键路径

## 其他

- 禁止在组件中直接操作 DOM，使用 Vue API
- 禁止使用 `console.log` 提交代码
- 重要数据存储使用 localStorage，设置过期时间
- PWA 相关配置在 `public/` 目录下