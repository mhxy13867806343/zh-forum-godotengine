<template>
  <n-config-provider :theme="currentTheme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-message-provider>
          <div class="app-root">
            <AppHeader />

            <main class="main-content-layout">
              <router-view />
            </main>

            <footer class="app-footer">
              <p class="m-0">
                Godot 中文论坛 · 非官方中文社区 | 基于
                <a href="https://godotengine.org" target="_blank">Godot Engine</a>
                与
                <a href="https://forum.godotengine.org" target="_blank">Official Forum Discourse API</a>
              </p>
              <p class="mt-1 text-xs text-gray-500">
                本站致力于促进开源游戏引擎技术交流与本地化学习。
              </p>
            </footer>

            <!-- Naive UI 回到顶部组件 -->
            <n-back-top :right="40" :bottom="60" :visibility-height="180" />
          </div>
        </n-message-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { useTheme } from '@/hooks/useTheme'
import AppHeader from '@/components/AppHeader.vue'

const { currentTheme, themeOverrides } = useTheme()
</script>

<style src="@/styles/app.css" scoped></style>
