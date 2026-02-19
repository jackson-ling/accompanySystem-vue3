<template>
  <div class="workbench-page">
    <!-- Header -->
    <div class="header">
      <div class="left" @click="router.back()">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </div>
      <div class="title">陪诊师工作台</div>
    </div>

    <!-- Status Card -->
    <div class="status-card">
      <div class="card-content">
        <div class="avatar-box" @click="router.push('/companion/profile-edit')">
          <el-avatar :size="60" :src="getUserAvatar(userStore.userInfo?.avatar)" />
          <div class="edit-badge">
            <el-icon :size="12" color="#fff"><Edit /></el-icon>
          </div>
        </div>
        <div class="info-box" @click="router.push('/companion/profile-edit')">
          <div class="name-row">
            <span class="name">{{ userStore.userInfo?.nickname || '陪诊师' }}</span>
            <div class="status-indicator" :class="{ online: isOnline }" @click.stop="toggleStatus">
              <span class="dot"></span>
              {{ isOnline ? '接单中' : '休息中' }}
            </div>
          </div>
          <div class="detail-row">
            <span class="info-text">{{ userStore.userInfo?.phone || '未设置手机号' }}</span>
            <span class="divider">|</span>
            <span class="info-text">{{ companionProfile?.experience || '未知' }}</span>
          </div>
          <div class="edit-hint-row">
            <span>点击修改个人信息</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="toggle-box">
          <el-switch
            v-model="isOnline"
            inline-prompt
            active-text="开工"
            inactive-text="收工"
            size="large"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          />
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="value">{{ statistics.todayIncome.toFixed(2) }}</div>
        <div class="label">今日收入</div>
      </div>
      <div class="stat-item">
        <div class="value">{{ statistics.todayOrders }}</div>
        <div class="label">今日订单</div>
      </div>
      <div class="stat-item">
        <div class="value">{{ statistics.rating.toFixed(1) }}</div>
        <div class="label">服务评分</div>
      </div>
      <div class="stat-item">
        <div class="value">{{ statistics.followers }}</div>
        <div class="label">被关注数</div>
      </div>
      <div class="stat-item">
        <div class="value">{{ statistics.totalOrders }}</div>
        <div class="label">累计接单</div>
      </div>
      <div class="stat-item">
        <div class="value">{{ statistics.workDays }}<span>天</span></div>
        <div class="label">工作时长</div>
      </div>
    </div>

    <!-- Menu Grid -->
    <div class="menu-grid">
      <div class="menu-item" @click="router.push('/companion/income-details')">
        <div class="icon-box green">
          <el-icon :size="24" color="#67c23a"><Money /></el-icon>
        </div>
        <div class="label">收入明细</div>
      </div>
      <div class="menu-item" @click="router.push('/companion/order-hall')">
        <div class="icon-box blue">
          <el-icon :size="24" color="#409eff"><List /></el-icon>
        </div>
        <div class="label">抢单大厅</div>
      </div>
      <div class="menu-item" @click="router.push('/companion/service-orders')">
        <div class="icon-box orange">
          <el-icon :size="24" color="#e6a23c"><Timer /></el-icon>
        </div>
        <div class="label">全部订单</div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="recent-orders">
      <div class="section-title">
        <span>待处理订单</span>
        <span class="more" @click="router.push('/companion/service-orders')"
          >查看全部 <el-icon><ArrowRight /></el-icon
        ></span>
      </div>

      <template v-if="pendingOrders.length > 0">
        <div class="order-card" v-for="order in pendingOrders" :key="order.id">
          <div class="card-body">
            <div class="info-row">
              <span class="label">服务项目:</span>
              <span class="value">{{ order.serviceName }}</span>
            </div>
            <div class="info-row time-row">
              <span class="label">服务时间:</span>
              <span class="value time-highlight">{{ order.appointmentTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">就诊人:</span>
              <span class="value">{{ order.patientName || '未填写' }}</span>
            </div>
            <div class="info-row">
              <span class="label">联系电话:</span>
              <span class="value">{{ order.phone || '未填写' }}</span>
            </div>
            <div class="info-row">
              <span class="label">服务地点:</span>
              <span class="value"
                >{{ order.hospital }} {{ order.department ? `(${order.department})` : '' }}</span
              >
            </div>
          </div>
          <div class="card-footer">
            <el-button class="action-btn" plain size="small" @click="contactCustomer"
              >联系客户</el-button
            >
            <el-button
              class="action-btn"
              type="danger"
              plain
              size="small"
              @click="handleReject(order)"
              >拒单</el-button
            >
            <el-button
              class="action-btn primary"
              type="primary"
              size="small"
              @click="handleAccept(order)"
              >接单</el-button
            >
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <el-empty description="暂无待处理订单" :image-size="120">
          <template #default>
            <p class="empty-tips">当前没有需要处理的订单，去抢单大厅看看吧~</p>
            <el-button type="primary" round @click="router.push('/companion/order-hall')"
              >去抢单</el-button
            >
          </template>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  ArrowLeft,
  Bell,
  List,
  Money,
  ArrowRight,
  Edit,
  Timer,
  CircleCheckFilled,
} from '@element-plus/icons-vue'
import { getCompanionStatistics, getCompanionOrders, updateCompanionStatus, acceptOrder, rejectOrder, getCompanionProfile } from '@/api/companion'
import type { CompanionStatistics, Order } from '@/types/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCompanionOrderStore } from '@/stores/companionOrder'
import { computed } from 'vue'
import { getUserAvatar } from '@/constants/avatar'

const router = useRouter()
const userStore = useUserStore()
const defaultAvatar = getUserAvatar()
const companionOrderStore = useCompanionOrderStore()

// 陪诊师个人信息
const companionProfile = ref<any>(null)

// 统计数据
const statistics = ref<CompanionStatistics>({
  todayIncome: 0,
  todayOrders: 0,
  rating: 0,
  followers: 0,
  totalOrders: 0,
  workDays: 0,
})

// 待处理订单
const rawPendingOrders = ref<Order[]>([])
const pendingOrders = computed(() => {
  return rawPendingOrders.value.filter((order) => {
    const localStatus = companionOrderStore.getLocalStatus(order.id)
    // 如果本地状态存在且不是待接单(1)，则不显示
    if (localStatus && localStatus !== 1) {
      return false
    }
    return true
  })
})
const isOnline = ref(true)

// 获取统计数据
async function fetchStatistics() {
  try {
    statistics.value = await getCompanionStatistics()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取陪诊师个人信息
async function fetchProfile() {
  try {
    companionProfile.value = await getCompanionProfile()
  } catch (error) {
    console.error('获取陪诊师信息失败:', error)
  }
}

// 获取待处理订单
async function fetchPendingOrders() {
  try {
    const res = await getCompanionOrders({ status: 1, page: 1, size: 5 })
    rawPendingOrders.value = res.list || []
  } catch (error) {
    console.error('获取订单列表失败:', error)
  }
}

// 联系客户
const contactCustomer = () => {
  router.push('/messages')
}

// 拒单处理
const handleReject = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确认拒绝该订单吗？拒单可能会影响您的接单率', '拒单确认', {
      confirmButtonText: '确认拒单',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // 调用 API 拒单
    await rejectOrder(String(order.id))
    ElMessage.success('已拒绝该订单')
    // 从列表中移除
    const index = rawPendingOrders.value.findIndex((o) => o.id === order.id)
    if (index > -1) {
      rawPendingOrders.value.splice(index, 1)
    }
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('拒单失败:', error)
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

// 接单处理
const handleAccept = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确认接下该订单吗？接单后请准时提供服务', '接单确认', {
      confirmButtonText: '确认接单',
      cancelButtonText: '取消',
      type: 'success',
    })
    // 调用 API 接单
    await acceptOrder(String(order.id))
    ElMessage.success('接单成功')
    // 更新本地状态为待服务(2)
    companionOrderStore.updateLocalStatus(order.id, 2)
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('接单失败:', error)
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

// 切换在线状态
async function toggleStatus() {
  try {
    await updateCompanionStatus(!isOnline.value)
    isOnline.value = !isOnline.value
    ElMessage.success(isOnline.value ? '已开始接单' : '已停止接单')
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStatistics()
  fetchPendingOrders()
  fetchProfile()
})
</script>

<style scoped lang="scss">
.workbench-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40px;
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
    font-size: 18px;
    font-weight: 600;
    color: #333;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}

.status-card {
  margin: 16px;
  background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.08);

  .card-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .avatar-box {
      position: relative;
      flex-shrink: 0;

      .edit-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        background: #409eff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff;
      }
    }

    .info-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-top: 4px;
      position: relative;

      .name-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #909399;
          background: #f5f7fa;
          padding: 2px 8px;
          border-radius: 12px;
          transition: all 0.3s;
          white-space: nowrap;

          .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #909399;
          }

          &.online {
            color: #67c23a;
            background: #e1f3d8;

            .dot {
              background: #67c23a;
            }
          }
        }
      }

      .detail-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .info-text {
          font-size: 13px;
          color: #606266;
        }

        .divider {
          font-size: 12px;
          color: #dcdfe6;
        }
      }

      .edit-hint-row {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 11px;
        color: #909399;
        margin-top: 6px;

        .el-icon {
          position: relative;
          top: 1px;
        }
      }
    }

    .toggle-box {
      flex-shrink: 0;
      align-self: center;
    }
  }
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  margin: 12px 16px;
  padding: 20px 0 4px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);

  .stat-item {
    width: 33.33%;
    text-align: center;
    margin-bottom: 16px;
    position: relative;

    .value {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
      font-family:
        DINAlternate-Bold,
        -apple-system,
        Helvetica Neue,
        sans-serif;
    }

    .label {
      font-size: 12px;
      color: #909399;
    }
  }
}

