<template>
  <div class="service-detail">
    <div class="scroll-content">
      <!-- Header Image -->
      <div class="header-image-container">
        <el-image :src="service.image" fit="cover" class="header-image" loading="lazy" />
        <div class="back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </div>
      </div>

      <!-- Basic Info -->
      <div class="info-card">
        <div class="info-content">
          <div class="left-section">
            <span class="title">{{ service.name }}</span>
            <span class="price">¥{{ service.price }}</span>
          </div>
          <div class="right-section">
            <span class="sales">已售 {{ service.sales }}</span>
            <div class="duration-row">
              <el-icon><Clock /></el-icon>
              <span class="duration-text">{{ service.duration || '2小时' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="detail-tabs">
        <div class="tab-header">
          <div
            class="tab-item"
            :class="{ active: currentTab === 'intro' }"
            @click="currentTab = 'intro'"
          >
            服务介绍
          </div>
          <div
            class="tab-item"
            :class="{ active: currentTab === 'notes' }"
            @click="currentTab = 'notes'"
          >
            下单须知
          </div>
        </div>

        <div class="tab-content">
          <div v-if="currentTab === 'intro'" class="content-text">
            <p>1. 专业陪诊师一对一服务。</p>
            <p>2. 协助办理就诊卡、缴费、取药。</p>
            <p>3. 陪同检查、候诊。</p>
            <p>4. 记录医嘱，整理病历资料。</p>
            <div class="image-placeholder">服务详情图片展示区域</div>
          </div>
          <div v-else class="content-text">
            <p>1. 请至少提前1天预约。</p>
            <p>2. 服务期间产生的交通费、挂号费等由客户承担。</p>
            <p>3. 如需取消，请提前2小时通知。</p>
            <p>4. 陪诊师不提供医疗咨询服务，仅提供就医协助。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="detail-bottom-bar" v-if="!isFromOrderDetail">
      <el-button
        type="primary"
        class="action-btn"
        @click="isFromOrderCreate || hasCompanion ? handleBook() : openCompanionSelector()"
      >
        {{ isFromOrderCreate || hasCompanion ? '立即下单' : '选择陪诊人' }}
      </el-button>
    </div>

    <!-- Companion Selector -->
    <CompanionSelector
      v-model:visible="showCompanionSelector"
      :service="service"
      :companions="companionList"
      @book="handleCompanionSelect"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'service',
})
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import CompanionSelector from '@/components/appointment/CompanionSelector.vue'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { useCompanionStore } from '@/stores/companion'
import { useDrawerNavigation } from '@/composables/useDrawerNavigation'
import { getServiceDetail } from '@/api/service'
import type { ServiceItem } from '@/types/api'
import type { Companion } from '@/types/api'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const userStore = useUserStore()
const companionStore = useCompanionStore()
const currentTab = ref('intro')
const showCompanionSelector = ref(false)
const { navigateWithDelay } = useDrawerNavigation(showCompanionSelector)

// 从 API 获取的数据
const service = ref<ServiceItem>({
  id: 0,
  name: '',
  description: '',
  price: 0,
  sales: 0,
  duration: '',
  image: '',
})
const loading = ref(false)

// 陪诊师列表（从 store 获取）
const companionList = computed(() => companionStore.companionList)

// 获取服务详情
async function fetchServiceDetail() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    service.value = await getServiceDetail(id)
  } catch (error) {
    console.error('获取服务详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchServiceDetail()
  // 获取陪诊师列表（如果 store 中没有）
  if (companionStore.companionList.length === 0) {
    companionStore.fetchCompanions()
  }
})

const hasCompanion = ref(!!route.query.companionId)
const isFromOrderCreate = ref(route.query.from === 'order-create')
const isFromOrderDetail = ref(route.query.from === 'order-detail')

