import request from './request'
import type { DiscourseTopic, DiscourseTopicDetail, DiscourseCategory } from './types'
import { MOCK_TOPICS, MOCK_TOPIC_DETAILS } from './mockData'
import { getCategoryApiPath } from '../utils/categoryDict'

export async function fetchCategories(): Promise<DiscourseCategory[]> {
  try {
    const res: any = await request.get('/discourse/categories.json')
    if (res?.category_list?.categories) {
      return res.category_list.categories
    }
  } catch (err) {
    console.info('[Categories] Using local category cache.')
  }
  return []
}

export async function fetchLatestTopics(page = 0): Promise<{ topics: DiscourseTopic[]; more_topics_url?: string }> {
  try {
    const res: any = await request.get(`/discourse/latest.json?page=${page}`)
    if (res?.topic_list?.topics) {
      return {
        topics: res.topic_list.topics,
        more_topics_url: res.topic_list.more_topics_url
      }
    }
  } catch (err) {
    console.info('[LatestTopics] Attempting to load static synced data from /data/latest.json...')
    try {
      const staticRes = await fetch('/data/latest.json')
      if (staticRes.ok) {
        const data = await staticRes.json()
        if (data?.topic_list?.topics) {
          return {
            topics: data.topic_list.topics,
            more_topics_url: data.topic_list.more_topics_url
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return { topics: MOCK_TOPICS }
}

export async function fetchTopTopics(period = 'monthly'): Promise<{ topics: DiscourseTopic[] }> {
  try {
    const res: any = await request.get(`/discourse/top.json?period=${period}`)
    if (res?.topic_list?.topics) {
      return { topics: res.topic_list.topics }
    }
  } catch (err) {
    console.info('[TopTopics] Falling back to local data.')
  }
  return { topics: [...MOCK_TOPICS].sort((a, b) => b.like_count - a.like_count) }
}

export async function fetchCategoryTopics(categoryId: number, _slug?: string, page = 0): Promise<{ topics: DiscourseTopic[] }> {
  try {
    const canonicalPath = getCategoryApiPath(categoryId)
    const res: any = await request.get(`/discourse${canonicalPath}?page=${page}`)
    if (res?.topic_list?.topics) {
      return { topics: res.topic_list.topics }
    }
  } catch (err) {
    console.info(`[CategoryTopics] Filtered from local cache for category ${categoryId}`)
  }
  const filtered = MOCK_TOPICS.filter((t) => t.category_id === categoryId)
  return { topics: filtered.length > 0 ? filtered : MOCK_TOPICS.slice(0, 4) }
}

export async function fetchTopicDetail(topicId: number): Promise<DiscourseTopicDetail | null> {
  try {
    const res: any = await request.get(`/discourse/t/${topicId}.json`)
    if (res?.id) {
      return res
    }
  } catch (err) {
    console.info(`[TopicDetail] Loading pre-rendered detail for topic ${topicId}`)
  }
  if (MOCK_TOPIC_DETAILS[topicId]) {
    return MOCK_TOPIC_DETAILS[topicId]
  }
  // Generate dynamic fallback for other mock topics
  const summary = MOCK_TOPICS.find((t) => t.id === topicId)
  if (summary) {
    return {
      id: summary.id,
      title: summary.title,
      posts_count: summary.posts_count,
      created_at: summary.created_at,
      views: summary.views,
      reply_count: summary.reply_count,
      like_count: summary.like_count,
      last_posted_at: summary.last_posted_at,
      visible: true,
      closed: false,
      archived: false,
      has_summary: true,
      archetype: 'regular',
      slug: summary.slug,
      category_id: summary.category_id,
      word_count: 240,
      user_id: 10001,
      tags: summary.tags,
      post_stream: {
        stream: [1],
        posts: [
          {
            id: summary.id * 10,
            name: 'Godot Developer',
            username: 'godot_dev',
            avatar_template: 'https://avatars.githubusercontent.com/u/1024003?v=4',
            created_at: summary.created_at,
            cooked: `<p>${summary.excerpt || summary.title}</p><p>欢迎针对此主题在下方留言交流解决方案或提出疑问。</p>`,
            post_number: 1,
            post_type: 1,
            updated_at: summary.created_at,
            reply_count: summary.reply_count,
            quote_count: 0,
            incoming_link_count: 0,
            reads: summary.views,
            readers_count: summary.views,
            score: summary.like_count,
            yours: false,
            topic_id: summary.id,
            topic_slug: summary.slug,
            display_username: 'Godot Developer',
            version: 1,
            can_edit: false,
            can_delete: false,
            can_recover: false,
            can_see_hidden_post: false,
            can_wiki: false,
            moderator: false,
            admin: false,
            staff: false,
            user_id: 10001,
            hidden: false,
            trust_level: 2,
            user_deleted: false,
            can_view_edit_history: false,
            wiki: false
          }
        ]
      }
    }
  }
  return null
}
