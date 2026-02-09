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
        @click="activeTab = 'pending'"
      >
        待服务订单
        <div class="indicator" v-if="activeTab === 'pending'"></div>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        已完成
        <div class="indicator" v-if="activeTab === 'completed'"></div>
      </div>
    </div>

    <div class="order-list">
      <transition :name="transitionName" mode="out-in">
        <div :key="activeTab">
          <div class="order-card" v-for="order in filteredOrders" :key="order.id">
            <div
              class="card-header"
              @click="getStatusInfo(order.status).type === 'pending' ? goToDetail(order.id) : null"
              :class="{ clickable: getStatusInfo(order.status).type === 'pending' }"
            >
              <div class="service-name">
                {{ order.serviceName }}
                <el-icon class="link-icon" v-if="getStatusInfo(order.status).type === 'pending'"
                  ><ArrowRight
                /></el-icon>
              </div>
              <div class="status" :class="getStatusInfo(order.status).type">{{ getStatusInfo(order.status).text }}</div>
            </div>
            <div class="card-body" @click="goToDetail(order.id)">
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
              <el-button class="action-btn" plain size="small">联系客户</el-button>
              <el-button class="action-btn primary" type="primary" size="small">开始服务</el-button>
            </div>
            <div class="card-footer" v-else>
              <el-button class="action-btn" plain size="small" @click="goToDetail(order.id)"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Calendar, Location, User } from '@element-plus/icons-vue'
import { getCompanionOrders } from '@/api/order'
import type { Order } from '@/types/api'

const router = useRouter()
const activeTab = ref<'pending' | 'completed'>('pending') // pending | completed
const transitionName = ref('slide-left')

watch(activeTab, (newVal, oldVal) => {
  if (newVal === 'completed') {
    transitionName.value = 'tab-slide-left'
  } else {
    transitionName.value = 'tab-slide-right'
  }
})

// 订单数据和加载状态
const orders = ref<Order[]>([])
const loading = ref(false)

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getCompanionOrders()
    orders.value = res.list || res
  } catch (error) {
    console.error('获取订单失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOrders()
})

// 订单状态映射
const getStatusInfo = (status: number) => {
  // status: 2-待服务, 4-已完成
  return {
    2: { text: '待服务', type: 'pending' },
    4: { text: '已完成', type: 'completed' },
  }[status] || { text: '未知', type: '' }
}

const filteredOrders = computed(() => {
  const statusMap: Record<'pending' | 'completed', number> = { pending: 2, completed: 4 }
  return orders.value.filter((order) => order.status === statusMap[activeTab.value])
})

const goToDetail = (id: string | number) => {
  router.push(`/companion/service-order/${String(id)}`)
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
  padding: 16px;
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
  transition: all 0.3s ease;
}

.tab-slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.tab-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.tab-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.tab-slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
