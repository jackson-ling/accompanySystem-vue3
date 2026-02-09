import request from '@/utils/request'
import type { MessageConversation } from '@/types/api'

export function getMessageConversations() {
  return request.get<any, MessageConversation[]>('/user/messages')
}

export function getUnreadMessageCount() {
  return request.get<any, number>('/user/messages/unread-count')
}

export function markMessageRead(id: string) {
  return request.put<any, void>(`/user/messages/${id}/read`)
}

export function deleteMessage(id: string) {
  return request.delete<any, void>(`/user/messages/${id}`)
}
