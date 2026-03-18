<template>
  <div class="login-page">
    <div class="header">
      <div class="back-icon" @click="handleBack">
        <el-icon :size="24" color="#333"><ArrowLeft /></el-icon>
      </div>
      <div class="logo">
        <el-icon :size="48" color="#409eff"><FirstAidKit /></el-icon>
      </div>
      <div class="title">陪诊服务平台</div>
    </div>

    <div class="form-container">
      <!-- 统一标题区域 -->
      <div class="page-header">
        <div v-if="mode === 'login' || mode === 'register'" class="auth-tabs">
          <div class="tab-item" :class="{ active: mode === 'login' }" @click="mode = 'login'">
            登录
          </div>
          <div class="tab-item" :class="{ active: mode === 'register' }" @click="mode = 'register'">
            注册
          </div>
        </div>
        <div v-else class="page-title">重置密码</div>
      </div>

      <!-- 登录表单 -->
      <div class="form-content" v-if="mode === 'login'">
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
          <el-form-item prop="phone">
            <div class="input-wrapper">
              <span class="label-text">手机号码</span>
              <el-input v-model="loginForm.phone" placeholder="请输入手机号" class="custom-input" />
            </div>
          </el-form-item>
          <el-form-item prop="password">
            <div class="input-wrapper">
              <span class="label-text">密码</span>
              <el-input
                v-model="loginForm.password"
                placeholder="请输入密码"
                type="password"
                show-password
                class="custom-input"
              />
              <span class="forgot-pwd" @click.stop="mode = 'reset'">忘记密码?</span>
            </div>
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" class="submit-btn" size="large" @click="handleLogin" round
              >登录</el-button
            >
          </div>
        </el-form>
      </div>

      <!-- 注册表单 -->
      <div class="form-content" v-else-if="mode === 'register'">
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef">
          <el-form-item prop="phone">
            <div class="input-wrapper">
              <span class="label-text">手机号码</span>
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号"
                class="custom-input"
              />
            </div>
          </el-form-item>
          <el-form-item prop="password">
            <div class="input-wrapper">
              <span class="label-text">设置密码</span>
              <el-input
                v-model="registerForm.password"
                placeholder="请输入密码"
                type="password"
                show-password
                class="custom-input"
              />
            </div>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <div class="input-wrapper">
              <span class="label-text">确认密码</span>
              <el-input
                v-model="registerForm.confirmPassword"
                placeholder="请再次输入密码"
                type="password"
                show-password
                class="custom-input"
              />
            </div>
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" class="submit-btn" size="large" @click="handleRegister" round
              >注册</el-button
            >
          </div>
          <div class="extra-links">
            <span @click="mode = 'login'">已有账号？去登录</span>
          </div>
        </el-form>
      </div>

      <!-- 重置密码表单 -->
      <div class="form-content" v-else>
        <el-form :model="resetForm" :rules="resetRules" ref="resetFormRef">
          <el-form-item prop="phone">
            <div class="input-wrapper">
              <span class="label-text">手机号码</span>
              <el-input
                v-model="resetForm.phone"
                placeholder="请输入注册手机号"
                class="custom-input"
              />
            </div>
          </el-form-item>
          <el-form-item prop="password">
            <div class="input-wrapper">
              <span class="label-text">新密码</span>
              <el-input
                v-model="resetForm.password"
                placeholder="设置新密码 (6-20位)"
                type="password"
                show-password
                class="custom-input"
              />
            </div>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <div class="input-wrapper">
              <span class="label-text">确认密码</span>
              <el-input
                v-model="resetForm.confirmPassword"
                placeholder="请再次输入新密码"
                type="password"
                show-password
                class="custom-input"
              />
            </div>
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" class="submit-btn" size="large" @click="handleReset" round
              >确认修改</el-button
            >
            <el-button class="submit-btn cancel-btn" size="large" @click="mode = 'login'" round
              >返回登录</el-button
            >
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Iphone, Lock, FirstAidKit, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { login as loginApi, register as registerApi, resetPassword as resetPasswordApi } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const handleBack = () => {
  if (route.query.from === 'logout') {
    router.push('/profile')
  } else if (route.query.from === 'guard') {
    router.push('/user/profile')
  } else {
    router.back()
  }
}

