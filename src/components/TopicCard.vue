<template>
  <div class="topic-card" @click="goToDetail">
    <div class="topic-header">
      <div class="topic-title-area">
        <h3 class="topic-title">
          <span v-if="topic.pinned" class="mr-1.5 text-orange-400 font-bold" title="置顶">📌</span>
          <span>{{ displayTitle }}</span>
        </h3>
        <div class="topic-meta-row">
          <CategoryBadge :category-id="topic.category_id" />
          <span>{{ relativeTime }}</span>
          <span v-if="topic.tags && topic.tags.length > 0" class="flex items-center gap-1">
            <n-tag
              v-for="t in topic.tags"
              :key="getTagName(t)"
              size="small"
              round
              :bordered="false"
              class="text-xs"
            >
              #{{ translateTag(t) }}
            </n-tag>
          </span>
        </div>
      </div>

      <div class="topic-stats">
        <div class="stat-item" title="回复数">
          <span>💬</span>
          <span>{{ topic.posts_count }}</span>
        </div>
        <div class="stat-item" title="浏览量">
          <span>👁️</span>
          <span>{{ topic.views }}</span>
        </div>
        <div class="stat-item" title="点赞数">
          <span>❤️</span>
          <span>{{ topic.like_count }}</span>
        </div>
      </div>
    </div>

    <div v-if="topic.excerpt" class="topic-excerpt">
      {{ topic.excerpt }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiscourseTopic } from '@/api/types'
import { formatRelativeTime } from '@/utils/date'
import { translateTitle, translateTag, getTagName } from '@/utils/translator'
import CategoryBadge from './CategoryBadge.vue'

const props = defineProps<{
  topic: DiscourseTopic
}>()

const router = useRouter()

const displayTitle = computed(() => {
  return translateTitle(props.topic.title)
})

const relativeTime = computed(() => {
  return formatRelativeTime(props.topic.bumped_at || props.topic.created_at)
})

const goToDetail = () => {
  router.push(`/t/${props.topic.id}`)
}
</script>

<style src="@/styles/topic-card.css" scoped></style>
