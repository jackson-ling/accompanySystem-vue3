import request from '@/utils/request'
import type { FeedbackItem } from '@/types/api'

export interface FeedbackPayload {
  content: string
  images?: string[]
  contact?: string
}

export function submitFeedback(data: FeedbackPayload) {
  return request.post<any, void>('/user/feedback', data)
}

export function getFeedbackList() {
  return request.get<any, FeedbackItem[]>('/user/feedback')
}
