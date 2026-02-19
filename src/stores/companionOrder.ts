import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCompanionOrderStore = defineStore('companionOrder', () => {
  // Map<orderId, status>
  const localOrderStatuses = ref<Record<string, number>>({})
  // 记录列表页当前激活的 Tab
  const activeTab = ref<'pending' | 'completed'>('pending')

  const updateLocalStatus = (orderId: string | number, status: number) => {
    localOrderStatuses.value[String(orderId)] = status
  }

  const getLocalStatus = (orderId: string | number) => {
    return localOrderStatuses.value[String(orderId)]
  }

  return {
    localOrderStatuses,
    activeTab,
    updateLocalStatus,
    getLocalStatus
  }
})
