<template>
  <div class="service-orders-page">
    <div class="header">
      <div class="left" @click="router.back()">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </div>
      <div class="title">全部订单</div>
      <div class="right"></div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'pending' }"
        @click="handleTabChange('pending')"
      >
        待服务订单
        <div class="indicator" v-if="activeTab === 'pending'"></div>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'completed' }"
        @click="handleTabChange('completed')"
      >
        已完成
        <div class="indicator" v-if="activeTab === 'completed'"></div>
      </div>
    </div>

    <div class="order-list">
      <transition :name="transitionName">
        <div :key="activeTab" class="tab-pane">
          <div class="order-card" v-for="order in filteredOrders" :key="order.id">
            <div
              class="card-header"
              @click="
                getStatusInfo(order.status).type === 'pending'
                  ? goToDetail(order.id, order.status, order._uniqueId)
                  : null
              "
              :class="{ clickable: getStatusInfo(order.status).type === 'pending' }"
            >
              <div class="service-name">
                {{ order.serviceName }}
                <el-icon class="link-icon" v-if="getStatusInfo(order.status).type === 'pending'"
                  ><ArrowRight
                /></el-icon>
              </div>
              <div class="status" :class="getStatusInfo(order.status).type">
                {{ getStatusInfo(order.status).text }}
              </div>
            </div>
            <div class="card-body" @click="goToDetail(order.id, order.status, order._uniqueId)">
              <div class="info-row">
                <el-icon><Calendar /></el-icon>
                <span>{{ order.time }}</span>
              </div>
              <div class="info-row">
                <el-icon><Location /></el-icon>
                <span>{{ order.hospital }}</span>
              </div>
              <div class="info-row">
                <el-icon><User /></el-icon>
                <span>{{ order.patientName }} ({{ order.phone }})</span>
              </div>
            </div>
            <div class="card-footer" v-if="getStatusInfo(order.status).type === 'pending'">
              <el-button class="action-btn" plain size="small" @click.stop="contactCustomer"
                >联系客户</el-button
              >
              <el-button
                class="action-btn primary"
                type="primary"
                size="small"
                v-if="order.status === 2"
                @click.stop="handleStartService(order)"
                >开始服务</el-button
              >
            </div>
            <div class="card-footer" v-else>
              <el-button
                class="action-btn"
                plain
                size="small"
                @click="goToDetail(order.id, order.status, order._uniqueId)"
                >查看详情</el-button
              >
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredOrders.length === 0" class="empty-state">
            <el-empty description="暂无订单" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'service-orders',
})
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, Calendar, Location, User } from '@element-plus/icons-vue'
import { getCompanionOrders, startCompanionOrder } from '@/api/order'
import type { Order } from '@/types/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCompanionOrderStore } from '@/stores/companionOrder'

type OrderWithUniqueId = Order & { _uniqueId?: string }

const router = useRouter()
const route = useRoute()
const activeTab = ref<'pending' | 'completed'>(
  (route.query.tab as 'pending' | 'completed') || 'pending',
) // pending | completed
const transitionName = ref('tab-slide-left')
const companionOrderStore = useCompanionOrderStore()

// 初始化 activeTab
// 优先使用路由参数，如果没有则默认为 'pending'，不使用 store 中的历史状态，确保每次进入都是待服务
if (route.query.tab) {
  activeTab.value = route.query.tab as 'pending' | 'completed'
} else {
  activeTab.value = 'pending'
}
// 同步初始状态到 store
companionOrderStore.activeTab = activeTab.value

// 统一的 Tab 切换处理函数
const handleTabChange = async (tab: 'pending' | 'completed') => {
  if (activeTab.value === tab) return

  // 1. 先确定动画方向
  if (tab === 'completed') {
    transitionName.value = 'tab-slide-left' // 从右向左进
  } else {
    transitionName.value = 'tab-slide-right' // 从左向右进
  }

  // 等待 DOM 更新，确保 transition 组件获取到新的 name
  await nextTick()

  // 2. 更新状态
  activeTab.value = tab
  companionOrderStore.activeTab = tab

  // 3. 同步路由
  router.replace({ query: { ...route.query, tab } })
}

// 监听路由变化（处理浏览器后退等外部变化）
watch(
  () => route.query.tab,
  async (newTab) => {
    if (newTab && newTab !== activeTab.value) {
      // 外部触发的变化
      const tab = newTab as 'pending' | 'completed'

      // 确定动画方向
      if (tab === 'completed') {
        transitionName.value = 'tab-slide-left'
      } else {
        transitionName.value = 'tab-slide-right'
      }

      await nextTick()

      activeTab.value = tab
      companionOrderStore.activeTab = tab
    }
  },
)

