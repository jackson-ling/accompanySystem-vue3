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
          <el-icon :size="40" color="#e6a23c" v-if="order.status === 2"><Clock /></el-icon>
          <el-icon :size="40" color="#409eff" v-else-if="order.status === 3"><Timer /></el-icon>
          <el-icon :size="40" color="#67c23a" v-else-if="order.status === 4"
            ><CircleCheckFilled
          /></el-icon>
        </div>
        <div class="status-text">{{ getStatusText(order.status) }}</div>
        <div class="status-desc" v-if="order.status === 2">请在预约时间前到达医院</div>
        <div class="status-desc" v-else-if="order.status === 3">请准时到达医院提供服务</div>
        <div class="status-desc" v-else-if="order.status === 4">服务已完成，期待您的下次服务</div>
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

      <!-- Companion Info -->
      <div class="info-card">
        <div class="card-title">陪诊师信息</div>
        <div class="info-item">
          <span class="label">姓名</span>
          <span class="value">{{ order.companionName || '未分配' }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系电话</span>
          <span
            class="value phone"
            @click="order.companionPhone && callPhone(order.companionPhone)"
          >
            {{ order.companionPhone || '暂无电话' }}
            <el-icon class="phone-icon" v-if="order.companionPhone"><Phone /></el-icon>
          </span>
        </div>
      </div>

      <!-- User Review -->
      <div class="info-card" v-if="order.status === 4 && order.clientComment">
        <div class="card-title">用户评价</div>
        <div class="comment-item">
          <div class="comment-header">
            <el-avatar
              :size="30"
              src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
            />
            <span class="username">张女士</span>
            <div class="score-display">
              <el-icon color="#F7BA2A"><StarFilled /></el-icon>
              <span class="score-text">{{ order.clientComment.score.toFixed(1) }}</span>
            </div>
          </div>
          <div class="comment-content">
            {{ order.clientComment.content || '用户未填写评价内容' }}
          </div>
          <div class="comment-date">{{ order.clientComment.time }}</div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="bottom-bar" v-if="order && (order.status === 2 || order.status === 3)">
      <template v-if="order.status === 2">
        <el-button class="action-btn" plain round @click="contactUser">联系客户</el-button>
        <el-button class="action-btn" type="primary" round @click="startService()">
          开始服务
        </el-button>
      </template>
      <div v-else-if="order.status === 3" class="slide-verify" ref="sliderContainer">
        <div class="slide-track">
          <div class="slide-text">右滑结束服务</div>
        </div>
        <div
          class="slide-btn"
          :style="{
            transform: `translateX(${sliderLeft}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease',
          }"
          @mousedown="onMouseDown"
          @touchstart="onTouchStart"
        >
          <el-icon><ArrowRight /></el-icon>
        </div>
        <div
          class="slide-mask"
          :style="{
            width: `${sliderLeft}px`,
            transition: isDragging ? 'none' : 'width 0.3s ease',
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  Timer,
  CircleCheckFilled,
  Phone,
  Clock,
  StarFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCompanionOrderDetail } from '@/api/order'
import type { Order } from '@/types/api'
import { useCompanionOrderStore } from '@/stores/companionOrder'

const router = useRouter()
const route = useRoute()
const order = ref<Order | null>(null)
const loading = ref(false)
const companionOrderStore = useCompanionOrderStore()

// 获取订单详情
async function fetchOrderDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    const uniqueId = (route.query._uid as string) || id
    const queryStatus = route.query.status
    const res = await getCompanionOrderDetail(id)

    // 优先使用本地存储的状态
    // 如果没有 uniqueId (即 _uid 参数)，则回退到 id，这会导致相同 id 的订单共享状态
    // 但在 ServiceOrders.vue 中我们已经确保传递了 _uid
    const localStatus = companionOrderStore.getLocalStatus(uniqueId)
    if (localStatus) {
      res.status = localStatus
    } else if (queryStatus) {
      res.status = Number(queryStatus)
    }

    // 保存 uniqueId 到 order 对象上，以便后续操作使用
    // @ts-ignore
    res._uniqueId = uniqueId

    // 模拟评价数据（仅用于展示）
    if (res.status === 4 && !res.clientComment) {
      res.clientComment = {
        score: 5,
        content: '非常专业，帮我节省了很多时间，推荐!',
        time: '2023-10-15',
      }
    }

    order.value = res
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
  router.push('/messages')
}

const startService = () => {
  if (order.value) {
    order.value.status = 3
    // @ts-ignore
    const key = order.value._uniqueId || order.value.id
    companionOrderStore.updateLocalStatus(key, 3)
  }
  ElMessage.success('开始服务打卡成功')
}

const completeService = () => {
  ElMessageBox.confirm('确认服务已完成吗？', '服务完成', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success',
  })
    .then(() => {
      if (order.value) {
        order.value.status = 4
        // @ts-ignore
        const key = order.value._uniqueId || order.value.id
        companionOrderStore.updateLocalStatus(key, 4)
      }
      ElMessage.success('服务已完成')
    })
    .catch(() => {
      sliderLeft.value = 0
    })
}

// Slider Logic
const sliderLeft = ref(0)
const sliderContainer = ref<HTMLElement | null>(null)
const startX = ref(0)
const isDragging = ref(false)

const onMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true
  startX.value = e.clientX
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0]
    if (touch) {
      isDragging.value = true
      startX.value = touch.clientX
      document.addEventListener('touchmove', onTouchMove)
      document.addEventListener('touchend', onTouchEnd)
    }
  }
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  handleMove(e.clientX)
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || e.touches.length === 0) return
  const touch = e.touches[0]
  if (touch) {
    handleMove(touch.clientX)
  }
}

const handleMove = (currentX: number) => {
  if (!sliderContainer.value) return
  const containerWidth = sliderContainer.value.clientWidth
  const btnWidth = 50 // Match CSS width
  const max = containerWidth - btnWidth

  let diff = currentX - startX.value
  if (diff < 0) diff = 0
  if (diff > max) diff = max

  sliderLeft.value = diff

  if (diff >= max) {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('touchend', onTouchEnd)
    completeService()
  }
}

const onMouseUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  if (sliderContainer.value && sliderLeft.value < sliderContainer.value.clientWidth - 50) {
    sliderLeft.value = 0
  }
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false
  if (sliderContainer.value && sliderLeft.value < sliderContainer.value.clientWidth - 50) {
    sliderLeft.value = 0
  }
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
})
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

.comment-item {
  padding: 0;
  border-bottom: none;

  .comment-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;

    .username {
      font-size: 14px;
      font-weight: 500;
      flex: 1;
    }

    .score-display {
      display: flex;
      align-items: center;
      gap: 2px;

      .score-text {
        font-size: 14px;
        color: #f7ba2a;
        font-weight: bold;
        margin-left: 2px;
      }
    }
  }

  .comment-content {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
    line-height: 1.6;
  }

  .comment-date {
    font-size: 12px;
    color: #999;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
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

    &:only-child {
      margin-right: 0;
    }
  }

  .slide-verify {
    flex: 1;
    height: 44px;
    position: relative;
    background: #f2f3f5;
    border-radius: 22px;
    overflow: hidden;
    user-select: none;

    .slide-track {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slide-text {
      color: #999;
      font-size: 14px;
      z-index: 1;
    }

    .slide-btn {
      position: absolute;
      left: 0;
      top: 0;
      width: 50px;
      height: 44px;
      background: #fff;
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      cursor: grab;
      z-index: 3;
      color: #409eff;
      font-size: 18px;

      &:active {
        cursor: grabbing;
      }
    }

    .slide-mask {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(to right, #a0cfff, #409eff);
      z-index: 2;
    }
  }
}
</style>
