import request from './request'
import type { DiscourseTopic, DiscourseTopicDetail, DiscourseCategory } from './types'
import { MOCK_TOPICS, MOCK_TOPIC_DETAILS } from './mockData'
import { getCategoryApiPath } from '../utils/categoryDict'

/**
 * Safely compute static asset URL regardless of root domain or GitHub Pages subpath.
 */
export function getStaticDataUrl(filename: string): string {
  const cleanPath = filename.startsWith('/') ? filename.slice(1) : filename
  if (typeof window !== 'undefined') {
    let dir = window.location.pathname
    if (dir.endsWith('.html') || dir.endsWith('.htm')) {
      dir = dir.substring(0, dir.lastIndexOf('/') + 1)
    } else if (!dir.endsWith('/')) {
      dir = dir + '/'
    }
    return `${window.location.origin}${dir}${cleanPath}`
  }
  return `/${cleanPath}`
}

let cachedLatest: any = null
let cachedTop: any = null
let cachedCategories: any = null

async function loadStaticJson(filename: string): Promise<any> {
  try {
    const url = getStaticDataUrl(filename)
    const res = await fetch(url)
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.warn(`[StaticData] Failed to load ${filename}:`, e)
  }
  return null
}

export async function fetchCategories(): Promise<DiscourseCategory[]> {
  // In dev environment, Vite proxy is available
  if (import.meta.env.DEV) {
    try {
      const res: any = await request.get('/discourse/categories.json')
      if (res?.category_list?.categories) {
        return res.category_list.categories
      }
    } catch {
      // Fallback to static data
    }
  }

  if (!cachedCategories) {
    cachedCategories = await loadStaticJson('data/categories.json')
  }

  if (cachedCategories?.category_list?.categories) {
    return cachedCategories.category_list.categories
  }

  return []
}

export async function fetchLatestTopics(page = 0): Promise<{ topics: DiscourseTopic[]; more_topics_url?: string; total?: number }> {
  // In dev environment, Vite proxy is available
  if (import.meta.env.DEV) {
    try {
      const res: any = await request.get(`/discourse/latest.json?page=${page}`)
      if (res?.topic_list?.topics) {
        return {
          topics: res.topic_list.topics,
          more_topics_url: res.topic_list.more_topics_url,
          total: res.topic_list.topics.length
        }
      }
    } catch {
      // Fallback to static synced data
    }
  }

  if (!cachedLatest) {
    cachedLatest = await loadStaticJson('data/latest.json')
  }

  const allTopics: DiscourseTopic[] = cachedLatest?.topic_list?.topics || MOCK_TOPICS

  // Each Discourse page chunk has 30 topics
  const pageSize = 30
  const start = page * pageSize
  const pagedTopics = allTopics.slice(start, start + pageSize)
  const hasMore = start + pageSize < allTopics.length

  return {
    topics: pagedTopics,
    more_topics_url: hasMore ? `/latest?page=${page + 1}` : undefined,
    total: allTopics.length
  }
}

export async function fetchTopTopics(period = 'monthly'): Promise<{ topics: DiscourseTopic[]; total?: number }> {
  if (import.meta.env.DEV) {
    try {
      const res: any = await request.get(`/discourse/top.json?period=${period}`)
      if (res?.topic_list?.topics) {
        return { topics: res.topic_list.topics, total: res.topic_list.topics.length }
      }
    } catch {
      // Fallback to static synced data
    }
  }

  if (!cachedTop) {
    cachedTop = await loadStaticJson('data/top.json')
  }

  if (cachedTop?.topic_list?.topics) {
    return { topics: cachedTop.topic_list.topics, total: cachedTop.topic_list.topics.length }
  }

  const sorted = [...MOCK_TOPICS].sort((a, b) => b.like_count - a.like_count)
  return { topics: sorted, total: sorted.length }
}

export async function fetchCategoryTopics(
  categoryId: number,
  _slug?: string,
  page = 0
): Promise<{ topics: DiscourseTopic[]; more_topics_url?: string; total?: number }> {
  if (import.meta.env.DEV) {
    try {
      const canonicalPath = getCategoryApiPath(categoryId)
      const res: any = await request.get(`/discourse${canonicalPath}?page=${page}`)
      if (res?.topic_list?.topics) {
        return {
          topics: res.topic_list.topics,
          more_topics_url: res.topic_list.more_topics_url,
          total: res.topic_list.topics.length
        }
      }
    } catch {
      // Fallback
    }
  }

  if (!cachedLatest) {
    cachedLatest = await loadStaticJson('data/latest.json')
  }
  if (!cachedTop) {
    cachedTop = await loadStaticJson('data/top.json')
  }

  const pool: DiscourseTopic[] = [
    ...(cachedLatest?.topic_list?.topics || []),
    ...(cachedTop?.topic_list?.topics || []),
    ...MOCK_TOPICS
  ]

  const seen = new Set<number>()
  const uniqueTopics: DiscourseTopic[] = []
  for (const t of pool) {
    if (!seen.has(t.id)) {
      seen.add(t.id)
      uniqueTopics.push(t)
    }
  }

  const filtered = uniqueTopics.filter((t) => t.category_id === categoryId)
  const pageSize = 30
  const start = page * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const hasMore = start + pageSize < filtered.length

  return {
    topics: paged,
    more_topics_url: hasMore ? `?page=${page + 1}` : undefined,
    total: filtered.length
  }
}

export async function fetchTopicDetail(topicId: number): Promise<DiscourseTopicDetail | null> {
  if (import.meta.env.DEV) {
    try {
      const res: any = await request.get(`/discourse/t/${topicId}.json`)
      if (res?.id) {
        return res
      }
    } catch {
      // Fallback
    }
  }

  if (MOCK_TOPIC_DETAILS[topicId]) {
    return MOCK_TOPIC_DETAILS[topicId]
  }

  if (!cachedLatest) {
    cachedLatest = await loadStaticJson('data/latest.json')
  }
  if (!cachedTop) {
    cachedTop = await loadStaticJson('data/top.json')
  }

  const pool: DiscourseTopic[] = [
    ...(cachedLatest?.topic_list?.topics || []),
    ...(cachedTop?.topic_list?.topics || []),
    ...MOCK_TOPICS
  ]
  const summary = pool.find((t) => t.id === topicId)
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
