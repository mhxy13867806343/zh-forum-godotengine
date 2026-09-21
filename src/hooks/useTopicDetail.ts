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

  const submitReply = (content: string, authorName = 'Godot 探索者') => {
    if (!content.trim() || !topic.value) return false
    const newPost: DiscoursePost = {
      id: Date.now(),
      name: authorName,
      username: 'community_member',
      avatar_template: 'https://avatars.githubusercontent.com/u/1024004?v=4',
      created_at: new Date().toISOString(),
      cooked: `<p>${content.replace(/\n/g, '<br/>')}</p>`,
      post_number: (replies.value.length || 0) + 1,
      post_type: 1,
      updated_at: new Date().toISOString(),
      reply_count: 0,
      quote_count: 0,
      incoming_link_count: 0,
      reads: 1,
      readers_count: 1,
      score: 0,
      yours: true,
      topic_id: topic.value.id,
      topic_slug: topic.value.slug,
      display_username: authorName,
      version: 1,
      can_edit: true,
      can_delete: true,
      can_recover: false,
      can_see_hidden_post: false,
      can_wiki: false,
      moderator: false,
      admin: false,
      staff: false,
      user_id: 99999,
      hidden: false,
      trust_level: 1,
      user_deleted: false,
      can_view_edit_history: false,
      wiki: false
    }
    replies.value.push(newPost)
    topic.value.posts_count += 1
    topic.value.reply_count += 1
    return true
  }

  return {
    loading,
    topic,
    replies,
    isBilingual,
    loadTopic,
    toggleBilingual,
    submitReply
  }
}
