<template>
  <div class="service-order-detail-page">
    <div class="header">
      <div class="left" @click="router.back()">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </div>
      <div class="title">订单详情</div>
      <div class="right"></div>
    </div>

    <div class="content" v-if="order">
      <!-- Status Card -->
      <div class="status-card">
        <div class="status-icon">
          <el-icon :size="40" color="#409eff" v-if="order.status === 3"
            ><Timer
          /></el-icon>
          <el-icon :size="40" color="#67c23a" v-else-if="order.status === 4"
            ><CircleCheckFilled
          /></el-icon>
        </div>
        <div class="status-text">{{ getStatusText(order.status) }}</div>
        <div class="status-desc" v-if="order.status === 3">请准时到达医院提供服务</div>
        <div class="status-desc" v-else>服务已完成，期待下次为您服务</div>
      </div>

      <!-- Service Info -->
      <div class="info-card">
        <div class="card-title">服务信息</div>
        <div class="info-item">
          <span class="label">服务项目</span>
          <span class="value">{{ order.serviceName }}</span>
        </div>
        <div class="info-item">
          <span class="label">就诊医院</span>
          <span class="value">{{ order.hospital }}</span>
        </div>
        <div class="info-item">
          <span class="label">服务时间</span>
          <span class="value">{{ order.appointmentTime }}</span>
        </div>
        <div class="info-item">
          <span class="label">服务费用</span>
          <span class="value price">¥{{ order.amount }}</span>
        </div>
      </div>

      <!-- Patient Info -->
      <div class="info-card">
        <div class="card-title">就诊人信息</div>
        <div class="info-item">
          <span class="label">姓名</span>
          <span class="value">{{ order.patientName }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系电话</span>
          <span class="value phone" @click="callPhone(order.phone || '13800138000')">
            {{ order.phone || '138****8000' }}
            <el-icon class="phone-icon"><Phone /></el-icon>
          </span>
        </div>
        <div class="info-item">
          <span class="label">备注需求</span>
          <span class="value">{{ order.remark || '无' }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="bottom-bar" v-if="order && order.status === 3">
      <el-button class="action-btn" plain round @click="contactUser">联系客户</el-button>
      <el-button class="action-btn" type="primary" round @click="startService">完成服务</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Timer, CircleCheckFilled, Phone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCompanionOrderDetail } from '@/api/order'
import type { Order } from '@/types/api'

const router = useRouter()
const route = useRoute()
const order = ref<Order | null>(null)
const loading = ref(false)

// 获取订单详情
async function fetchOrderDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    order.value = await getCompanionOrderDetail(id)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrderDetail()
})

// 状态映射
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

const callPhone = (phone: string) => {
  window.location.href = `tel:${phone}`
}

const contactUser = () => {
  ElMessage.success('正在呼叫客户...')
}

const startService = () => {
  ElMessage.success('开始服务打卡成功')
}
</script>

<style scoped lang="scss">
.service-order-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;
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
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}

.content {
  padding: 16px;
}

.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  margin-bottom: 12px;

  .status-icon {
    margin-bottom: 12px;
  }

  .status-text {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .status-desc {
    font-size: 14px;
    color: #999;
  }
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 3px solid #409eff;
    line-height: 1;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #666;
      width: 80px;
      flex-shrink: 0;
    }

    .value {
      color: #333;
      text-align: right;
      flex: 1;

      &.price {
        color: #f56c6c;
        font-weight: 600;
        font-size: 16px;
      }

      &.phone {
        color: #409eff;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  z-index: 99;

  .action-btn {
    flex: 1;
    height: 40px;
    font-size: 15px;

    &:first-child {
      margin-right: 12px;
    }
  }
}
</style>
