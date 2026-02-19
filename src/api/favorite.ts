import request from '@/utils/request'
import type { FavoriteItem } from '@/types/api'

export function getFavorites(params?: { type?: 'companion' | 'service' }) {
  return request.get<any, FavoriteItem[]>('/user/favorites', { params })
}

export function addFavorite(data: { type: 'companion' | 'service'; itemId: number }) {
  return request.post<any, void>('/user/favorites', data)
}

export function deleteFavorite(id: number) {
  return request.delete<any, void>(`/user/favorites/${id}`)
}
