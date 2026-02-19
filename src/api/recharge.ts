import request from '@/utils/request'
import type { RechargeConfig, RechargeRecord } from '@/types/api'

export function getRechargeRecords() {
  return request.get<any, RechargeRecord[]>('/user/recharge/records')
}

export function createRecharge(data: { amount: number; method: string }) {
  return request.post<any, void>('/user/recharge', data)
}

export function getRechargeConfig() {
  return request.get<any, RechargeConfig>('/user/recharge/config')
}
