# ProseMirror Next.js Demo

这是一个基于 Next.js 和 TypeScript 的 ProseMirror 富文本编辑器演示项目。

## 功能特性

- ✨ 现代化的 Next.js 15 框架
- 📝 ProseMirror 富文本编辑器
- 🎨 Tailwind CSS 样式
- 🔧 TypeScript 支持
- ⚡ ESLint 代码检查
- 🎯 App Router 架构

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 3. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
└── components/            # React 组件
    └── ProseMirrorEditor.tsx  # ProseMirror 编辑器组件
```

## ProseMirror 功能

- 📄 基本文本编辑
- **粗体**和 *斜体* 格式
- 📝 段落和标题
- 🔄 撤销/重做 (Ctrl+Z / Ctrl+Y)
- ⌨️ 键盘快捷键支持
- 📋 列表支持

## 技术栈

- [Next.js 15](https://nextjs.org/) - React 框架
- [ProseMirror](https://prosemirror.net/) - 富文本编辑器
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [ESLint](https://eslint.org/) - 代码检查

## 开发指南

### ProseMirror 自定义

编辑器的主要逻辑在 `src/components/ProseMirrorEditor.tsx` 中：

- `mySchema`: 定义了文档结构和允许的标记
- `exampleSetup`: 提供了基本的编辑器功能和工具栏
- `EditorView`: 处理编辑器的渲染和交互

### 添加新功能

要添加新的 ProseMirror 功能，你可以：

1. 安装相应的 ProseMirror 插件
2. 在 `ProseMirrorEditor.tsx` 中导入并配置
3. 更新样式文件 `globals.css`

## 许可证

MIT License

## 贡献

欢迎提交 Issues 和 Pull Requests！
