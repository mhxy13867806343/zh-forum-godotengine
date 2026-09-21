import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import path from 'path'

import { fetch as undiciFetch, ProxyAgent } from 'undici'
import { execSync } from 'child_process'

function getSystemProxy(): string | null {
  if (process.env.https_proxy || process.env.http_proxy) {
    return process.env.https_proxy || process.env.http_proxy
  }
  try {
    const out = execSync('scutil --proxy', { encoding: 'utf-8' })
    const portMatch = out.match(/HTTPPort\s*:\s*(\d+)/)
    const proxyMatch = out.match(/HTTPProxy\s*:\s*([^\s]+)/)
    const enabled = out.match(/HTTPEnable\s*:\s*1/)
    if (enabled && portMatch && proxyMatch) {
      return `http://${proxyMatch[1]}:${portMatch[1]}`
    }
  } catch {}
  return 'http://127.0.0.1:17891'
}

const proxyUrl = getSystemProxy()
const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined

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
          let response: any
          let lastErr: any
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              response = await undiciFetch(targetUrl, {
                dispatcher,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'application/json'
                }
              })
              if (response && response.status < 500) {
                break
              }
            } catch (e: any) {
              lastErr = e
              await new Promise(r => setTimeout(r, 300))
            }
          }

          if (!response && lastErr) {
            throw lastErr
          }

          res.statusCode = response.status
          response.headers.forEach((val: string, key: string) => {
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
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: '502 Bad Gateway: ' + err.message }))
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
