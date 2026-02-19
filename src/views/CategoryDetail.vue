<template>
  <div class="category-detail">
    <div class="header">
      <div class="back-icon" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="title">服务列表</div>
      <div class="placeholder"></div>
    </div>

    <div class="filter-bar">
      <div
        v-for="filter in filters"
        :key="filter.value"
        class="filter-item"
        :class="{ active: currentFilter === filter.value }"
        @click="setFilter(filter.value)"
      >
        {{ filter.label }}
      </div>
    </div>

    <div class="service-list">
      <div
        class="service-card"
        v-for="service in serviceList"
        :key="service.id"
        @click="goToServiceDetail(service.id)"
      >
        <el-image :src="service.image" class="service-image" fit="cover" loading="lazy" />
        <div class="service-info">
          <div class="service-name">{{ service.name }}</div>
          <div class="service-desc">{{ service.description }}</div>
          <div class="service-meta">
            <span class="service-price">¥{{ service.price }}</span>
            <span class="service-sales">已售 {{ service.sales }}</span>
          </div>
          <div class="service-duration">
            <el-icon><Clock /></el-icon>
            <span>{{ service.duration }}</span>
          </div>
          <el-button type="primary" size="small" class="select-btn" round>选择陪诊师</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getServices } from '@/api/service'
import type { ServiceItem } from '@/types/api'

const router = useRouter()
const currentFilter = ref('good_reviews')

// 筛选条件映射到 API 参数
const sortMap = {
  good_reviews: 'sales_desc',    // 好评优先 → 销量优先（暂用销量替代）
  low_price: 'price_asc',        // 低价优先
  sales_volume: 'sales_desc',    // 销量优先
}

const filters = [
  { label: '好评优先', value: 'good_reviews' },
  { label: '低价优先', value: 'low_price' },
  { label: '销量优先', value: 'sales_volume' },
]

// 从 API 获取的数据
const serviceList = ref<ServiceItem[]>([])
const loading = ref(false)

// 获取服务数据
async function fetchServices() {
  loading.value = true
  try {
    const sort = sortMap[currentFilter.value as keyof typeof sortMap] as 'price_asc' | 'price_desc' | 'sales_desc'
    serviceList.value = await getServices({ sort })
  } catch (error) {
    console.error('获取服务列表失败:', error)
  } finally {
    loading.value = false
  }
}

const setFilter = (val: string) => {
  currentFilter.value = val
  fetchServices()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchServices()
})

const goToServiceDetail = (id: number) => {
  router.push({ name: 'service', params: { id } })
}
</script>

<style scoped lang="scss">
.category-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-top: calc(44px + env(safe-area-inset-top)); /* Space for header */
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(44px + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 15px;
  padding-right: 15px;
  z-index: 100;
  border-bottom: 1px solid #eee;
  max-width: 750px;
  margin: 0 auto;

  .title {
    font-size: 16px;
    font-weight: bold;
  }

  .back-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #333;

    .back-icon {
      font-size: 18px;
    }
  }

  .placeholder {
    width: 60px; /* Approximate width of back button area */
  }
}

.filter-bar {
  display: flex;
  background-color: #fff;
  padding: 10px 0;
  margin-bottom: 10px;

  .filter-item {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    position: relative;

    &.active {
      color: #409eff;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background-color: #409eff;
      }
    }
  }
}

.service-list {
  padding: 0 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.service-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  padding: 10px;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: none;

  .service-image {
    width: 100px;
    height: 100px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .service-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;

    .service-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .service-desc {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .service-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 4px;

      .service-price {
        color: #f56c6c;
        font-size: 18px;
        font-weight: bold;
      }

      .service-sales {
        font-size: 11px;
        color: #999;
      }
    }

    .service-duration {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #999;
      margin-top: 4px;
    }

    .select-btn {
      position: absolute;
      right: 0;
      bottom: 0;
      height: 32px;
      padding: 0 15px;
      box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
    }
  }
}
</style>
