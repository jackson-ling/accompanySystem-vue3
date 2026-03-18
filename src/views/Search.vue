<template>
  <div class="search-page">
    <!-- Search Header -->
    <div class="search-header">
      <div class="header-left" @click="goBack">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
      </div>
      <div class="search-input-wrapper">
        <el-input
          v-model="searchText"
          placeholder="搜索您需要的服务"
          class="search-input"
          :prefix-icon="Search"
          clearable
          @keyup.enter="performSearch(searchText)"
        />
      </div>
      <div class="header-right" @click="performSearch(searchText)">
        <span class="search-btn-text">搜索</span>
      </div>
    </div>

    <!-- Search Content -->
    <div class="search-content">
      <!-- Default View (History & Guess) -->
      <div v-if="!isSearching && !showResults" class="default-view">
        <!-- History Search -->
        <div v-if="historyList.length > 0" class="section">
          <div class="section-header">
            <span class="title">历史搜索</span>
            <span class="clear-btn" @click="clearHistory">清空</span>
          </div>
          <div class="tags-container">
            <div
              v-for="(tag, index) in historyList"
              :key="index"
              class="tag-item"
              @click="performSearch(tag)"
            >
              {{ tag }}
            </div>
          </div>
        </div>

        <!-- Guess You Like -->
        <div class="section">
          <div class="section-header">
            <span class="title">猜你喜欢</span>
          </div>
          <div class="tags-container">
            <div
              v-for="service in allServices"
              :key="service.id"
              class="tag-item"
              @click="performSearch(service.name)"
            >
              {{ service.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-else class="results-view">
        <div v-if="filteredServices.length === 0" class="empty-state">
          <span>暂无相关服务</span>
        </div>
        <div v-else class="service-list">
          <div
            class="service-card"
            v-for="service in filteredServices"
            :key="service.id"
            @click="goToServiceDetail(service)"
          >
            <el-image :src="service.image" class="service-image" fit="cover" loading="lazy" />
            <div class="service-info">
              <div class="info-top">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-desc">{{ service.description }}</div>
              </div>
              <div class="info-bottom">
                <div class="service-meta">
                  <div class="meta-row">
                    <span class="service-price">¥{{ service.price }}</span>
                  </div>
                </div>
                <el-button type="primary" size="small" class="select-btn" round plain>
                  去预约
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowLeft } from '@element-plus/icons-vue'
import { getServices } from '@/api/service'
import type { ServiceItem } from '@/types/api'

const router = useRouter()
const searchText = ref('')
const historyList = ref<string[]>([])
const showResults = ref(false)
const isSearching = ref(false)

// Watch searchText to reset view when cleared
watch(searchText, (val) => {
  if (!val) {
    showResults.value = false
    isSearching.value = false
  }
})

// 服务数据和加载状态
const allServices = ref<ServiceItem[]>([])
const loading = ref(false)
const filteredServices = ref<ServiceItem[]>([])

// 获取服务列表
const fetchServices = async () => {
  loading.value = true
  try {
    const res = await getServices()
    allServices.value = res?.list || res || []
  } catch (error) {
    console.error('获取服务列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    historyList.value = JSON.parse(history)
  }
  // 获取服务列表
  fetchServices()
})

const goBack = () => {
  if (showResults.value) {
    showResults.value = false
    searchText.value = ''
  } else {
    router.back()
  }
}

const performSearch = async (text: string) => {
  if (!text.trim()) return

  searchText.value = text
  showResults.value = true
  isSearching.value = true

  // Save to history
  const index = historyList.value.indexOf(text)
  if (index !== -1) {
    historyList.value.splice(index, 1)
  }
  historyList.value.unshift(text)
  if (historyList.value.length > 10) {
    historyList.value.pop()
  }
  localStorage.setItem('searchHistory', JSON.stringify(historyList.value))

  // 调用API搜索服务
  try {
    const res = await getServices({ keyword: text })
    filteredServices.value = res
  } catch (error) {
    console.error('搜索服务失败:', error)
    filteredServices.value = []
  } finally {
    isSearching.value = false
  }
}

const clearHistory = () => {
  historyList.value = []
  localStorage.removeItem('searchHistory')
}

const goToServiceDetail = (service: ServiceItem) => {
  router.push({
    name: 'service',
    params: { id: service.id },
  })
}
</script>

<style scoped lang="scss">
.search-page {
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 12px;

  .header-left {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .search-input-wrapper {
    flex: 1;

    :deep(.el-input__wrapper) {
      border-radius: 20px;
      background-color: #f7f8fa;
      box-shadow: none !important;

      &.is-focus {
        background-color: #fff;
        box-shadow: 0 0 0 1px #409eff !important;
      }
    }
  }

  .header-right {
    font-size: 15px;
    color: #333;
    font-weight: 500;
    cursor: pointer;
  }
}

.search-content {
  flex: 1;
  padding: 15px;

  .section {
    margin-bottom: 30px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .title {
        font-size: 15px;
        font-weight: bold;
        color: #333;
      }

      .clear-btn {
        font-size: 13px;
        color: #999;
        cursor: pointer;
      }
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .tag-item {
        padding: 6px 16px;
        background-color: #f7f8fa;
        border-radius: 16px;
        font-size: 13px;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;

        &:active {
          background-color: #ebedf0;
        }
      }
    }
  }
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .service-card {
    display: flex;
    gap: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    cursor: pointer;

    .service-image {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .service-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .info-top {
        .service-name {
          font-size: 15px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        .service-desc {
          font-size: 12px;
          color: #999;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .info-bottom {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .service-price {
          color: #f56c6c;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
</style>
