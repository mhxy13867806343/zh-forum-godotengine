import { ref, computed, onMounted } from 'vue'
import { CATEGORY_MAP, type CategoryMeta } from '../utils/categoryDict'
import { fetchCategories } from '../api/discourse'

export interface CategoryGroup {
  parent: CategoryMeta
  children: CategoryMeta[]
}

export function useCategories() {
  const loading = ref(false)
  const allCategories = ref<CategoryMeta[]>(Object.values(CATEGORY_MAP))

  const loadCategories = async () => {
    loading.value = true
    try {
      const apiCategories = await fetchCategories()
      if (apiCategories && apiCategories.length > 0) {
        // Merge API counts if available
        apiCategories.forEach((apiCat) => {
          if (CATEGORY_MAP[apiCat.id]) {
            CATEGORY_MAP[apiCat.id].description = apiCat.description_text || CATEGORY_MAP[apiCat.id].description
          }
        })
      }
    } catch (e) {
      console.warn('Failed to fetch categories from API, using default dictionary', e)
    } finally {
      loading.value = false
    }
  }

  const categoryGroups = computed<CategoryGroup[]>(() => {
    const mainCategories = [23, 6, 14, 19, 4] // Announcements, Help, Showcase, Resources, General
    return mainCategories
      .map((mainId) => {
        const parent = CATEGORY_MAP[mainId]
        if (!parent) return null
        const children = Object.values(CATEGORY_MAP).filter((c) => c.parentId === mainId)
        return { parent, children }
      })
      .filter((item): item is CategoryGroup => item !== null)
  })

  const flatSubCategories = computed(() => {
    return Object.values(CATEGORY_MAP).filter((c) => c.parentId !== undefined)
  })

  onMounted(() => {
    loadCategories()
  })

  return {
    loading,
    allCategories,
    categoryGroups,
    flatSubCategories,
    loadCategories
  }
}
