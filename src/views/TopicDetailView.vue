<template>
  <div class="topic-detail-container">
    <div class="flex items-center justify-between">
      <n-button quaternary size="small" @click="goBack">
        ← 返回话题列表
      </n-button>
      <div class="flex items-center gap-2">
        <n-button size="small" secondary @click="toggleBilingual">
          {{ isBilingual ? '切换英文原版' : '查看中文对照' }}
        </n-button>
        <a
          v-if="topic"
          :href="`https://forum.godotengine.org/t/${topic.slug}/${topic.id}`"
          target="_blank"
          class="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          <span>官方原帖</span>
          <span>↗</span>
        </a>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 flex justify-center">
      <n-spin size="large" description="正在载入帖子完整内容与楼层..." />
    </div>

    <div v-else-if="topic" class="flex flex-col gap-5">
      <!-- Topic Header Card -->
      <div class="topic-header-card">
        <h1 class="detail-title">{{ topic.title }}</h1>
        <div v-if="isBilingual && translatedTitle !== topic.title" class="detail-zh-title">
          <span>🇨🇳 中文释义：</span>
          <span class="font-medium">{{ translatedTitle }}</span>
        </div>

        <div class="detail-meta">
          <CategoryBadge :category-id="topic.category_id" />
          <span>创建于 {{ formatTime(topic.created_at) }}</span>
          <span>{{ topic.views }} 次浏览</span>
          <span>{{ topic.like_count }} 点赞</span>
          <span v-if="topic.tags && topic.tags.length > 0" class="flex items-center gap-1">
            <n-tag
              v-for="t in topic.tags"
              :key="getTagName(t)"
              size="small"
              round
              :bordered="false"
            >
              #{{ translateTag(t) }}
            </n-tag>
          </span>
        </div>
      </div>

      <!-- Replies & Posts Stream -->
      <div class="posts-list">
        <PostItem
          v-for="post in replies"
          :key="post.id"
          :post="post"
          @reply-to="handleReplyTo"
        />
      </div>

      <!-- Quick Reply Box -->
      <div class="reply-box-card">
        <h3 class="text-base font-semibold mb-3">发表快速回复 / 讨论</h3>
        <n-input
          v-model:value="replyContent"
          type="textarea"
          placeholder="在此输入您对该技术问题的见解或补充..."
          :rows="4"
          class="mb-3"
        />
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-400">支持 Markdown 语法与代码块</span>
          <n-button type="primary" :disabled="!replyContent.trim()" @click="onSendReply">
            发送回复
          </n-button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 text-gray-400">
      <p>未找到该话题内容或连接受限</p>
      <n-button size="small" @click="goBack">返回首页</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTopicDetail } from '@/hooks/useTopicDetail'
import { formatDateTime } from '@/utils/date'
import { translateTitle, translateTag, getTagName } from '@/utils/translator'
import CategoryBadge from '@/components/CategoryBadge.vue'
import PostItem from '@/components/PostItem.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const topicId = computed(() => Number(route.params.id))
const { loading, topic, replies, isBilingual, loadTopic, toggleBilingual, submitReply } = useTopicDetail()

const replyContent = ref('')

const translatedTitle = computed(() => {
  return topic.value ? translateTitle(topic.value.title) : ''
})

const formatTime = (timeStr: string) => {
  return formatDateTime(timeStr)
}

const goBack = () => {
  router.back()
}

const handleReplyTo = (username: string) => {
  replyContent.value = `@${username} `
}

const onSendReply = () => {
  if (submitReply(replyContent.value)) {
    message.success('回复已成功发送到本地讨论流！')
    replyContent.value = ''
  }
}

watch(
  topicId,
  (newId) => {
    if (newId) {
      loadTopic(newId)
    }
  },
  { immediate: true }
)
</script>

<style src="@/styles/topic-detail.css" scoped></style>
