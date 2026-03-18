import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Companion as ApiCompanion, FavoriteItem } from '@/types/api'
import { getCompanions, toggleCompanionFavorite } from '@/api/companion'
import { getFavorites } from '@/api/favorite'
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
  const favoritesList = ref<FavoriteItem[]>([])

  // 获取收藏列表
  async function fetchFavorites() {
    try {
      const res = await getFavorites({ type: 'companion' })
      favoritesList.value = res
      // 更新 favorites 数组
      favorites.value = favoritesList.value.map((f) => f.itemId)
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
    try {
      // 调用后端 API，返回true表示已收藏，false表示已取消收藏
      const isFavorite = await toggleCompanionFavorite(id)

      // 根据后端返回结果更新本地状态
      if (isFavorite) {
        // 已收藏，添加到favorites数组
        if (!favorites.value.includes(id)) {
          favorites.value.push(id)
        }
      } else {
        // 已取消收藏，从favorites数组中移除
        const index = favorites.value.indexOf(id)
        if (index > -1) {
          favorites.value.splice(index, 1)
        }
        // 同时从favoritesList中移除
        const listIndex = favoritesList.value.findIndex((f) => f.itemId === id)
        if (listIndex > -1) {
          favoritesList.value.splice(listIndex, 1)
        }
      }

      localStorage.setItem('collected_companions', JSON.stringify(favorites.value))

      return isFavorite
    } catch (error) {
      console.error('收藏/取消收藏失败:', error)
      throw error
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
