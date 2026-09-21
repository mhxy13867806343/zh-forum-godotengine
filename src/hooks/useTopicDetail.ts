import { ref } from 'vue'
import type { DiscourseTopicDetail, DiscoursePost } from '../api/types'
import { fetchTopicDetail } from '../api/discourse'

export function useTopicDetail() {
  const loading = ref(false)
  const topic = ref<DiscourseTopicDetail | null>(null)
  const replies = ref<DiscoursePost[]>([])
  const isBilingual = ref(true)

  const loadTopic = async (topicId: number) => {
    loading.value = true
    try {
      const res = await fetchTopicDetail(topicId)
      if (res) {
        topic.value = res
        replies.value = res.post_stream?.posts || []
      }
    } catch (err) {
      console.error('Error fetching topic detail:', err)
    } finally {
      loading.value = false
    }
  }

  const toggleBilingual = () => {
    isBilingual.value = !isBilingual.value
  }

  return {
    loading,
    topic,
    replies,
    isBilingual,
    loadTopic,
    toggleBilingual
  }
}
