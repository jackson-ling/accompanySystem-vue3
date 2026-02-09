<template>
  <div class="settings-page">
    <div class="header">
      <div class="back-icon" @click="router.back()">
        <el-icon :size="24" color="#333"><ArrowLeft /></el-icon>
      </div>
      <div class="title">设置</div>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="menu-group">
        <div class="menu-item" @click="handleChangeAvatar">
          <div class="left">修改头像</div>
          <div class="right">
            <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
            <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
          </div>
        </div>
        <!-- 隐藏的文件上传输入框 -->
        <input
          type="file"
          ref="fileInputRef"
          accept="image/*"
          style="display: none"
          @change="handleFileChange"
        />
        <div class="menu-item" @click="handleChangeNickname">
          <div class="left">修改昵称</div>
          <div class="right">
            <span class="value">{{ userStore.userInfo?.nickname }}</span>
            <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="menu-item" @click="handleChangePassword">
          <div class="left">修改密码</div>
          <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="menu-group">
        <div class="menu-item" @click="handleAbout">
          <div class="left">关于我们</div>
          <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="menu-group">
        <div class="menu-item center-text" @click="handleLogout">退出登录</div>
      </div>

      <div class="menu-group">
        <div class="menu-item center-text danger-text" @click="handleDeleteAccount">注销账号</div>
      </div>
    </div>

    <!-- 昵称修改弹窗 -->
    <el-dialog
      v-model="showNicknameDialog"
      title="修改昵称"
      width="80%"
      class="custom-dialog"
      align-center
      destroy-on-close
    >
      <div class="dialog-content">
        <el-input v-model="newNickname" placeholder="请输入新的昵称" clearable size="large" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNicknameDialog = false" round>取消</el-button>
          <el-button type="primary" @click="submitNicknameChange" round> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const showNicknameDialog = ref(false)
const newNickname = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const handleChangePassword = () => {
  router.push('/user/change-password')
}

const handleChangeNickname = () => {
  newNickname.value = userStore.userInfo?.nickname || ''
  showNicknameDialog.value = true
}

const submitNicknameChange = () => {
  if (!newNickname.value.trim()) {
    ElMessage.warning('昵称不能为空')
    return
  }

  if (userStore.userInfo) {
    userStore.userInfo.nickname = newNickname.value
    ElMessage.success(`昵称已修改为: ${newNickname.value}`)
    showNicknameDialog.value = false
  }
}

const handleChangeAvatar = () => {
  // 触发文件选择
  // 无论是 PC 端还是移动端，input type="file" 都能提供原生的文件选择体验
  // PC 端弹出文件资源管理器，移动端弹出"拍照/相册"选项
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    // 简单的文件类型检查
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择图片文件')
      return
    }

    // 简单的文件大小检查 (例如 2MB)
    if (file.size > 2 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过 2MB')
      return
    }

    // 使用 FileReader 读取文件并预览
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result && userStore.userInfo) {
        // 模拟上传成功，直接设置 base64 数据
        userStore.userInfo.avatar = e.target.result as string
        ElMessage.success('头像已更新')
      }
    }
    reader.readAsDataURL(file)
  }

  // 清空 input，以便下次可以选择同一文件
  input.value = ''
}

const handleAbout = () => {
  ElMessage.info('当前版本 v1.0.0')
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push({ path: '/login', query: { from: 'logout' } })
    })
    .catch(() => {})
}

const handleDeleteAccount = () => {
  ElMessageBox.confirm('注销账号后无法恢复，确定要继续吗？', '警告', {
    confirmButtonText: '确定注销',
    cancelButtonText: '取消',
    type: 'error',
  })
    .then(() => {
      // 模拟注销
      setTimeout(() => {
        userStore.logout()
        ElMessage.success('账号已注销')
        router.push('/profile')
      }, 1000)
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.settings-page {
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
  }

  .back-icon,
  .placeholder {
    width: 24px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}

.content {
  padding: 12px;
}

.menu-group {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #f5f7fa;
    font-size: 15px;
    color: #333;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: #f9f9f9;
    }

    .right {
      display: flex;
      align-items: center;
      gap: 4px;

      .value {
        color: #909399;
        font-size: 14px;
      }
    }

    &.center-text {
      justify-content: center;
      font-weight: 500;
    }

    &.danger-text {
      color: #f56c6c;
    }
  }
}
</style>

<style lang="scss">
/* 全局样式修改 Dialog */
.custom-dialog {
  border-radius: 16px !important; // 圆角方框
  max-width: 320px; // 适当比例大小，适配移动端

  .el-dialog__header {
    margin-right: 0;
    text-align: center;
    padding: 20px 20px 10px;

    .el-dialog__title {
      font-weight: 600;
    }
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px;
    text-align: center;

    .dialog-footer {
      display: flex;
      justify-content: space-between;
      gap: 12px;

      button {
        flex: 1;
        margin: 0;
      }
    }
  }
}
</style>
