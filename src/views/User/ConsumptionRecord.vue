<template>
  <div class="consumption-record">
    <div class="header">
      <div class="back-icon" @click="router.back()">
        <el-icon :size="24" color="#333"><ArrowLeft /></el-icon>
      </div>
      <div class="title">消费记录</div>
      <div class="placeholder"></div>
    </div>
    <div class="content">
      <div v-if="records.length > 0" class="record-list">
        <div v-for="item in records" :key="item.id" class="record-item">
          <div class="item-left">
            <div class="type">{{ item.type }}</div>
            <div class="time">{{ item.time }}</div>
          </div>
          <div class="item-right">
            <div class="amount">{{ formatAmount(item.amount) }}</div>
            <div class="balance">余额 {{ item.balance.toFixed(2) }}</div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无消费记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getConsumptionRecords } from '@/api/wallet'
import type { ConsumptionRecord } from '@/types/api'

const router = useRouter()
const records = ref<ConsumptionRecord[]>([])
const loading = ref(false)

// 格式化金额显示
const formatAmount = (amount: number) => {
  // 如果已经是负数，直接显示；否则添加负号
  const absAmount = Math.abs(amount)
  const prefix = amount < 0 ? '' : '-'
  return `${prefix}${absAmount.toFixed(2)}`
}

// 获取消费记录
async function fetchRecords() {
  loading.value = true
  try {
    const res = await getConsumptionRecords()
    records.value = res.list || res || []
  } catch (error) {
    console.error('获取消费记录失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped lang="scss">
.consumption-record {
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
      color: #333;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .balance {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
