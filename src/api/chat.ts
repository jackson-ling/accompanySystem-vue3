import request from '@/utils/request'
import type { ChatMessage, PageParams } from '@/types/api'

export function getChatMessages(type: string, params?: PageParams) {
  return request.get<any, ChatMessage[]>(`/user/chats/${type}`, { params })
}

export function sendChatMessage(type: string, data: { text: string; type: string }) {
  return request.post<any, void>(`/user/chats/${type}/messages`, data)
}

export function deleteChat(type: string) {
  return request.delete<any, void>(`/user/chats/${type}`)
}
