<template>
  <div class="sync-container">
    <div class="sync-card">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-blue-400 m-0">⚡ 官方论坛数据爬虫与同步中心</h1>
          <p class="text-gray-400 text-sm mt-1 mb-0">
            实时对接 <a href="https://forum.godotengine.org" target="_blank" class="text-blue-400 underline">forum.godotengine.org</a> Discourse 开放 API，支持后台抓取与离线增量缓存。
          </p>
        </div>
        <n-button
          type="primary"
          :loading="stats.isSyncing"
          @click="triggerSync"
        >
          {{ stats.isSyncing ? '正在同步中...' : '立即手动触发同步' }}
        </n-button>
      </div>

      <!-- Sync Status Alert -->
      <div class="mt-4">
        <n-alert :type="alertType" :title="stats.status === 'running' ? '同步任务进行中' : '同步服务状态'">
          {{ stats.message }}
        </n-alert>
      </div>

      <!-- Statistics Grid -->
      <div class="sync-stats-grid">
        <div class="stat-box">
          <span class="stat-num">{{ stats.totalTopics.toLocaleString() }}</span>
          <span class="stat-label">已索引话题数 (Topics)</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">{{ stats.totalCategories }}</span>
          <span class="stat-label">覆盖官方版块分类</span>
        </div>
        <div class="stat-box">
          <span class="stat-num text-lg font-mono">{{ stats.lastSyncTime }}</span>
          <span class="stat-label">上次同步完成时间</span>
        </div>
        <div class="stat-box">
          <span class="stat-num text-lg text-emerald-400">自动化服务激活</span>
          <span class="stat-label">同步策略：智能增量缓存</span>
        </div>
      </div>

      <!-- Live logs -->
      <div class="mt-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold">同步日志输出</span>
          <span class="text-xs text-gray-500">自动滚动</span>
        </div>
        <div class="log-box">
          <div v-for="(log, idx) in syncLogs" :key="idx">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSyncSpider } from '@/hooks/useSyncSpider'

const { stats, syncLogs, triggerSync } = useSyncSpider()

const alertType = computed(() => {
  if (stats.value.status === 'running') return 'info'
  if (stats.value.status === 'success') return 'success'
  if (stats.value.status === 'failed') return 'warning'
  return 'default'
})
</script>

<style src="@/styles/sync.css" scoped></style>
