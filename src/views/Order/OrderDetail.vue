<template>
  <div class="order-detail-page" v-loading="loading">
    <div class="nav-header">
      <el-icon @click="router.back()" class="back-icon"><ArrowLeft /></el-icon>
      <span>订单详情</span>
      <div style="width: 24px"></div>
    </div>

    <div class="content" v-if="order">
      <!-- Status Card -->
      <div class="status-card" :class="getStatusClass(order.status)">
        <div class="status-text">
          <el-icon class="status-icon"><InfoFilled /></el-icon>
          <span>{{ getStatusText(order.status) }}</span>
        </div>
        <div class="status-desc">{{ getStatusDesc(order.status) }}</div>
      </div>

      <!-- Service Evaluation -->
      <div class="section-card" v-if="order.status === 4 && !order.clientComment">
        <div class="card-title">服务评价</div>

        <!-- Not Evaluated -->
        <div class="evaluation-form">
          <div class="form-item rating-item">
            <span class="label">评分</span>
            <el-rate v-model="evaluationForm.score" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />
          </div>
          <div class="form-item">
            <el-input
              v-model="evaluationForm.content"
              type="textarea"
              :rows="3"
              placeholder="请输入您的评价内容，这对我们帮助很大~"
              resize="none"
              maxlength="500"
              show-word-limit
            />
          </div>
          <div class="form-footer">
            <el-button type="primary" :loading="submitLoading" round @click="handleSubmitEvaluation"
              >提交评价</el-button
            >
          </div>
        </div>
      </div>

      <!-- Service Info -->
      <div class="section-card">
        <div class="card-title">服务信息</div>
        <div class="service-info" @click="navigateToService(order.serviceId)">
          <el-image :src="order.image" class="service-img" fit="cover" />
          <div class="info-middle">
            <div class="service-name">{{ order.serviceName }}</div>
            <div class="service-intro">
              {{ serviceDetail?.description || '暂无服务简介' }}
            </div>
            <div class="service-meta">
              <span class="meta-item"
                ><el-icon><Timer /></el-icon> {{ serviceDetail?.duration || '暂无时长' }}</span
              >
              <span class="meta-item">销量 {{ serviceDetail?.sales || 0 }}</span>
            </div>
          </div>
          <div class="view-detail">
            <span class="tip">查看详情</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="price">¥{{ order.price }}</div>
        </div>
      </div>

      <!-- Companion Info -->
      <div class="section-card">
        <div class="card-title">陪诊师信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">陪诊人</span>
            <div
              class="value"
              @click="order.companionId ? navigateToCompanion(order.companionId) : null"
              :class="{ 'is-link': !!order.companionId }"
              style="display: flex; align-items: center; justify-content: flex-end"
            >
              <el-avatar
                v-if="order.companionId"
                :size="24"
                :src="
                  order.companionAvatar ||
                  'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
                "
                style="margin-right: 8px"
              />
              <span>{{ order.companionName || '待分配' }}</span>
              <el-icon v-if="order.companionId" style="margin-left: 4px"><ArrowRight /></el-icon>
            </div>
          </div>
          <div class="info-item">
            <span class="label">联系电话</span>
            <span class="value">{{
              order.companionPhone || (order.companionName ? '暂无' : '等待系统分配')
            }}</span>
          </div>
        </div>
      </div>

      <!-- Patient Info -->
      <div class="section-card">
        <div class="card-title">就诊人信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">就诊人</span>
            <span class="value">{{ order.patientName }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话</span>
            <span class="value">{{ order.phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">接送方式</span>
            <span class="value">{{ order.pickupOption || '自行前往' }}</span>
          </div>
          <div class="info-item" v-if="order.remarks">
            <span class="label">备注</span>
            <span class="value">{{ order.remarks }}</span>
          </div>
        </div>
      </div>

      <!-- Order Info -->
      <div class="section-card">
        <div class="card-title">订单信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">订单编号</span>
            <span class="value copy-row">
              {{ order.id }}
              <span class="copy-btn" @click="copyText(order.id.toString())">复制</span>
            </span>
          </div>
          <div class="info-item">
            <span class="label">创建时间</span>
            <span class="value">{{ order.createTime }}</span>
          </div>
          <div class="info-item" v-if="order.payTime">
            <span class="label">支付时间</span>
            <span class="value">{{ order.payTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="bottom-bar" v-if="order">
      <div class="price-container">
        <span class="label">合计:</span>
        <span class="price">¥{{ order.price }}</span>
      </div>
      <div class="actions">
        <el-button round v-if="order.status === 1" @click="handleCancel">取消订单</el-button>
        <el-button
          type="primary"
          round
          v-if="order.status === 1"
          class="primary-btn"
          @click="handlePay"
          >去支付</el-button
        >
        <el-button
          round
          v-if="order.status === 2"
          class="contact-btn"
          @click="handleContact($event)"
          >联系陪诊师</el-button
        >
        <el-button
          type="primary"
          round
          v-if="order.status === 3"
          class="primary-btn"
          @click="handleConfirm"
          >确认完成</el-button
        >
        <el-button round v-if="order.status === 4" @click="handleRefund">申请售后</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Location, Timer, InfoFilled, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserOrderDetail, cancelUserOrder, confirmUserOrder, evaluateOrder } from '@/api/order'
import { getServiceDetail } from '@/api/service'
import type { Order, ServiceItem } from '@/types/api'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string
const order = ref<Order | null>(null)
const serviceDetail = ref<ServiceItem | null>(null)
const loading = ref(false)

const evaluationForm = ref({
  score: 5,
  content: '',
})
const submitLoading = ref(false)

const fetchOrderDetail = async () => {
  // Try to load from history state first for immediate display
  const historyState = history.state
  if (historyState && historyState.orderData) {
    console.log('Loading order from history state', historyState.orderData)
    order.value = historyState.orderData
  }

  loading.value = false
  try {
    const res = await getUserOrderDetail(orderId)
    order.value = res

    if (res.serviceId && !isNaN(Number(res.serviceId))) {
      const serviceRes = await getServiceDetail(Number(res.serviceId))
      serviceDetail.value = serviceRes
    }
  } catch (error: any) {
    console.error('获取订单详情失败:', error)
    ElMessage.error(error.message || '获取订单详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (orderId) {
    fetchOrderDetail()
  }
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

const getStatusDesc = (status: number) => {
  const map: Record<number, string> = {
    1: '请在15分钟内完成支付，超时将自动取消',
    2: '等待陪诊师接单，请保持电话畅通',
    3: '陪诊师正在为您服务中',
    4: '服务已完成，期待您的下次光临',
    5: '正在处理退款/售后申请',
  }
  return map[status] || ''
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

const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  })
}

const navigateToCompanion = (id: number) => {
  router.push(`/companion/${id}`)
}

const navigateToService = (id: number) => {
  router.push({
    path: `/service/${id}`,
    query: { from: 'order-detail' },
  })
}

const handlePay = () => {
  if (document.activeElement instanceof HTMLElement) {
    const el = document.activeElement
    setTimeout(() => {
      el.blur()
    }, 100)
  }
  // Mock pay action or navigate to pay page
  ElMessage.info('跳转支付页面...')
}

const handleCancel = () => {
  if (document.activeElement instanceof HTMLElement) {
    const el = document.activeElement
    setTimeout(() => {
      el.blur()
    }, 100)
  }
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await cancelUserOrder(orderId)
      ElMessage.success('订单已取消')
      fetchOrderDetail()
    } catch (error) {
      // Error handled by request interceptor usually
    }
  })
}

const handleConfirm = () => {
  if (document.activeElement instanceof HTMLElement) {
    const el = document.activeElement
    setTimeout(() => {
      el.blur()
    }, 100)
  }
  ElMessageBox.confirm('确认服务已完成吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success',
  }).then(async () => {
    try {
      await confirmUserOrder(orderId)
      ElMessage.success('订单已完成')
      fetchOrderDetail()
    } catch (error) {}
  })
}

