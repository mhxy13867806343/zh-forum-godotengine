<template>
  <transition name="back-top-fade">
    <div
      v-show="visible"
      class="app-back-top"
      title="回到顶部"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <span class="back-top-icon">▲</span>
      <span class="back-top-text">顶部</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
const visible = ref(false)

const handleScroll = () => {
  const scrollTop =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  visible.value = scrollTop > 160
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  document.body.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style src="@/styles/back-top.css" scoped></style>
