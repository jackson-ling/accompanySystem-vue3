<template>
  <div class="order-list-page">
    <div class="sticky-header">
      <div class="header-nav">
        <el-icon @click="router.back()" class="back-icon"><ArrowLeft /></el-icon>
        <span>我的订单</span>
        <div style="width: 24px"></div>
      </div>

      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick" stretch class="custom-tabs">
          <el-tab-pane label="全部" name="0"></el-tab-pane>
          <el-tab-pane label="待服务" name="2"></el-tab-pane>
          <el-tab-pane label="服务中" name="3"></el-tab-pane>
          <el-tab-pane label="已完成" name="4"></el-tab-pane>
          <el-tab-pane label="退款/售后" name="5"></el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div class="order-content">
      <transition :name="transitionName" mode="out-in">
        <div v-if="filteredOrders.length === 0" class="empty-state" key="empty">
          <el-empty description="暂无订单" />
        </div>
        <div v-else class="order-list" :key="activeTab">
          <div v-for="order in filteredOrders" :key="order.id" class="order-card">
            <div class="card-header">
              <span class="time">{{ order.createTime }}</span>
              <span class="status" :class="getStatusClass(order.status)">{{
                getStatusText(order.status)
              }}</span>
            </div>
            <div class="card-body">
              <el-image :src="order.image" class="service-img" fit="cover" />
              <div class="info">
                <div class="service-name">{{ order.serviceName }}</div>
                <div class="service-desc">{{ order.hospital }} | {{ order.department }}</div>
                <div class="price-row">
                  <span class="price">¥{{ order.price }}</span>
                  <span class="count">x1</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="total">
                共1件商品 合计: <span class="total-price">¥{{ order.price }}</span>
              </div>
              <div class="actions">
                <el-button size="small" round v-if="[4, 5].includes(order.status)"
                  >删除订单</el-button
                >
                <!-- <el-button size="small" round v-if="order.status === 1">取消订单</el-button> -->
                <!-- <el-button size="small" type="primary" round v-if="order.status === 1" class="primary-btn">去支付</el-button> -->
                <el-button size="small" round v-if="order.status === 2">联系陪诊师</el-button>
                <el-button
                  size="small"
                  type="primary"
                  round
                  v-if="order.status === 3"
                  class="primary-btn"
                  >确认完成</el-button
                >
                <el-button size="small" round v-if="order.status === 4">申请售后</el-button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'OrderList',
})
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getUserOrders } from '@/api/order'
import type { Order } from '@/types/api'

const router = useRouter()
const route = useRoute()

const activeTab = ref('0')
const transitionName = ref('tab-slide-left')

// 从 API 获取的订单数据
const orderList = ref<Order[]>([])
const loading = ref(false)

// 获取订单数据
async function fetchOrders() {
  loading.value = true
  try {
    const status = activeTab.value === '0' ? undefined : parseInt(activeTab.value)
    const res = await getUserOrders({ status })
    orderList.value = res.list
  } catch (error) {
    console.error('获取订单列表失败:', error)
    orderList.value = []
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  if (activeTab.value === '0') return orderList.value
  return orderList.value.filter((order) => order.status.toString() === activeTab.value)
})

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    1: '待付款',
    2: '待服务',
    3: '服务中',
    4: '已完成',
    5: '退款/售后',
  }
  return map[status] || '未知状态'
}

const getStatusClass = (status: number) => {
  const map: Record<number, string> = {
    1: 'status-pending',
    2: 'status-wait',
    3: 'status-process',
    4: 'status-success',
    5: 'status-refund',
  }
  return map[status] || ''
}

const handleTabClick = (tab: any) => {
  const newIndex = parseInt(tab.props.name)
  const oldIndex = parseInt(activeTab.value)
  if (newIndex > oldIndex) {
    transitionName.value = 'tab-slide-left'
  } else {
    transitionName.value = 'tab-slide-right'
  }
  // router.replace({ query: { ...route.query, status: tab.props.name } })
  activeTab.value = tab.props.name
}

onMounted(() => {
  const status = route.query.status as string
  if (status) {
    activeTab.value = status
  }
  fetchOrders()
})

watch(
  () => route.query.status,
  (newStatus) => {
    if (newStatus) {
      activeTab.value = newStatus as string
    } else {
      activeTab.value = '0'
    }
  },
)

watch(activeTab, () => {
  fetchOrders()
})
</script>

<style scoped lang="scss">
.order-list-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #eee;

  .back-icon {
    font-size: 20px;
    cursor: pointer;
  }
}

.tabs-wrapper {
  background-color: #fff;
}

.order-content {
  flex: 1;
  padding: 12px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  overflow-x: hidden;

  .empty-state {
    padding-top: 60px;
  }
}

/* Tab Transitions */
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.tab-slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.tab-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.tab-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.tab-slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.order-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 12px;

    .time {
      color: #909399;
    }

    .status {
      font-weight: 500;
      &.status-pending {
        color: #ff9500;
      }
      &.status-wait {
        color: #409eff;
      }
      &.status-process {
        color: #e6a23c;
      }
      &.status-success {
        color: #67c23a;
      }
      &.status-refund {
        color: #909399;
      }
    }
  }

  .card-body {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;

    .service-img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      background-color: #f5f7fa;
    }

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .service-name {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        line-height: 1.4;
      }

      .service-desc {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }

      .price-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .price {
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }

        .count {
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }

  .card-footer {
    border-top: 1px solid #f5f7fa;
    padding-top: 12px;

    .total {
      text-align: right;
      font-size: 12px;
      color: #606266;
      margin-bottom: 12px;

      .total-price {
        color: #333;
        font-weight: 500;
        font-size: 14px;
      }
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;

      .primary-btn {
        padding: 0 20px;
      }
    }
  }
}

:deep(.el-tabs__header) {
  margin: 0;
}
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
:deep(.el-tabs__item) {
  font-size: 14px; /* Standard size for better readability */
  padding: 0 4px !important; /* Minimal padding to allow flex distribution */
  height: 44px;
  line-height: 44px;
  text-align: center;
  justify-content: center;
  letter-spacing: -0.5px; /* Slight tracking reduction to fit long text */
}
:deep(.el-tabs__nav-scroll) {
  padding: 0; /* Remove extra padding */
}
</style>
