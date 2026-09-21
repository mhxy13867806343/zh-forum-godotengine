export interface DiscourseCategory {
  id: number
  name: string
  color: string
  text_color: string
  slug: string
  topic_count: number
  post_count: number
  position: number
  description: string
  description_text: string
  parent_category_id?: number | null
  subcategory_ids?: number[]
}

export interface DiscoursePoster {
  extras?: string
  description: string
  user_id: number
  primary_group_id?: number | null
  flair_group_id?: number | null
}

export interface DiscourseUser {
  id: number
  username: string
  name: string
  avatar_template: string
}

export interface DiscourseTopic {
  id: number
  title: string
  fancy_title?: string
  slug: string
  posts_count: number
  reply_count: number
  highest_post_number: number
  image_url?: string | null
  created_at: string
  last_posted_at: string
  bumped: boolean
  bumped_at: string
  unseen: boolean
  pinned: boolean
  unpinned?: boolean | null
  excerpt?: string
  visible: boolean
  closed: boolean
  archived: boolean
  bookmarked?: boolean | null
  liked?: boolean | null
  views: number
  like_count: number
  has_summary: boolean
  archetype: string
  last_poster_username?: string
  category_id: number
  pinned_globally: boolean
  featured_link?: string | null
  has_accepted_answer?: boolean
  posters?: DiscoursePoster[]
  tags?: Array<string | { id?: number; name?: string; slug?: string }>
}

export interface DiscoursePost {
  id: number
  name: string
  username: string
  avatar_template: string
  created_at: string
  cooked: string
  post_number: number
  post_type: number
  updated_at: string
  reply_count: number
  reply_to_post_number?: number | null
  quote_count: number
  incoming_link_count: number
  reads: number
  readers_count: number
  score: number
  yours: boolean
  topic_id: number
  topic_slug: string
  display_username: string
  primary_group_name?: string | null
  flair_name?: string | null
  flair_url?: string | null
  flair_bg_color?: string | null
  flair_color?: string | null
  version: number
  can_edit: boolean
  can_delete: boolean
  can_recover: boolean
  can_see_hidden_post: boolean
  can_wiki: boolean
  user_title?: string | null
  actions_summary?: Array<{ id: number; count: number }>
  moderator: boolean
  admin: boolean
  staff: boolean
  user_id: number
  hidden: boolean
  trust_level: number
  deleted_at?: string | null
  user_deleted: boolean
  edit_reason?: string | null
  can_view_edit_history: boolean
  wiki: boolean
  reviewable_id?: number | null
  reviewable_score_count?: number
  reviewable_score_pending_count?: number
}

export interface DiscourseTopicDetail {
  id: number
  title: string
  fancy_title?: string
  posts_count: number
  created_at: string
  views: number
  reply_count: number
  like_count: number
  last_posted_at: string
  visible: boolean
  closed: boolean
  archived: boolean
  has_summary: boolean
  archetype: string
  slug: string
  category_id: number
  word_count: number
  deleted_at?: string | null
  user_id: number
  tags?: Array<string | { id?: number; name?: string; slug?: string }>
  post_stream: {
    posts: DiscoursePost[]
    stream: number[]
  }
  suggested_topics?: DiscourseTopic[]
}
