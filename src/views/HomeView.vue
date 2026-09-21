<template>
  <div class="home-container">
    <PullToRefresh :on-refresh="handlePullRefresh" :disabled="!isMobile">
      <main class="home-main-feed">
        <!-- Hero Banner -->
        <div class="hero-banner">
          <div class="hero-text-wrap">
            <h1 class="hero-title">欢迎来到 Godot 中文论坛 🎮</h1>
            <p class="hero-desc">
              汇聚全球与中文开发者，实时同步 Godot 官方技术讨论、疑难解答、游戏展厅与开源资产。用 GDScript 与 C# 创造属于你的数字世界！
            </p>
          </div>
          <div class="hero-action-wrap">
            <n-button
              type="primary"
              secondary
              :loading="isRefreshing"
              :disabled="refreshCooldown > 0"
              class="refresh-btn"
              @click="handleRefreshTopics"
            >
              <template #icon>
                <span class="spin-icon" :class="{ 'is-spinning': isRefreshing }">🔄</span>
              </template>
              <span v-if="isRefreshing">正在同步{{ currentTabLabel }}...</span>
              <span v-else-if="refreshCooldown > 0">⏳ {{ refreshCooldown }}s 后可刷新</span>
              <span v-else>刷新{{ currentTabLabel }}</span>
            </n-button>
          </div>
        </div>

        <!-- Sticky Feed Header & Categories (Fixed on both PC and Mobile) -->
        <div class="feed-sticky-header">
          <!-- Feed Filter Tabs -->
          <div class="feed-header-bar">
            <n-tabs :value="currentTab" type="segment" size="small" @update:value="handleTabChange">
              <n-tab name="latest">🔥 最新讨论</n-tab>
              <n-tab name="top">🏆 热门榜单</n-tab>
              <n-tab name="hot">⭐ 精选问答</n-tab>
            </n-tabs>

            <div v-if="selectedTag" class="flex items-center gap-2 text-sm">
              <span>当前标签：</span>
              <n-tag closable size="small" type="info" @close="clearTag">
                #{{ selectedTag }}
              </n-tag>
            </div>
          </div>

          <!-- Quick Category Horizontal Pills Bar (Fixed on both PC and Mobile) -->
          <div class="category-pills-bar">
            <div
              class="cat-pill"
              :class="{ active: selectedCategoryId === null }"
              @click="selectMobileCategory(null)"
            >
              全部板块
            </div>
            <div
              v-for="cat in mobileCategories"
              :key="cat.id"
              class="cat-pill"
              :class="{ active: selectedCategoryId === cat.id }"
              @click="selectMobileCategory(cat.id, cat.slug)"
            >
              <span class="cat-dot" :style="{ backgroundColor: cat.color }"></span>
              <span>{{ cat.zhName }}</span>
            </div>
          </div>

          <!-- Dynamic Loading Progress Bar (0% ... 100%) -->
          <transition name="fade">
            <div v-if="loading" class="category-loading-progress mt-1">
              <div class="flex items-center justify-between text-xs text-blue-400 mb-1 px-1">
                <span class="flex items-center gap-1.5 font-medium">
                  <span class="spin-icon is-spinning text-xs">🔄</span>
                  <span>正在同步论坛数据...</span>
                </span>
                <span class="font-mono font-bold text-blue-400">{{ loadingProgress }}%</span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :style="{ width: `${loadingProgress}%` }"
                ></div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Feed Content Area with Spin -->
        <n-spin :show="loading && displayedTopics.length > 0" size="large" description="正在同步论坛话题...">
          <div class="feed-content-area min-h-420px flex flex-col justify-start">
            <!-- Initial / Empty Loading State (Centered with 0% ... 100% Progress) -->
            <div v-if="loading && displayedTopics.length === 0" class="flex flex-col items-center justify-center py-24 text-center gap-3">
              <span class="text-4xl">💬</span>
              <p class="text-gray-300 text-sm font-medium m-0">正在同步论坛话题数据，请稍候...</p>
              <div class="w-280px max-w-full my-2">
                <div class="flex items-center justify-between text-xs text-blue-400 mb-1 px-0.5">
                  <span>同步进度</span>
                  <span class="font-mono font-bold">{{ loadingProgress }}%</span>
                </div>
                <div class="progress-track-large">
                  <div
                    class="progress-fill"
                    :style="{ width: `${loadingProgress}%` }"
                  ></div>
                </div>
              </div>
              <span class="text-xs text-gray-500">已载入 {{ loadingProgress }}%</span>
            </div>

            <!-- Topics List -->
            <div v-else-if="displayedTopics.length > 0" class="min-h-300px">
              <TopicCard
                v-for="topic in displayedTopics"
                :key="topic.id"
                :topic="topic"
              />

              <!-- Mobile Infinite Scroll Status (Pull-Up to Load More) -->
              <div v-if="isMobile" class="mobile-scroll-status">
                <div v-if="isLoadingMore" class="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
                  <n-spin size="small" />
                  <span>正在载入更多讨论...</span>
                </div>
                <div
                  v-else-if="hasMoreTopics"
                  class="mobile-load-trigger"
                  @click="loadMore"
                >
                  <span>上拉或点击载入更多 ▾</span>
                </div>
                <div v-else class="py-6 text-center text-xs text-gray-500">
                  <span>—— 已加载全部 {{ displayedTopics.length }} 条讨论 ——</span>
                </div>
              </div>
            </div>

            <!-- Error State (502 or Network Error) -->
            <div v-else-if="hasError && !loading" class="empty-state">
              <span class="text-5xl inline-block mb-3">⚠️</span>
              <p class="text-lg font-bold text-red-400 m-0">话题数据加载失败</p>
              <p class="text-sm text-gray-400 max-w-md mx-auto mt-2 mb-0">
                {{ errorMessage || '无法连接到官方论坛接口或遭遇 502 网关超时，请点击下方按钮重新加载。' }}
              </p>
              <div class="flex gap-3 justify-center mt-5">
                <n-button type="primary" size="medium" :loading="loading" @click="refresh">
                  <template #icon>🔄</template>
                  立即刷新重试
                </n-button>
                <n-button v-if="page > 1" size="medium" @click="handlePageChange(1)">返回第 1 页</n-button>
                <n-button size="medium" @click="resetFilters">重置所有筛选</n-button>
              </div>
            </div>

            <!-- Empty State (Only show when NOT loading and zero topics) -->
            <div v-else-if="!loading && displayedTopics.length === 0" class="empty-state">
              <p class="text-lg">暂无匹配的话题数据</p>
              <p v-if="page > 1" class="text-sm text-gray-400">
                当前第 {{ page }} 页暂无内容（已超出数据范围，共 {{ maxPage }} 页）。
              </p>
              <div class="flex gap-2 justify-center mt-3">
                <n-button type="primary" size="small" :loading="loading" @click="refresh">
                  <template #icon>🔄</template>
                  刷新数据
                </n-button>
                <n-button v-if="page > 1" size="small" @click="handlePageChange(1)">返回第 1 页</n-button>
                <n-button size="small" @click="resetFilters">重置筛选条件</n-button>
              </div>
            </div>
          </div>
        </n-spin>

        <!-- Desktop Pagination (Strictly hidden on Mobile H5 to eliminate horizontal overflow) -->
        <div v-if="!isMobile && totalCount > 0" class="flex justify-center items-center my-6 py-2">
          <n-pagination
            v-model:page="page"
            v-model:page-size="pageSize"
            :item-count="totalCount"
            :page-sizes="[10, 20, 30]"
            show-size-picker
            show-quick-jumper
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </main>
    </PullToRefresh>

    <!-- Sidebar (Desktop only; mobile uses the drawer and top pills) -->
    <AppSidebar v-if="!isMobile" @tag-select="handleTagSelect" />
  </div>
