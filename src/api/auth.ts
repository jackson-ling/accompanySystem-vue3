import request from '@/utils/request'
import type { AuthResult } from '@/types/api'

export interface LoginPayload {
  phone: string
  password?: string
}

export interface RegisterPayload {
  phone: string
  password: string
}

export interface ResetPasswordPayload {
  phone: string
  password: string
}

export function register(data: RegisterPayload) {
  return request.post<any, AuthResult>('/auth/register', data)
}

export function login(data: LoginPayload) {
  return request.post<any, AuthResult>('/auth/login', data)
}

export function logout() {
  return request.post<any, void>('/auth/logout')
}

export function resetPassword(data: ResetPasswordPayload) {
  return request.post<any, void>('/auth/reset-password', data)
}
