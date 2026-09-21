const TERM_MAP: Record<string, string> = {
  'GDScript': 'GDScript',
  'Godot 4': 'Godot 4',
  'Godot 3': 'Godot 3',
  'First Level is ready!': '第一关已经制作完成！',
  'Warrior of the Inquisition 0.1.4, is available for testing!': '我的第一款游戏《审判所战士 0.1.4》现已开启测试！',
  "Can't get time slowing to work.": '无法正常实现时间变慢/子弹时间效果。',
  'Pixel Art (For a beginner)': '给新手的像素画入门指南',
  'Three professions, one town: what I learned building a life RPG solo in Godot 4.7': '三个职业，一个小镇：我用 Godot 4 独立开发生活类 RPG 的心路历程与经验',
  'How can I get the collision layer of a colliding tile in a TileMapLayer?': '如何在 TileMapLayer 中获取碰撞图块的碰撞层 (collision layer)？',
  'Sword Swinging Mechanic': '挥剑攻击/近战动作手感机制实现',
  'Godot MCP Studio, an AI tool for Godot 4': 'Godot MCP Studio：面向 Godot 4 的 AI 辅助开发工具',
  'Run Current Scene in 640x360 resolution': '如何以 640x360 分辨率运行当前独立场景？',
  'How do I implement borders for my game?': '如何在游戏中实现地图/屏幕边界碰撞？',
  'Grab focus on buttons created during game': '如何让游戏运行时动态生成的按钮自动获取焦点？',
  'How do I load an MP3 from user:// into an AudioStreamPlayer?': '如何从 user:// 本地目录将 MP3 音频加载进 AudioStreamPlayer？',
  'Editor Plugin to Connect Signals Through Viewport': '视口中直接可视化连接信号的编辑器插件',
  'Help with a Segmented dragon enemy': '多节龙型蠕虫敌人的分节跟随逻辑求助',
  'Welcome to the Godot Forum!': '欢迎来到 Godot 官方论坛！',
  'Post Tutorials here!(videos to Godot)': '在此分享你的 Godot 教程与视频！'
}

export function translateTitle(title: string): string {
  if (!title) return ''
  for (const [en, zh] of Object.entries(TERM_MAP)) {
    if (title.toLowerCase().includes(en.toLowerCase())) {
      return zh
    }
  }
  return title
}

export const TAG_ZH_MAP: Record<string, string> = {
  'godot-4': 'Godot 4.x',
  'godot-3': 'Godot 3.x',
  '2d': '2D 游戏',
  '3d': '3D 渲染',
  'gdscript': 'GDScript 脚本',
  'csharp': 'C# 开发',
  'game': '游戏作品',
  'tilemap': 'TileMap 瓦片地图',
  'plugin-development': '插件开发',
  'animation': '动画',
  'rendering': '渲染器',
  'networking': '网络多人',
  'xr': 'XR/VR',
  'release': '版本发布',
  'beta': '测试版本',
  'dev-snapshot': '开发快照'
}

export function getTagName(tag: any): string {
  if (!tag) return ''
  if (typeof tag === 'string') return tag
  return tag.name || tag.slug || String(tag.id || '')
}

export function translateTag(tag: any): string {
  const name = getTagName(tag)
  return TAG_ZH_MAP[name] || name
}
