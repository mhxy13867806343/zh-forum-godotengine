/**
 * Godot 官方论坛定时抓取与离线同步脚本
 * 支持本地定时运行，亦可由 GitHub Actions / Linux Cron 在云端 24 小时自动执行
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetch as undiciFetch, ProxyAgent } from 'undici'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'https://forum.godotengine.org'
const OUTPUT_DIR = path.resolve(__dirname, '../public/data')

function getSystemProxy() {
  if (process.env.https_proxy || process.env.http_proxy) {
    return process.env.https_proxy || process.env.http_proxy
  }
  if (process.platform === 'darwin') {
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
  return null
}

const proxyUrl = getSystemProxy()
const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined

async function fetchJson(urlPath) {
  const targetUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`
  const res = await undiciFetch(targetUrl, {
    dispatcher,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} on ${urlPath}`)
  }
  return await res.json()
}

async function syncForumData() {
  console.log(`[${new Date().toISOString()}] 开始执行 Godot 官方论坛定时同步任务...`)
  if (proxyUrl) console.log(`[Proxy] 使用网络代理: ${proxyUrl}`)

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  try {
    // 1. 同步全站分类
    console.log('1. 正在拉取 categories.json...')
    const catData = await fetchJson('/categories.json')
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'categories.json'),
      JSON.stringify(catData, null, 2),
      'utf-8'
    )
    console.log('✓ 分类数据同步完成')

    // 2. 同步最新话题（拉取前 6 页，约 180 条讨论，去重后聚合）
    console.log('2. 正在拉取 latest.json (多页话题聚合)...')
    const allLatestTopics = []
    const seenLatestIds = new Set()
    let latestBaseData = null

    for (let p = 0; p < 6; p++) {
      try {
        const data = await fetchJson(`/latest.json?page=${p}`)
        if (!latestBaseData) latestBaseData = data
        const topics = data?.topic_list?.topics || []
        for (const t of topics) {
          if (!seenLatestIds.has(t.id)) {
            seenLatestIds.add(t.id)
            allLatestTopics.push(t)
          }
        }
        await new Promise(r => setTimeout(r, 60))
      } catch (err) {
        console.warn(`第 ${p} 页拉取跳过:`, err.message)
        break
      }
    }

    if (latestBaseData) {
      latestBaseData.topic_list.topics = allLatestTopics
      fs.writeFileSync(
        path.join(OUTPUT_DIR, 'latest.json'),
        JSON.stringify(latestBaseData, null, 2),
        'utf-8'
      )
      console.log(`✓ 最新话题同步完成，聚合共 ${allLatestTopics.length} 条话题`)
    }

    // 3. 同步热门话题
    console.log('3. 正在拉取 top.json...')
    const topData = await fetchJson('/top.json?period=monthly')
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'top.json'),
      JSON.stringify(topData, null, 2),
      'utf-8'
    )
    console.log('✓ 热门话题同步完成')

    // 4. 同步作品展厅 (Showcase 完整全量抓取，支持第 1 页到尾页 134 页)
    console.log('4. 正在抓取作品展厅 (Showcase 14) 全量数据...')
    const allShowcase = []
    const seenShowcaseIds = new Set()
    for (let p = 0; p <= 45; p++) {
      try {
        const data = await fetchJson(`/c/showcase/14.json?page=${p}`)
        const list = data?.topic_list?.topics || []
        if (list.length === 0) break
        for (const t of list) {
          if (!seenShowcaseIds.has(t.id)) {
            seenShowcaseIds.add(t.id)
            allShowcase.push(t)
          }
        }
        if (!data?.topic_list?.more_topics_url) break
        await new Promise(r => setTimeout(r, 60))
      } catch (e) {
        console.warn(`Showcase 第 ${p} 页拉取结束:`, e.message)
        break
      }
    }
    if (allShowcase.length > 0) {
      fs.writeFileSync(
        path.join(OUTPUT_DIR, 'showcase.json'),
        JSON.stringify({
          total: allShowcase.length,
          updated_at: new Date().toISOString(),
          topics: allShowcase
        }, null, 2),
        'utf-8'
      )
      console.log(`✓ 作品展厅全量同步完成，共 ${allShowcase.length} 条作品 (覆盖至尾页)`)
    }

    // 5. 同步重点核心板块
    console.log('5. 正在抓取重点核心板块数据 (UI、编程、求助等)...')
    const catDir = path.join(OUTPUT_DIR, 'categories')
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true })

    const targetCategories = [8, 7, 6, 9, 10, 11, 12, 23, 19, 21, 20, 4]
    for (const catId of targetCategories) {
      try {
        const catTopics = []
        const seenCatIds = new Set()
        for (let p = 0; p < 4; p++) {
          const data = await fetchJson(`/c/${catId}.json?page=${p}`)
          const list = data?.topic_list?.topics || []
          if (list.length === 0) break
          for (const t of list) {
            if (!seenCatIds.has(t.id)) {
              seenCatIds.add(t.id)
              catTopics.push(t)
            }
          }
          if (!data?.topic_list?.more_topics_url) break
          await new Promise(r => setTimeout(r, 50))
        }
        if (catTopics.length > 0) {
          fs.writeFileSync(
            path.join(catDir, `${catId}.json`),
            JSON.stringify({
              categoryId: catId,
              total: catTopics.length,
              topics: catTopics,
              updated_at: new Date().toISOString()
            }, null, 2),
            'utf-8'
          )
        }
      } catch (err) {
        console.warn(`Category ${catId} 同步跳过:`, err.message)
      }
    }
    console.log('✓ 核心板块数据同步完成')

    // 6. 维护规范路径静态镜像 (例如 c/help/ui/8.json)
    const cHelpUiDir = path.join(OUTPUT_DIR, 'c/help/ui')
    if (!fs.existsSync(cHelpUiDir)) fs.mkdirSync(cHelpUiDir, { recursive: true })
    if (fs.existsSync(path.join(catDir, '8.json'))) {
      fs.copyFileSync(path.join(catDir, '8.json'), path.join(cHelpUiDir, '8.json'))
    }

    const cShowcaseDir = path.join(OUTPUT_DIR, 'c/showcase')
    if (!fs.existsSync(cShowcaseDir)) fs.mkdirSync(cShowcaseDir, { recursive: true })
    if (fs.existsSync(path.join(OUTPUT_DIR, 'showcase.json'))) {
      fs.copyFileSync(path.join(OUTPUT_DIR, 'showcase.json'), path.join(cShowcaseDir, '14.json'))
    }

    // 7. 更新同步元信息
    const syncMeta = {
      lastSyncedAt: new Date().toISOString(),
      topicCount: allLatestTopics.length,
      showcaseCount: allShowcase.length,
      categoryCount: catData?.category_list?.categories?.length || 0,
      status: 'success'
    }
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'sync-meta.json'),
      JSON.stringify(syncMeta, null, 2),
      'utf-8'
    )
    console.log('✓ 全部同步状态更新完成:', syncMeta)
  } catch (error) {
    console.error('同步失败:', error.message)
    const failMeta = {
      lastSyncedAt: new Date().toISOString(),
      error: error.message,
      status: 'failed'
    }
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'sync-meta.json'),
      JSON.stringify(failMeta, null, 2),
      'utf-8'
    )
  }
}

syncForumData()
