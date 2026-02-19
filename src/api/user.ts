import request from '@/utils/request'
import type { UserProfile } from '@/types/api'

export function getUserProfile() {
  return request.get<any, UserProfile>('/user/profile')
}

export function updateUserProfile(data: Partial<UserProfile>) {
  return request.put<any, void>('/user/profile', data)
}

export function updateUserAvatar(data: { avatar: string }) {
  return request.put<any, void>('/user/avatar', data)
}

export function updateUserPassword(data: { oldPassword: string; newPassword: string }) {
  return request.put<any, void>('/user/password', data)
}

export function getUserBalance() {
  return request.get<any, number>('/user/balance')
}
