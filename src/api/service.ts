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

export async function getServiceDetail(id: number) {
  try {
    const list = await getServices()
    const found = list.find((item) => item.id === id)
    if (found) {
      return found
    }
  } catch (error) {
    console.error('Failed to get services list for detail:', error)
  }
  return request.get<any, ServiceItem>(`/services/${id}`)
}

export function getServiceCategories() {
  return request.get<any, ServiceCategory[]>('/services/categories')
}
