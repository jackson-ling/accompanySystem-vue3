<template>
  <div class="recharge-page">
    <div class="header">
      <div class="back-icon" @click="router.back()">
        <el-icon :size="24" color="#333"><ArrowLeft /></el-icon>
      </div>
      <div class="title">充值中心</div>
      <div class="header-right">
        <el-dropdown
          trigger="click"
          @command="handleCommand"
          popper-class="recharge-dropdown-popper"
          placement="bottom-end"
          :teleported="false"
        >
          <div class="more-btn">
            <el-icon :size="20"><MoreFilled /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="recharge">充值记录</el-dropdown-item>
              <el-dropdown-item command="consumption" divided>消费记录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="content">
      <div class="balance-card">
        <div class="label">当前余额 (元)</div>
        <div class="amount">{{ userStore.userInfo?.balance || '0.00' }}</div>
      </div>

      <div class="recharge-section">
        <div class="section-title">充值金额</div>
        <div class="amount-grid">
          <div
            v-for="item in amounts"
            :key="item"
            class="amount-item"
            :class="{ active: selectedAmount === item && !isCustomAmount }"
            @click="selectAmount(item)"
          >
            <span class="value">{{ item }}</span>
          </div>
          <div class="amount-item custom" :class="{ active: isCustomAmount }" @click="selectCustom">
            <div v-if="isCustomAmount" class="custom-input-wrapper">
              <input
                v-model="customAmount"
                class="custom-input"
                type="number"
                placeholder="输入金额"
                ref="customInputRef"
                @input="handleCustomAmountInput"
              />
            </div>
            <span v-else>其他金额</span>
          </div>
        </div>
      </div>

      <div class="pay-method">
        <div class="section-title">支付方式</div>
        <div class="method-item">
          <div class="left">
            <el-icon :size="24" color="#09bb07"><ChatDotRound /></el-icon>
            <span class="text">微信支付</span>
          </div>
          <el-radio v-model="payMethod" label="wechat"> </el-radio>
        </div>
      </div>

      <div class="btn-container">
        <el-button type="primary" round class="submit-btn" size="large" @click="handleRecharge"
          >立即充值</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowLeft, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
import { createRecharge } from '@/api/recharge'

const router = useRouter()
const userStore = useUserStore()

const amounts = [50, 100, 200, 500, 1000]
const selectedAmount = ref(100)
const customAmount = ref('')
const isCustomAmount = ref(false)
const payMethod = ref('wechat')
const customInputRef = ref()

const selectAmount = (amount: number) => {
  selectedAmount.value = amount
  isCustomAmount.value = false
  customAmount.value = ''
}

const selectCustom = () => {
  isCustomAmount.value = true
  nextTick(() => {
    customInputRef.value?.focus()
  })
}

const handleCustomAmountInput = () => {
  if (Number(customAmount.value) > 9999) {
    customAmount.value = '9999'
    ElMessage.warning('单次充值金额不能超过9999元')
  }
}

const handleCommand = (command: string) => {
  if (command === 'recharge') {
    router.push('/user/recharge-record')
  } else if (command === 'consumption') {
    router.push('/user/consumption-record')
  }
}

const handleRecharge = async () => {
  const amount = isCustomAmount.value ? Number(customAmount.value) : selectedAmount.value

  if (!amount || amount <= 0) {
    ElMessage.warning('请输入有效的充值金额')
    return
  }

  // 开启全屏Loading
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '充值中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    // 尝试调用 API
    await createRecharge({ amount, method: payMethod.value })

    ElMessage.success(`成功充值 ${amount} 元`)
    // 更新余额
    if (userStore.userInfo) {
      const current = Number(userStore.userInfo.balance) || 0
      userStore.userInfo.balance = parseFloat((current + amount).toFixed(2))
    }
    loadingInstance.close()
    router.back()
  } catch (error) {
    loadingInstance.close()
    console.error('充值失败:', error)
    ElMessage.error('充值失败，请稍后重试')
  }
}
</script>

<style scoped lang="scss">
.recharge-page {
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

  .back-icon {
    width: 24px;
    display: flex;
    align-items: center;
    z-index: 1;
  }

  .header-right {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #666;
    z-index: 1;
    margin-right: -16px; /* Extend to right edge */
    height: 100%;

    .more-btn {
      padding: 0 16px; /* Visual spacing */
      height: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .record-btn {
      font-size: 14px;
      color: #333;
      cursor: pointer;
      padding: 4px 8px;
    }
  }
}

.content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.balance-card {
  background: linear-gradient(135deg, #2979ff 0%, #4facfe 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(41, 121, 255, 0.3);

  .label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  .amount {
    font-size: 32px;
    font-weight: bold;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  .amount-item {
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    height: 60px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    gap: 2px;

    .symbol {
      font-size: 14px;
    }

    .value {
      font-size: 20px;
      font-weight: 600;
    }

    &.active {
      background-color: #ecf5ff;
      border-color: #409eff;
      color: #409eff;
    }

    &.custom {
      font-size: 14px;
    }

    .custom-input-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      .symbol {
        margin-left: 4px;
        font-size: 14px;
      }

      .custom-input {
        border: none;
        outline: none;
        background: transparent;
        width: 80px;
        font-size: 20px;
        color: #409eff;
        text-align: center;
        font-weight: 600;

        &::placeholder {
          color: #a8abb2;
          font-size: 14px;
          text-align: center;
          font-weight: normal;
        }
      }
    }
  }
}

.pay-method {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 40px;

  .section-title {
    margin-bottom: 12px;
  }

  .method-item {
    background-color: #fff;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #e4e7ed;

    .left {
      display: flex;
      align-items: center;
      gap: 8px;

      .text {
        font-size: 16px;
        color: #333;
      }
    }

    :deep(.el-radio__label) {
      display: none;
    }

    :deep(.el-radio) {
      margin-right: 0;
      height: auto;
    }
  }
}

.btn-container {
  margin-top: auto;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));

  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
  }
}
</style>

<style lang="scss">
.recharge-dropdown-popper {
    width: 120px;
    border-radius: 8px !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
    /* Remove manual inset/margin overrides to let Popper position it, but adjust offset if needed */
    
    .el-popper__arrow {
      display: block !important; /* Show arrow */
      &::before {
        border-color: #fff !important; /* White border */
        background-color: #fff !important; /* White background */
      }
    }

    .el-dropdown-menu {
      padding: 0 !important;
      border-radius: 8px;
      overflow: hidden;
      background-color: #fff;
      margin-top: 0;
    }

    .el-dropdown-menu__item {
      height: 48px;
      line-height: 48px;
      padding: 0 !important;
      justify-content: center;
      font-size: 14px;
      color: #333;
      text-align: center;
      background-color: #fff !important;

      &:hover,
      &:active,
      &:focus {
        background-color: #fff !important;
        color: #333 !important;
      }

      &.el-dropdown-menu__item--divided {
        margin-top: 0;
        border-top: 1px solid #f0f2f5;

        &::before {
          display: none !important;
        }
      }
    }
  }
</style>