const mode = ref<'login' | 'register' | 'reset'>('login')
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()

const loginForm = reactive({
  phone: '',
  password: '',
})

const registerForm = reactive({
  phone: '',
  password: '',
  confirmPassword: '',
})

const resetForm = reactive({
  phone: '',
  password: '',
  confirmPassword: '',
})

const validateResetConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const validateRegisterConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const commonRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

const loginRules: FormRules = {
  ...commonRules,
}

const registerRules: FormRules = {
  ...commonRules,
  confirmPassword: [{ validator: validateRegisterConfirmPassword, trigger: 'blur' }],
}

const resetRules: FormRules = {
  ...commonRules,
  confirmPassword: [{ validator: validateResetConfirmPassword, trigger: 'blur' }],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    await loginFormRef.value.validate()
    // 调用登录 API
    await userStore.login(loginForm.phone, loginForm.password)
    ElMessage.success('登录成功')
    // 跳转到来源页面或默认页面
    const redirect = route.query.redirect as string
    router.push(redirect || '/profile')
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  try {
    await registerFormRef.value.validate()
    // 调用注册 API
    await registerApi({
      phone: registerForm.phone,
      password: registerForm.password,
    })
    ElMessage.success('注册成功，请登录')
    mode.value = 'login'
    loginForm.phone = registerForm.phone
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  }
}

const handleReset = async () => {
  if (!resetFormRef.value) return

  // 再次校验两次密码是否一致
  if (resetForm.password !== resetForm.confirmPassword) {
    ElMessage.error('两次输入密码不一致!')
    return
  }

  try {
    await resetFormRef.value.validate()
    // 调用重置密码 API
    await resetPasswordApi({
      phone: resetForm.phone,
      password: resetForm.password,
    })
    ElMessage.success('密码修改成功，请登录')
    mode.value = 'login'
    loginForm.phone = resetForm.phone
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  }
}

</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background-color: #fff;
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

.center-link {
  text-align: center;
  margin-top: 15px;
  justify-content: center !important;
}

.header {
  display: flex;
  flex-direction: column;
}

.header {
  margin-top: 20px;
  margin-bottom: 40px;
  position: relative;
  text-align: center;

  .back-icon {
    position: absolute;
    left: 0;
    top: 0;
    cursor: pointer;
    padding: 8px;
    margin-left: -8px;
  }

  .logo {
    margin-bottom: 16px;
  }

  .title {
    font-size: 28px;
    font-weight: bold;
    color: #333;
  }
}

.form-container {
  flex: 1;

  .page-header {
    margin-bottom: 30px;

    .auth-tabs {
      display: flex;

      .tab-item {
        font-size: 20px;
        color: #999;
        margin-right: 32px;
        padding-bottom: 8px;
        cursor: pointer;
        transition: color 0.3s;
        position: relative;
        font-weight: 600; /* 始终保持加粗，防止切换抖动 */

        &.active {
          color: #333;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: #409eff;
            border-radius: 2px;
          }
        }
      }
    }

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }

  .form-actions {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin: 0;

      &.cancel-btn {
        margin-top: 0;
        background-color: #f5f7fa;
        border-color: #f5f7fa;
        color: #909399;

        &:active {
          background-color: #e6e8eb;
        }
      }
    }
  }

  .extra-links {
    margin-top: 16px;
    text-align: right;

    span {
      font-size: 14px;
      color: #666;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }
  }
}

.footer-agreement {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 20px;

  .link {
    color: #409eff;
    cursor: pointer;
  }
}

/* Custom Input Styles */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
  background-color: transparent;
  padding: 0;
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
    width: 80px;
    font-weight: 500;
    margin-right: 12px;
    flex-shrink: 0;
    text-align: left;
  }

  .custom-input {
    flex: 1;
    height: 100%;

    :deep(.el-input__inner) {
      height: 100%;
      font-size: 16px;
      text-align: left;
    }
  }
}

.forgot-pwd {
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
  white-space: nowrap;
  margin-left: 8px;
  user-select: none;
}
</style>