</template>

<script setup lang="ts">
import { useForumTopics } from '@/hooks/useForumTopics'
import { useMobile } from '@/hooks/useMobile'
import TopicCard from '@/components/TopicCard.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import PullToRefresh from '@/components/PullToRefresh.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { isMobile } = useMobile()

const {
  loading,
  loadingProgress,
  hasError,
  errorMessage,
  paginatedTopics,
  accumulatedTopics,
  isLoadingMore,
  hasMoreTopics,
  loadMore,
  page,
  pageSize,
  totalCount,
  maxPage,
  handlePageChange,
  handlePageSizeChange,
  currentTab,
  searchQuery,
  selectedTag,
  selectedCategoryId,
  loadTopics,
  refresh,
  setTab,
  setCategory,
  setTag
} = useForumTopics()

const displayedTopics = computed(() => {
  return isMobile.value ? accumulatedTopics.value : paginatedTopics.value
})

const tabNameMap: Record<string, string> = {
  latest: '最新讨论',
  top: '热门榜单',
  hot: '精选问答'
}

const currentTabLabel = computed(() => tabNameMap[currentTab.value] || '话题数据')

const mobileCategories = [
  { id: 7, slug: 'programming', zhName: '编程开发', color: '#78E5F6' },
  { id: 8, slug: 'ui', zhName: '界面 UI', color: '#78E5F6' },
  { id: 9, slug: 'physics', zhName: '物理系统', color: '#78E5F6' },
  { id: 10, slug: 'shaders', zhName: '着色特效', color: '#78E5F6' },
  { id: 20, slug: '2d', zhName: '2D 游戏', color: '#78E5F6' },
  { id: 21, slug: '3d', zhName: '3D 渲染', color: '#78E5F6' },
  { id: 13, slug: 'networking', zhName: '网络联机', color: '#78E5F6' },
  { id: 22, slug: 'assets', zhName: '插件扩展', color: '#DF9B66' }
]