// 订单数据和加载状态
const orders = ref<OrderWithUniqueId[]>([])
const loading = ref(false)

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getCompanionOrders()
    // The API returns PaginatedResult<Order>, but TS might be confused by the assignment
    // We explicitly access the list property if available
    if ('list' in res && Array.isArray(res.list)) {
      orders.value = res.list.map((item, index) => ({
        ...item,
        _uniqueId: `${item.id}_${index}`,
      })) as OrderWithUniqueId[]
    } else if (Array.isArray(res)) {
      // Fallback if it returns an array
      orders.value = (res as Order[]).map((item, index) => ({
        ...item,
        _uniqueId: `${item.id}_${index}`,
      })) as OrderWithUniqueId[]
    } else {
      orders.value = []
    }
  } catch (error) {
    console.error('获取订单失败:', error)
  } finally {
    loading.value = false
  }
}

const contactCustomer = () => {
  router.push('/messages')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOrders()
})

// 订单状态映射
const getStatusInfo = (status: number) => {
  // status: 2-待服务, 3-服务中, 4-已完成
  return (
    {
      2: { text: '待服务', type: 'pending' },
      3: { text: '服务中', type: 'pending' }, // 这里的 type 控制颜色，服务中也用 pending 的颜色（或自定义）
      4: { text: '已完成', type: 'completed' },
    }[status] || { text: '未知', type: '' }
  )
}

const filteredOrders = computed(() => {
  const allOrders = orders.value.map((order) => {
    const uniqueId = order._uniqueId || order.id
    const localStatus = companionOrderStore.getLocalStatus(uniqueId)
    return localStatus ? { ...order, status: localStatus } : order
  })

  if (activeTab.value === 'pending') {
    // 待服务标签下显示：待服务(2) 和 服务中(3)
    return allOrders.filter((order) => order.status === 2 || order.status === 3)
  } else {
    // 已完成标签下显示：已完成(4)
    return allOrders.filter((order) => order.status === 4)
  }
})

const handleStartService = (order: Order) => {
  ElMessageBox.confirm('您是否确定开始服务？', '开始服务', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await startCompanionOrder(order.id)
        ElMessage.success('开始服务打卡成功')
        // 更新本地状态
        order.status = 3
        // @ts-ignore
        companionOrderStore.updateLocalStatus(order._uniqueId || order.id, 3)
      } catch (error) {
        console.error('开始服务失败:', error)
        ElMessage.error('开始服务失败，请重试')
      }
    })
    .catch(() => {
      // 取消操作，关闭弹窗（自动关闭）
    })
}

const goToDetail = (id: string | number, status?: number, uniqueId?: string) => {
  router.push({
    path: `/companion/service-order/${String(id)}`,
    query: {
      ...(status ? { status: String(status) } : {}),
      ...(uniqueId ? { _uid: uniqueId } : {}),
    },
  })
}
</script>

<style scoped lang="scss">
.service-orders-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 20px;
}

.header {
  height: 44px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }
}

.filter-tabs {
  display: flex;
  background: #fff;
  margin-bottom: 12px;
  padding: 0 16px;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    font-size: 15px;
    color: #666;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      color: #409eff;
      font-weight: 500;
    }

    .indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 3px;
      background: #409eff;
      border-radius: 2px;
    }
  }
}

.order-list {
  position: relative;
  overflow-x: hidden;
  min-height: calc(100vh - 100px); /* 占满剩余高度，防止闪烁 */
}

.tab-pane {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    &.clickable {
      cursor: pointer;
    }

    .service-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 4px;

      .link-icon {
        color: #c0c4cc;
        font-size: 14px;
      }
    }

    .status {
      font-size: 14px;

      &.pending {
        color: #409eff;
      }
      &.completed {
        color: #67c23a;
      }
    }
  }

  .card-body {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    cursor: pointer;

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;

      .el-icon {
        color: #999;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #f5f7fa;

    .action-btn {
      padding: 8px 16px;
      height: 32px;
      border-radius: 16px;

      &.primary {
        background: #409eff;
        border-color: #409eff;
        color: #fff;
      }
    }
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
  top: 0;
  left: 0;
  width: 100%;
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
</style>
