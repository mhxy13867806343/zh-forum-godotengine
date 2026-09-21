import { ref, computed, onMounted } from 'vue'
import { CATEGORY_MAP, type CategoryMeta } from '../utils/categoryDict'
import { fetchCategories } from '../api/discourse'

export interface CategoryGroup {
  parent: CategoryMeta
  children: CategoryMeta[]
}

export function useCategories() {
  const loading = ref(false)
  const loadingProgress = ref(0)
  const allCategories = ref<CategoryMeta[]>(Object.values(CATEGORY_MAP))
  let progressTimer: any = null

  const startProgress = () => {
    loadingProgress.value = 15
    if (progressTimer) clearInterval(progressTimer)
    progressTimer = setInterval(() => {
      if (loadingProgress.value < 65) {
        loadingProgress.value += Math.floor(Math.random() * 8) + 6
      } else if (loadingProgress.value < 88) {
        loadingProgress.value += Math.floor(Math.random() * 4) + 2
      } else if (loadingProgress.value < 96) {
        loadingProgress.value += 1
      }
    }, 110)
  }

  const finishProgress = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
    loadingProgress.value = 100
  }

  const resetProgress = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
    loadingProgress.value = 0
  }

  const loadCategories = async () => {
    loading.value = true
    startProgress()
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
      finishProgress()
    } catch (e) {
      resetProgress()
      console.warn('Failed to fetch categories from API, using default dictionary', e)
    } finally {
      setTimeout(() => {
        loading.value = false
        setTimeout(() => {
          loadingProgress.value = 0
        }, 200)
      }, 250)
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
    loadingProgress,
    allCategories,
    categoryGroups,
    flatSubCategories,
    loadCategories
  }
}
