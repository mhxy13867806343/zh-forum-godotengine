<template>
  <header class="header-container">
    <router-link to="/" class="logo-area">
      <img
        src="/godot-logo.svg"
        alt="Godot Engine Logo"
        class="logo-img"
      />
      <div class="flex items-center gap-2">
        <span class="logo-title">Godot 中文论坛</span>
        <span class="logo-badge">Community Edition</span>
      </div>
    </router-link>

    <nav class="nav-links">
      <router-link to="/" class="nav-item">💬 话题流</router-link>
      <router-link to="/categories" class="nav-item">📂 板块大厅</router-link>
      <router-link to="/showcase" class="nav-item">🎮 作品展示</router-link>
      <router-link to="/sync" class="nav-item">⚡ 官方同步</router-link>
      <router-link to="/about" class="nav-item">📖 社区指南</router-link>
    </nav>

    <div class="header-actions">
      <n-input
        v-model:value="keyword"
        placeholder="搜索 Godot 讨论/问答..."
        clearable
        size="small"
        round
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #prefix>🔍</template>
      </n-input>

      <n-dropdown trigger="hover" :options="themeOptions" @select="handleSelectTheme">
        <n-button
          circle
          secondary
          size="small"
          :title="buttonTooltip"
          @click="handleToggleTheme"
        >
          <template #icon>
            <span>{{ isDark ? '☀️' : '🌙' }}</span>
          </template>
        </n-button>
      </n-dropdown>

      <a
        href="https://forum.godotengine.org/"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
      >
        <span>官方原站</span>
        <span>↗</span>
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useTheme } from '@/hooks/useTheme'

const router = useRouter()
const message = useMessage()
const { isDark, themeMode, toggleTheme, setThemeMode } = useTheme()
const keyword = ref('')

const themeOptions = [
  { label: '☀️ 浅色模式', key: 'light' },
  { label: '🌙 深色模式', key: 'dark' },
  { label: '💻 跟随系统外观', key: 'system' }
]

const buttonTooltip = computed(() => {
  if (themeMode.value === 'system') {
    return `当前跟随系统外观（${isDark.value ? '深色' : '浅色'}，点击切换）`
  }
  return isDark.value ? '切换至浅色模式（悬停更多）' : '切换至深色模式（悬停更多）'
})

const handleToggleTheme = () => {
  const nextIsDark = toggleTheme()
  if (nextIsDark) {
    message.success('已切换至深色模式 🌙')
  } else {
    message.info('已切换至浅色模式 ☀️')
  }
}

const handleSelectTheme = (key: string) => {
  if (key === 'system') {
    setThemeMode('system')
    message.info(`已恢复跟随系统外观 (${isDark.value ? '深色' : '浅色'}) 💻`)
  } else if (key === 'dark') {
    setThemeMode('dark')
    message.success('已切换至深色模式 🌙')
  } else if (key === 'light') {
    setThemeMode('light')
    message.info('已切换至浅色模式 ☀️')
  }
}

const handleSearch = () => {
  if (keyword.value.trim()) {
    router.push({ path: '/', query: { q: keyword.value.trim() } })
  }
}
</script>

<style src="@/styles/header.css" scoped></style>
