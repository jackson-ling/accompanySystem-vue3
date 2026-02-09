import request from '@/utils/request'
import type { Patient } from '@/types/api'

export function getPatients() {
  return request.get<any, Patient[]>('/user/patients')
}

export function createPatient(data: Omit<Patient, 'id'>) {
  return request.post<any, void>('/user/patients', data)
}

export function getPatientDetail(id: number) {
  return request.get<any, Patient>(`/user/patients/${id}`)
}

export function updatePatient(id: number, data: Partial<Patient>) {
  return request.put<any, void>(`/user/patients/${id}`, data)
}

export function deletePatient(id: number) {
  return request.delete<any, void>(`/user/patients/${id}`)
}

export function setDefaultPatient(id: number) {
  return request.put<any, void>(`/user/patients/${id}/default`)
}
