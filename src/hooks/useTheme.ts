import { ref, computed } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'

const THEME_KEY = 'godot_zh_theme'

const isDark = ref(true)

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved !== null) {
    isDark.value = saved === 'dark'
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

// Ensure initial html class is set immediately
syncHtmlClass()

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
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
    toggleTheme,
    currentTheme,
    themeOverrides
  }
}
