import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Patient, UserProfile } from '@/types/api'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { getUserProfile, getUserBalance } from '@/api/user'
import {
  getPatients,
  createPatient,
  updatePatient as updatePatientApi,
  deletePatient as deletePatientApi,
  setDefaultPatient,
} from '@/api/patient'

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

  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    try {
      await createPatient(patient)
      await fetchPatients()
    } catch (error) {
      console.error('Failed to add patient:', error)
      throw error
    }
  }

  const updatePatient = async (patient: Patient) => {
    try {
      await updatePatientApi(patient.id, patient)
      await fetchPatients()
    } catch (error) {
      console.error('Failed to update patient:', error)
      throw error
    }
  }

  // 设置默认就诊人
  const setPatientDefault = async (id: number) => {
    try {
      await setDefaultPatient(id)
      // 更新本地状态：将其他就诊人设为非默认，当前设为默认
      patients.value = patients.value.map((p) => ({
        ...p,
        default: p.id === id,
      }))
      // 同时更新选中的就诊人
      selectedPatientId.value = id
    } catch (error) {
      console.error('Failed to set default patient:', error)
      throw error
    }
  }

  const deletePatient = async (id: number) => {
    try {
      await deletePatientApi(id)
      await fetchPatients()
      if (selectedPatientId.value === id) {
        selectedPatientId.value = null
      }
    } catch (error) {
      console.error('Failed to delete patient:', error)
      throw error
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
    // 将登录返回的数据转换为 UserProfile 格式
    userInfo.value = {
      id: res.userId,
      nickname: res.nickname,
      avatar: res.avatar,
      phone: res.phone,
      balance: 0, // 登录时余额默认为0，后续通过 fetchProfile 获取完整信息
    }
    isLogin.value = true
    // 获取完整的用户信息（包括余额）
    await fetchProfile()
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

  // 获取用户余额
  const fetchBalance = async () => {
    if (!userInfo.value) {
      await fetchProfile()
      return
    }
    const balance = await getUserBalance()
    userInfo.value.balance = balance
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
    setPatientDefault,
    deletePatient,
    selectPatient,
    getSelectedPatient,
    login,
    loginLegacy,
    logout,
    updateUserInfo,
    fetchProfile,
    fetchBalance,
    fetchPatients,
    init,
  }
})
