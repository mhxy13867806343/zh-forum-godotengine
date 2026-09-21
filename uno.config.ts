import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    })
  ],
  theme: {
    colors: {
      godot: {
        blue: '#478CBF',
        dark: '#20252C',
        surface: '#2c313a',
        border: '#3d4450',
        text: '#f1f1f1',
        muted: '#9ba1a6',
        accent: '#478cbf'
      }
    }
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'card-hover': 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'
  }
})
