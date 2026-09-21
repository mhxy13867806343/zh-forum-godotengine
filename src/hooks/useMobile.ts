import { ref, onMounted, onUnmounted } from 'vue'

export function useMobile(breakpoint = 768) {
  const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false)

  const handleResize = () => {
    isMobile.value = window.innerWidth <= breakpoint
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize, { passive: true })
    handleResize()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    isMobile
  }
}
