import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Patient, UserProfile } from '@/types/api'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { getUserProfile } from '@/api/user'
import { getPatients } from '@/api/patient'

// 重新导出类型以保持向后兼容
export type { Patient }
export type { UserProfile as UserInfo }

export const useUserStore = defineStore('user', () => {
  // 用户信息（初始化为空，从 localStorage 或 API 获取）
  const userInfo = ref<UserProfile | null>(null)
  const isLogin = ref(false) // 默认未登录

  // 就诊人列表（从 API 获取）
  const patients = ref<Patient[]>([])
  const selectedPatientId = ref<number | null>(null)

  const addPatient = (patient: Omit<Patient, 'id'>) => {
    if (patient.default) {
      patients.value = patients.value.map((p) => ({ ...p, default: false }))
    }
    const newId = patients.value.length > 0 ? Math.max(...patients.value.map((p) => p.id)) + 1 : 1
    patients.value.push({
      ...patient,
      id: newId,
    })
  }

  const updatePatient = (patient: Patient) => {
    if (patient.default) {
      patients.value = patients.value.map((p) => ({ ...p, default: false }))
    }
    const index = patients.value.findIndex((p) => p.id === patient.id)
    if (index !== -1) {
      patients.value[index] = patient
    }
  }

  const deletePatient = (id: number) => {
    const index = patients.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      patients.value.splice(index, 1)
      if (selectedPatientId.value === id) {
        selectedPatientId.value = null
      }
    }
  }

  const selectPatient = (id: number) => {
    selectedPatientId.value = id
  }

  const getSelectedPatient = () => {
    return patients.value.find((p) => p.id === selectedPatientId.value) || null
  }

  // 登录（调用 API）
  const login = async (phone: string, password: string) => {
    const res = await loginApi({ phone, password })
    // 保存 token
    localStorage.setItem('token', res.token)
    // 保存用户信息
    userInfo.value = res.userInfo
    isLogin.value = true
    // 获取就诊人列表
    await fetchPatients()
    return res
  }

  // 获取用户信息
  const fetchProfile = async () => {
    const info = await getUserProfile()
    userInfo.value = info
    isLogin.value = true
  }

  // 获取就诊人列表
  const fetchPatients = async () => {
    const list = await getPatients()
    patients.value = list
    // 设置默认就诊人
    const defaultPatient = list.find((p) => p.default)
    if (defaultPatient) {
      selectedPatientId.value = defaultPatient.id
    }
  }

  // 初始化：检查是否有 token
  const init = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await fetchProfile()
        await fetchPatients()
      } catch {
        // token 无效，清除
        localStorage.removeItem('token')
      }
    }
  }

  // 旧的 login 方法（保持兼容，内部调用新的 API）
  const loginLegacy = () => {
    // 此方法已被 login 替代，暂时保留用于兼容
    console.warn('loginLegacy is deprecated, use login(phone, password) instead')
  }

  const updateUserInfo = (info: Partial<UserProfile>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
    }
  }

  // 退出登录（调用 API）
  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      // 无论 API 是否成功，都清除本地状态
      localStorage.removeItem('token')
      isLogin.value = false
      userInfo.value = null
      patients.value = []
      selectedPatientId.value = null
    }
  }

  return {
    userInfo,
    isLogin,
    patients,
    selectedPatientId,
    addPatient,
    updatePatient,
    deletePatient,
    selectPatient,
    getSelectedPatient,
    login,
    loginLegacy,
    logout,
    updateUserInfo,
    fetchProfile,
    fetchPatients,
    init,
  }
})
