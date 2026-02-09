import request from '@/utils/request'
import type { DepartmentItem, DictItem, HospitalItem } from '@/types/api'

export function getServiceTypes() {
  return request.get<any, DictItem[]>('/dict/service-types')
}

export function getHospitals(params?: { keyword?: string }) {
  return request.get<any, HospitalItem[]>('/dict/hospitals', { params })
}

export function getDepartments(params?: { hospitalId?: number }) {
  return request.get<any, DepartmentItem[]>('/dict/departments', { params })
}
