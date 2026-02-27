import request from '@/utils/request'

export interface ChatMessage {
  id: number
  text: string
  isMe: boolean
  time: string
}

export function chatWithAi(data: { message: string }) {
  return request.post<any, { reply: string; suggestions?: string[] }>('/ai/chat', data)
}

export function getAiChatHistory() {
  return request.get<any, ChatMessage[]>('/ai/chat')
}

export function clearAiChat() {
  return request.delete<any, null>('/ai/chat')
}
