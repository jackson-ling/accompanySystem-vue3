import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Companion as ApiCompanion } from '@/types/api'
import { getCompanions } from '@/api/companion'
import { getFavorites, addFavorite, deleteFavorite } from '@/api/favorite'
import type { CompanionListParams } from '@/api/companion'

// 扩展 API 类型，添加 collectedCount 字段（收藏数量）
export interface Companion extends Omit<ApiCompanion, 'collected'> {
  collected: number // 收藏数量（与 API 的 collected: boolean 不同）
}

export const useCompanionStore = defineStore('companion', () => {
  // State
  const searchText = ref('')
  const currentFilter = ref('score')
  const showFilter = ref(false)
  const filterForm = ref({
    gender: '', // '' | 'male' | 'female'
    categories: [] as number[],
    serviceType: '', // '' | 'home' | 'store'
  })

  // 从 API 获取的陪诊师列表
  const companionList = ref<Companion[]>([])

  // 获取陪诊师数据
  async function fetchCompanions(params?: CompanionListParams) {
    try {
      const res = await getCompanions({ page: 1, size: 50, ...params })
      const list = Array.isArray(res.list) ? res.list : []
      companionList.value = list.map((item) => ({
        ...item,
        collected: typeof item.collected === 'number' ? item.collected : item.collected ? 1 : 0,
      }))
    } catch (error) {
      console.error('获取陪诊师列表失败:', error)
    }
  }

  // Favorites
  const favorites = ref<number[]>(JSON.parse(localStorage.getItem('collected_companions') || '[]'))
  const favoritesList = ref<{ id: number; itemId: number }[]>([])

  // 获取收藏列表
  async function fetchFavorites() {
    try {
      const res = await getFavorites({ type: 'companion' })
      favoritesList.value = res.map((item: any) => ({
        id: item.id,
        itemId: item.itemId
      }))
      // 更新 favorites 数组
      favorites.value = favoritesList.value.map(f => f.itemId)
    } catch (error) {
      console.error('获取收藏列表失败:', error)
    }
  }

  // Actions
  const resetState = () => {
    searchText.value = ''
    currentFilter.value = 'score'
    showFilter.value = false
    filterForm.value = {
      gender: '',
      categories: [],
      serviceType: '',
    }
  }

  const toggleFavorite = async (id: number) => {
    const index = favorites.value.indexOf(id)
    try {
      if (index > -1) {
        // 取消收藏 - 调用删除API
        const favItem = favoritesList.value.find(f => f.itemId === id)
        if (favItem) {
          await deleteFavorite(favItem.id)
        }
        favorites.value.splice(index, 1)
      } else {
        // 添加收藏 - 调用添加API
        await addFavorite({ type: 'companion', itemId: id })
        favorites.value.push(id)
      }
      localStorage.setItem('collected_companions', JSON.stringify(favorites.value))
    } catch (error) {
      console.error('操作收藏失败:', error)
    }
  }

  const isFavorite = (id: number) => {
    return favorites.value.includes(id)
  }

  return {
    searchText,
    currentFilter,
    showFilter,
    filterForm,
    companionList,
    favorites,
    favoritesList,
    resetState,
    toggleFavorite,
    isFavorite,
    fetchCompanions,
    fetchFavorites,
  }
})
