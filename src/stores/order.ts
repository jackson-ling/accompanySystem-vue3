import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ServiceItem, Companion } from '@/types/api'

type PickupOption = 'none' | 'pick' | 'drop' | 'both'
type PaymentMethod = 'wechat' | 'alipay' | 'balance'

export const useOrderStore = defineStore('order', () => {
  // 选中的服务
  const selectedService = ref<ServiceItem | null>(null)

  // 选中的陪诊师
  const selectedCompanion = ref<Companion | null>(null)

  // 选中的就诊人ID
  const selectedPatientId = ref<number | null>(null)

  // 预约时间
  const appointmentTime = ref('')

  // 医院名称
  const hospital = ref('')

  // 科室名称
  const department = ref('')

  // 接送选项
  const pickupOption = ref<PickupOption>('none')

  // 备注
  const remarks = ref('')

  // 支付方式
  const paymentMethod = ref<PaymentMethod>('wechat')

  // 设置服务
  const setService = (service: ServiceItem) => {
    selectedService.value = service
  }

  // 设置陪诊师
  const setCompanion = (companion: Companion) => {
    selectedCompanion.value = companion
  }

  // 设置就诊人
  const setSelectedPatientId = (id: number | null) => {
    selectedPatientId.value = id
  }

  // 设置预约时间
  const setAppointmentTime = (time: string) => {
    appointmentTime.value = time
  }

  // 设置医院
  const setHospital = (value: string) => {
    hospital.value = value
  }

  // 设置科室
  const setDepartment = (value: string) => {
    department.value = value
  }

  // 重置订单
  const resetOrder = () => {
    selectedService.value = null
    selectedCompanion.value = null
    selectedPatientId.value = null
    appointmentTime.value = ''
    hospital.value = ''
    department.value = ''
    pickupOption.value = 'none'
    remarks.value = ''
    paymentMethod.value = 'wechat'
  }

  // 检查是否可以创建订单
  const canCreateOrder = () => {
    return !!(
      selectedService.value &&
      hospital.value &&
      department.value &&
      appointmentTime.value
    )
  }

  return {
    selectedService,
    selectedCompanion,
    selectedPatientId,
    appointmentTime,
    hospital,
    department,
    pickupOption,
    remarks,
    paymentMethod,
    setService,
    setCompanion,
    setSelectedPatientId,
    setAppointmentTime,
    setHospital,
    setDepartment,
    resetOrder,
    canCreateOrder,
  }
})
