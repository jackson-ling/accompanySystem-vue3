<template>
  <div class="home-view">
    <!-- Top Search Bar -->
    <div class="search-bar" @click="goToSearch">
      <el-input
        v-model="searchText"
        placeholder="搜索您需要的服务"
        class="search-input"
        :prefix-icon="Search"
        readonly
      />
    </div>

    <!-- Carousel -->
    <div class="carousel-section">
      <el-carousel height="180px" trigger="click" :interval="3000" arrow="never">
        <el-carousel-item v-for="(item, index) in carouselImages" :key="index">
          <el-image :src="item" fit="cover" class="carousel-image" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- Nav Grid -->
    <div class="nav-grid">
      <div class="nav-item">
        <div class="nav-content" @click="goToServiceCategory('companion')">
          <div class="nav-icon-wrapper" style="background-color: #409eff">
            <el-icon :size="24" color="#fff"><FirstAidKit /></el-icon>
          </div>
          <span class="nav-text">陪诊服务</span>
        </div>
      </div>
      <div class="nav-item">
        <div class="nav-content" @click="goToServiceCategory('agency')">
          <div class="nav-icon-wrapper" style="background-color: #67c23a">
            <el-icon :size="24" color="#fff"><ListIcon /></el-icon>
          </div>
          <span class="nav-text">代办服务</span>
        </div>
      </div>
    </div>

    <!-- Service List Section -->
    <div class="service-list-section">
      <div class="section-header">
        <div class="section-title">所有服务</div>
      </div>

      <div class="service-list">
        <div
          class="service-card"
          v-for="service in serviceList"
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
                <div class="meta-row secondary">
                  <span class="service-sales">已售 {{ service.sales }}</span>
                  <span class="service-duration">时长: {{ service.duration }}</span>
                </div>
              </div>
              <el-button
                type="primary"
                size="default"
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
    </div>

    <!-- Companion Selector -->
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
  name: 'HomeView',
})
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useDrawerNavigation } from '@/composables/useDrawerNavigation'
import { Search, FirstAidKit, List as ListIcon } from '@element-plus/icons-vue'
import CompanionSelector from '@/components/appointment/CompanionSelector.vue'
import { getServices } from '@/api/service'
import { getCompanions } from '@/api/companion'
import type { ServiceItem } from '@/types/api'
import type { Companion } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()
const searchText = ref('')
const showCompanionDrawer = ref(false)
const { navigateWithDelay } = useDrawerNavigation(showCompanionDrawer)
const selectedService = ref<any>(null)

// 从 API 获取的数据
const serviceList = ref<ServiceItem[]>([])
const companionList = ref<Companion[]>([])
const loading = ref(false)

// 轮播图（静态展示，保留硬编码）
const carouselImages = [
  'https://placehold.co/750x360/409EFF/fff?text=专业陪诊+安心无忧',
  'https://placehold.co/750x360/67C23A/fff?text=全程陪伴+贴心服务',
  'https://placehold.co/750x360/E6A23C/fff?text=专业代办+省时省力',
]

// 获取数据
async function fetchData() {
  loading.value = true
  try {
    const [servicesRes, companionsRes] = await Promise.allSettled([
      getServices(),
      getCompanions({ page: 1, size: 10 })
    ])

    if (servicesRes.status === 'fulfilled') {
      serviceList.value = servicesRes.value?.list || []
    }

    if (companionsRes.status === 'fulfilled') {
      companionList.value = companionsRes.value.list
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})

const goToSearch = () => {
  router.push('/search')
}

const goToServiceCategory = (type: string) => {
  router.push({
    path: '/service-category',
    query: { type },
  })
}

const goToServiceDetail = (service: any) => {
  router.push({
    name: 'service',
    params: { id: service.id },
  })
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
  navigateWithDelay({
    name: 'order-create',
    query: {
      serviceId: selectedService.value.id,
      companionId: companion.id,
    },
  })
}
</script>

<style scoped lang="scss">
.home-view {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 60px; /* Space for bottom tab bar if needed */
}

.search-bar {
  padding: 10px 15px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;

  .search-input {
    width: 100%;
    pointer-events: none;

    :deep(.el-input__wrapper) {
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
  }
}

.carousel-section {
  margin-bottom: 15px;

  .carousel-image {
    width: 100%;
    height: 100%;
  }
}

.nav-grid {
  display: flex;
  background-color: #fff;
  padding: 20px 0;
  margin-bottom: 15px;

  .nav-item {
    flex: 1;
    display: flex;
    justify-content: center;

    .nav-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .nav-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .nav-text {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  }
}

.service-list-section {
  background-color: #fff;
  padding: 15px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .section-title {
      font-size: 18px;
      font-weight: bold;
      position: relative;
      padding-left: 10px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background-color: #409eff;
        border-radius: 2px;
      }
    }
  }

  .service-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .service-card {
    display: flex;
    gap: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    cursor: pointer;

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

        .select-btn {
          height: 28px;
          font-size: 12px;
          padding: 0 12px;
          background-color: #409eff;
          border-color: #409eff;
          color: #fff;
        }
      }
    }
  }
}
</style>
