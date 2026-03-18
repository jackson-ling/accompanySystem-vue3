import request from '@/utils/request'
import type { ChatMessage, PageParams } from '@/types/api'

// 获取聊天消息列表
export function getChatMessages(
  type: string,
  params?: { page?: number; pageSize?: number; targetId?: number },
) {
  return request.get<any, ChatMessage[]>(`/user/chats/${type}`, { params })
}

export function sendChatMessage(
  type: string,
  data: { text: string; type: string },
  targetId?: number,
) {
  const params = targetId ? { targetId } : undefined
  return request.post<any, void>(`/user/chats/${type}/messages`, data, { params })
}

// 删除聊天记录
export function deleteChat(type: string, targetId?: number) {
  const params = targetId ? { targetId } : undefined
  return request.delete<any, void>(`/user/chats/${type}`, { params })
}
