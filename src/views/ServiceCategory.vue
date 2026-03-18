<template>
  <div class="service-category-page">
    <div class="page-header">
      <div class="header-left" @click="router.back()">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
      </div>
      <span class="page-title">{{ title }}</span>
      <div class="header-right"></div>
    </div>

    <!-- Banner -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="banner-text">
          <div class="main-title">专业陪诊 贴心服务</div>
          <div class="sub-title">让就医更简单</div>
        </div>
      </div>
    </div>

    <!-- Sort Bar -->
    <div class="sort-bar">
      <div
        class="sort-item"
        :class="{ active: currentSort === 'smart' }"
        @click="currentSort = 'smart'"
      >
        智能排序
      </div>
      <div
        class="sort-item"
        :class="{ active: currentSort === 'sales' }"
        @click="currentSort = 'sales'"
      >
        销量优先
      </div>
      <div
        class="sort-item"
        :class="{ active: currentSort === 'price' }"
        @click="currentSort = 'price'"
      >
        低价优先
      </div>
    </div>

    <div class="service-list">
      <div
        v-for="service in filteredServices"
        :key="service.id"
        class="service-item"
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
              <div class="meta-row secondary">
                <span class="service-sales">已售 {{ service.sales || 0 }}</span>
                <span class="service-duration" v-if="service.duration"
                  >时长: {{ service.duration }}</span
                >
              </div>
            </div>
            <el-button
              type="primary"
              size="small"
              class="select-btn"
              round
              @click.stop="openCompanionDrawer(service)"
            >
              选择陪诊人
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Companion Selector Component -->
    <CompanionSelector
      v-model:visible="showCompanionDrawer"
      :service="selectedService"
      :companions="companionList"
      @book="bookCompanion"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ServiceCategory'
})
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useDrawerNavigation } from '@/composables/useDrawerNavigation'
import CompanionSelector from '@/components/appointment/CompanionSelector.vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getServices } from '@/api/service'
import { getCompanions } from '@/api/companion'
import type { ServiceItem } from '@/types/api'
import type { Companion } from '@/types/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const type = ref((route.query.type as string) || 'companion')
const currentSort = ref('smart')
const title = computed(() => (type.value === 'companion' ? '陪诊服务' : '代办服务'))
const showCompanionDrawer = ref(false)
const { navigateWithDelay } = useDrawerNavigation(showCompanionDrawer)
const selectedService = ref<ServiceItem | null>(null)

// 从 API 获取的数据
const allServices = ref<ServiceItem[]>([])
const companionList = ref<Companion[]>([])
const loading = ref(false)

// 筛选条件映射到 API 参数
const sortMap = {
  smart: '',                // 智能排序 → 默认排序（按创建时间）
  sales: 'sales_desc',      // 销量优先
  price: 'price_asc',      // 低价优先
}

// 获取服务数据
async function fetchServices() {
  loading.value = true
  try {
    const sort = sortMap[currentSort.value as keyof typeof sortMap]
    const params: any = { type: type.value as 'companion' | 'agency' }
    if (sort) params.sort = sort
    const res = await getServices(params)
    allServices.value = res?.list || res || []
  } catch (error) {
    console.error('获取服务列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取陪诊师数据
async function fetchCompanions() {
  try {
    const res = await getCompanions({ page: 1, size: 10 })
    companionList.value = res.list
  } catch (error) {
    console.error('获取陪诊师列表失败:', error)
  }
}

// 切换排序时重新获取数据
watch(currentSort, () => {
  fetchServices()
})

// 切换服务类型时重新获取数据
watch(type, () => {
  fetchServices()
})

const filteredServices = computed(() => {
  return allServices.value
})

const goToServiceDetail = (service: any) => {
  router.push(`/service/${service.id}`)
}

const openCompanionDrawer = (service: any) => {
  selectedService.value = service
  showCompanionDrawer.value = true
}

const bookCompanion = (companion: any) => {
  if (!userStore.isLogin) {
    navigateWithDelay('/login')
    return
  }
  if (selectedService.value) {
    navigateWithDelay({
      name: 'order-create',
      query: {
        serviceId: selectedService.value.id,
        companionId: companion.id,
      },
    })
  }
}

onMounted(() => {
  // 初始化 type
  type.value = (route.query.type as string) || 'companion'
  fetchServices()
  fetchCompanions()
})

// 监听路由参数变化
watch(
  () => route.query.type,
  (newType) => {
    if (newType) {
      type.value = newType as string
    }
  }
)
</script>

<style scoped lang="scss">
.service-category-page {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  padding-top: calc(15px + env(safe-area-inset-top));
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #f5f5f5;

  .header-left {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 16px;
    color: #333;
    width: 80px;

    .back-icon {
      font-size: 20px;
    }
  }

  .page-title {
    font-size: 18px;
    font-weight: bold;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .header-right {
    width: 80px;
  }
}

.banner-section {
  padding: 15px;
  background-color: #fff;

  .banner-content {
    height: 100px;
    background: linear-gradient(135deg, #409eff, #79bbff);
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding: 0 20px;

    .banner-text {
      color: #fff;

      .main-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .sub-title {
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }
}

.sort-bar {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 10px;

  .sort-item {
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: none;

    &.active {
      color: #409eff;
      font-weight: bold;
    }
  }
}

.service-list {
  padding: 10px 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.service-item {
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  display: flex;
  gap: 12px;
  cursor: pointer;

  .select-btn {
    height: 32px;
    padding: 0 15px;
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
  }

  .service-image {
    width: 90px;
    height: 90px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .service-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .info-top {
      .service-name {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        margin-bottom: 6px;
      }

      .service-desc {
        font-size: 12px;
        color: #999;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
      }
    }

    .info-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 8px;

      .service-meta {
        .meta-row {
          display: flex;
          align-items: baseline;
          gap: 4px;

          &.secondary {
            margin-top: 4px;
            font-size: 11px;
            color: #999;
            gap: 8px;
          }

          .service-price {
            color: #f56c6c;
            font-size: 18px;
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style>
