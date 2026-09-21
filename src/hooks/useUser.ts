import { ref, computed } from 'vue'
import { loginApi, registerApi, logoutApi, getCurrentUserApi } from '@/api/auth'

export interface UserProfile {
  id: number
  username: string
  nickname: string
  avatar: string
  bio: string
  role: 'member' | 'developer' | 'moderator' | 'admin'
  roleName: string
  token: string
  joinedAt: string
}

const STORAGE_KEY = 'godot_zh_user'
const TOKEN_KEY = 'godot_zh_token'

const currentUser = ref<UserProfile | null>(null)

// Initialize from localStorage and verify with backend
if (typeof localStorage !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      currentUser.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage', e)
  }
}

export function useUser() {
  const isAuthModalOpen = ref(false)
  const authMode = ref<'login' | 'register'>('login')

  const isLoggedIn = computed(() => currentUser.value !== null)

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    authMode.value = mode
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
  }

  const login = async (username: string, password = ''): Promise<boolean> => {
    // Send real HTTP request via Axios
    const res = await loginApi({ username, password })
    if (res?.data?.user) {
      currentUser.value = res.data.user
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user))
        localStorage.setItem(TOKEN_KEY, res.data.token)
      }
      isAuthModalOpen.value = false
      return true
    }
    return false
  }

  const register = async (username: string, nickname: string, password = ''): Promise<boolean> => {
    // Send real HTTP request via Axios
    const res = await registerApi({ username, nickname, password })
    if (res?.data?.user) {
      currentUser.value = res.data.user
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user))
        localStorage.setItem(TOKEN_KEY, res.data.token)
      }
      isAuthModalOpen.value = false
      return true
    }
    return false
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // ignore
    }
    currentUser.value = null
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  const checkCurrentUser = async () => {
    if (typeof localStorage === 'undefined') return
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      try {
        const res = await getCurrentUserApi()
        if (res?.data?.user) {
          currentUser.value = res.data.user
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user))
        }
      } catch (err) {
        console.warn('Session expired or offline:', err)
      }
    }
  }

  return {
    currentUser,
    isLoggedIn,
    isAuthModalOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
    checkCurrentUser
  }
}
