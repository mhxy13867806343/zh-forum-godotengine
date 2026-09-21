<template>
  <div class="showcase-container">
    <div class="showcase-banner">
      <h1 class="text-2xl font-bold text-blue-400 m-0">🎮 作品与项目展厅 (Showcase)</h1>
      <p class="text-gray-400 text-sm mt-1 mb-0">
        发现社区开发者使用 Godot 打造的独立游戏、在研项目 (DevLog) 与效率工具。
      </p>
    </div>

    <!-- Category quick filters -->
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

    <div v-if="loading && displayedTopics.length === 0" class="py-16 flex justify-center">
      <n-spin size="large" description="载入作品展厅中..." />
    </div>

    <div v-else class="flex flex-col gap-6">
      <!-- Showcase Cards Grid -->
      <div v-if="displayedTopics.length > 0" class="showcase-grid">
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

      <!-- Empty State when page or category is empty -->
      <div v-else class="showcase-empty-state">
        <div class="flex flex-col items-center justify-center py-10 px-4 gap-3 text-center">
          <span class="text-5xl">🕹️</span>
          <h3 class="text-lg font-bold text-gray-200 m-0">该分类暂无更多作品数据</h3>
          <p class="text-sm text-gray-400 max-w-md m-0">
            当前第 <span class="text-blue-400 font-semibold">{{ page }}</span> 页暂无作品内容
            <template v-if="totalCount > 0">（已超出有效页码范围，共 {{ maxPage }} 页，{{ totalCount }} 个作品）</template>。
          </p>
          <div class="flex items-center gap-3 mt-3">
            <n-button type="primary" size="small" @click="handlePageChange(1)">
              返回第 1 页
            </n-button>
            <n-button v-if="page > 1 && maxPage > 1" size="small" @click="handlePageChange(Math.min(page - 1, maxPage))">
              前往尾页 (第 {{ maxPage }} 页)
            </n-button>
          </div>
        </div>
      </div>

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

      <!-- Desktop Pagination (Strictly hidden on Mobile H5 to eliminate horizontal drag) -->
      <div v-if="!isMobile && totalCount > 0" class="flex justify-center items-center my-4 py-2">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForumTopics } from '@/hooks/useForumTopics'
import { useMobile } from '@/hooks/useMobile'
import { formatRelativeTime } from '@/utils/date'
import { translateTitle } from '@/utils/translator'
import CategoryBadge from '@/components/CategoryBadge.vue'

const route = useRoute()
const router = useRouter()
const { isMobile } = useMobile()

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
  maxPage,
  handlePageChange,
  handlePageSizeChange,
  loadTopics
} = useForumTopics()

pageSize.value = 9

const displayedTopics = computed(() => {
  return isMobile.value ? accumulatedTopics.value : paginatedTopics.value
})

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
