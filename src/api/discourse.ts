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
  try {
    const res: any = await request.get('/discourse/categories.json')
    if (res?.category_list?.categories) {
      return res.category_list.categories
    }
  } catch {
    // In static production hosting, fallback to synced live snapshot
    const data = await loadStaticJson('data/categories.json')
    if (data?.category_list?.categories) {
      return data.category_list.categories
    }
  }
  return []
}

export async function fetchLatestTopics(page = 0): Promise<{ topics: DiscourseTopic[]; more_topics_url?: string; total?: number }> {
  try {
    const res: any = await request.get(`/discourse/latest.json?page=${page}`)
    if (res?.topic_list?.topics) {
      return {
        topics: res.topic_list.topics,
        more_topics_url: res.topic_list.more_topics_url,
        total: 45000
      }
    }
  } catch {
    // In static production hosting, fallback to synced live snapshot
    const data = await loadStaticJson(`data/latest.json?page=${page}`)
    if (data?.topic_list?.topics) {
      const all: DiscourseTopic[] = data.topic_list.topics
      const pageSize = 30
      const start = page * pageSize
      const slice = all.slice(start, start + pageSize)
      return {
        topics: slice.length > 0 ? slice : all.slice(0, pageSize),
        more_topics_url: `/latest?page=${page + 1}`,
        total: Math.max(all.length, 45000)
      }
    }
  }

  return { topics: [], total: 0 }
}

export async function fetchTopTopics(period = 'monthly'): Promise<{ topics: DiscourseTopic[]; total?: number }> {
  try {
    const res: any = await request.get(`/discourse/top.json?period=${period}`)
    if (res?.topic_list?.topics) {
      return { topics: res.topic_list.topics, total: 1000 }
    }
  } catch {
    const data = await loadStaticJson(`data/top.json?period=${period}`)
    if (data?.topic_list?.topics) {
      return { topics: data.topic_list.topics, total: 1000 }
    }
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

  try {
    const res: any = await request.get(`/discourse${canonicalPath}?page=${page}`)
    if (res?.topic_list?.topics) {
      return {
        topics: res.topic_list.topics,
        more_topics_url: res.topic_list.more_topics_url,
        total: totalExpected
      }
    }
  } catch {
    // In static production hosting, filter from synced live snapshot
    const data = await loadStaticJson(`data/latest.json?cat=${categoryId}&page=${page}`)
    if (data?.topic_list?.topics) {
      const all: DiscourseTopic[] = data.topic_list.topics
      const filtered = all.filter((t) => t.category_id === categoryId)
      const pageSize = 30
      const start = page * pageSize
      const slice = filtered.slice(start, start + pageSize)
      return {
        topics: slice.length > 0 ? slice : filtered,
        more_topics_url: `?page=${page + 1}`,
        total: totalExpected
      }
    }
  }

  return { topics: [], total: totalExpected }
}

export async function fetchTopicDetail(topicId: number): Promise<DiscourseTopicDetail | null> {
  try {
    const res: any = await request.get(`/discourse/t/${topicId}.json`)
    if (res?.id) {
      return res
    }
  } catch (err: any) {
    console.warn(`[TopicDetail] Failed to fetch live topic ${topicId}:`, err.message)
  }

  return null
}
