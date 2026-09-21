import { ref, computed } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'

const THEME_KEY = 'godot_zh_theme'

function getSystemIsDark(): boolean {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return true
}

export type ThemeMode = 'system' | 'dark' | 'light'

const themeMode = ref<ThemeMode>('system')
const isDark = ref(getSystemIsDark())

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') {
    themeMode.value = saved
    isDark.value = saved === 'dark'
  } else {
    themeMode.value = 'system'
    isDark.value = getSystemIsDark()
  }
}

function syncHtmlClass() {
  if (typeof document !== 'undefined') {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }
}

// Listen to system dark/light theme changes
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemChange = (e: MediaQueryListEvent) => {
    if (themeMode.value === 'system') {
      isDark.value = e.matches
      syncHtmlClass()
    }
  }
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemChange)
  }
}

// Ensure initial html class is set immediately
syncHtmlClass()

export function useTheme() {
  const toggleTheme = (): boolean => {
    const nextIsDark = !isDark.value
    isDark.value = nextIsDark
    themeMode.value = nextIsDark ? 'dark' : 'light'
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_KEY, themeMode.value)
    }
    syncHtmlClass()
    return nextIsDark
  }

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    if (mode === 'system') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(THEME_KEY)
      }
      isDark.value = getSystemIsDark()
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_KEY, mode)
      }
      isDark.value = mode === 'dark'
    }
    syncHtmlClass()
  }

  const currentTheme = computed(() => (isDark.value ? darkTheme : null))

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    const common = {
      primaryColor: '#478CBF',
      primaryColorHover: '#5CA1D4',
      primaryColorPressed: '#38739E',
      primaryColorSuppl: '#478CBF',
      borderRadius: '8px'
    }

    if (isDark.value) {
      return {
        common: {
          ...common,
          bodyColor: '#181b20',
          cardColor: '#242932',
          modalColor: '#282e38',
          headerColor: '#20252C',
          borderColor: '#353c48',
          textColorBase: '#f1f5f9',
          textColor1: '#e2e8f0',
          textColor2: '#94a3b8'
        },
        Card: {
          color: '#242932',
          borderColor: '#353c48'
        },
        Layout: {
          color: '#181b20',
          headerColor: '#20252C',
          siderColor: '#20252C',
          footerColor: '#20252C'
        }
      }
    } else {
      return {
        common: {
          ...common,
          bodyColor: '#f8fafc',
          cardColor: '#ffffff',
          modalColor: '#ffffff',
          headerColor: '#ffffff',
          borderColor: '#e2e8f0',
          textColorBase: '#1e293b',
          textColor1: '#0f172a',
          textColor2: '#475569'
        },
        Card: {
          color: '#ffffff',
          borderColor: '#e2e8f0'
        },
        Layout: {
          color: '#f8fafc',
          headerColor: '#ffffff',
          siderColor: '#ffffff',
          footerColor: '#ffffff'
        }
      }
    }
  })

  return {
    isDark,
    themeMode,
    toggleTheme,
    setThemeMode,
    currentTheme,
    themeOverrides
  }
}
