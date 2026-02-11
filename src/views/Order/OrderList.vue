<template>
  <div class="order-list-page">
    <div class="sticky-header">
      <div class="header-nav">
        <el-icon @click="router.back()" class="back-icon"><ArrowLeft /></el-icon>
        <span>我的订单</span>
        <div style="width: 24px"></div>
      </div>

      <div class="tabs-wrapper">
        <el-tabs
          v-model="activeTab"
          @tab-click="handleTabClick"
          stretch
          class="custom-tabs"
          :class="{ 'no-transition': !isMounted }"
        >
          <el-tab-pane label="全部" name="0"></el-tab-pane>
          <el-tab-pane label="待服务" name="2"></el-tab-pane>
          <el-tab-pane label="服务中" name="3"></el-tab-pane>
          <el-tab-pane label="已完成" name="4"></el-tab-pane>
          <el-tab-pane label="退款/售后" name="5"></el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div class="order-content">
      <transition :name="transitionName">
        <div v-if="filteredOrders.length === 0" class="empty-state" key="empty">
          <el-empty description="暂无订单" />
        </div>
        <div v-else class="order-list" :key="activeTab">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
            @click="navigateToDetail(order)"
          >
            <div class="card-header">
              <div class="header-left">
                <span class="service-title">{{ order.serviceName }}</span>
              </div>
              <div class="header-right">
                <span class="status" :class="getStatusClass(order.status)">{{
                  getStatusText(order.status)
                }}</span>
              </div>
            </div>

            <div class="card-body">
              <el-image :src="order.image" class="service-img" fit="cover" />
              <div class="info">
                <div class="info-top">
                  <div class="companion-info">
                    <div class="companion-row">
                      <span class="label">陪诊师：</span>
                      <span class="value">{{ order.companionName || '暂无' }}</span>
                    </div>
                    <div class="companion-row">
                      <span class="label">联系电话：</span>
                      <span class="value">{{ order.companionPhone || '暂无' }}</span>
                    </div>
                  </div>
                  <div class="view-details">
                    <span>查看详情</span>
                    <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                  </div>
                </div>
                <div class="time-row">
                  <el-icon><Clock /></el-icon>
                  <span>{{ order.appointmentTime }}</span>
                </div>
                <div class="price-row">
                  <span class="label">总价</span>
                  <span class="price">¥{{ order.price }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="actions">
                <el-button
                  size="small"
                  round
                  v-if="order.status === 1"
                  @click.stop="handleCancel(order)"
                  >取消订单</el-button
                >
                <el-button
                  size="small"
                  type="primary"
                  round
                  v-if="order.status === 1"
                  class="primary-btn"
                  @click.stop="handlePay(order)"
                  >去支付</el-button
                >
                <el-button
                  size="small"
                  round
                  v-if="order.status === 2"
                  @click.stop="handleContact(order)"
                  >联系陪诊师</el-button
                >
                <el-button
                  size="small"
                  type="primary"
                  round
                  v-if="order.status === 3"
                  class="primary-btn"
                  @click.stop="handleConfirm(order)"
                  >确认完成</el-button
                >
                <el-button
                  size="small"
                  round
                  v-if="order.status === 4"
                  @click.stop="handleRefund(order)"
                  >申请售后</el-button
                >
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, Clock } from '@element-plus/icons-vue'
import { getUserOrders, cancelUserOrder, confirmUserOrder } from '@/api/order'
import type { Order } from '@/types/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

// Robustly get initial tab from route or window location
const getInitialTab = () => {
  // Priority 1: Check route query directly if available
  if (route.query.status) return route.query.status as string

  // Priority 2: Parse from window.location.href to handle cases where route isn't fully ready
  // This regex looks for ?status=X or &status=X, handling both hash and history mode structures
  try {
    const match = window.location.href.match(/[?&]status=([^&#]+)/)
    if (match && match[1]) {
      return match[1]
    }
  } catch (e) {
    console.error('Error parsing URL for tab status:', e)
  }

  return '0'
}

const activeTab = ref(getInitialTab())
const transitionName = ref('')

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

const isMounted = ref(false)

const handleTabClick = async (tab: any) => {
  const newIndex = parseInt(tab.props.name)
  const oldIndex = parseInt(activeTab.value)
  if (newIndex > oldIndex) {
    transitionName.value = 'tab-slide-left'
  } else {
    transitionName.value = 'tab-slide-right'
  }

  await nextTick()

  activeTab.value = tab.props.name
  router.replace({ query: { ...route.query, status: tab.props.name } })
}

const navigateToDetail = (order: Order) => {
  const id = order.id
  if (id === undefined || id === null || id === '') {
    console.error('无效的订单ID:', id)
    ElMessage.error('无法查看详情：订单ID无效')
    return
  }
  console.log('Navigating to order detail:', id)

  // Debug: Check if route exists
  const routeExists = router.hasRoute('order-detail')
  if (!routeExists) {
    console.error('Critical Error: Route "order-detail" not found!')
    ElMessage.error('系统错误：详情页路由未注册')
    return
  }

  router
    .push({
      name: 'order-detail',
      params: { id: id.toString() },
      state: { orderData: JSON.parse(JSON.stringify(order)) }, // Pass order data as fallback
    })
    .catch((err) => {
      console.error('Navigation failed:', err)
      ElMessage.error('跳转失败: ' + err.message)
    })
}

const handlePay = (order: Order) => {
  setTimeout(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }, 100)
  ElMessage.info('跳转支付页面...')
}

const handleCancel = (order: Order) => {
  setTimeout(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }, 100)
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await cancelUserOrder(order.id)
      ElMessage.success('订单已取消')
      fetchOrders()
    } catch (error) {}
  })
}

