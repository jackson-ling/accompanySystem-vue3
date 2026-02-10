<template>
  <div class="change-password-page">
    <div class="header">
      <div class="back-icon" @click="router.back()">
        <el-icon :size="24" color="#333"><ArrowLeft /></el-icon>
      </div>
      <div class="title">修改密码</div>
      <div class="placeholder"></div>
    </div>

    <div class="form-container">
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        class="password-form"
      >
        <el-form-item prop="oldPassword">
          <div class="input-wrapper">
            <span class="label-text">旧密码</span>
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
              placeholder="请输入旧密码"
              class="custom-input"
            />
          </div>
        </el-form-item>

        <el-form-item prop="newPassword">
          <div class="input-wrapper">
            <span class="label-text">新密码</span>
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              placeholder="请输入新密码"
              class="custom-input"
            />
          </div>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <div class="input-wrapper">
            <span class="label-text">确认密码</span>
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码"
              class="custom-input"
            />
          </div>
        </el-form-item>

        <div class="form-actions">
          <el-button
            type="primary"
            round
            class="submit-btn"
            size="large"
            @click="submitPasswordChange"
            :loading="loading"
            ref="submitBtnRef"
            >确认修改</el-button
          >
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const router = useRouter()
const passwordFormRef = ref<FormInstance>()
const loading = ref(false)
const submitBtnRef = ref()

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
}

const submitPasswordChange = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟请求
      setTimeout(() => {
        loading.value = false
        ElMessage.success('密码修改成功')
        router.back()
      }, 1000)
    }
  })
}
</script>

<style scoped lang="scss">
.change-password-page {
  min-height: 100vh;
  background-color: #fff;
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

.form-container {
  padding: 30px 20px;
  flex: 1;
}

/* 复用 Login.vue 的样式 */
.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #fff; /* 背景改为白色 */
  border-radius: 8px; /* 圆角 */
  padding: 0 16px;
  height: 56px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6; /* 适当颜色的边框线 */
  transition:
    border-color 0.3s,
    background-color 0.3s;

  &:focus-within {
    border-color: #409eff;
    background-color: #fff;
  }

  .label-text {
    font-size: 16px;
    color: #333;
    width: 80px;
    font-weight: 500;
    margin-right: 12px;
    flex-shrink: 0;
    text-align: left;
  }

  .custom-input {
    flex: 1;
    height: 100%;

    :deep(.el-input__wrapper) {
      box-shadow: none !important; // 去除 Element Plus 默认边框
      background-color: transparent;
      padding: 0;
      height: 100%;
    }

    :deep(.el-input__inner) {
      height: 100%;
      font-size: 16px;
      text-align: left;
      color: #333;
    }
  }
}

.form-actions {
  margin-top: 40px;
  padding: 0 20px;

  .submit-btn {
      width: 100%;
      font-size: 16px;
      height: 44px;
      border-radius: 22px;

      /* 覆盖 Element Plus 默认的 hover/focus 样式，防止点击后颜色变浅（粘滞效果） */
      &:hover,
      &:focus {
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        color: var(--el-color-white);
      }

      /* 显式定义点击（按下）时的样式，确保有操作反馈 */
      &:active {
        background-color: var(--el-color-primary-dark-2);
        border-color: var(--el-color-primary-dark-2);
        color: var(--el-color-white);
      }
    }
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}
</style>
