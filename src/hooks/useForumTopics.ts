import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { DiscourseTopic } from '../api/types'
import { fetchLatestTopics, fetchTopTopics, fetchCategoryTopics } from '../api/discourse'
import { getCategoryTotalTopics } from '../utils/categoryDict'
import { getTagName } from '../utils/translator'

export function useForumTopics() {
  const route = useRoute()
  const router = useRouter()

  const loading = ref(false)

  // Initialize tab from URL query (?tab=top / ?tab=hot / ?tab=latest)
  const qTab = (route?.query?.tab as string) || 'latest'
  const initialTab = (['latest', 'top', 'hot'].includes(qTab) ? qTab : 'latest') as 'latest' | 'top' | 'hot'
  const currentTab = ref<'latest' | 'top' | 'hot'>(initialTab)

  const searchQuery = ref((route?.query?.q as string) || '')
  const selectedTag = ref<string | null>((route?.query?.tag as string) || null)
  const selectedCategoryId = ref<number | null>(null)
  const selectedCategorySlug = ref<string | undefined>(undefined)

  // Initialize page and pageSize from URL query string if present
  const initialPage = route?.query?.page ? Math.max(1, Number(route.query.page) || 1) : 1
  const initialPageSize = route?.query?.pageSize ? Number(route.query.pageSize) || 20 : 20

  // Real Pagination State
  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const initialBaseCount = initialTab === 'top' ? 1000 : (initialTab === 'hot' ? 25000 : 45000)
  const totalCount = ref(initialBaseCount)
  const maxPage = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

  // In-memory cache keyed by scope + page:
  // e.g. "tab_latest_p_0", "tab_top_p_0", "cat_9_p_0"
  const pageCache = new Map<string, DiscourseTopic[]>()
  const hasMoreMap = new Map<string, boolean>()

  // Reactive trigger for cache updates
  const cacheVersion = ref(0)

  const getCacheKey = (p: number) => {
    const scope = selectedCategoryId.value !== null ? `cat_${selectedCategoryId.value}` : `tab_${currentTab.value}`
    return `${scope}_p_${p}`
  }

  const fetchDiscoursePage = async (p: number): Promise<DiscourseTopic[]> => {
    const key = getCacheKey(p)
    if (pageCache.has(key)) {
      return pageCache.get(key)!
    }

    let pageTopics: DiscourseTopic[] = []
    let hasMore = true

    try {
      if (selectedCategoryId.value !== null) {
        const res = await fetchCategoryTopics(selectedCategoryId.value, selectedCategorySlug.value, p)
        pageTopics = res.topics || []
        hasMore = !!res.more_topics_url
      } else if (currentTab.value === 'top') {
        const res = await fetchTopTopics()
        pageTopics = res.topics || []
        hasMore = false
      } else if (currentTab.value === 'hot') {
        const res = await fetchCategoryTopics(6, 'help', p)
        pageTopics = res.topics || []
        hasMore = !!res.more_topics_url
      } else {
        const res = await fetchLatestTopics(p)
        pageTopics = res.topics || []
        hasMore = !!res.more_topics_url
      }
    } catch {
      pageTopics = []
      hasMore = false
    }

    pageCache.set(key, pageTopics)
    hasMoreMap.set(key, hasMore)
    cacheVersion.value++
    return pageTopics
  }

  const ensurePageDataLoaded = async () => {
    const startIndex = (page.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    const startDiscoursePage = Math.floor(startIndex / 30)
    const endDiscoursePage = Math.floor((endIndex - 1) / 30)

    // Check if all needed pages are already in cache
    let needsFetch = false
    for (let p = startDiscoursePage; p <= endDiscoursePage; p++) {
      if (!pageCache.has(getCacheKey(p))) {
        needsFetch = true
        break
      }
    }

    // If all cached, immediately return with 0 network request
    if (!needsFetch) {
      loading.value = false
      return
    }

    loading.value = true
    try {
      for (let p = startDiscoursePage; p <= endDiscoursePage; p++) {
        await fetchDiscoursePage(p)
      }

      // Dynamically compute totalCount:
      const lastKey = getCacheKey(endDiscoursePage)
      if (hasMoreMap.has(lastKey) && !hasMoreMap.get(lastKey)) {
        const lastPageTopics = pageCache.get(lastKey)?.length || 0
        if (lastPageTopics > 0) {
          totalCount.value = (endDiscoursePage * 30) + lastPageTopics
        } else {
          // The requested page is beyond the actual topics list
          const baseEstimate = selectedCategoryId.value
            ? getCategoryTotalTopics(selectedCategoryId.value)
            : (currentTab.value === 'top' ? 1000 : (currentTab.value === 'hot' ? 25000 : 45000))
          totalCount.value = baseEstimate
        }
      } else {
        const baseEstimate = selectedCategoryId.value
          ? getCategoryTotalTopics(selectedCategoryId.value)
          : (currentTab.value === 'top' ? 1000 : (currentTab.value === 'hot' ? 25000 : 45000))
        totalCount.value = Math.max(baseEstimate, (endDiscoursePage + 1) * 30)
      }
    } catch (err) {
      console.error('Error loading forum topics:', err)
    } finally {
      loading.value = false
    }
  }

  const loadTopics = async (categoryId?: number, categorySlug?: string, pageNumber?: number) => {
    const isCatChanged =
      selectedCategoryId.value !== (categoryId ?? null) ||
      selectedCategorySlug.value !== categorySlug

    if (isCatChanged) {
      selectedCategoryId.value = categoryId ?? null
      selectedCategorySlug.value = categorySlug
      totalCount.value = getCategoryTotalTopics(categoryId ?? null)
    }

    if (pageNumber && pageNumber > 0) {
      page.value = pageNumber
    } else if (route?.query?.page) {
      page.value = Math.max(1, Number(route.query.page) || 1)
    }

    await ensurePageDataLoaded()
  }

  const refresh = async () => {
    // Clear cache only for current scope to force fresh fetch
    const scopePrefix = selectedCategoryId.value !== null ? `cat_${selectedCategoryId.value}` : `tab_${currentTab.value}`
    for (const key of Array.from(pageCache.keys())) {
      if (key.startsWith(scopePrefix)) {
        pageCache.delete(key)
        hasMoreMap.delete(key)
      }
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
      const list = pageCache.get(getCacheKey(p))
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

  // For mobile infinite scroll stream (page 1 up to current page.value)
  const accumulatedTopics = computed(() => {
    void cacheVersion.value
    const endIndex = page.value * pageSize.value
    const endDiscoursePage = Math.floor((endIndex - 1) / 30)

    let combined: DiscourseTopic[] = []
    for (let p = 0; p <= endDiscoursePage; p++) {
      const list = pageCache.get(getCacheKey(p))
      if (list) combined.push(...list)
    }

    const sliced = combined.slice(0, endIndex)

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

  const isLoadingMore = ref(false)

  const hasMoreTopics = computed(() => {
    return page.value * pageSize.value < totalCount.value
  })

  const loadMore = async () => {
    if (isLoadingMore.value || loading.value || !hasMoreTopics.value) return
    isLoadingMore.value = true
    try {
      page.value++
      await ensurePageDataLoaded()
    } finally {
      isLoadingMore.value = false
    }
  }

  // Aliased for backward compatibility with view templates
  const filteredTopics = computed(() => paginatedTopics.value)

  const handlePageChange = async (newPage: number, updateUrl = true) => {
    page.value = newPage
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Sync page to browser address bar query
    if (updateUrl && router && route) {
      const query = { ...route.query }
      if (newPage > 1) {
        query.page = String(newPage)
      } else {
        delete query.page
      }
      await router.push({ query })
    }

    await ensurePageDataLoaded()
  }

  const handlePageSizeChange = async (newSize: number) => {
    pageSize.value = newSize
    page.value = 1

    if (router && route) {
      const query = { ...route.query }
      delete query.page
      query.pageSize = String(newSize)
      await router.push({ query })
    }

    await ensurePageDataLoaded()
  }

  const setTab = async (tab: 'latest' | 'top' | 'hot') => {
    if (currentTab.value !== tab) {
      currentTab.value = tab
      page.value = 1
      totalCount.value = tab === 'top' ? 1000 : (tab === 'hot' ? 25000 : 45000)

      if (router && route) {
        const query = { ...route.query }
        delete query.page
        if (tab !== 'latest') {
          query.tab = tab
        } else {
          delete query.tab
        }
        await router.push({ query })
      }

      // If tab data is already cached, renders instantly without network request!
      await ensurePageDataLoaded()
    }
  }

  const setCategory = async (catId: number | null, slug?: string) => {
    if (router && route) {
      const query = { ...route.query }
      delete query.page
      await router.push({ query })
    }
    await loadTopics(catId || undefined, slug, 1)
  }

  const setTag = async (tag: string | null) => {
    selectedTag.value = tag
    page.value = 1

    if (router && route) {
      const query = { ...route.query }
      delete query.page
      if (tag) {
        query.tag = tag
      } else {
        delete query.tag
      }
      await router.push({ query })
    }
  }

  // React to browser Back/Forward buttons and external URL query changes
  if (route) {
    watch(
      () => route.query.tab,
      async (newTab) => {
        const validTab = (newTab as 'latest' | 'top' | 'hot') || 'latest'
        if (['latest', 'top', 'hot'].includes(validTab) && validTab !== currentTab.value) {
          currentTab.value = validTab
          page.value = 1
          totalCount.value = validTab === 'top' ? 1000 : (validTab === 'hot' ? 25000 : 45000)
          await ensurePageDataLoaded()
        }
      }
    )

    watch(
      () => route.query.page,
      async (newVal) => {
        const targetPage = newVal ? Math.max(1, Number(newVal) || 1) : 1
        if (targetPage !== page.value) {
          page.value = targetPage
          await ensurePageDataLoaded()
        }
      }
    )

    watch(
      () => route.query.tag,
      (newTag) => {
        const t = (newTag as string) || null
        if (t !== selectedTag.value) {
          selectedTag.value = t
        }
      }
    )

    watch(
      () => route.query.q,
      (newQ) => {
        const q = (newQ as string) || ''
        if (q !== searchQuery.value) {
          searchQuery.value = q
        }
      }
    )
  }

  return {
    loading,
    topics: paginatedTopics,
    filteredTopics,
    paginatedTopics,
    accumulatedTopics,
    isLoadingMore,
    hasMoreTopics,
    loadMore,
    totalCount,
    maxPage,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    currentTab,
    searchQuery,
    selectedTag,
    selectedCategoryId,
    loadTopics,
    refresh,
    setTab,
    setCategory,
    setTag
  }
}
