<template>
  <div
    class="pull-refresh-container"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
    @mousedown="handleMouseDown"
  >
    <!-- Pull Down Indicator -->
    <div
      class="pull-down-indicator"
      :style="{
        height: `${pullDistance}px`,
        opacity: pullDistance > 8 ? 1 : 0
      }"
    >
      <div class="indicator-bubble">
        <span
          class="indicator-icon"
          :class="{
            'is-spinning': isRefreshing,
            'is-ready': pullDistance >= triggerDistance && !isRefreshing
          }"
        >
          {{ isRefreshing ? '🔄' : '↓' }}
        </span>
        <span class="indicator-text">
          {{ isRefreshing ? '正在同步最新话题...' : (pullDistance >= triggerDistance ? '释放立即刷新' : '下拉即可刷新') }}
        </span>
      </div>
    </div>

    <!-- Main Content Slot -->
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  onRefresh: () => Promise<void> | void
  disabled?: boolean
}>()

const triggerDistance = 55
const maxDistance = 90
const pullDistance = ref(0)
const isRefreshing = ref(false)
let startY = 0
let isDragging = false

const getScrollTop = () => {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
}

// Touch Event Handlers
const handleTouchStart = (e: TouchEvent) => {
  if (props.disabled) return
  if (getScrollTop() <= 5 && !isRefreshing.value) {
    startY = e.touches[0].clientY
    isDragging = true
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging || isRefreshing.value || props.disabled) return
  const currentY = e.touches[0].clientY
  const diff = currentY - startY
  if (diff > 0 && getScrollTop() <= 5) {
    pullDistance.value = Math.min(diff * 0.45, maxDistance)
  } else {
    pullDistance.value = 0
    isDragging = false
  }
}

const handleTouchEnd = async () => {
  if (!isDragging || props.disabled) return
  isDragging = false
  if (pullDistance.value >= triggerDistance && !isRefreshing.value) {
    isRefreshing.value = true
    pullDistance.value = triggerDistance
    try {
      await props.onRefresh()
    } finally {
      setTimeout(() => {
        isRefreshing.value = false
        pullDistance.value = 0
      }, 350)
    }
  } else {
    pullDistance.value = 0
  }
}

// Mouse Event Handlers (Support DevTools mouse drag simulation)
const handleMouseDown = (e: MouseEvent) => {
  if (props.disabled || e.button !== 0) return
  if (getScrollTop() <= 5 && !isRefreshing.value) {
    startY = e.clientY
    isDragging = true

    const handleMouseMove = (me: MouseEvent) => {
      if (!isDragging || isRefreshing.value) return
      const diff = me.clientY - startY
      if (diff > 0 && getScrollTop() <= 5) {
        pullDistance.value = Math.min(diff * 0.45, maxDistance)
      } else {
        pullDistance.value = 0
        isDragging = false
      }
    }

    const handleMouseUp = async () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      if (!isDragging) return
      isDragging = false

      if (pullDistance.value >= triggerDistance && !isRefreshing.value) {
        isRefreshing.value = true
        pullDistance.value = triggerDistance
        try {
          await props.onRefresh()
        } finally {
          setTimeout(() => {
            isRefreshing.value = false
            pullDistance.value = 0
          }, 350)
        }
      } else {
        pullDistance.value = 0
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }
}
</script>

<style src="@/styles/pull-refresh.css" scoped></style>
