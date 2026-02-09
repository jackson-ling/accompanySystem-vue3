import request from '@/utils/request'
import type { ConsumptionRecord, PaginatedResult, PageParams } from '@/types/api'

export function getConsumptionRecords(params?: PageParams) {
  return request.get<any, PaginatedResult<ConsumptionRecord>>('/user/consumption', { params })
}

export function getTransactionRecords(params?: PageParams) {
  return request.get<any, PaginatedResult<ConsumptionRecord>>('/user/transactions', { params })
}
