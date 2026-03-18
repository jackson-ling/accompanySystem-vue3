import request from '@/utils/request'
import type {
  AvailableOrder,
  Companion,
  CompanionReview,
  CompanionStatistics,
  IncomeRecord,
  Order,
  PaginatedResult,
  PageParams,
} from '@/types/api'

export interface CompanionListParams extends PageParams {
  gender?: 'male' | 'female'
  service?: number
  sort?: 'score_desc' | 'orders_desc'
  keyword?: string
}

export function getCompanions(params?: CompanionListParams) {
  return request.get<any, PaginatedResult<Companion>>('/companions', { params })
}

/** 获取可接订单列表（抢单大厅） */
export function getAvailableOrders(params?: PageParams) {
  return request.get<any, PaginatedResult<AvailableOrder>>('/companion/available-orders', {
    params,
  })
}

export function getCompanionDetail(id: number) {
  return request.get<any, Companion>(`/companions/${id}`)
}

export function getCompanionReviews(id: number, params?: PageParams) {
  return request.get<any, PaginatedResult<CompanionReview>>(`/companions/${id}/comments`, {
    params,
  })
}

export function toggleCompanionFavorite(id: number) {
  return request.post<any, boolean>(`/companions/${id}/favorite`)
}

// 陪诊师工作台相关 API

/** 获取陪诊师统计数据 */
export function getCompanionStatistics() {
  return request.get<any, CompanionStatistics>('/companion/statistics')
}

/** 获取陪诊师订单列表 */
export function getCompanionOrders(params?: PageParams & { status?: number }) {
  return request.get<any, PaginatedResult<Order>>('/companion/orders', { params })
}

/** 获取陪诊师收入明细 */
export function getCompanionIncome(params?: PageParams) {
  return request.get<any, PaginatedResult<IncomeRecord>>('/companion/income', { params })
}

/** 更新陪诊师在线状态 */
export function updateCompanionStatus(isOnline: boolean) {
  return request.post<any, void>('/companion/status', { isOnline })
}

/** 获取陪诊师个人信息 */
export function getCompanionProfile() {
  return request.get<any, any>('/companion/profile')
}

/** 更新陪诊师个人信息 */
export function updateCompanionProfile(data: {
  nickname?: string
  avatar?: string
  phone?: string
  age?: string
  experience?: string
  introduction?: string
}) {
  return request.put<any, void>('/companion/profile', data)
}

/** 陪诊师接单 */
export function acceptOrder(orderId: string) {
  return request.put<any, Order>(`/companion/orders/${orderId}/accept`)
}

/** 陪诊师拒单 */
export function rejectOrder(orderId: string, reason?: string) {
  return request.put<any, void>(`/companion/orders/${orderId}/reject`, { reason })
}