const selectMobileCategory = (catId: number | null, slug?: string) => {
  setCategory(catId, slug)
}

const isRefreshing = ref(false)
const refreshCooldown = ref(0)
let cooldownTimer: any = null

const startRefreshCooldown = (seconds = 10) => {
  refreshCooldown.value = seconds
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    if (refreshCooldown.value > 1) {
      refreshCooldown.value--
    } else {
      refreshCooldown.value = 0
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

const handleTabChange = (tabName: string) => {
  setTab(tabName as 'latest' | 'top' | 'hot')
}

const handleTagSelect = (tag: string) => {
  setTag(tag)
}

const clearTag = () => {
  setTag(null)
}

const resetFilters = async () => {
  await setTag(null)
  searchQuery.value = ''
  await router.push({ path: '/' })
  loadTopics()
}

const handleRefreshTopics = async () => {
  if (isRefreshing.value || refreshCooldown.value > 0) return
  isRefreshing.value = true
  startRefreshCooldown(10)
  try {
    await refresh()
    message.success(`已拉取并同步官方【${currentTabLabel.value}】最新数据 🔄`)
  } catch {
    message.error('刷新失败，请检查网络连接')
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 450)
  }
}

const handlePullRefresh = async () => {
  try {
    await refresh()
    message.success(`已同步最新【${currentTabLabel.value}】话题 🔄`)
  } catch {
    message.error('刷新失败，请检查网络连接')
  }
}

// Touch / Scroll listener for mobile infinite scroll (pull-up to load more)
const handleMobileScroll = () => {
  if (!isMobile.value) return
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight = window.innerHeight || document.documentElement.clientHeight

  if (scrollTop + clientHeight >= scrollHeight - 220) {
    loadMore()
  }
}

onMounted(() => {
  loadTopics()
  window.addEventListener('scroll', handleMobileScroll, { passive: true })
})

onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
    cooldownTimer = null
  }
  window.removeEventListener('scroll', handleMobileScroll)
})

watch(
  () => route.query.q,
  (newQ) => {
    searchQuery.value = (newQ as string) || ''
  },
  { immediate: true }
)

watch(
  () => route.query.tag,
  (newTag) => {
    if (newTag) {
      setTag(newTag as string)
    }
  },
  { immediate: true }
)
</script>

<style src="@/styles/home.css" scoped></style>
