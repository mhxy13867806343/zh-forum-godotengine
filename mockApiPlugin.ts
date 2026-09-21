import type { Plugin } from 'vite'

export function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        if (!url.startsWith('/api/auth') && !url.startsWith('/api/topics')) {
          return next()
        }

        let bodyStr = ''
        req.on('data', (chunk) => {
          bodyStr += chunk
        })

        req.on('end', () => {
          let body: any = {}
          try {
            if (bodyStr) body = JSON.parse(bodyStr)
          } catch {
            // ignore
          }

          res.setHeader('Content-Type', 'application/json; charset=utf-8')

          // 1. POST /api/auth/login
          if (url.startsWith('/api/auth/login') && req.method === 'POST') {
            const username = body.username || 'godot_dev'
            const user = {
              id: Math.floor(Math.random() * 90000) + 10000,
              username,
              nickname: username === 'godot_dev' ? 'Godot 独立开发者' : username,
              avatar: `https://avatars.githubusercontent.com/u/${(username.length * 12345) % 100000}?v=4`,
              bio: '热爱 Godot 游戏引擎与开源技术！',
              role: username === 'admin' ? 'admin' : 'developer',
              roleName: username === 'admin' ? '论坛管理员' : '认证开发者',
              token: `godot_jwt_${Date.now()}`,
              joinedAt: '2026-09-21'
            }
            res.statusCode = 200
            return res.end(
              JSON.stringify({
                code: 200,
                message: '登录成功',
                data: {
                  token: user.token,
                  user
                }
              })
            )
          }

          // 2. POST /api/auth/register
          if (url.startsWith('/api/auth/register') && req.method === 'POST') {
            const username = body.username || `user_${Date.now()}`
            const nickname = body.nickname || username
            const user = {
              id: Math.floor(Math.random() * 90000) + 10000,
              username,
              nickname,
              avatar: `https://avatars.githubusercontent.com/u/${(username.length * 54321) % 100000}?v=4`,
              bio: 'Godot 中文论坛新成员。',
              role: 'member',
              roleName: '社区成员',
              token: `godot_jwt_${Date.now()}`,
              joinedAt: '2026-09-21'
            }
            res.statusCode = 200
            return res.end(
              JSON.stringify({
                code: 200,
                message: '注册成功并已自动登录',
                data: {
                  token: user.token,
                  user
                }
              })
            )
          }

          // 3. GET /api/auth/current-user
          if (url.startsWith('/api/auth/current-user') && req.method === 'GET') {
            const user = {
              id: 10001,
              username: 'godot_dev',
              nickname: 'Godot 独立开发者',
              avatar: 'https://avatars.githubusercontent.com/u/1024001?v=4',
              bio: '热爱 Godot 游戏引擎与开源技术！',
              role: 'developer',
              roleName: '认证开发者',
              token: `godot_jwt_existing`,
              joinedAt: '2026-09-21'
            }
            res.statusCode = 200
            return res.end(
              JSON.stringify({
                code: 200,
                data: { user }
              })
            )
          }

          // 4. POST /api/auth/logout
          if (url.startsWith('/api/auth/logout') && req.method === 'POST') {
            res.statusCode = 200
            return res.end(
              JSON.stringify({
                code: 200,
                message: '已成功退出当前账号'
              })
            )
          }

          // 5. POST /api/topics/reply
          if (url.startsWith('/api/topics/reply') && req.method === 'POST') {
            const newPost = {
              id: Date.now(),
              name: body.authorName || 'Godot 探索者',
              username: body.username || 'community_member',
              avatar_template: 'https://avatars.githubusercontent.com/u/1024004?v=4',
              created_at: new Date().toISOString(),
              cooked: `<p>${(body.content || '').replace(/\n/g, '<br/>')}</p>`,
              post_number: 99,
              post_type: 1,
              updated_at: new Date().toISOString(),
              reply_count: 0,
              quote_count: 0,
              incoming_link_count: 0,
              reads: 1,
              readers_count: 1,
              score: 0,
              yours: true,
              topic_id: body.topicId || 0,
              topic_slug: '',
              display_username: body.authorName || 'Godot 探索者',
              version: 1,
              can_edit: true,
              can_delete: true,
              can_recover: false,
              can_see_hidden_post: false,
              can_wiki: false,
              moderator: false,
              admin: false,
              staff: false,
              user_id: 88888,
              hidden: false,
              trust_level: 2,
              user_deleted: false,
              can_view_edit_history: false,
              wiki: false
            }
            res.statusCode = 200
            return res.end(
              JSON.stringify({
                code: 200,
                message: '回复发表成功',
                data: newPost
              })
            )
          }

          // 6. POST /api/topics/like
          if (url.startsWith('/api/topics/like') && req.method === 'POST') {
            res.statusCode = 200
            return res.end(
              JSON.stringify({
                code: 200,
                message: body.liked ? '点赞成功' : '已取消点赞',
                data: {
                  liked: body.liked,
                  score: body.liked ? 1 : 0
                }
              })
            )
          }

          res.statusCode = 404
          res.end(JSON.stringify({ code: 404, message: 'Not Found' }))
        })
      })
    }
  }
}
