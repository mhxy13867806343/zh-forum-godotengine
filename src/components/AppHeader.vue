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
        <span class="logo-badge">Community</span>
      </div>
    </router-link>

    <!-- Desktop Navigation -->
    <nav class="nav-links desktop-nav">
      <router-link to="/" class="nav-item">💬 话题流</router-link>
      <router-link to="/categories" class="nav-item">📂 板块大厅</router-link>
      <router-link to="/showcase" class="nav-item">🎮 作品展示</router-link>
      <router-link to="/sync" class="nav-item">⚡ 官方同步</router-link>
      <router-link to="/about" class="nav-item">📖 社区指南</router-link>
    </nav>

    <!-- Header Actions (Desktop & Mobile) -->
    <div class="header-actions">
      <n-input
        v-model:value="keyword"
        placeholder="搜索讨论..."
        clearable
        size="small"
        round
        class="search-input desktop-search"
        @keyup.enter="handleSearch"
      >
        <template #prefix>🔍</template>
      </n-input>

      <!-- Theme Switcher -->
      <n-button
        circle
        secondary
        size="small"
        :title="isDark ? '切换至浅色模式' : '切换至深色模式'"
        @click="handleToggleTheme"
      >
        <template #icon>
          <span>{{ isDark ? '☀️' : '🌙' }}</span>
        </template>
      </n-button>

      <!-- External Godot Forum Link (Desktop) -->
      <a
        href="https://forum.godotengine.org/"
        target="_blank"
        rel="noopener noreferrer"
        class="desktop-link inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
      >
        <span>官方原站</span>
        <span>↗</span>
      </a>

      <!-- Mobile Hamburger Button -->
      <n-button
        class="mobile-menu-btn"
        quaternary
        size="small"
        aria-label="打开社区导航"
        @click="showDrawer = true"
      >
        <template #icon>
          <span class="text-xl font-bold">☰</span>
        </template>
      </n-button>
    </div>

    <!-- Mobile Drawer (Full Navigation, Categories, Tags & Resources) -->
    <n-drawer v-model:show="showDrawer" width="310" placement="right">
      <n-drawer-content title="Godot 社区导航" closable>
        <div class="mobile-drawer-body">
          <!-- Search -->
          <div class="mb-4">
            <n-input
              v-model:value="keyword"
              placeholder="搜索 Godot 讨论/问答..."
              clearable
              size="small"
              round
              @keyup.enter="handleMobileSearch"
            >
              <template #prefix>🔍</template>
            </n-input>
          </div>

          <!-- Main Nav Pages -->
          <div class="drawer-group-title">核心功能</div>
          <div class="mobile-nav-list">
            <router-link to="/" class="mobile-nav-item" @click="showDrawer = false">
              <span>💬 话题流</span>
            </router-link>
            <router-link to="/categories" class="mobile-nav-item" @click="showDrawer = false">
              <span>📂 板块大厅</span>
            </router-link>
            <router-link to="/showcase" class="mobile-nav-item" @click="showDrawer = false">
              <span>🎮 作品展厅</span>
            </router-link>
            <router-link to="/sync" class="mobile-nav-item" @click="showDrawer = false">
              <span>⚡ 官方同步</span>
            </router-link>
            <router-link to="/about" class="mobile-nav-item" @click="showDrawer = false">
              <span>📖 社区指南</span>
            </router-link>
          </div>

          <!-- Quick Categories in Drawer -->
          <div class="drawer-group-title mt-5">热门求助板块</div>
          <div class="drawer-cat-grid">
            <router-link
              v-for="cat in drawerCategories"
              :key="cat.id"
              :to="`/c/${cat.slug}/${cat.id}`"
              class="drawer-cat-item"
              @click="showDrawer = false"
            >
              <span class="drawer-cat-dot" :style="{ backgroundColor: cat.color }"></span>
              <span class="truncate">{{ cat.zhName }}</span>
            </router-link>
          </div>

          <!-- Hot Tags in Drawer -->
          <div class="drawer-group-title mt-5">常用技术标签</div>
          <div class="drawer-tags-cloud">
            <n-tag
              v-for="tag in drawerTags"
              :key="tag.key"
              size="small"
              round
              class="cursor-pointer"
              @click="handleTagClick(tag.key)"
            >
              #{{ tag.label }}
            </n-tag>
          </div>

          <!-- Official Links -->
          <div class="drawer-group-title mt-5">Godot 常用链接</div>
          <div class="flex flex-col gap-2.5 text-xs text-gray-400">
            <a href="https://godotengine.org" target="_blank" class="hover:text-blue-400 flex items-center justify-between">
              <span>🌐 Godot Engine 官网</span>
              <span>↗</span>
            </a>
            <a href="https://docs.godotengine.org" target="_blank" class="hover:text-blue-400 flex items-center justify-between">
              <span>📚 官方中文文档 (Docs)</span>
              <span>↗</span>
            </a>
            <a href="https://github.com/godotengine/godot" target="_blank" class="hover:text-blue-400 flex items-center justify-between">
              <span>🐙 GitHub 引擎源码</span>
              <span>↗</span>
            </a>
            <a href="https://forum.godotengine.org/" target="_blank" class="hover:text-blue-400 flex items-center justify-between">
              <span>💬 官方论坛原站</span>
              <span>↗</span>
            </a>
          </div>

          <!-- Bottom Actions -->
          <div class="mt-6 pt-4 border-t border-gray-700/30 flex items-center justify-between text-sm">
            <span class="text-gray-400">主题外观</span>
            <n-button size="tiny" secondary @click="handleToggleTheme">
              {{ isDark ? '切换浅色 ☀️' : '切换深色 🌙' }}
            </n-button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </header>
