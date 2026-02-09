<template>
  <div class="order-hall-page">
    <div class="header">
      <div class="left" @click="router.back()">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </div>
      <div class="title">抢单大厅</div>
      <div class="right"></div>
    </div>

    <!-- Filter Tabs Removed -->

    <div class="order-list">
      <div class="order-card" v-for="order in availableOrders" :key="order.id">
        <div class="card-header">
          <div class="service-tag">{{ order.serviceName }}</div>
          <div class="price">¥{{ order.amount }}</div>
        </div>
        <div class="info-row">
          <el-icon><Location /></el-icon>
          <span>{{ order.hospital }}{{ order.department ? ` (${order.department})` : '' }}</span>
        </div>
        <div class="info-row">
          <el-icon><Clock /></el-icon>
          <span>{{ order.appointmentTime }}</span>
        </div>
        <div class="card-footer">
          <div class="distance">{{ order.distance || '距离未知' }}</div>
          <el-button type="primary" size="small" round>立即抢单</el-button>
        </div>
      </div>
      <div v-if="availableOrders.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无可接订单" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Location, Clock } from '@element-plus/icons-vue'
import { getAvailableOrders } from '@/api/companion'
import type { AvailableOrder } from '@/types/api'

const router = useRouter()

// 可接订单列表
const availableOrders = ref<AvailableOrder[]>([])
const loading = ref(false)

// 获取可接订单
async function fetchAvailableOrders() {
  loading.value = true
  try {
    const res = await getAvailableOrders({ page: 1, size: 50 })
    availableOrders.value = res.list || []
  } catch (error) {
    console.error('获取可接订单失败:', error)
    availableOrders.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAvailableOrders()
})
</script>

<style scoped lang="scss">
.order-hall-page {
  min-height: 100vh;
  background-color: #f5f7fa;
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

  .title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }
}

.filter-tabs {
  display: flex;
  background: #fff;
  padding: 10px 16px;
  gap: 20px;
  border-bottom: 1px solid #f5f7fa;

  .tab-item {
    font-size: 14px;
    color: #666;
    padding-bottom: 6px;
    border-bottom: 2px solid transparent;

    &.active {
      color: #409eff;
      border-color: #409eff;
      font-weight: 500;
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

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .service-tag {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      position: relative;
      padding-left: 10px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 14px;
        background: #409eff;
        border-radius: 2px;
      }
    }

    .price {
      font-size: 16px;
      font-weight: 600;
      color: #f56c6c;
    }
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #666;
    margin-bottom: 8px;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f5f7fa;

    .distance {
      font-size: 12px;
      color: #999;
    }
  }
}

.empty-state {
  padding: 60px 0;
}
</style>
