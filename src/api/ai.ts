import request from '@/utils/request'

export function chatWithAi(data: { message: string }) {
  return request.post<any, { reply: string; suggestions?: string[] }>('/ai/chat', data)
}
