<template>
  <aside class="sidebar-container">
    <!-- Quick Categories -->
    <div class="sidebar-section">
      <div class="section-title">
        <span>热门求助板块</span>
        <router-link to="/categories" class="text-xs text-blue-400 hover:underline">全部</router-link>
      </div>

      <div class="category-menu-list">
        <router-link
          v-for="cat in quickCategories"
          :key="cat.id"
          :to="`/c/${cat.slug}/${cat.id}`"
          class="category-menu-item"
        >
          <div class="flex items-center">
            <span class="cat-indicator" :style="{ backgroundColor: cat.color }"></span>
            <span>{{ cat.zhName }}</span>
          </div>
          <span class="text-xs text-gray-500">{{ cat.name }}</span>
        </router-link>
      </div>
    </div>

    <!-- Hot Tags -->
    <div class="sidebar-section">
      <div class="section-title">
        <span>常用技术标签</span>
      </div>
      <div class="tags-cloud">
        <n-tag
          v-for="tag in popularTags"
          :key="tag.key"
          size="small"
          round
          class="tag-item"
          @click="filterByTag(tag.key)"
        >
          #{{ tag.label }}
        </n-tag>
      </div>
    </div>

    <!-- Official Links -->
    <div class="sidebar-section text-xs text-gray-400 leading-relaxed">
      <div class="section-title">
        <span>Godot 常用链接</span>
      </div>
      <div class="flex flex-col gap-2">
        <a href="https://godotengine.org" target="_blank" class="hover:text-blue-400">🌐 Godot Engine 官网</a>
        <a href="https://docs.godotengine.org" target="_blank" class="hover:text-blue-400">📚 官方中文文档 (Docs)</a>
        <a href="https://github.com/godotengine/godot" target="_blank" class="hover:text-blue-400">🐙 GitHub 引擎源码</a>
        <a href="https://godotengine.org/asset-library/asset" target="_blank" class="hover:text-blue-400">📦 资产库 (Asset Library)</a>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useCategories } from '@/hooks/useCategories'

const emit = defineEmits<{
  (e: 'tag-select', tag: string): void
}>()

const router = useRouter()
const { flatSubCategories } = useCategories()

const quickCategories = computed(() => {
  // Common help subcategories
  const targetIds = [7, 9, 8, 10, 11, 12, 24, 21]
  return flatSubCategories.value.filter((c) => targetIds.includes(c.id))
})

const popularTags = [
  { key: 'godot-4', label: 'Godot 4' },
  { key: 'gdscript', label: 'GDScript' },
  { key: '2d', label: '2D 游戏' },
  { key: '3d', label: '3D 渲染' },
  { key: 'shaders', label: '着色器' },
  { key: 'csharp', label: 'C#' },
  { key: 'tilemap', label: '瓦片地图' },
  { key: 'xr', label: 'XR/VR' }
]

const filterByTag = (tagKey: string) => {
  emit('tag-select', tagKey)
  router.push({ path: '/', query: { tag: tagKey } })
}
</script>

<style src="@/styles/sidebar.css" scoped></style>