watch(
  () => route.query,
  (newQuery) => {
    // 只在当前页面路由更新时更新状态，避免跳转到其他页面（如登录页）时状态重置导致 UI 闪烁
    if (route.name === 'service') {
      hasCompanion.value = !!newQuery.companionId
      isFromOrderCreate.value = newQuery.from === 'order-create'
      isFromOrderDetail.value = newQuery.from === 'order-detail'
    }
  },
)

const handleBook = () => {
  if (!userStore.isLogin) {
    navigateWithDelay('/login')
    return
  }

  if (isFromOrderCreate.value) {
    // If from order create, update store and go back
    orderStore.setService(service.value)
    // We don't necessarily set companion here unless it was passed or selected here
    // But this page is mainly for Service.
    router.back()
    return
  }

  const companionId = route.query.companionId
  router.push({
    path: '/order/create',
    query: {
      serviceId: service.value.id,
      companionId: companionId,
    },
  })
}

const openCompanionSelector = () => {
  if (isFromOrderCreate.value) {
    // If from order create, we treat the main button as "Confirm Service" (Immediate Order)
    // So we shouldn't open companion selector, we should just handle book
    handleBook()
    return
  }
  showCompanionSelector.value = true
}

const handleCompanionSelect = (companion: any) => {
  if (!userStore.isLogin) {
    navigateWithDelay('/login')
    return
  }
  // Close drawer with delay then navigate
  navigateWithDelay({
    path: '/order/create',
    query: {
      serviceId: service.value.id,
      companionId: companion.id,
    },
  })
}
</script>

<style scoped lang="scss">
.service-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f7f8fa;
  overflow: hidden !important;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.header-image-container {
  position: relative;
  width: 100%;
  height: 250px;
  flex-shrink: 0;

  .header-image {
    width: 100%;
    height: 100%;
  }

  .back-btn {
    position: absolute;
    top: calc(20px + env(safe-area-inset-top));
    left: 15px;
    width: 32px;
    height: 32px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    cursor: pointer;
    z-index: 10;
  }
}

.info-card {
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;

  .info-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .left-section {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    flex: 1;
    margin-right: 15px;

    .title {
      font-size: 23px;
      font-weight: bold;
      color: #333;
      margin-right: 12px;
      margin-bottom: 0;
      line-height: 1.4;
    }

    .price {
      color: #f56c6c;
      font-size: 24px;
      font-weight: bold;
      line-height: 1;
    }
  }

  .right-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;

    .sales {
      color: #999;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .duration-row {
      display: flex;
      align-items: center;
      color: #666;
      font-size: 13px;
      gap: 4px;
      white-space: nowrap;
    }
  }
}

.detail-tabs {
  background-color: #fff;
  min-height: 300px;
  flex: 1;

  .tab-header {
    display: flex;
    border-bottom: 1px solid #eee;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 15px 0;
      font-size: 15px;
      color: #666;
      position: relative;
      cursor: pointer;
      transition: none;

      &.active {
        color: #409eff;
        font-weight: bold;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background-color: #409eff;
        }
      }
    }
  }

  .tab-content {
    padding: 20px 15px;

    .content-text {
      font-size: 14px;
      color: #333;
      line-height: 1.6;

      p {
        margin-bottom: 10px;
      }

      .image-placeholder {
        width: 100%;
        height: 200px;
        background-color: #f0f2f5;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #999;
        margin-top: 20px;
        border-radius: 8px;
      }
    }
  }
}

.detail-bottom-bar {
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  box-sizing: border-box;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  /* Ensure it doesn't shrink or grow unexpectedly */
  flex-shrink: 0;

  .action-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 22px;
    border: none;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);

    // 强制覆盖 Element Plus 默认的点击变色行为
    --el-button-active-bg-color: #409eff;
    --el-button-active-border-color: #409eff;
    --el-button-hover-bg-color: #409eff;
    --el-button-hover-border-color: #409eff;

    &:active,
    &:focus,
    &:hover {
      background-color: #409eff !important;
      border-color: #409eff !important;
      opacity: 1 !important;
    }
  }
}
</style>
