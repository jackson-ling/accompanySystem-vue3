import request from '@/utils/request'
import type { CreateOrderPayload, Order, PaginatedResult, PageParams } from '@/types/api'

export interface UserOrderListParams extends PageParams {
  status?: number
}

export function getUserOrders(params?: UserOrderListParams) {
  return request.get<any, PaginatedResult<Order>>('/user/orders', { params })
}

export function createUserOrder(data: CreateOrderPayload) {
  return request.post<any, void>('/user/orders', data)
}

export function getUserOrderDetail(id: string | number) {
  return request.get<any, Order>(`/user/orders/${id}`)
}

export function cancelUserOrder(id: string | number) {
  return request.put<any, void>(`/user/orders/${id}/cancel`)
}

export function payUserOrder(id: string | number, data: { paymentMethod: string }) {
  return request.post<any, void>(`/user/orders/${id}/pay`, data)
}

export function confirmUserOrder(id: string | number) {
  return request.put<any, void>(`/user/orders/${id}/confirm`)
}

export function refundUserOrder(id: string | number, data: { reason: string }) {
  return request.post<any, void>(`/user/orders/${id}/refund`, data)
}

export function evaluateOrder(id: string | number, data: { score: number; content: string }) {
  return request.post<any, void>(`/user/orders/${id}/comment`, data)
}

export interface CompanionOrderListParams extends PageParams {
  status?: number
}

export function getCompanionOrders(params?: CompanionOrderListParams) {
  return request.get<any, PaginatedResult<Order>>('/companion/orders', { params })
}

export function getCompanionOrderDetail(id: string | number) {
  return request.get<any, Order>(`/companion/orders/${id}`)
}

export function updateCompanionOrderStatus(id: string | number, data: { status: number }) {
  return request.put<any, void>(`/companion/orders/${id}/status`, data)
}

export function startCompanionOrder(id: string | number) {
  return request.put<any, void>(`/companion/orders/${id}/start`)
}

export function completeCompanionOrder(id: string | number, data: { serviceContent: string; images: string[] }) {
  return request.put<any, void>(`/companion/orders/${id}/complete`, data)
}
