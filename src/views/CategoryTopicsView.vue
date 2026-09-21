<template>
  <div class="home-container">
    <PullToRefresh :on-refresh="handlePullRefresh" :disabled="!isMobile">
      <main class="home-main-feed">
        <!-- Category Header Card -->
        <div class="hero-banner">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span
                class="w-3.5 h-3.5 rounded-sm inline-block"
                :style="{ backgroundColor: catInfo.color }"
              ></span>
              <h1 class="hero-title m-0">{{ catInfo.zhName }}</h1>
              <span class="text-sm text-gray-400 font-mono">({{ catInfo.name }})</span>
            </div>
            <p class="hero-desc">
              {{ catInfo.zhDescription || catInfo.description }}
            </p>
          </div>
          <router-link to="/categories" class="text-xs text-blue-400 hover:underline">
            ← 返回板块列表
          </router-link>
        </div>

        <!-- Category Feed with Spin -->
        <n-spin :show="loading" size="large" :description="`正在同步【${catInfo.zhName}】板块话题...`">
          <div v-if="displayedTopics.length > 0" class="min-h-300px">
            <TopicCard
              v-for="topic in displayedTopics"
              :key="topic.id"
              :topic="topic"
            />

            <!-- Mobile Infinite Scroll Status -->
            <div v-if="isMobile" class="mobile-scroll-status">
              <div v-if="isLoadingMore" class="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
                <n-spin size="small" />
                <span>正在加载更多讨论...</span>
              </div>
              <div
                v-else-if="hasMoreTopics"
                class="mobile-load-trigger"
                @click="loadMore"
              >
                <span>上拉或点击加载更多 ▾</span>
              </div>
              <div v-else class="py-6 text-center text-xs text-gray-500">
                <span>—— 已载入该板块全部讨论 ——</span>
              </div>
            </div>
          </div>

          <div v-else-if="!loading" class="empty-state">
            <p class="text-lg">该板块暂无话题，或正在同步中</p>
            <router-link to="/">
              <n-button size="small">返回首页最新话题</n-button>
            </router-link>
          </div>
        </n-spin>

        <!-- Desktop Pagination (Strictly hidden on Mobile) -->
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

    <AppSidebar v-if="!isMobile" />
  </div>
</template>

<script setup lang="ts">
import { useForumTopics } from '@/hooks/useForumTopics'
import { useMobile } from '@/hooks/useMobile'
import { getCategoryInfo } from '@/utils/categoryDict'
import TopicCard from '@/components/TopicCard.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import PullToRefresh from '@/components/PullToRefresh.vue'

const route = useRoute()
const message = useMessage()
const { isMobile } = useMobile()

const categoryId = computed(() => Number(route.params.id))
const categorySlug = computed(() => route.params.slug as string)
const catInfo = computed(() => getCategoryInfo(categoryId.value))

const {
  loading,
  paginatedTopics,
  accumulatedTopics,
  isLoadingMore,
  hasMoreTopics,
  loadMore,
  page,
  pageSize,
  totalCount,
  handlePageChange,
  handlePageSizeChange,
  loadTopics,
  refresh
} = useForumTopics()

const displayedTopics = computed(() => {
  return isMobile.value ? accumulatedTopics.value : paginatedTopics.value
})

const handlePullRefresh = async () => {
  try {
    await refresh()
    message?.success(`已刷新【${catInfo.value.zhName}】板块数据 🔄`)
  } catch {
    message?.error('刷新失败，请检查网络连接')
  }
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadTopics(Number(newId), categorySlug.value)
    }
  },
  { immediate: true }
)
</script>

<style src="@/styles/home.css" scoped></style>