.menu-grid {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 24px;

  .menu-item {
    flex: 1;
    background: #fff;
    padding: 16px;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);

    .icon-box {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.blue {
        background: #ecf5ff;
      }

      &.green {
        background: #f0f9eb;
      }

      &.orange {
        background: #fdf6ec;
      }
    }

    .label {
      font-size: 13px;
      font-weight: 500;
      color: #333;
    }
  }
}

.recent-orders {
  padding: 0 16px;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 4px;

    span {
      font-size: 17px;
      font-weight: 600;
      color: #333;
    }

    .more {
      font-size: 13px;
      color: #909399;
      font-weight: normal;
      display: flex;
      align-items: center;
    }
  }
}

.order-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  .card-body {
    .info-row {
      display: flex;
      margin-bottom: 10px;
      font-size: 14px;
      line-height: 1.5;

      .label {
        color: #909399;
        width: 70px;
        flex-shrink: 0;
      }

      .value {
        color: #333;
        flex: 1;
        font-weight: 500;
      }

      &.time-row {
        .value.time-highlight {
          color: #409eff;
          font-weight: 600;
          font-size: 15px;
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #f5f7fa;

    .action-btn {
      padding: 8px 20px;
      height: 32px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
    }
  }
}

.empty-state {
  background: #fff;
  border-radius: 16px;
  padding: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  :deep(.el-empty__description) {
    margin-top: 10px;
    p {
      font-size: 15px;
      color: #909399;
    }
  }

  .empty-tips {
    font-size: 13px;
    color: #909399;
    margin-bottom: 16px;
  }
}
</style>
