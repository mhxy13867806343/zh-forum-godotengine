# Godot Chinese Forum (Godot 中文论坛)

<p align="center">
  <img src="./public/godot-logo.svg" width="96" height="96" alt="Godot Engine Logo" />
</p>

<p align="center">
  <strong>A localized Chinese mirror portal for the official Godot Engine forum, connecting global and Chinese game developers.</strong>
</p>

<p align="center">
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue 3.5" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white" alt="Vite 6" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.naiveui.com/"><img src="https://img.shields.io/badge/Naive%20UI-2.45-18A058?logo=naiveui&logoColor=white" alt="Naive UI" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" /></a>
</p>

<p align="center">
  <a href="./README.md">简体中文</a> · <a href="./README_EN.md"><strong>English</strong></a>
</p>

---

## 📌 Relevant Links

* 🌐 **Online Demo**: [https://mhxy13867806343.github.io/zh-forum-godotengine/](https://mhxy13867806343.github.io/zh-forum-godotengine/)
* 🔗 **Official Godot Forum**: [https://forum.godotengine.org/](https://forum.godotengine.org/)
* 🐙 **GitHub Repository**: [https://github.com/mhxy13867806343/zh-forum-godotengine](https://github.com/mhxy13867806343/zh-forum-godotengine)
* 📖 **Official Godot Documentation**: [https://docs.godotengine.org/](https://docs.godotengine.org/)
* 🎮 **Godot Engine Official Website**: [https://godotengine.org/](https://godotengine.org/)

---

## 📖 Overview

**Godot Chinese Forum** is a lightweight, high-performance community portal designed specifically for Chinese-speaking developers. Built with **Vue 3.5 + Vite + TypeScript + Naive UI + UnoCSS**, it interfaces directly with the official Godot Discourse API, offering real-time topic feeds, localized tags, project showcase galleries, and tailored responsive experiences for both desktop and mobile devices.

---

## ✨ Key Features

* 🔄 **Real-Time Official Discourse Sync**: Pulls live topics from official Latest, Monthly Top, Curated Q&A (Help), and Project Showcase categories.
* 📱 **Mobile (H5) First Architecture**:
  * **Pull-to-Refresh Gesture**: Smooth damping drag down with status indicators (`Pull down to refresh` -> `Release to sync`).
  * **Infinite Scroll (Pull-up Load More)**: Automatic stream loading at the bottom, eliminating desktop pagination and preventing horizontal dragging or overflow.
  * **Mobile Navigation Drawer**: Slide-out drawer on tap of hamburger menu with full category list, tags, and quick search.
  * **Horizontal Quick Category Pills**: Swipeable category chips below feed tabs for 1-tap filtering.
  * **High-Visibility Back-to-Top**: Prominent floating button for instant smooth scrolling.
* 🖥️ **Desktop Rich Pagination**: Complete page jumper (Goto), page size switcher (10/20/30 per page), and clean bidirectional browser address bar query sync.
* ⚡ **Zero Re-Request In-Memory Cache**: Switching between tabs (Latest / Top / Hot) instantly reuses cached data with 0 latency; manual refresh with a 10s cooldown guard.
* 🌓 **Dark / Light Theme**: Follows OS preference by default, with instant one-click toggle.
* 🏷️ **Bilingual Category & Tag Mapping**: Comprehensive translation dictionaries for 20+ Godot engine modules, nodes, and technical topics.

---

## 🛠️ Tech Stack

| Module | Technology |
| :--- | :--- |
| **Frontend Framework** | [Vue 3.5 (Composition API)](https://vuejs.org/) |
| **Build Tooling** | [Vite 6](https://vitejs.dev/) + [vue-tsc](https://github.com/vuejs/language-tools) |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) |
| **UI Component Library** | [Naive UI 2.45](https://www.naiveui.com/) |
| **Atomic CSS** | [UnoCSS](https://unocss.dev/) |
| **HTTP Client** | [Axios](https://axios-http.com/) with Vite native fetch proxy plugin |
| **Date & Time** | [Dayjs](https://day.js.org/) |

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/mhxy13867806343/zh-forum-godotengine.git
cd zh-forum-godotengine
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run development server

```bash
pnpm dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 4. Build for production

```bash
pnpm build
```

Production assets will be output to the `dist/` directory, ready to deploy to GitHub Pages, Vercel, Netlify, or Nginx.

### 5. Preview production build locally

```bash
pnpm preview
```

---

## 📄 License

This project is open-sourced under the [MIT License](./LICENSE). Contributions, issues, and pull requests are warmly welcomed!
