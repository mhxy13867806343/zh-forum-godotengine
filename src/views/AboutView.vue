<template>
  <div class="topic-detail-container">
    <div class="topic-header-card">
      <h1 class="detail-title text-blue-400">📖 关于 Godot 中文论坛与社区指南</h1>
      <p class="text-gray-300 text-sm leading-relaxed">
        Godot 是一款功能完备、跨平台且完全免费开源的轻量级现代游戏引擎。本项目基于 Vite + Vue 3.5 + Naive UI 构建，旨在消除语言壁垒，为广大中文 Godot 开发者提供与国际官方社区同步的技术桥梁。
      </p>

      <div class="mt-6 flex flex-col gap-4">
        <div class="p-4 rounded bg-gray-800/40 border border-gray-700/50">
          <h3 class="text-base font-semibold text-blue-300 mb-2">🎯 核心目标</h3>
          <ul class="text-sm text-gray-300 space-y-1.5 pl-4 list-disc">
            <li><strong>完整官方版块镜像与汉化</strong>：严格遵循官方 Discourse 分类体系，涵盖编程、物理、UI、着色器、XR 等全部子版块。</li>
            <li><strong>官方 API 实时同步</strong>：通过 Discourse REST API 抓取最新技术提问与官方公告。</li>
            <li><strong>中英双语对照体验</strong>：内置常见技术术语对照，支持标题与正文双语阅读。</li>
          </ul>
        </div>

        <div class="p-4 rounded bg-gray-800/40 border border-gray-700/50">
          <h3 class="text-base font-semibold text-blue-300 mb-2">🤝 社区交流规范</h3>
          <ul class="text-sm text-gray-300 space-y-1.5 pl-4 list-disc">
            <li>提问时尽量注明使用的 Godot 版本（如 Godot 4.3 或 Godot 3.5）。</li>
            <li>分享代码请使用 Markdown 代码块包裹，指明语言（如 <code>gdscript</code> 或 <code>csharp</code>）。</li>
            <li>保持友善、包容与互相尊重的开源社区精神。</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style src="@/styles/topic-detail.css" scoped></style>
