import request from './request'
import type { DiscoursePost } from './types'

export interface ReplyParams {
  topicId: number
  content: string
  authorName: string
  username: string
}

export interface LikeParams {
  postId: number
  liked: boolean
}

/**
 * 提交回复接口
 */
export async function postReplyApi(params: ReplyParams): Promise<{ code: number; message: string; data: DiscoursePost }> {
  return request.post('/topics/reply', params)
}

/**
 * 帖子点赞接口
 */
export async function toggleLikeApi(params: LikeParams): Promise<{ code: number; message: string; data: { liked: boolean; score: number } }> {
  return request.post('/topics/like', params)
}
