import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        }
      ],
      dts: 'auto-imports.d.ts'
    }),
    Components({
      resolvers: [NaiveUiResolver()],
      dts: 'components.d.ts'
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api/discourse': {
        target: 'https://forum.godotengine.org',
        changeOrigin: true,
        followRedirects: true,
        rewrite: (path) => path.replace(/^\/api\/discourse/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        }
      }
    }
  }
})
