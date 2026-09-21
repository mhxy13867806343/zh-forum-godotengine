import request from './request'
import type { DiscourseTopic, DiscourseTopicDetail, DiscourseCategory } from './types'
import { getCategoryApiPath, getCategoryTotalTopics } from '../utils/categoryDict'

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

async function loadStaticJson(filename: string): Promise<any> {
  try {
    const url = getStaticDataUrl(filename)
    const res = await fetch(url)
    if (res.ok) {
      return await res.json()
    }
  } catch (e: any) {
    console.warn(`[StaticData] Failed to load ${filename}:`, e.message)
  }
  return null
}

export async function fetchCategories(): Promise<DiscourseCategory[]> {
  if (import.meta.env.DEV) {
    try {
      const res: any = await request.get('/discourse/categories.json')
      if (res?.category_list?.categories) {
        return res.category_list.categories
      }
    } catch (e: any) {
      console.warn('[Dev Proxy Notice] Categories fetch fallback:', e.message)
    }
  }

  // In static production hosting, fallback to synced snapshot
  const data = await loadStaticJson('data/categories.json')
  if (Array.isArray(data)) {
    return data
  }
  if (data?.category_list?.categories) {
    return data.category_list.categories
  }
  return []
}

export async function fetchLatestTopics(page = 0): Promise<{ topics: DiscourseTopic[]; more_topics_url?: string; total?: number }> {
  if (import.meta.env.DEV) {
    try {
      const res: any = await request.get(`/discourse/latest.json?page=${page}`)
      if (res?.topic_list?.topics) {
        return {
          topics: res.topic_list.topics,
          more_topics_url: res.topic_list.more_topics_url,
          total: 45000
        }
      }
    } catch (e: any) {
      console.warn('[Dev Proxy Notice] Latest topics fallback:', e.message)
    }
  }

  // In static production hosting, load from synced snapshot
  const data = await loadStaticJson('data/latest.json')
  const rawList: DiscourseTopic[] = data?.topic_list?.topics || (Array.isArray(data?.topics) ? data.topics : [])
  if (rawList.length > 0) {
    const pageSize = 30
    const start = page * pageSize
    const slice = rawList.slice(start, start + pageSize)
    return {
      topics: slice.length > 0 ? slice : rawList.slice(0, pageSize),
      more_topics_url: (start + pageSize < rawList.length) ? `/latest?page=${page + 1}` : undefined,
      total: Math.max(rawList.length, 45000)
    }
  }

  return { topics: [], total: 0 }
}

export async function fetchTopTopics(period = 'monthly'): Promise<{ topics: DiscourseTopic[]; total?: number }> {
  if (import.meta.env.DEV) {
    try {
      const res: any = await request.get(`/discourse/top.json?period=${period}`)
      if (res?.topic_list?.topics) {
        return { topics: res.topic_list.topics, total: 1000 }
      }
    } catch (e: any) {
      console.warn('[Dev Proxy Notice] Top topics fallback:', e.message)
    }
  }

  const data = await loadStaticJson(`data/top.json?period=${period}`)
  const rawList: DiscourseTopic[] = data?.topic_list?.topics || (Array.isArray(data?.topics) ? data.topics : [])
  if (rawList.length > 0) {
    return { topics: rawList, total: Math.max(rawList.length, 1000) }
  }

  return { topics: [], total: 0 }
}

