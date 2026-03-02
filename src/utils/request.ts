import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

// 扩展配置类型，支持重试
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  __retryCount?: number
  retry?: number
  retryDelay?: number
}

const service = axios.create({
  baseURL,
  timeout,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      // 使用字符串索引避免类型错误
      config.headers['token'] = token
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 处理文件下载
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return res
    }

    // 处理标准响应格式
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 200 || res.code === 201) {
        return res.data
      }

      // 处理 401 未授权（HTTP 状态码）
      if (res.code === 401) {
        handleUnauthorized()
        return Promise.reject(new Error('登录已过期，请重新登录'))
      }

      // 处理其他错误（400, 500 等）
      const message = res.msg || res.message || '请求失败'
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }

    return res
  },
  (error: AxiosError) => {
    const config = error.config as CustomAxiosRequestConfig

    // 处理 401 未授权
    if (error.response?.status === 401) {
      handleUnauthorized()
      return Promise.reject(error)
    }

    // 重试机制：仅对 5xx 服务器错误或网络错误重试
    if (config && shouldRetry(error)) {
      const retry = config.retry ?? 0
      const retryDelay = config.retryDelay ?? 1000
      config.__retryCount = config.__retryCount ?? 0

      if (config.__retryCount < retry) {
        config.__retryCount += 1
        return new Promise((resolve) => {
          setTimeout(() => resolve(service(config)), retryDelay)
        })
      }
    }

    // 显示错误消息
    const message = (error.response?.data as any)?.msg || error.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 处理 401 未授权
function handleUnauthorized() {
  // 清除 token
  localStorage.removeItem('token')

  // 清除用户信息（如果使用了 store）
  // 这里需要延迟导入避免循环依赖
  import('@/stores/user').then(({ useUserStore }) => {
    const userStore = useUserStore()
    if (userStore.$reset) {
      userStore.$reset()
    } else if (userStore.logout) {
      userStore.logout()
    }
  })

  // 跳转到登录页，记录当前路由用于登录后重定向
  const currentPath = router.currentRoute.value.fullPath
  if (currentPath !== '/login') {
    router.push({
      path: '/login',
      query: { redirect: currentPath },
    })
  }
}

// 判断是否应该重试
function shouldRetry(error: AxiosError): boolean {
  // 网络错误（无响应）
  if (!error.response) {
    return true
  }

  // 5xx 服务器错误
  const status = error.response.status
  return status >= 500 && status < 600
}

export default service
