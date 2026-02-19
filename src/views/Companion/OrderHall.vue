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
        <div class="card-main">
          <div class="left-info">
            <div class="service-tag">{{ order.serviceName }}</div>
            <div class="info-row">
              <el-icon><User /></el-icon>
              <span>{{ order.patientName || '就诊人' }}</span>
            </div>
            <div class="info-row">
              <el-icon><Location /></el-icon>
              <span
                >{{ order.hospital }}{{ order.department ? ` (${order.department})` : '' }}</span
              >
            </div>
            <div class="info-row">
              <el-icon><Clock /></el-icon>
              <span>{{ order.appointmentTime }}</span>
            </div>
          </div>
          <div class="right-price">
            <div class="price">¥{{ order.amount }}</div>
          </div>
        </div>
        <div class="card-footer">
          <el-button type="primary" size="small" round @click="handleGrab(order)"
            >立即抢单</el-button
          >
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
import { ArrowLeft, Location, Clock, User } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getAvailableOrders, acceptOrder } from '@/api/companion'
import type { AvailableOrder } from '@/types/api'

const router = useRouter()

// 可接订单列表
const availableOrders = ref<AvailableOrder[]>([])
const loading = ref(false)

// 抢单处理
const handleGrab = async (order: AvailableOrder) => {
  try {
    await ElMessageBox.confirm('确认要抢这个订单吗？', '抢单确认', {
      confirmButtonText: '确认抢单',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // 调用接单 API
    await acceptOrder(String(order.id))
    ElMessage.success('抢单成功')
    // 从列表中移除已抢订单
    const index = availableOrders.value.findIndex((o) => o.id === order.id)
    if (index > -1) {
      availableOrders.value.splice(index, 1)
    }
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('抢单失败:', error)
      ElMessage.error('抢单失败，请稍后重试')
    }
  }
}

// 获取可接订单
async function fetchAvailableOrders() {
  loading.value = true
  try {
    console.log('[OrderHall] 开始获取可接订单...')
    const res = await getAvailableOrders({ page: 1, size: 50 })
    console.log('[OrderHall] 接口返回:', res)

    // 如果返回的数据有 list 字段，使用它；否则直接使用返回值
    if (res && typeof res === 'object') {
      if ('list' in res) {
        availableOrders.value = res.list || []
      } else if (Array.isArray(res)) {
        // 如果直接返回数组
        availableOrders.value = res
      } else {
        availableOrders.value = []
      }
    } else {
      availableOrders.value = []
    }

    console.log('[OrderHall] 订单列表:', availableOrders.value)

    // 如果仍然没有数据，使用 Mock 数据
    if (availableOrders.value.length === 0) {
      console.warn('[OrderHall] 接口未返回数据，使用 Mock 数据')
      availableOrders.value = mockOrders
    }
  } catch (error) {
    console.error('获取可接订单失败:', error)
    // 使用 Mock 数据作为兜底
    availableOrders.value = mockOrders
  } finally {
    loading.value = false
  }
}

// Mock 数据（临时方案）
const mockOrders: AvailableOrder[] = [
  {
    id: 'ORD20240315001',
    serviceName: '门诊陪诊',
    hospital: '北京协和医院',
    department: '心内科',
    appointmentTime: '2024-03-16 09:00',
    pickupOption: '需要接送',
    amount: 298.00,
    distance: '2.5km',
    publishTime: '2024-03-15 14:30',
    patientName: '李女士'
  },
  {
    id: 'ORD20240315002',
    serviceName: '全天陪诊',
    hospital: '北京同仁医院',
    department: '眼科',
    appointmentTime: '2024-03-16 14:00',
    pickupOption: '不需要接送',
    amount: 598.00,
    distance: '1.2km',
    publishTime: '2024-03-15 15:00',
    patientName: '王先生'
  },
  {
    id: 'ORD20240315003',
    serviceName: '异地陪诊',
    hospital: '北京天坛医院',
    department: '神经外科',
    appointmentTime: '2024-03-17 10:00',
    pickupOption: '需要接送',
    amount: 898.00,
    distance: '5.8km',
    publishTime: '2024-03-15 16:00',
    patientName: '张女士'
  },
  {
    id: 'ORD20240315004',
    serviceName: '门诊陪诊',
    hospital: '北京朝阳医院',
    department: '呼吸内科',
    appointmentTime: '2024-03-17 15:30',
    pickupOption: '不需要接送',
    amount: 298.00,
    distance: '3.2km',
    publishTime: '2024-03-15 17:00',
    patientName: '赵先生'
  },
  {
    id: 'ORD20240315005',
    serviceName: '全天陪诊',
    hospital: '北京安贞医院',
    department: '心血管内科',
    appointmentTime: '2024-03-18 08:30',
    pickupOption: '需要接送',
    amount: 598.00,
    distance: '4.5km',
    publishTime: '2024-03-15 18:00',
    patientName: '刘女士'
  }
]

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

  .card-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
  }

  .left-info {
    flex: 1;

    .service-tag {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      position: relative;
      padding-left: 10px;
      margin-bottom: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background: #409eff;
        border-radius: 2px;
      }
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .right-price {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-left: 16px;

    .price {
      font-size: 20px;
      font-weight: 600;
      color: #f56c6c;
      font-family:
        DINAlternate-Bold,
        -apple-system,
        Helvetica Neue,
        sans-serif;
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f5f7fa;
  }
}

.empty-state {
  padding: 60px 0;
}
</style>