const handleConfirm = (order: Order) => {
  setTimeout(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }, 100)
  ElMessageBox.confirm('确认服务已完成吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success',
  }).then(async () => {
    try {
      await confirmUserOrder(order.id)
      ElMessage.success('订单已完成')
      fetchOrders()
    } catch (error) {}
  })
}

const handleContact = (order: Order) => {
  setTimeout(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }, 100)
  router.push('/messages')
}

const handleRefund = (order: Order) => {
  setTimeout(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }, 100)
  ElMessage.info('售后功能开发中')
}

onMounted(() => {
  fetchOrders()
  // Delay enabling transitions to allow initial render without animation
  setTimeout(() => {
    isMounted.value = true
  }, 100)
})

watch(
  () => route.query.status,
  async (newStatus) => {
    // Only update if newStatus is present and different (avoids resetting to '0' unnecessarily if route query is temporarily missing during some transitions)
    if (newStatus && newStatus !== activeTab.value) {
      const newIndex = parseInt(newStatus as string)
      const oldIndex = parseInt(activeTab.value)
      if (newIndex > oldIndex) {
        transitionName.value = 'tab-slide-left'
      } else {
        transitionName.value = 'tab-slide-right'
      }
      await nextTick()
      activeTab.value = newStatus as string
    }
  },
)

watch(activeTab, () => {
  fetchOrders()
})
</script>

<style scoped lang="scss">
/* Override element-plus button focus style for mobile */
:deep(.el-button:focus:not(:focus-visible)) {
  background-color: var(--el-button-bg-color);
  border-color: var(--el-button-border-color);
  color: var(--el-button-text-color);
}
:deep(.el-button--primary:focus:not(:focus-visible)) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: var(--el-color-white);
}

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
  position: relative;

  .empty-state {
    padding-top: 60px;
    width: 100%;
  }

  .order-list {
    width: 100%;
  }
}

/* Tab Transitions */
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active {
  transition: all 0.3s ease-out;
}

.tab-slide-left-leave-active,
.tab-slide-right-leave-active {
  position: absolute;
  top: 12px; /* Match padding-top of container */
  left: 12px; /* Match padding-left of container */
  right: 12px; /* Match padding-right of container */
  width: calc(100% - 24px); /* Account for padding */
  z-index: 1;
}

.tab-slide-left-enter-active,
.tab-slide-right-enter-active {
  position: relative;
  z-index: 2;
}

.tab-slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.tab-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.tab-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.tab-slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.order-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  transition: all 0.2s;

  &:active {
    background-color: #f9f9f9;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f5f7fa;

    .header-left {
      display: flex;
      align-items: center;
      padding-top: 2px;

      .service-title {
        font-size: 17px;
        font-weight: bold;
        color: #303133;
      }
    }

    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .status {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
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
  }

  .card-body {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;

    .service-img {
      width: 70px;
      height: 70px;
      border-radius: 6px;
      background-color: #f5f7fa;
      flex-shrink: 0;
    }

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0; /* Prevent flex overflow */

      .info-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .companion-info {
          display: flex;
          flex-direction: column;
        }

        .view-details {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #909399;
          flex-shrink: 0;
          margin-left: 8px;
          margin-top: 2px;

          .arrow-icon {
            font-size: 12px;
            margin-left: 2px;
          }
        }
      }

      .companion-row {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;

        .label {
          color: #606266;
          margin-right: 4px;
        }

        .value {
          font-weight: 500;
        }
      }

      .time-row {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;

        .el-icon {
          margin-right: 4px;
        }
      }

      .price-row {
        display: flex;
        justify-content: flex-end;
        align-items: baseline;

        .label {
          font-size: 12px;
          color: #909399;
          margin-right: 4px;
        }

        .price {
          font-size: 16px;
          color: #333;
          font-weight: bold;
          font-family: DINAlternate-Bold, sans-serif;
        }
      }
    }
  }

  .card-footer {
    padding-top: 8px;

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

/* Disable transition on active bar when not mounted */
:deep(.no-transition .el-tabs__active-bar) {
  transition: none !important;
}
</style>
