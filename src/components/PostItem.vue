<template>
  <div class="post-item-card">
    <div class="post-user-row">
      <div class="post-user-info">
        <n-avatar
          round
          size="medium"
          :src="avatarUrl"
          fallback-src="https://forum.godotengine.org/uploads/default/original/2X/4/4b0a7fa8a6334634b94a13d421f0d99e6f04e21f.svg"
        />
        <div>
          <div class="username">{{ post.name || post.username }}</div>
          <div class="text-xs text-gray-400">@{{ post.username }} · {{ formattedTime }}</div>
        </div>
      </div>
      <div class="post-floor">
        #{{ post.post_number }} 楼
      </div>
    </div>

    <!-- Render Discourse cooked HTML -->
    <div class="cooked" v-html="sanitizedCooked"></div>
  </div>
</template>

<script setup lang="ts">
import type { DiscoursePost } from '@/api/types'
import { formatRelativeTime } from '@/utils/date'

const props = defineProps<{
  post: DiscoursePost
}>()

const formattedTime = computed(() => {
  return formatRelativeTime(props.post.created_at)
})

const avatarUrl = computed(() => {
  if (!props.post.avatar_template) {
    return 'https://avatars.githubusercontent.com/u/1024001?v=4'
  }
  if (props.post.avatar_template.startsWith('http')) {
    return props.post.avatar_template.replace('{size}', '64')
  }
  return `https://forum.godotengine.org${props.post.avatar_template.replace('{size}', '64')}`
})

const sanitizedCooked = computed(() => {
  return props.post.cooked || ''
})
</script>

<style src="@/styles/topic-detail.css" scoped></style>
