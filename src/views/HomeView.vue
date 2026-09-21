<template>
  <div class="home-container">
    <main class="home-main-feed">
      <!-- Hero Banner -->
      <div class="hero-banner">
        <div>
          <h1 class="hero-title">欢迎来到 Godot 中文论坛 🎮</h1>
          <p class="hero-desc">
            汇聚全球与中文开发者，实时同步 Godot 官方技术讨论、疑难解答、游戏展厅与开源资产。用 GDScript 与 C# 创造属于你的数字世界！
          </p>
        </div>
        <div class="hidden sm:block text-right">
          <n-button
            type="primary"
            secondary
            :loading="isRefreshing"
            class="refresh-btn"
            @click="handleRefreshTopics"
          >
            <template #icon>
              <span class="spin-icon" :class="{ 'is-spinning': isRefreshing }">🔄</span>
            </template>
            <span>{{ isRefreshing ? '正在同步最新讨论...' : '刷新数据' }}</span>
          </n-button>
        </div>
      </div>

      <!-- Feed Filter Tabs -->
      <div class="feed-header-bar">
        <n-tabs :value="currentTab" type="segment" size="small" @update:value="handleTabChange">
          <n-tab name="latest">🔥 最新讨论</n-tab>
          <n-tab name="top">🏆 热门榜单</n-tab>
          <n-tab name="hot">⭐ 精选问答</n-tab>
        </n-tabs>

        <div v-if="selectedTag" class="flex items-center gap-2 text-sm">
          <span>当前筛选标签：</span>
          <n-tag closable size="small" type="info" @close="clearTag">
            #{{ selectedTag }}
          </n-tag>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-12 flex justify-center">
        <n-spin size="large" description="正在同步论坛话题..." />
      </div>

      <!-- Topics List -->
      <div v-else-if="filteredTopics.length > 0">
        <TopicCard
          v-for="topic in paginatedTopics"
          :key="topic.id"
          :topic="topic"
        />

        <!-- Pagination -->
        <div class="flex justify-center items-center my-6 py-2">
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
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p class="text-lg">暂无匹配的话题数据</p>
        <n-button size="small" @click="resetFilters">重置筛选条件</n-button>
      </div>
    </main>

    <!-- Sidebar -->
    <AppSidebar @tag-select="handleTagSelect" />
  </div>
</template>

<script setup lang="ts">
import { useForumTopics } from '@/hooks/useForumTopics'
import TopicCard from '@/components/TopicCard.vue'
import AppSidebar from '@/components/AppSidebar.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const {
  loading,
  filteredTopics,
  paginatedTopics,
  page,
  pageSize,
  totalCount,
  handlePageChange,
  handlePageSizeChange,
  currentTab,
  searchQuery,
  selectedTag,
  loadTopics,
  refresh,
  setTab,
  setTag
} = useForumTopics()

const isRefreshing = ref(false)

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
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await refresh()
    message.success('已拉取并同步官方论坛最新数据 🔄')
  } catch {
    message.error('刷新失败，请检查网络连接')
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 450)
  }
}

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

onMounted(() => {
  loadTopics()
})
</script>

<style src="@/styles/home.css" scoped></style>
