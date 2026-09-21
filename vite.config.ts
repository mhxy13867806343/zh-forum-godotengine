import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import path from 'path'

function discourseProxyPlugin() {
  return {
    name: 'discourse-proxy-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/discourse')) {
          return next()
        }
        try {
          const targetPath = req.url.replace(/^\/api\/discourse/, '')
          const targetUrl = `https://forum.godotengine.org${targetPath}`
          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json'
            }
          })

          res.statusCode = response.status
          response.headers.forEach((val, key) => {
            const lower = key.toLowerCase()
            if (!['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(lower)) {
              res.setHeader(key, val)
            }
          })
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          const arrayBuffer = await response.arrayBuffer()
          res.end(Buffer.from(arrayBuffer))
        } catch (err: any) {
          console.error('[Discourse Proxy Plugin Error]', err.message)
          res.statusCode = 502
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    UnoCSS(),
    discourseProxyPlugin(),
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
    port: 5173
  }
})
