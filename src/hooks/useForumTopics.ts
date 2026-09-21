import { ref, computed } from 'vue'
import type { DiscourseTopic } from '../api/types'
import { fetchLatestTopics, fetchTopTopics, fetchCategoryTopics } from '../api/discourse'
import { getTagName } from '../utils/translator'

export function useForumTopics() {
  const loading = ref(false)
  const topics = ref<DiscourseTopic[]>([])
  const currentTab = ref<'latest' | 'top' | 'hot'>('latest')
  const searchQuery = ref('')
  const selectedTag = ref<string | null>(null)
  const selectedCategoryId = ref<number | null>(null)

  // Pagination state
  const page = ref(1)
  const pageSize = ref(10)

  const loadTopics = async (categoryId?: number, categorySlug?: string, pageNumber = 1) => {
    loading.value = true
    try {
      if (categoryId && categorySlug) {
        selectedCategoryId.value = categoryId
        const res = await fetchCategoryTopics(categoryId, categorySlug, pageNumber - 1)
        topics.value = res.topics
      } else if (currentTab.value === 'top') {
        const res = await fetchTopTopics()
        topics.value = res.topics
      } else {
        const res = await fetchLatestTopics(pageNumber - 1)
        topics.value = res.topics
      }
    } catch (err) {
      console.error('Error fetching topics:', err)
    } finally {
      loading.value = false
    }
  }

  const filteredTopics = computed(() => {
    return topics.value.filter((topic) => {
      // Filter by search query
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        const matchesTitle = topic.title.toLowerCase().includes(q)
        const matchesExcerpt = topic.excerpt?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesExcerpt) return false
      }
      // Filter by category
      if (selectedCategoryId.value !== null && topic.category_id !== selectedCategoryId.value) {
        return false
      }
      // Filter by tag (supports both string and object tags)
      if (selectedTag.value !== null) {
        if (!topic.tags || !topic.tags.some((t) => getTagName(t).toLowerCase() === selectedTag.value?.toLowerCase())) {
          return false
        }
      }
      return true
    })
  })

  // Paginated slice for current page view
  const paginatedTopics = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return filteredTopics.value.slice(start, start + pageSize.value)
  })

  const totalCount = computed(() => {
    return filteredTopics.value.length
  })

  const handlePageChange = (newPage: number) => {
    page.value = newPage
    // Scroll window smoothly to top of topic feed
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    pageSize.value = newSize
    page.value = 1
  }

  const setTab = (tab: 'latest' | 'top' | 'hot') => {
    currentTab.value = tab
    page.value = 1
    loadTopics(selectedCategoryId.value || undefined)
  }

  const setCategory = (catId: number | null, slug?: string) => {
    selectedCategoryId.value = catId
    page.value = 1
    loadTopics(catId || undefined, slug)
  }

  const setTag = (tag: string | null) => {
    selectedTag.value = tag
    page.value = 1
  }

  return {
    loading,
    topics,
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
