import { ref, computed } from 'vue'
import type { DiscourseTopic } from '../api/types'
import { fetchLatestTopics, fetchTopTopics, fetchCategoryTopics } from '../api/discourse'
import { getCategoryTotalTopics } from '../utils/categoryDict'
import { getTagName } from '../utils/translator'

export function useForumTopics() {
  const loading = ref(false)
  const currentTab = ref<'latest' | 'top' | 'hot'>('latest')
  const searchQuery = ref('')
  const selectedTag = ref<string | null>(null)
  const selectedCategoryId = ref<number | null>(null)
  const selectedCategorySlug = ref<string | undefined>(undefined)

  // Real Pagination State
  const page = ref(1)
  const pageSize = ref(20)
  const totalCount = ref(1000)

  // In-memory cache for Discourse pages (each Discourse page = 30 topics)
  // key: discoursePage (0-based) -> DiscourseTopic[]
  const pageCache = new Map<number, DiscourseTopic[]>()
  const hasMoreMap = new Map<number, boolean>()

  // Reactive trigger for cache updates
  const cacheVersion = ref(0)

  const fetchDiscoursePage = async (p: number): Promise<DiscourseTopic[]> => {
    if (pageCache.has(p)) {
      return pageCache.get(p)!
    }
    let pageTopics: DiscourseTopic[] = []
    let hasMore = true

    if (selectedCategoryId.value !== null) {
      const res = await fetchCategoryTopics(selectedCategoryId.value, selectedCategorySlug.value, p)
      pageTopics = res.topics || []
      hasMore = !!res.more_topics_url
    } else if (currentTab.value === 'top') {
      const res = await fetchTopTopics()
      pageTopics = res.topics || []
      hasMore = false
    } else {
      const res = await fetchLatestTopics(p)
      pageTopics = res.topics || []
      hasMore = !!res.more_topics_url
    }

    pageCache.set(p, pageTopics)
    hasMoreMap.set(p, hasMore)
    cacheVersion.value++
    return pageTopics
  }

  const ensurePageDataLoaded = async () => {
    loading.value = true
    try {
      const startIndex = (page.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      const startDiscoursePage = Math.floor(startIndex / 30)
      const endDiscoursePage = Math.floor((endIndex - 1) / 30)

      for (let p = startDiscoursePage; p <= endDiscoursePage; p++) {
        await fetchDiscoursePage(p)
      }

      // Dynamically compute totalCount:
      // If we reached the end of Discourse topics (no more_topics_url)
      if (hasMoreMap.has(endDiscoursePage) && !hasMoreMap.get(endDiscoursePage)) {
        const lastPageTopics = pageCache.get(endDiscoursePage)?.length || 0
        totalCount.value = Math.max((endDiscoursePage * 30) + lastPageTopics, 30)
      } else {
        const baseEstimate = selectedCategoryId.value
          ? getCategoryTotalTopics(selectedCategoryId.value)
          : (currentTab.value === 'top' ? 300 : 2500)
        // Keep total count at least ahead of current page
        totalCount.value = Math.max(baseEstimate, (page.value + 5) * pageSize.value)
      }
    } catch (err) {
      console.error('Error loading forum topics:', err)
    } finally {
      loading.value = false
    }
  }

  const loadTopics = async (categoryId?: number, categorySlug?: string, pageNumber = 1) => {
    const isCatChanged =
      selectedCategoryId.value !== (categoryId ?? null) ||
      selectedCategorySlug.value !== categorySlug

    if (isCatChanged) {
      pageCache.clear()
      hasMoreMap.clear()
      selectedCategoryId.value = categoryId ?? null
      selectedCategorySlug.value = categorySlug
      page.value = pageNumber
      totalCount.value = getCategoryTotalTopics(categoryId ?? null)
    }

    await ensurePageDataLoaded()
  }

  const paginatedTopics = computed(() => {
    // Read cacheVersion so computed property reacts to cache fills
    void cacheVersion.value

    const startIndex = (page.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    const startDiscoursePage = Math.floor(startIndex / 30)
    const endDiscoursePage = Math.floor((endIndex - 1) / 30)

    let combined: DiscourseTopic[] = []
    for (let p = startDiscoursePage; p <= endDiscoursePage; p++) {
      const list = pageCache.get(p)
      if (list) combined.push(...list)
    }

    const offset = startIndex - (startDiscoursePage * 30)
    const sliced = combined.slice(offset, offset + pageSize.value)

    if (searchQuery.value.trim() || selectedTag.value) {
      return sliced.filter((topic) => {
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase()
          const matchesTitle = topic.title.toLowerCase().includes(q)
          const matchesExcerpt = topic.excerpt?.toLowerCase().includes(q)
          if (!matchesTitle && !matchesExcerpt) return false
        }
        if (selectedTag.value !== null) {
          if (!topic.tags || !topic.tags.some((t) => getTagName(t).toLowerCase() === selectedTag.value?.toLowerCase())) {
            return false
          }
        }
        return true
      })
    }

    return sliced
  })

  // Aliased for backward compatibility with view templates
  const filteredTopics = computed(() => paginatedTopics.value)

  const handlePageChange = async (newPage: number) => {
    page.value = newPage
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    await ensurePageDataLoaded()
  }

  const handlePageSizeChange = async (newSize: number) => {
    pageSize.value = newSize
    page.value = 1
    await ensurePageDataLoaded()
  }

  const setTab = async (tab: 'latest' | 'top' | 'hot') => {
    if (currentTab.value !== tab) {
      currentTab.value = tab
      pageCache.clear()
      hasMoreMap.clear()
      page.value = 1
      totalCount.value = tab === 'top' ? 300 : 2500
      await ensurePageDataLoaded()
    }
  }

  const setCategory = async (catId: number | null, slug?: string) => {
    await loadTopics(catId || undefined, slug, 1)
  }

  const setTag = (tag: string | null) => {
    selectedTag.value = tag
    page.value = 1
  }

  return {
    loading,
    topics: paginatedTopics,
    filteredTopics,
    paginatedTopics,
    totalCount,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    currentTab,
    searchQuery,
    selectedTag,
    selectedCategoryId,
    loadTopics,
    setTab,
    setCategory,
    setTag
  }
}
