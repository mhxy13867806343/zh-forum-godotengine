<template>
  <div class="home-container">
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

      <!-- Loading State -->
      <div v-if="loading" class="py-12 flex justify-center">
        <n-spin size="large" description="加载该板块话题中..." />
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

      <div v-else class="empty-state">
        <p class="text-lg">该板块暂无话题，或正在同步中</p>
        <router-link to="/">
          <n-button size="small">返回首页最新话题</n-button>
        </router-link>
      </div>
    </main>

    <AppSidebar />
  </div>
</template>

<script setup lang="ts">
import { useForumTopics } from '@/hooks/useForumTopics'
import { getCategoryInfo } from '@/utils/categoryDict'
import TopicCard from '@/components/TopicCard.vue'
import AppSidebar from '@/components/AppSidebar.vue'

const route = useRoute()
const categoryId = computed(() => Number(route.params.id))
const categorySlug = computed(() => route.params.slug as string)
const catInfo = computed(() => getCategoryInfo(categoryId.value))

const {
  loading,
  filteredTopics,
  paginatedTopics,
  page,
  pageSize,
  totalCount,
  handlePageChange,
  handlePageSizeChange,
  loadTopics
} = useForumTopics()

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
