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

        <!-- Dynamic Loading Progress Bar (0% ... 100%, only when topics exist on screen) -->
        <transition name="fade">
          <div v-if="loading && displayedTopics.length > 0" class="category-loading-progress mt-1">
            <div class="flex items-center justify-between text-xs text-blue-400 mb-1 px-1">
              <span class="flex items-center gap-1.5 font-medium">
                <span class="spin-icon is-spinning text-xs">🔄</span>
                <span>正在同步【{{ catInfo.zhName }}】板块数据...</span>
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

        <!-- Category Feed with Spin -->
        <n-spin :show="loading && displayedTopics.length > 0" size="large" :description="`正在同步【${catInfo.zhName}】板块话题...`">
          <div class="feed-content-area min-h-420px flex flex-col justify-start">
            <!-- Initial / Empty Loading State (Centered with 0% ... 100% Progress) -->
            <div v-if="loading && displayedTopics.length === 0" class="flex flex-col items-center justify-center py-24 text-center gap-3">
              <span class="text-4xl">📂</span>
              <p class="text-gray-300 text-sm font-medium m-0">正在同步【{{ catInfo.zhName }}】板块话题数据，请稍候...</p>
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

            <!-- Error State: 502 or Network Error -->
            <div v-else-if="hasError && !loading" class="empty-state">
              <span class="text-5xl inline-block mb-3">⚠️</span>
              <p class="text-lg font-bold text-red-400 m-0">该板块话题加载失败</p>
              <p class="text-sm text-gray-400 max-w-md mx-auto mt-2 mb-0">
                {{ errorMessage || '无法连接到官方论坛接口或遭遇 502 网关超时，请点击下方按钮重新加载。' }}
              </p>
              <div class="flex gap-3 justify-center mt-5">
                <n-button type="primary" size="medium" :loading="loading" @click="refresh">
                  <template #icon>🔄</template>
                  立即刷新重试
                </n-button>
                <router-link to="/">
                  <n-button size="medium">返回首页</n-button>
                </router-link>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="!loading && displayedTopics.length === 0" class="empty-state">
              <p class="text-lg">该板块暂无话题，或正在同步中</p>
              <div class="flex gap-3 justify-center mt-3">
                <n-button type="primary" size="small" :loading="loading" @click="refresh">
                  <template #icon>🔄</template>
                  刷新板块数据
                </n-button>
                <router-link to="/">
                  <n-button size="small">返回首页最新话题</n-button>
                </router-link>
              </div>
            </div>
          </div>
        </n-spin>

        <!-- Desktop Pagination (Hidden while loading / when progress is not 100%) -->
        <div v-if="!isMobile && !loading && totalCount > 0" class="flex justify-center items-center my-6 py-2">
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
