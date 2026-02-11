<template>
  <div class="income-details-page">
    <div class="header">
      <div class="left" @click="router.back()">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </div>
      <div class="title">收入明细</div>
      <div class="right"></div>
    </div>

    <div class="overview-card">
      <div class="total-label">本月总收入 (元)</div>
      <div class="total-amount">{{ totalIncome.toFixed(2) }}</div>
      <div class="stats-row">
        <div class="stat">
          <div class="label">今日收入</div>
          <div class="value">{{ todayIncome.toFixed(2) }}</div>
        </div>
        <div class="stat">
          <div class="label">累计收入</div>
          <div class="value">{{ totalCumulativeIncome.toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <div class="record-list">
      <div class="list-title">近期明细</div>
      <div class="record-item" v-for="record in incomeRecords" :key="record.id">
        <div class="icon-box">
          <el-icon><Money /></el-icon>
        </div>
        <div class="content">
          <div class="top">
            <span class="type">{{ record.serviceName }}</span>
            <span v-if="record.status === 'completed'" class="status completed">已完成</span>
            <span v-else-if="record.status === 'pending'" class="status pending">待结算</span>
            <span v-else class="status cancelled">已取消</span>
          </div>
          <div class="bottom">
            <span class="time">{{ record.time }}</span>
          </div>
        </div>
        <div class="right-column">
          <span class="view-detail" @click="navigateToOrder(record.orderId)">查看详情 ></span>
          <div class="amount">+{{ record.amount.toFixed(2) }}</div>
        </div>
      </div>
      <div v-if="incomeRecords.length === 0" class="empty-state">
        <el-empty description="暂无收入记录" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Money } from '@element-plus/icons-vue'
import { getCompanionIncome } from '@/api/companion'
import { getCompanionStatistics } from '@/api/companion'
import type { IncomeRecord, CompanionStatistics } from '@/types/api'

const router = useRouter()

// 收入记录列表
const incomeRecords = ref<IncomeRecord[]>([])
const statistics = ref<CompanionStatistics | null>(null)
const loading = ref(false)

// 计算总收入
const totalIncome = computed(() => {
  return incomeRecords.value
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0)
})

// 今日收入
const todayIncome = computed(() => {
  return statistics.value?.todayIncome || 0
})

// 累计收入
const totalCumulativeIncome = computed(() => {
  return incomeRecords.value
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0)
})

// 跳转到订单详情
const navigateToOrder = (orderId: string) => {
  // 收入明细中的订单通常是已完成的，传入 status=4
  router.push({
    path: `/companion/service-order/${orderId}`,
    query: { status: '4' },
  })
}

// 获取收入明细
async function fetchIncomeRecords() {
  loading.value = true
  try {
    const res = await getCompanionIncome({ page: 1, size: 50 })
    incomeRecords.value = res.list || []
  } catch (error) {
    console.error('获取收入明细失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取统计数据
async function fetchStatistics() {
  try {
    statistics.value = await getCompanionStatistics()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchIncomeRecords()
  fetchStatistics()
})
</script>

<style scoped lang="scss">
.income-details-page {
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
  color: #333;
  position: sticky;
  top: 0;
  z-index: 100;

  .title {
    font-size: 17px;
    font-weight: 600;
  }
}

.overview-card {
  margin: 16px;
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  color: #fff;
  padding: 24px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);

  .total-label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 12px;
  }

  .total-amount {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 28px;
    font-family: DINAlternate-Bold, 'Helvetica Neue', Helvetica, sans-serif;
  }

  .stats-row {
    display: flex;

    .stat {
      flex: 1;

      .label {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 8px;
      }

      .value {
        font-size: 22px;
        font-weight: 600;
        font-family: DINAlternate-Bold, 'Helvetica Neue', Helvetica, sans-serif;
      }
    }
  }
}

.record-list {
  background: #fff;
  border-radius: 16px;
  margin: 0 16px;
  padding: 20px 16px;

  .list-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    padding-left: 4px;
    border-left: 4px solid #409eff;
    line-height: 1;
  }

  .record-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f5f7fa;

    &:last-child {
      border-bottom: none;
    }

    .icon-box {
      width: 44px;
      height: 44px;
      background: #ecf5ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      margin-right: 14px;
    }

    .content {
      flex: 1;

      .top {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 8px;
        gap: 8px;

        .type {
          font-size: 15px;
          color: #333;
          font-weight: 500;
        }

        .status {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;

          &.completed {
            background-color: #e1f3d8;
            color: #67c23a;
          }

          &.pending {
            background-color: #fdf6ec;
            color: #e6a23c;
          }

          &.cancelled {
            background-color: #f4f4f5;
            color: #909399;
          }
        }
      }

      .bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #909399;
      }
    }

    .right-column {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-left: 12px;
      gap: 4px;

      .view-detail {
        font-size: 12px;
        color: #409eff;
        cursor: pointer;
      }

      .amount {
        font-size: 17px;
        font-weight: 600;
        color: #f56c6c;
        font-family: DINAlternate-Bold, sans-serif;
      }
    }
  }

  .empty-state {
    padding: 40px 0;
  }
}
</style>
