<template>
  <div class="user-profile">
    <!-- 头部区域 -->
    <div class="header-section">
      <!-- 移除右上角设置入口 -->
      <div class="user-card">
        <div class="info-wrapper" @click="handleUserInfoClick">
          <el-avatar :size="64" :src="userStore.userInfo?.avatar || defaultAvatar" class="avatar" />
          <div class="info-content">
            <div class="nickname-row">
              <span class="nickname">{{
                userStore.isLogin ? userStore.userInfo?.nickname : '点击登录/注册'
              }}</span>
              <el-tag
                v-if="userStore.isLogin"
                size="small"
                type="warning"
                effect="dark"
                round
                class="level-tag"
                >VIP会员</el-tag
              >
            </div>
            <div class="phone" v-if="userStore.isLogin">{{ userStore.userInfo?.phone }}</div>
            <div class="desc" v-else>登录后享受更多权益</div>
          </div>
        </div>
        <!-- 设置图标放在原来的箭头位置 -->
        <div class="settings-icon" @click="router.push('/user/settings')" v-if="userStore.isLogin">
          <el-icon :size="24" color="#fff"><Setting /></el-icon>
        </div>
        <el-icon class="arrow-icon" color="#fff" v-else><ArrowRight /></el-icon>
      </div>

      <!-- 余额统计 -->
      <div class="balance-card">
        <div class="balance-info">
          <span class="label">账户余额</span>
          <div class="amount-row">
            <span class="amount">{{ userStore.isLogin ? userStore.userInfo?.balance : '0' }}</span>
          </div>
        </div>
        <el-button class="recharge-btn" @click="handleProtectedNav('/user/recharge')"
          >立即充值</el-button
        >
      </div>
    </div>

    <!-- 订单卡片 -->
    <div class="section-card" style="margin-top: 46px">
      <div class="card-header" @click="handleProtectedNav('/order/list')">
        <span class="title">我的订单</span>
        <div class="more">
          全部订单 <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      <div class="order-grid">
        <div class="grid-item" @click="handleProtectedNav('/order/list?status=2')">
          <div class="icon-wrapper">
            <el-icon :size="28" color="#409eff"><Timer /></el-icon>
            <div class="badge" v-if="userStore.isLogin && pendingServiceCount > 0">
              {{ pendingServiceCount }}
            </div>
          </div>
          <span class="label">待服务</span>
        </div>
        <div class="grid-item" @click="handleProtectedNav('/order/list?status=3')">
          <div class="icon-wrapper">
            <el-icon :size="28" color="#e6a23c"><Compass /></el-icon>
          </div>
          <span class="label">服务中</span>
        </div>
        <div class="grid-item" @click="handleProtectedNav('/order/list?status=4')">
          <div class="icon-wrapper">
            <el-icon :size="28" color="#67c23a"><CircleCheck /></el-icon>
          </div>
          <span class="label">已完成</span>
        </div>
        <div class="grid-item" @click="handleProtectedNav('/order/list?status=5')">
          <div class="icon-wrapper">
            <el-icon :size="28" color="#909399"><RefreshLeft /></el-icon>
          </div>
          <span class="label">退款/售后</span>
        </div>
      </div>
    </div>

    <!-- 常用功能菜单 -->
    <div class="section-card menu-list">
      <div class="card-header">
        <span class="title">常用功能</span>
      </div>

      <div class="menu-item" @click="handlePatientManagement">
        <div class="left">
          <el-icon :size="20" color="#409eff"><User /></el-icon>
          <span class="text">就诊人管理</span>
        </div>
        <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
      </div>

      <div class="menu-item" @click="handleFavorites">
        <div class="left">
          <el-icon :size="20" color="#f56c6c"><Star /></el-icon>
          <span class="text">我的收藏</span>
        </div>
        <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
      </div>

      <div class="menu-item" @click="handleWorkbench">
        <div class="left">
          <el-icon :size="20" color="#e6a23c"><Briefcase /></el-icon>
          <span class="text">陪诊师工作台</span>
        </div>
        <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
      </div>

      <div class="menu-item" @click="handleService">
        <div class="left">
          <el-icon :size="20" color="#67c23a"><Headset /></el-icon>
          <span class="text">联系客服</span>
        </div>
        <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
      </div>

      <div class="menu-item" @click="handleProtectedNav('/user/feedback')">
        <div class="left">
          <el-icon :size="20" color="#409eff"><Edit /></el-icon>
          <span class="text">意见反馈</span>
        </div>
        <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 退出登录按钮 (已移除) -->
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UserProfile',
})
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Setting,
  ArrowRight,
  Timer,
  Compass,
  CircleCheck,
  RefreshLeft,
  User,
  Star,
  Briefcase,
  Headset,
  Edit,
} from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 待服务订单数量（从订单数据中计算或 API 获取）
const pendingServiceCount = ref(0)

// 统一的登录检查跳转
const handleProtectedNav = (path: string) => {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }
  router.push(path)
}

const handleUserInfoClick = () => {
  if (!userStore.isLogin) {
    router.push('/login')
  }
}

const handleSettingClick = () => {
  handleProtectedNav('/user/settings')
}

const handlePatientManagement = () => {
  handleProtectedNav('/user/patient')
}

