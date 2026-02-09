<template>
  <div class="recharge-record">
    <div class="header">
      <div class="back-icon" @click="router.back()">
        <el-icon :size="24" color="#333"><ArrowLeft /></el-icon>
      </div>
      <div class="title">充值记录</div>
      <div class="placeholder"></div>
    </div>
    <div class="content">
      <div v-if="records.length > 0" class="record-list">
        <div v-for="item in records" :key="item.id" class="record-item">
          <div class="item-left">
            <div class="type">充值-{{ item.method === 'wechat' ? '微信支付' : '其他' }}</div>
            <div class="time">{{ item.time }}</div>
          </div>
          <div class="item-right">
            <div class="amount">+{{ item.amount.toFixed(2) }}</div>
            <div class="status" :class="item.status">{{ getStatusText(item.status) }}</div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无充值记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getRechargeRecords } from '@/api/recharge'

interface RechargeRecord {
  id: number
  amount: number
  method: string
  time: string
  status: string
}

const router = useRouter()
const records = ref<RechargeRecord[]>([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRechargeRecords()
    // 兼容不同的返回格式
    if (Array.isArray(res)) {
      records.value = res
    } else {
      // @ts-ignore
      records.value = res.data || []
    }
  } catch (error) {
    console.error('获取充值记录失败:', error)
    records.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    success: '充值成功',
    pending: '处理中',
    failed: '充值失败',
  }
  return map[status] || status
}
</script>

<style scoped lang="scss">
.recharge-record {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #eee;

  .title {
    font-size: 17px;
    font-weight: 500;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .back-icon,
  .placeholder {
    width: 24px;
    display: flex;
    align-items: center;
  }
}

.content {
  flex: 1;
  padding: 16px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .item-left {
    .type {
      font-size: 16px;
      color: #333;
      margin-bottom: 6px;
      font-weight: 500;
    }
    .time {
      font-size: 12px;
      color: #999;
    }
  }

  .item-right {
    text-align: right;

    .amount {
      font-size: 18px;
      color: #f56c6c;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .status {
      font-size: 12px;

      &.success {
        color: #67c23a;
      }
      &.pending {
        color: #e6a23c;
      }
      &.failed {
        color: #f56c6c;
      }
    }
  }
}
</style>
