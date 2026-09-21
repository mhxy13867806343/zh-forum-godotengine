<template>
  <div class="showcase-container">
    <PullToRefresh :on-refresh="handlePullRefresh" :disabled="!isMobile">
      <div class="showcase-banner">
        <h1 class="text-2xl font-bold text-blue-400 m-0">🎮 作品与项目展厅 (Showcase)</h1>
        <p class="text-gray-400 text-sm mt-1 mb-0">
          发现社区开发者使用 Godot 打造的独立游戏、在研项目 (DevLog) 与效率工具。
        </p>
      </div>

      <!-- Category quick filters (Sticky on PC & Mobile) -->
      <div class="showcase-sticky-header">
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <n-button
            v-for="f in filterTabs"
            :key="f.id"
            size="small"
            :type="activeFilter === f.id ? 'primary' : 'default'"
            secondary
            class="flex-shrink-0"
            @click="switchFilter(f.id, f.slug)"
          >
            {{ f.name }}
          </n-button>
        </div>

        <!-- Dynamic Loading Progress Bar (0% ... 100%, only when topics exist on screen) -->
        <transition name="fade">
          <div v-if="loading && displayedTopics.length > 0" class="category-loading-progress mt-1">
            <div class="flex items-center justify-between text-xs text-blue-400 mb-1 px-1">
              <span class="flex items-center gap-1.5 font-medium">
                <span class="spin-icon is-spinning text-xs">🔄</span>
                <span>正在同步作品数据...</span>
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

      <!-- Showcase Content Area with Spin -->
      <n-spin :show="loading && displayedTopics.length > 0" size="large" description="正在同步作品展厅...">
        <div class="showcase-content-area min-h-420px flex flex-col justify-start">
          <!-- Initial / Empty Loading State (Centered with 0% ... 100% Progress) -->
          <div v-if="loading && displayedTopics.length === 0" class="flex flex-col items-center justify-center py-24 text-center gap-3">
            <span class="text-4xl">🕹️</span>
            <p class="text-gray-300 text-sm font-medium m-0">正在同步官方作品展厅数据，请稍候...</p>
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

          <!-- Showcase Cards Grid -->
          <div v-else-if="displayedTopics.length > 0" class="showcase-grid min-h-300px">
            <div
              v-for="item in displayedTopics"
              :key="item.id"
              class="showcase-card"
              @click="goToTopic(item.id)"
            >
              <div class="showcase-cover">
                <img
                  v-if="item.image_url"
                  :src="item.image_url"
                  alt="Cover"
                />
                <div v-else class="flex flex-col items-center justify-center text-gray-500 gap-2">
                  <span class="text-4xl">🕹️</span>
                  <span class="text-xs">Godot 引擎开发项目</span>
                </div>
              </div>

              <div class="showcase-body">
                <div class="flex items-center justify-between">
                  <CategoryBadge :category-id="item.category_id" />
                  <span class="text-xs text-gray-400">❤️ {{ item.like_count }}</span>
                </div>

                <h3 class="showcase-title">
                  {{ translateTitle(item.title) }}
                </h3>

                <p class="showcase-desc">
                  {{ item.excerpt || '点击查看该游戏的开发心得与试玩链接。' }}
                </p>

                <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-700/30 text-xs text-gray-400">
                  <span>💬 {{ item.posts_count }} 讨论</span>
                  <span>{{ formatRelativeTime(item.bumped_at || item.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Error State: 502 Bad Gateway / Network Error -->
          <div v-else-if="hasError && !loading" class="showcase-empty-state">
            <div class="flex flex-col items-center justify-center py-14 px-4 gap-3 text-center">
              <span class="text-5xl">⚠️</span>
              <h3 class="text-lg font-bold text-red-400 m-0">作品数据加载失败</h3>
              <p class="text-sm text-gray-400 max-w-md m-0">
                {{ errorMessage || '官方论坛接口响应中断或遭遇 502 网关超时。' }}
              </p>
              <div class="flex items-center gap-3 mt-4">
                <n-button type="primary" size="medium" :loading="loading" @click="refresh">
                  <template #icon>🔄</template>
                  重新加载 (立即刷新)
                </n-button>
                <n-button v-if="page > 1" size="medium" @click="handlePageChange(1)">
                  返回第 1 页
                </n-button>
              </div>
            </div>
          </div>

          <!-- Empty State when page or category is empty -->
          <div v-else-if="!loading" class="showcase-empty-state">
            <div class="flex flex-col items-center justify-center py-10 px-4 gap-3 text-center">
              <span class="text-5xl">🕹️</span>
              <h3 class="text-lg font-bold text-gray-200 m-0">该分类暂无更多作品数据</h3>
              <p class="text-sm text-gray-400 max-w-md m-0">
                当前第 <span class="text-blue-400 font-semibold">{{ page }}</span> 页暂无作品内容
                <template v-if="totalCount > 0">（已超出有效页码范围，共 {{ maxPage }} 页，{{ totalCount }} 个作品）</template>。
              </p>
              <div class="flex items-center gap-3 mt-3">
                <n-button type="primary" size="small" :loading="loading" @click="refresh">
                  <template #icon>🔄</template>
                  刷新当前数据
                </n-button>
                <n-button size="small" @click="handlePageChange(1)">
                  返回第 1 页
                </n-button>
                <n-button v-if="page > 1 && maxPage > 1" size="small" @click="handlePageChange(Math.min(page - 1, maxPage))">
                  前往尾页 (第 {{ maxPage }} 页)
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </n-spin>

        <!-- Mobile Infinite Scroll Status -->
        <div v-if="isMobile && displayedTopics.length > 0" class="mobile-scroll-status">
          <div v-if="isLoadingMore" class="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
            <n-spin size="small" />
            <span>正在加载更多作品...</span>
          </div>
          <div
            v-else-if="hasMoreTopics"
            class="mobile-load-trigger"
            @click="loadMore"
          >
            <span>上拉或点击加载更多作品 ▾</span>
          </div>
          <div v-else class="py-6 text-center text-xs text-gray-500">
            <span>—— 已载入全部 {{ displayedTopics.length }} 款社区作品 ——</span>
          </div>
        </div>

        <!-- Desktop Pagination (Hidden while loading / when progress is not 100%) -->
        <div v-if="!isMobile && !loading && totalCount > 0" class="flex justify-center items-center my-4 py-2">
          <n-pagination
            v-model:page="page"
            v-model:page-size="pageSize"
            :item-count="totalCount"
            :page-sizes="[9, 12, 18]"
            show-size-picker
            show-quick-jumper
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </PullToRefresh>
    </div>
  </template>

<script setup lang="ts">
import { useForumTopics } from '@/hooks/useForumTopics'
import { useMobile } from '@/hooks/useMobile'
import { formatRelativeTime } from '@/utils/date'
import { translateTitle } from '@/utils/translator'
import CategoryBadge from '@/components/CategoryBadge.vue'
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
  loadTopics,
  refresh
} = useForumTopics()

pageSize.value = 9

const displayedTopics = computed(() => {
  return isMobile.value ? accumulatedTopics.value : paginatedTopics.value
})

const handlePullRefresh = async () => {
  try {
    await refresh()
    message?.success('已刷新作品展厅数据 🔄')
  } catch {
    message?.error('刷新失败，请检查网络连接')
  }
}

const filterTabs = [
  { id: 14, slug: 'showcase', name: '全部作品' },
  { id: 15, slug: 'games', name: '🎮 已发布游戏' },
  { id: 24, slug: 'in-development', name: '🔨 在研游戏 (DevLog)' },
  { id: 16, slug: 'tools', name: '⚙️ 辅助工具与软件' }
]

const getTabBySlug = (slug?: string) => {
  return filterTabs.find((f) => f.slug === slug) || filterTabs[0]
}

const initialFilterTab = getTabBySlug(route.query.filter as string)
const activeFilter = ref<number>(initialFilterTab.id)

const switchFilter = (id: number, slug: string) => {
  activeFilter.value = id
  page.value = 1

  const query = { ...route.query }
  delete query.page
  if (slug !== 'showcase') {
    query.filter = slug
  } else {
    delete query.filter
  }
  router.push({ query })
  loadTopics(id, slug)
}

const goToTopic = (id: number) => {
  router.push(`/t/${id}`)
}

const handleMobileScroll = () => {
  if (!isMobile.value) return
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight = window.innerHeight || document.documentElement.clientHeight

  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMore()
  }
}

watch(
  () => route.query.filter,
  (newFilterSlug) => {
    const target = getTabBySlug(newFilterSlug as string)
    if (target.id !== activeFilter.value) {
      activeFilter.value = target.id
      loadTopics(target.id, target.slug)
    }
  }
)

onMounted(() => {
  const initialPage = route.query.page ? Math.max(1, Number(route.query.page) || 1) : 1
  loadTopics(initialFilterTab.id, initialFilterTab.slug, initialPage)
  window.addEventListener('scroll', handleMobileScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleMobileScroll)
})
</script>

<style src="@/styles/showcase.css" scoped></style>
