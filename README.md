# Godot 中文论坛 (Godot Chinese Forum)

<p align="center">
  <img src="./public/godot-logo.svg" width="96" height="96" alt="Godot Engine Logo" />
</p>

<p align="center">
  <strong>连接全球与中文社区的 Godot 引擎官方论坛本地化镜像门户</strong>
</p>

<p align="center">
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue 3.5" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white" alt="Vite 6" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.naiveui.com/"><img src="https://img.shields.io/badge/Naive%20UI-2.45-18A058?logo=naiveui&logoColor=white" alt="Naive UI" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" /></a>
</p>

<p align="center">
  <a href="./README.md"><strong>简体中文</strong></a> · <a href="./README_EN.md">English</a>
</p>

---

## 📌 相关链接 (Links)

* 🌐 **在线预览地址 (Online Demo)**: [https://mhxy13867806343.github.io/zh-forum-godotengine/](https://mhxy13867806343.github.io/zh-forum-godotengine/)
* 🔗 **官方论坛原地址 (Official Godot Forum)**: [https://forum.godotengine.org/](https://forum.godotengine.org/)
* 🐙 **开源仓库地址 (GitHub Repository)**: [https://github.com/mhxy13867806343/zh-forum-godotengine](https://github.com/mhxy13867806343/zh-forum-godotengine)
* 📖 **Godot 官方中文文档 (Official Docs)**: [https://docs.godotengine.org/zh-cn/](https://docs.godotengine.org/zh-cn/)
* 🎮 **Godot 引擎官网 (Godot Engine)**: [https://godotengine.org/](https://godotengine.org/)

---

## 📖 项目简介

**Godot 中文论坛** 是一个专为中文开发者打造的轻量级、高性能社区镜像门户。基于 **Vue 3.5 + Vite + TypeScript + Naive UI + UnoCSS** 构建，直接对接 Godot 官方 Discourse API，实现了技术问答、游戏展示、插件资产与官方公告的中文本地化呈现与双端深度体验优化。

---

## ✨ 核心特性

* 🔄 **官方数据实时同步与镜像**：实时拉取官方论坛最新讨论（Latest）、月度热门（Top）、精选问答（Help）以及作品展厅（Showcase）。
* 📱 **H5 / 移动端极致适配**：
  * **下拉手势刷新**（Pull to Refresh）：顶部触控下拉带有质感胶囊动画与即时数据刷新。
  * **上拉触底加载**（Infinite Scroll）：移动端采用无缝流式加载，彻底摒弃桌面端宽大横向分页组件，杜绝小屏幕左右晃动与横向溢出。
  * **移动端专用侧滑抽屉**（Drawer）：集成核心功能、热门板块、高频技术标签与官方资源。
  * **顶部横向滑动分类栏**：无需滚动至屏幕底部即可秒切各大技术板块。
  * **自研高保真回到顶部**（AppBackTop）：高对比度悬浮按钮，支持平滑秒回顶部。
* 🖥️ **PC 端深度分页体验**：支持跳转至指定页（Goto）、每页条数切换（10/20/30 条）、双向同步浏览器地址栏参数。
* ⚡ **零重复网络请求内存缓存**：Tab 切换（最新/热门/精选）直接命中内存分页缓存，0 秒无感渲染；支持按需强制同步刷新（内置 10 秒冷却防频刷机制）。
* 🌓 **深色/浅色模式无缝切换**：默认自适应跟随用户操作系统偏好，支持右上角一键手动切换。
* 🏷️ **技术分类与标签双语映射**：内置 20+ Godot 核心板块与常用技术标签翻译字典，降低新手语言门槛。

---

## 🛠️ 技术栈

| 模块 | 技术方案 |
| :--- | :--- |
| **前端框架** | [Vue 3.5 (Composition API)](https://vuejs.org/) |
| **工程化工具** | [Vite 6](https://vitejs.dev/) + [vue-tsc](https://github.com/vuejs/language-tools) |
| **开发语言** | [TypeScript 5.7](https://www.typescriptlang.org/) |
| **组件库** | [Naive UI 2.45](https://www.naiveui.com/) |
| **原子化 CSS** | [UnoCSS](https://unocss.dev/) |
| **网络请求** | [Axios](https://axios-http.com/) (配合 Vite 原生 Fetch 代理插件) |
| **日期处理** | [Dayjs](https://day.js.org/) |

---

## 🚀 快速启动

### 1. 克隆代码仓库

```bash
git clone https://github.com/mhxy13867806343/zh-forum-godotengine.git
cd zh-forum-godotengine
```

### 2. 安装项目依赖

推荐使用 `pnpm` 安装依赖：

```bash
pnpm install
```

### 3. 本地启动开发服务器

```bash
pnpm dev
```

启动成功后，在浏览器访问 [http://localhost:5173/](http://localhost:5173/)。

### 4. 生产环境构建

```bash
pnpm build
```

构建产物将输出在 `dist/` 目录中，可直接部署至 GitHub Pages、Vercel、Cloudflare Pages 或 Nginx 服务器。

### 5. 本地预览生产构建产物

```bash
pnpm preview
```

---

## 📁 目录结构

```text
zh-forum-godotengine/
├── public/                     # 静态公共资源
│   ├── data/                   # 离线备份数据与元信息
│   └── godot-logo.svg          # 论坛 Logo 图标
├── src/
│   ├── api/                    # Discourse API 接口与请求封装
│   ├── components/             # 通用组件 (TopicCard, AppHeader, AppBackTop, PullToRefresh 等)
│   ├── hooks/                  # 组合式函数 (useForumTopics, useCategories, useTheme, useMobile)
│   ├── router/                 # Vue Router 路由配置
│   ├── styles/                 # 独立分离的模块化 CSS 样式表
│   ├── utils/                  # 分类字典、标签翻译与日期格式化工具
│   ├── views/                  # 视图页面 (Home, Category, TopicDetail, Showcase, Sync, About)
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 应用入口
├── vite.config.ts              # Vite 与原生 Fetch 代理插件配置
├── package.json                # 项目依赖配置
├── LICENSE                     # MIT 开源授权协议
├── README.md                   # 中文说明文档
└── README_EN.md                # 英文说明文档
```

---

## 📄 开源许可证 (License)

本项目基于 [MIT License](./LICENSE) 协议完全开源。欢迎社区开发者提出 Issue 与 PR，共同完善 Godot 中文生态！