</template>

<script setup lang="ts">
import { useTheme } from '@/hooks/useTheme'

const router = useRouter()
const message = useMessage()
const { isDark, toggleTheme } = useTheme()
const keyword = ref('')
const showDrawer = ref(false)

const drawerCategories = [
  { id: 7, slug: 'programming', zhName: '编程开发', color: '#78E5F6' },
  { id: 8, slug: 'ui', zhName: '界面 UI', color: '#78E5F6' },
  { id: 9, slug: 'physics', zhName: '物理系统', color: '#78E5F6' },
  { id: 10, slug: 'shaders', zhName: '着色特效', color: '#78E5F6' },
  { id: 11, slug: 'animation', zhName: '动画系统', color: '#78E5F6' },
  { id: 13, slug: 'networking', zhName: '网络联机', color: '#78E5F6' },
  { id: 22, slug: 'assets', zhName: '插件扩展', color: '#DF9B66' },
  { id: 24, slug: 'in-development', zhName: '在研项目', color: '#888888' }
]

const drawerTags = [
  { key: 'godot-4', label: 'Godot 4' },
  { key: 'gdscript', label: 'GDScript' },
  { key: '2d', label: '2D 游戏' },
  { key: '3d', label: '3D 渲染' },
  { key: 'shaders', label: '着色器' },
  { key: 'csharp', label: 'C#' },
  { key: 'tilemap', label: '瓦片地图' },
  { key: 'xr', label: 'XR/VR' }
]

const handleToggleTheme = () => {
  const nextIsDark = toggleTheme()
  if (nextIsDark) {
    message.success('已切换至深色模式 🌙')
  } else {
    message.info('已切换至浅色模式 ☀️')
  }
}

const handleSearch = () => {
  if (keyword.value.trim()) {
    router.push({ path: '/', query: { q: keyword.value.trim() } })
  }
}

const handleMobileSearch = () => {
  if (keyword.value.trim()) {
    showDrawer.value = false
    router.push({ path: '/', query: { q: keyword.value.trim() } })
  }
}

const handleTagClick = (tagKey: string) => {
  showDrawer.value = false
  router.push({ path: '/', query: { tag: tagKey } })
}
</script>

<style src="@/styles/header.css" scoped></style>
