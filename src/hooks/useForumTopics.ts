import { ref, computed } from 'vue'
import type { DiscourseTopic } from '../api/types'
import { fetchLatestTopics, fetchTopTopics, fetchCategoryTopics } from '../api/discourse'

export function useForumTopics() {
  const loading = ref(false)
  const topics = ref<DiscourseTopic[]>([])
  const currentTab = ref<'latest' | 'top' | 'hot'>('latest')
  const searchQuery = ref('')
  const selectedTag = ref<string | null>(null)
  const selectedCategoryId = ref<number | null>(null)

  const loadTopics = async (categoryId?: number, categorySlug?: string) => {
    loading.value = true
    try {
      if (categoryId && categorySlug) {
        selectedCategoryId.value = categoryId
        const res = await fetchCategoryTopics(categoryId, categorySlug)
        topics.value = res.topics
      } else if (currentTab.value === 'top') {
        const res = await fetchTopTopics()
        topics.value = res.topics
      } else {
        const res = await fetchLatestTopics()
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
      // Filter by tag
      if (selectedTag.value !== null) {
        if (!topic.tags || !topic.tags.includes(selectedTag.value)) {
          return false
        }
      }
      return true
    })
  })

  const setTab = (tab: 'latest' | 'top' | 'hot') => {
    currentTab.value = tab
    loadTopics(selectedCategoryId.value || undefined)
  }

  const setCategory = (catId: number | null, slug?: string) => {
    selectedCategoryId.value = catId
    loadTopics(catId || undefined, slug)
  }

  const setTag = (tag: string | null) => {
    selectedTag.value = tag
  }

  return {
    loading,
    topics,
    filteredTopics,
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
