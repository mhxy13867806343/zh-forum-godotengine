<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
    :style="{ backgroundColor: badgeBg, color: badgeColor }"
    @click.stop="handleClick"
  >
    <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: cat.color || '#478cbf' }"></span>
    <span>{{ cat.zhName || cat.name }}</span>
  </span>
</template>

<script setup lang="ts">
import { getCategoryInfo } from '@/utils/categoryDict'

const props = defineProps<{
  categoryId: number
}>()

const router = useRouter()
const cat = computed(() => getCategoryInfo(props.categoryId))

const badgeBg = computed(() => {
  return `${cat.value.color}22`
})

const badgeColor = computed(() => {
  return cat.value.color || '#478cbf'
})

const handleClick = () => {
  router.push(`/c/${cat.value.slug}/${cat.value.id}`)
}
</script>
