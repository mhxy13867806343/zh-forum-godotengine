import request from './request'
import type { UserProfile } from '@/hooks/useUser'

export interface LoginParams {
  username: string
  password?: string
}

export interface RegisterParams {
  username: string
  nickname: string
  password?: string
}

export interface AuthResponse {
  code: number
  message: string
  data: {
    token: string
    user: UserProfile
  }
}

/**
 * 登录接口
 */
export async function loginApi(params: LoginParams): Promise<AuthResponse> {
  return request.post('/auth/login', params)
}

/**
 * 注册接口
 */
export async function registerApi(params: RegisterParams): Promise<AuthResponse> {
  return request.post('/auth/register', params)
}

/**
 * 获取当前已登录用户信息
 */
export async function getCurrentUserApi(): Promise<{ code: number; data: { user: UserProfile } }> {
  return request.get('/auth/current-user')
}

/**
 * 退出登录接口
 */
export async function logoutApi(): Promise<{ code: number; message: string }> {
  return request.post('/auth/logout')
}
