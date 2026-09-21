export interface CategoryMeta {
  id: number
  slug: string
  name: string
  zhName: string
  color: string
  icon: string
  description: string
  zhDescription: string
  parentId?: number
}

export const CATEGORY_MAP: Record<number, CategoryMeta> = {
  23: {
    id: 23,
    slug: 'announcements',
    name: 'Announcements',
    zhName: '官方公告',
    color: '#F57389',
    icon: 'megaphone-outline',
    description: 'Official blog posts and other Godot announcements.',
    zhDescription: 'Godot 官方博客同步、新版本发布与重大社区通知。'
  },
  6: {
    id: 6,
    slug: 'help',
    name: 'Help',
    zhName: '求助问答',
    color: '#478CBF',
    icon: 'help-circle-outline',
    description: 'Ask your questions here! If possible, use one of the more specific subcategories.',
    zhDescription: 'Godot 开发者技术求助与答疑核心区。'
  },
  7: {
    id: 7,
    slug: 'programming',
    name: 'Programming',
    zhName: '编程开发',
    color: '#78E5F6',
    icon: 'code-slash-outline',
    description: 'Questions about code, syntax and related topics.',
    zhDescription: 'GDScript、C#、C++ GDExtension 及代码语法、API 与逻辑架构问答。',
    parentId: 6
  },
  9: {
    id: 9,
    slug: 'physics',
    name: 'Physics',
    zhName: '物理系统',
    color: '#78E5F6',
    icon: 'planet-outline',
    description: 'Talk about physic bodies and how they can interact with each other.',
    zhDescription: '刚体、碰撞体、射线检测、物理约束与物理模拟探讨。',
    parentId: 6
  },
  8: {
    id: 8,
    slug: 'ui',
    name: 'UI',
    zhName: '界面 UI',
    color: '#78E5F6',
    icon: 'browsers-outline',
    description: 'Ask questions about the Godot UI system.',
    zhDescription: 'Control 节点控件、界面自适应布局、主题皮肤与手柄按键导航。',
    parentId: 6
  },
  10: {
    id: 10,
    slug: 'shaders',
    name: 'Shaders',
    zhName: '着色器与特效',
    color: '#78E5F6',
    icon: 'sparkles-outline',
    description: 'Get help with shaders and visual effects.',
    zhDescription: 'Godot Shader 语言、后处理特效、材质渲染与粒子系统。',
    parentId: 6
  },
  11: {
    id: 11,
    slug: 'animation',
    name: 'Animation',
    zhName: '动画系统',
    color: '#78E5F6',
    icon: 'film-outline',
    description: 'Anything animation related — from small animated sprites to complex animation trees for 3D models.',
    zhDescription: '帧动画、骨骼动画、AnimationPlayer 与复杂 AnimationTree 状态机。',
    parentId: 6
  },
  12: {
    id: 12,
    slug: 'networking',
    name: 'Networking',
    zhName: '网络与联机',
    color: '#78E5F6',
    icon: 'cloud-outline',
    description: 'Questions about networking and multiplayer games.',
    zhDescription: '网络同步、多人多人对战、WebSocket、RPC 与后端通信。',
    parentId: 6
  },
  26: {
    id: 26,
    slug: 'navigation',
    name: 'Navigation',
    zhName: '寻路导航',
    color: '#78E5F6',
    icon: 'compass-outline',
    description: 'Anything related to pathfinding.',
    zhDescription: 'NavigationAgent、NavMesh 烘焙、A* 算法与避障系统。',
    parentId: 6
  },
  13: {
    id: 13,
    slug: 'audio',
    name: 'Audio',
    zhName: '音频与音效',
    color: '#78E5F6',
    icon: 'volume-high-outline',
    description: 'Ask questions about sound effects, music, spatial audio and more.',
    zhDescription: '音效加载、BGM 控制、AudioServer 总线与 3D 空间音频。',
    parentId: 6
  },
  30: {
    id: 30,
    slug: 'xr',
    name: 'XR',
    zhName: '扩展现实 XR',
    color: '#78E5F6',
    icon: 'glasses-outline',
    description: 'Anything related to extended reality (AR/VR).',
    zhDescription: 'VR / AR / OpenXR 虚拟现实开发与手柄姿态追踪。',
    parentId: 6
  },
  14: {
    id: 14,
    slug: 'showcase',
    name: 'Showcase',
    zhName: '作品展厅',
    color: '#808281',
    icon: 'game-controller-outline',
    description: 'Show everyone what you are working on and discover amazing projects!',
    zhDescription: '展示你的作品，发掘社区开发者使用 Godot 创造的惊艳项目！'
  },
  15: {
    id: 15,
    slug: 'games',
    name: 'Games',
    zhName: '已发布游戏',
    color: '#808281',
    icon: 'trophy-outline',
    description: 'Show games you made with Godot!',
    zhDescription: '已上架 Steam / Itch / 移动端的完整游戏成品展示。',
    parentId: 14
  },
  24: {
    id: 24,
    slug: 'in-development',
    name: 'In Development',
    zhName: '在研项目',
    color: '#808281',
    icon: 'construct-outline',
    description: 'Do you have any work-in-progress? Share what you are currently creating in this category!',
    zhDescription: '正在开发中的项目、Demo 试玩、开发者日志 (DevLog) 分享。',
    parentId: 14
  },
  16: {
    id: 16,
    slug: 'tools',
    name: 'Applications',
    zhName: '应用与工具',
    color: '#808281',
    icon: 'apps-outline',
    description: 'Show tools and other applications you made with Godot!',
    zhDescription: '使用 Godot 制作的非游戏类桌面应用、可视化工具与效率软件。',
    parentId: 14
  },
  19: {
    id: 19,
    slug: 'resources',
    name: 'Resources',
    zhName: '资源与教程',
    color: '#63B3ED',
    icon: 'library-outline',
    description: 'Share tutorials, plugins and other resources for creating Godot games!',
    zhDescription: '社区插件工具、实战教程与优质开源资产集合。'
  },
  21: {
    id: 21,
    slug: 'plugins',
    name: 'Plugins',
    zhName: '插件扩展',
    color: '#63B3ED',
    icon: 'extension-puzzle-outline',
    description: 'Share add-ons and other tools for Godot.',
    zhDescription: '社区编写的 Godot 编辑器插件、自定义节点与功能包。',
    parentId: 19
  },
  20: {
    id: 20,
    slug: 'tutorials',
    name: 'Tutorials',
    zhName: '教程指南',
    color: '#63B3ED',
    icon: 'book-outline',
    description: 'Post Godot related tutorials here.',
    zhDescription: '文字图文教程、视频教学、新手从零起步全流程。',
    parentId: 19
  },
  22: {
    id: 22,
    slug: 'tips-tricks',
    name: 'Tips & Tricks',
    zhName: '秘籍技巧',
    color: '#63B3ED',
    icon: 'bulb-outline',
    description: 'Show your favorite tips & tricks for making games.',
    zhDescription: '高效率技巧、隐藏功能、性能调优秘笈与避坑心得。',
    parentId: 19
  },
  25: {
    id: 25,
    slug: 'assets',
    name: 'Assets',
    zhName: '素材资产',
    color: '#63B3ED',
    icon: 'cube-outline',
    description: 'Post assets like sprites, 3d models, sound effects and more.',
    zhDescription: '2D 精灵素材、3D 模型、音效音轨等游戏资产资源。',
    parentId: 19
  },
  4: {
    id: 4,
    slug: 'general',
    name: 'General',
    zhName: '综合交流',
    color: '#8B6CE1',
    icon: 'chatbubbles-outline',
    description: 'Create topics here that don’t fit into any other existing category.',
    zhDescription: '综合讨论、游戏设计杂谈、开发者心路历程。'
  },
  31: {
    id: 31,
    slug: 'events',
    name: 'Events',
    zhName: '赛事活动',
    color: '#8B6CE1',
    icon: 'calendar-outline',
    description: 'Talk about game-dev / FOSS events here!',
    zhDescription: 'Godot Wild Jam、开源聚会与游戏开发者线上线下活动。',
    parentId: 4
  },
  29: {
    id: 29,
    slug: 'forum-updates',
    name: 'Forum Updates',
    zhName: '论坛维护动态',
    color: '#8B6CE1',
    icon: 'hardware-chip-outline',
    description: 'Announcements for this forum, like planned maintenance posts.',
    zhDescription: '论坛服务器升级、功能维护更新通知。',
    parentId: 4
  },
  2: {
    id: 2,
    slug: 'forum-feedback',
    name: 'Forum Feedback',
    zhName: '论坛反馈',
    color: '#CBD5E0',
    icon: 'chatbox-ellipses-outline',
    description: 'Discussions about this forum, how it’s organized, how it works, and how we can improve it.',
    zhDescription: '关于本论坛的建议、功能需求与问题反馈。'
  },
  5: {
    id: 5,
    slug: 'archive',
    name: 'Archive',
    zhName: '历史归档',
    color: '#718096',
    icon: 'archive-outline',
    description: 'This category hosts all old posts imported from the previous Question2Answer platform.',
    zhDescription: '原 Q&A 问答平台历史精华归档区。'
  }
}

export function getCategoryInfo(id: number): CategoryMeta {
  return (
    CATEGORY_MAP[id] || {
      id,
      slug: 'unknown',
      name: 'Other',
      zhName: '其他板块',
      color: '#478CBF',
      icon: 'folder-outline',
      description: '',
      zhDescription: ''
    }
  )
}

export function getCategoryApiPath(categoryId: number): string {
  const cat = CATEGORY_MAP[categoryId]
  if (!cat) return `/c/${categoryId}.json`
  if (cat.parentId && CATEGORY_MAP[cat.parentId]) {
    const parentCat = CATEGORY_MAP[cat.parentId]
    return `/c/${parentCat.slug}/${cat.slug}/${cat.id}.json`
  }
  return `/c/${cat.slug}/${cat.id}.json`
}