const handleContact = (event?: MouseEvent) => {
  if (event && event.target instanceof HTMLElement) {
    const target = event.target
    // Remove focus to prevent "stuck" style
    setTimeout(() => {
      target.blur()
    }, 100)
  }
  router.push('/messages')
}

const handleSubmitEvaluation = async () => {
  if (!evaluationForm.value.content.trim()) {
    ElMessage.warning('请输入评价内容')
    return
  }

  try {
    await ElMessageBox.confirm('确定要提交评价吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    submitLoading.value = true
    // Mock API call simulation
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update local order data to reflect evaluation
    if (order.value) {
      order.value.clientComment = {
        score: evaluationForm.value.score,
        content: evaluationForm.value.content,
        time: new Date().toLocaleString(),
      }
    }

    ElMessageBox.alert('评价提交成功', '提示', {
      confirmButtonText: '确定',
      callback: () => {
        // No need to fetch from backend since it's a mock
      },
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      ElMessage.error('评价提交失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleRefund = () => {
  if (document.activeElement instanceof HTMLElement) {
    const el = document.activeElement
    setTimeout(() => {
      el.blur()
    }, 100)
  }
  ElMessage.info('售后功能开发中')
}
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

.order-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px; /* Space for bottom bar */
}

.nav-header {
  position: sticky;
  top: 0;
  z-index: 100;
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

.content {
  padding: 15px;
}

.status-card {
  background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
  color: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);

  &.status-pending {
    background: linear-gradient(135deg, #ff9500 0%, #ffc107 100%);
  }
  &.status-wait {
    background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
  }
  &.status-process {
    background: linear-gradient(135deg, #e6a23c 0%, #f3d19e 100%);
  }
  &.status-success {
    background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
  }
  &.status-refund {
    background: linear-gradient(135deg, #909399 0%, #c8c9cc 100%);
  }

  .status-text {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 8px;

    .status-icon {
      margin-right: 8px;
      font-size: 24px;
    }
  }

  .status-desc {
    font-size: 13px;
    opacity: 0.9;
  }
}

.section-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;

  .card-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    border-left: 4px solid #409eff;
    padding-left: 10px;
    line-height: 1;
  }
}

.service-info {
  position: relative;
  display: flex;
  gap: 12px;
  cursor: pointer;
  align-items: flex-start;
  padding-top: 5px;

  .service-img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    background-color: #f5f7fa;
    flex-shrink: 0;
  }

  .info-middle {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 8px;
    overflow: hidden; /* For text overflow */
    padding-right: 60px; /* Space for view-detail */

    .service-name {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .service-intro {
      font-size: 12px;
      color: #909399;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.3;
    }

    .service-meta {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: #909399;
      align-items: center;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .view-detail {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #909399;

    .tip {
      margin-right: 2px;
    }
  }

  .price {
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 18px;
    color: #f56c6c;
    font-weight: bold;
  }
}

:deep(.contact-btn:focus:not(:active)) {
  background-color: #fff;
  color: #606266;
  border-color: #dcdfe6;
}

.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #909399;
      width: 80px;
    }

    .value {
      color: #303133;
      flex: 1;
      text-align: right;

      &.copy-row {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      .copy-btn {
        color: #409eff;
        font-size: 12px;
        margin-left: 8px;
        cursor: pointer;
      }
    }

    .value.is-link {
      cursor: pointer;
      color: #303133;

      &:active {
        opacity: 0.7;
      }
    }
  }
}

.evaluation-view {
  .rate-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .label {
      color: #909399;
      font-size: 14px;
      margin-right: 12px;
    }
  }

  .comment-content {
    font-size: 14px;
    color: #303133;
    line-height: 1.6;
    margin-bottom: 8px;
    white-space: pre-wrap;
  }

  .comment-time {
    font-size: 12px;
    color: #c0c4cc;
    text-align: right;
  }
}

.evaluation-form {
  .form-item {
    margin-bottom: 15px;

    .label {
      display: block;
      color: #303133;
      font-size: 14px;
      margin-bottom: 8px;
    }

    &.rating-item {
      display: flex;
      align-items: center;

      .label {
        display: inline-block;
        margin-bottom: 0;
        margin-right: 12px;
      }
    }
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  background-color: #fff;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  height: 60px;
  padding: 0 16px;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;

  .price-container {
    .label {
      font-size: 14px;
      color: #606266;
    }
    .price {
      font-size: 20px;
      color: #f56c6c;
      font-weight: bold;
      margin-left: 5px;
    }
  }

  .actions {
    display: flex;
    gap: 8px;

    .primary-btn {
      padding: 0 20px;
      height: 36px;
      border-radius: 18px;
    }
  }
}
</style>
