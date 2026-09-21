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

      <n-button
        circle
        secondary
        size="small"
        :title="isDark ? '切换至浅色模式' : '切换至深色模式'"
        @click="toggleTheme"
      >
        <template #icon>
          <span>{{ isDark ? '🌙' : '☀️' }}</span>
        </template>
      </n-button>

      <!-- User Auth Section -->
      <div v-if="!isLoggedIn" class="flex items-center gap-1.5">
        <n-button size="small" secondary type="primary" @click="openAuthModal('login')">
          登录
        </n-button>
        <n-button size="small" quaternary @click="openAuthModal('register')">
          注册
        </n-button>
      </div>

      <n-dropdown
        v-else
        :options="userMenuOptions"
        trigger="hover"
        @select="handleUserMenuSelect"
      >
        <div class="user-avatar-trigger">
          <n-avatar
            round
            size="small"
            :src="currentUser?.avatar"
            fallback-src="/godot-logo.svg"
          />
          <span class="user-display-name text-xs text-gray-200">
            {{ currentUser?.nickname || currentUser?.username }}
          </span>
        </div>
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

    <AuthModal
      v-model:show="isAuthModalOpen"
      :default-tab="authMode"
    />
  </header>
</template>

<script setup lang="ts">
import { useTheme } from '@/hooks/useTheme'
import { useUser } from '@/hooks/useUser'
import AuthModal from './AuthModal.vue'

const router = useRouter()
const message = useMessage()
const { isDark, toggleTheme } = useTheme()
const {
  currentUser,
  isLoggedIn,
  isAuthModalOpen,
  authMode,
  openAuthModal,
  logout
} = useUser()

const keyword = ref('')

const userMenuOptions = [
  { label: '👤 个人中心', key: 'profile' },
  { label: '⚙️ 账号偏好', key: 'settings' },
  { type: 'divider', key: 'd1' },
  { label: '🚪 退出登录', key: 'logout' }
]

const handleUserMenuSelect = (key: string) => {
  if (key === 'logout') {
    logout()
    message.info('已退出当前账号')
  } else if (key === 'profile') {
    message.success(`当前登录：${currentUser.value?.nickname} (${currentUser.value?.roleName})`)
  }
}

const handleSearch = () => {
  if (keyword.value.trim()) {
    router.push({ path: '/', query: { q: keyword.value.trim() } })
  }
}
</script>

<style src="@/styles/header.css" scoped></style>
<style src="@/styles/auth.css" scoped></style>