const handleFavorites = () => {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }
  router.push('/user/favorites')
}

const handleWorkbench = () => {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }
  router.push('/companion/workbench')
}

const handleService = () => {
  handleProtectedNav('/message/chat/service')
}
</script>

<style lang="scss">
.custom-dialog,
.mobile-dialog {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  .el-dialog__header {
    margin: 0;
    padding: 20px 0 10px;
    text-align: center;
    font-weight: 600;
    font-size: 18px;
    border-bottom: none;
    margin-right: 0;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 10px 24px 24px;
    border-top: none;
  }
}
</style>

<style scoped lang="scss">
.user-profile {
  height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: none;
}

.header-section {
  background: linear-gradient(135deg, #2979ff 0%, #4facfe 100%);
  padding: 40px 20px 80px; /* 增加底部padding以容纳悬浮卡片 */
  position: relative;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;

  .user-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    position: relative;
    z-index: 1;

    .info-wrapper {
      display: flex;
      align-items: center;
      flex: 1;
      cursor: pointer;
    }

    .avatar {
      border: 2px solid rgba(255, 255, 255, 0.5);
    }

    .info-content {
      margin-left: 16px;

      .nickname-row {
        display: flex;
        align-items: center;
        margin-bottom: 6px;

        .nickname {
          font-size: 20px;
          font-weight: 600;
          margin-right: 8px;
        }

        .level-tag {
          border-color: transparent;
          background: rgba(255, 255, 255, 0.2);
          color: #ffd700;
        }
      }

      .phone {
        font-size: 14px;
        opacity: 0.9;
      }

      .desc {
        font-size: 14px;
        opacity: 0.8;
      }
    }

    .settings-icon,
    .arrow-icon {
      padding: 8px;
      cursor: pointer;
    }
  }

  .balance-card {
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: -30px; /* 悬浮效果 */
    background: #fff;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 2;

    .balance-info {
      display: flex;
      align-items: center;

      .label {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-right: 16px;
      }

      .amount-row {
        color: #333;
        display: flex;
        align-items: baseline;

        .amount {
          font-size: 24px;
          font-weight: bold;
        }
      }
    }

    .recharge-btn {
      background: #409eff;
      color: #fff;
      border: none;
      padding: 8px 20px;
      font-weight: 500;
      border-radius: 20px;

      &:active {
        background: #337ecc;
      }
    }
  }
}

.section-card {
  margin: 16px 16px 0;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  &.menu-list {
    margin-top: 16px;
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f5f7fa;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .more {
      font-size: 13px;
      color: #999;
      display: flex;
      align-items: center;

      .el-icon {
        margin-left: 2px;
      }
    }
  }

  .order-grid {
    display: flex;
    padding: 20px 0;

    .grid-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;

      .icon-wrapper {
        position: relative;
        margin-bottom: 8px;

        .badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #f56c6c;
          color: #fff;
          font-size: 10px;
          height: 16px;
          min-width: 16px;
          line-height: 16px;
          text-align: center;
          border-radius: 8px;
          padding: 0 4px;
          border: 1px solid #fff;
        }
      }

      .label {
        font-size: 13px;
        color: #666;
      }
    }
  }

  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:active {
      background-color: #f9f9f9;
    }

    &:not(:last-child) {
      border-bottom: 1px solid #f9f9f9;
    }

    .left {
      display: flex;
      align-items: center;

      .text {
        margin-left: 12px;
        font-size: 15px;
        color: #333;
      }
    }
  }
}

.logout-section {
  margin: 30px 16px;

  .logout-btn {
    width: 100%;
    height: 44px;
    border-radius: 22px;
    font-size: 16px;
  }
}

.avatar-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;

  .avatar-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }
}

.dialog-content {
  padding: 10px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;

    .avatar-wrapper {
      position: relative;
      margin-bottom: 12px;
      cursor: pointer;

      .edit-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        background: #409eff;
        color: #fff;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }

    .tip {
      font-size: 13px;
      color: #909399;
    }
  }

  .edit-form {
    width: 100%;

    .nickname-item {
      margin-bottom: 0;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      width: 100%;
      background-color: #f5f7fa;
      border-radius: 8px;
      padding: 0 16px;
      height: 56px;
      box-sizing: border-box;
      border: 1px solid #ebedf0;
      transition: border-color 0.3s;

      &:focus-within {
        border-color: #409eff;
        background-color: #fff;
      }

      .label-text {
        font-size: 16px;
        color: #333;
        width: 60px;
        font-weight: 500;
        margin-right: 24px;
        flex-shrink: 0;
        text-align: left;
      }

      .custom-input {
        flex: 1;
        height: 100%;

        :deep(.el-input__wrapper) {
          box-shadow: none !important;
          background-color: transparent;
          padding: 0;
          height: 100%;
        }

        :deep(.el-input__inner) {
          height: 100%;
          font-size: 16px;
          text-align: left;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  gap: 12px;

  .cancel-btn,
  .confirm-btn {
    flex: 1;
    height: 40px;
    font-size: 15px;
  }

  .cancel-btn {
    background-color: #f5f7fa;
    border: none;
    color: #606266;
  }
}
</style>
