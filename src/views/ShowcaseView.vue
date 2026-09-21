<template>
  <div class="showcase-container">
    <div class="showcase-banner">
      <h1 class="text-2xl font-bold text-blue-400 m-0">🎮 作品与项目展厅 (Showcase)</h1>
      <p class="text-gray-400 text-sm mt-1 mb-0">
        发现社区开发者使用 Godot 打造的独立游戏、在研项目 (DevLog) 与效率工具。
      </p>
    </div>

    <!-- Category quick filters -->
    <div class="flex items-center gap-2">
      <n-button
        v-for="f in filterTabs"
        :key="f.id"
        size="small"
        :type="activeFilter === f.id ? 'primary' : 'default'"
        secondary
        @click="switchFilter(f.id, f.slug)"
      >
        {{ f.name }}
      </n-button>
    </div>

    <div v-if="loading" class="py-16 flex justify-center">
      <n-spin size="large" description="载入作品展厅中..." />
    </div>

    <div v-else class="showcase-grid">
      <div
        v-for="item in filteredTopics"
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
  </div>
</template>

<script setup lang="ts">
import { useForumTopics } from '@/hooks/useForumTopics'
import { formatRelativeTime } from '@/utils/date'
import { translateTitle } from '@/utils/translator'
import CategoryBadge from '@/components/CategoryBadge.vue'

const router = useRouter()
const { loading, filteredTopics, loadTopics } = useForumTopics()

const activeFilter = ref<number>(14)
const filterTabs = [
  { id: 14, slug: 'showcase', name: '全部作品' },
  { id: 15, slug: 'games', name: '🎮 已发布游戏' },
  { id: 24, slug: 'in-development', name: '🔨 在研游戏 (DevLog)' },
  { id: 16, slug: 'tools', name: '⚙️ 辅助工具与软件' }
]

const switchFilter = (id: number, slug: string) => {
  activeFilter.value = id
  loadTopics(id, slug)
}

const goToTopic = (id: number) => {
  router.push(`/t/${id}`)
}

onMounted(() => {
  loadTopics(14, 'showcase')
})
</script>

<style src="@/styles/showcase.css" scoped></style>
