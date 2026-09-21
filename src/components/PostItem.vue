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

    <div class="post-actions">
      <n-button
        quaternary
        size="small"
        :type="liked ? 'error' : 'default'"
        @click="toggleLike"
      >
        <template #icon>
          <span>{{ liked ? '❤️' : '🤍' }}</span>
        </template>
        <span>{{ likeCount }}</span>
      </n-button>

      <n-button quaternary size="small" @click="handleReply">
        <template #icon>
          <span>💬</span>
        </template>
        <span>回复</span>
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiscoursePost } from '@/api/types'
import { formatRelativeTime } from '@/utils/date'

const props = defineProps<{
  post: DiscoursePost
}>()

const emit = defineEmits<{
  (e: 'reply-to', username: string): void
}>()

import { toggleLikeApi } from '@/api/topics'

const liked = ref(false)
const likeCount = ref(props.post.score || 0)

const toggleLike = async () => {
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
  try {
    await toggleLikeApi({
      postId: props.post.id,
      liked: liked.value
    })
  } catch {
    // ignore
  }
}

const handleReply = () => {
  emit('reply-to', props.post.username)
}

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
