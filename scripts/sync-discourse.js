/**
 * Godot 官方论坛定时抓取与离线同步脚本
 * 支持本地定时运行，亦可由 GitHub Actions / Linux Cron 在云端 24 小时自动执行
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'https://forum.godotengine.org'
const OUTPUT_DIR = path.resolve(__dirname, '../public/data')

async function syncForumData() {
  console.log(`[${new Date().toISOString()}] 开始执行 Godot 官方论坛云端定时同步任务...`)

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }
  })

  try {
    // 1. 同步全站分类
    console.log('正在拉取 categories.json...')
    const catRes = await client.get('/categories.json')
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'categories.json'),
      JSON.stringify(catRes.data, null, 2),
      'utf-8'
    )
    console.log('✓ 分类数据同步完成')

    // 2. 同步最新话题（拉取前 6 页，约 180 条讨论，去重后聚合）
    console.log('正在拉取 latest.json (多页话题聚合)...')
    const allLatestTopics = []
    const seenLatestIds = new Set()
    let latestBaseData = null

    for (let p = 0; p < 6; p++) {
      try {
        const res = await client.get(`/latest.json?page=${p}`)
        if (!latestBaseData) latestBaseData = res.data
        const topics = res.data?.topic_list?.topics || []
        for (const t of topics) {
          if (!seenLatestIds.has(t.id)) {
            seenLatestIds.add(t.id)
            allLatestTopics.push(t)
          }
        }
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
    console.log('正在拉取 top.json...')
    const topRes = await client.get('/top.json?period=monthly')
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'top.json'),
      JSON.stringify(topRes.data, null, 2),
      'utf-8'
    )
    console.log('✓ 热门话题同步完成')

    // 4. 更新同步元信息
    const syncMeta = {
      lastSyncedAt: new Date().toISOString(),
      topicCount: allLatestTopics.length,
      categoryCount: catRes.data?.category_list?.categories?.length || 0,
      status: 'success'
    }
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'sync-meta.json'),
      JSON.stringify(syncMeta, null, 2),
      'utf-8'
    )
    console.log('✓ 同步状态更新完成:', syncMeta)
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
