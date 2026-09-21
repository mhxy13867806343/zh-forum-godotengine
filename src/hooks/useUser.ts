import { ref, computed } from 'vue'

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

const currentUser = ref<UserProfile | null>(null)

// Initialize from localStorage
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

  const login = async (username: string, _password: string): Promise<boolean> => {
    // Simulated authentication with persistent storage
    const user: UserProfile = {
      id: Math.floor(Math.random() * 90000) + 10000,
      username: username.trim(),
      nickname: username.trim() === 'godot_dev' ? 'Godot 独立开发者' : username.trim(),
      avatar: `https://avatars.githubusercontent.com/u/${(username.length * 12345) % 100000}?v=4`,
      bio: '热爱 Godot 游戏引擎与开源技术！',
      role: username === 'admin' ? 'admin' : 'developer',
      roleName: username === 'admin' ? '论坛管理员' : '认证开发者',
      token: `token_${Date.now()}`,
      joinedAt: '2026-09-21'
    }

    currentUser.value = user
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    }
    isAuthModalOpen.value = false
    return true
  }

  const register = async (username: string, nickname: string, _password: string): Promise<boolean> => {
    const user: UserProfile = {
      id: Math.floor(Math.random() * 90000) + 10000,
      username: username.trim(),
      nickname: nickname.trim() || username.trim(),
      avatar: `https://avatars.githubusercontent.com/u/${(username.length * 54321) % 100000}?v=4`,
      bio: 'Godot 中文论坛新成员。',
      role: 'member',
      roleName: '社区成员',
      token: `token_${Date.now()}`,
      joinedAt: '2026-09-21'
    }

    currentUser.value = user
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    }
    isAuthModalOpen.value = false
    return true
  }

  const logout = () => {
    currentUser.value = null
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
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
    logout
  }
}
