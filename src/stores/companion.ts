import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Companion as ApiCompanion, FavoriteItem } from '@/types/api'
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
  const favoritesList = ref<FavoriteItem[]>([])

  // 获取收藏列表
  async function fetchFavorites() {
    try {
      const res = await getFavorites({ type: 'companion' })
      favoritesList.value = res
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
          // 只有 API 成功才更新本地状态
          favorites.value.splice(index, 1)
          // 同步更新 favoritesList
          const listIndex = favoritesList.value.findIndex(f => f.itemId === id)
          if (listIndex > -1) favoritesList.value.splice(listIndex, 1)
        } else {
          // 如果本地找不到映射 ID，尝试重新获取列表或忽略（避免报错）
          console.warn('找不到收藏记录ID，尝试重新同步')
          await fetchFavorites()
          // 重试一次删除
          const retryItem = favoritesList.value.find(f => f.itemId === id)
          if (retryItem) {
            await deleteFavorite(retryItem.id)
            const newIndex = favorites.value.indexOf(id)
            if (newIndex > -1) favorites.value.splice(newIndex, 1)
          }
        }
      } else {
        // 添加收藏 - 调用添加API
        await addFavorite({ type: 'companion', itemId: id })
        // 添加成功后，重新获取列表以获得新的 favoriteId
        await fetchFavorites()
        // 确保 favorites 数组包含该 ID (fetchFavorites 会更新它，但为了UI即时响应，可以先 push)
        if (!favorites.value.includes(id)) {
          favorites.value.push(id)
        }
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
