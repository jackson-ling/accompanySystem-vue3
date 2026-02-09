import request from '@/utils/request'
import type { ServiceCategory, ServiceItem } from '@/types/api'

export interface ServiceListParams {
  type?: 'companion' | 'agency'
  sort?: 'price_asc' | 'price_desc' | 'sales_desc'
  keyword?: string
}

export function getServices(params?: ServiceListParams) {
  return request.get<any, ServiceItem[]>('/services', { params })
}

export function getServiceDetail(id: number) {
  return request.get<any, ServiceItem>(`/services/${id}`)
}

export function getServiceCategories() {
  return request.get<any, ServiceCategory[]>('/services/categories')
}