export async function fetchCategoryTopics(
  categoryId: number,
  _slug?: string,
  page = 0
): Promise<{ topics: DiscourseTopic[]; more_topics_url?: string; total?: number }> {
  const canonicalPath = getCategoryApiPath(categoryId)
  const totalExpected = getCategoryTotalTopics(categoryId) || 1200

  // 1. In local dev mode, proxy through Vite dev server to live Discourse API
  if (import.meta.env.DEV) {
    try {
      const res: any = await request.get(`/discourse${canonicalPath}?page=${page}`)
      if (res?.topic_list?.topics) {
        return {
          topics: res.topic_list.topics,
          more_topics_url: res.topic_list.more_topics_url,
          total: totalExpected
        }
      }
    } catch (e: any) {
      console.warn('[Dev Proxy Notice] Category fetch fallback:', e.message)
    }
  }

  // 2. Showcase category special handling (14 = all showcase, 15 = games, 24 = in-dev, 16 = tools)
  if ([14, 15, 24, 16].includes(categoryId)) {
    const showcaseData = await loadStaticJson('data/showcase.json')
    if (showcaseData?.topics && Array.isArray(showcaseData.topics)) {
      const allShowcase: DiscourseTopic[] = showcaseData.topics
      let filtered = allShowcase
      if (categoryId !== 14) {
        filtered = allShowcase.filter((t) => t.category_id === categoryId)
      }
      const pageSize = 30
      const start = page * pageSize
      const slice = filtered.slice(start, start + pageSize)
      const hasMore = start + pageSize < filtered.length
      return {
        topics: slice,
        more_topics_url: hasMore ? `?page=${page + 1}` : undefined,
        total: filtered.length
      }
    }
  }

  // 3. Category specific static snapshot: data/categories/${categoryId}.json
  const catData = await loadStaticJson(`data/categories/${categoryId}.json`)
  if (catData?.topics && Array.isArray(catData.topics)) {
    const allTopics: DiscourseTopic[] = catData.topics
    const pageSize = 30
    const start = page * pageSize
    const slice = allTopics.slice(start, start + pageSize)
    const hasMore = start + pageSize < allTopics.length
    return {
      topics: slice.length > 0 ? slice : allTopics.slice(0, pageSize),
      more_topics_url: hasMore ? `?page=${page + 1}` : undefined,
      total: Math.max(allTopics.length, totalExpected)
    }
  }

  // 4. Try canonical path in data/: data/c/help/ui/8.json
  const canonicalData = await loadStaticJson(`data${canonicalPath}`)
  if (canonicalData?.topics && Array.isArray(canonicalData.topics)) {
    const allTopics: DiscourseTopic[] = canonicalData.topics
    const pageSize = 30
    const start = page * pageSize
    const slice = allTopics.slice(start, start + pageSize)
    const hasMore = start + pageSize < allTopics.length
    return {
      topics: slice.length > 0 ? slice : allTopics.slice(0, pageSize),
      more_topics_url: hasMore ? `?page=${page + 1}` : undefined,
      total: Math.max(allTopics.length, totalExpected)
    }
  }

  // 5. Fallback: filter from latest snapshot
  const latestData = await loadStaticJson('data/latest.json')
  const rawLatest: DiscourseTopic[] = latestData?.topic_list?.topics || (Array.isArray(latestData?.topics) ? latestData.topics : [])
  if (rawLatest.length > 0) {
    const filtered = rawLatest.filter((t) => t.category_id === categoryId)
    const pageSize = 30
    const start = page * pageSize
    const slice = filtered.slice(start, start + pageSize)
    return {
      topics: slice.length > 0 ? slice : filtered,
      more_topics_url: undefined,
      total: Math.max(filtered.length, totalExpected)
    }
  }

  return { topics: [], total: totalExpected }
}

export async function fetchTopicDetail(topicId: number): Promise<DiscourseTopicDetail | null> {
  if (import.meta.env.DEV) {
    try {
      const res: any = await request.get(`/discourse/t/${topicId}.json`)
      if (res?.id) {
        return res
      }
    } catch (err: any) {
      console.warn(`[TopicDetail] Live fetch failed for topic ${topicId}:`, err.message)
    }
  }

  // Search cached static data for topic detail synthesis
  const showcaseData = await loadStaticJson('data/showcase.json')
  const foundInShowcase = showcaseData?.topics?.find((t: any) => t.id === topicId)
  if (foundInShowcase) {
    return buildSyntheticTopicDetail(foundInShowcase)
  }

  const latestData = await loadStaticJson('data/latest.json')
  const rawLatest: DiscourseTopic[] = latestData?.topic_list?.topics || (Array.isArray(latestData?.topics) ? latestData.topics : [])
  const foundInLatest = rawLatest.find((t) => t.id === topicId)
  if (foundInLatest) {
    return buildSyntheticTopicDetail(foundInLatest)
  }

  return null
}

function buildSyntheticTopicDetail(t: DiscourseTopic): DiscourseTopicDetail {
  return {
    id: t.id,
    title: t.title,
    fancy_title: t.fancy_title || t.title,
    posts_count: t.posts_count,
    created_at: t.created_at,
    views: t.views,
    reply_count: t.reply_count,
    like_count: t.like_count,
    last_posted_at: t.last_posted_at,
    visible: t.visible,
    closed: t.closed,
    archived: t.archived,
    has_summary: t.has_summary,
    archetype: t.archetype,
    slug: t.slug,
    category_id: t.category_id,
    word_count: 100,
    user_id: 1,
    tags: t.tags || [],
    post_stream: {
      posts: [
        {
          id: t.id * 10,
          name: '',
          username: 'GodotCommunity',
          avatar_template: '/user_avatar/forum.godotengine.org/system/{size}/1.png',
          created_at: t.created_at,
          cooked: t.excerpt ? `<p>${t.excerpt}</p>` : `<p>${t.title}</p>`,
          post_number: 1,
          post_type: 1,
          updated_at: t.bumped_at || t.created_at,
          reply_count: t.reply_count,
          quote_count: 0,
          incoming_link_count: 0,
          reads: t.views,
          readers_count: t.views,
          score: t.like_count,
          yours: false,
          topic_id: t.id,
          topic_slug: t.slug,
          display_username: '社区开发者',
          version: 1,
          can_edit: false,
          can_delete: false,
          can_recover: false,
          can_see_hidden_post: false,
          can_wiki: false,
          moderator: false,
          admin: false,
          staff: false,
          user_id: 1,
          hidden: false,
          trust_level: 1,
          user_deleted: false,
          can_view_edit_history: false,
          wiki: false
        }
      ],
      stream: [t.id * 10]
    }
  }
}
