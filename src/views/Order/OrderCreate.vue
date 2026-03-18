<template>
  <div class="order-create-page">
    <div class="header-nav">
      <el-icon @click="router.back()" class="back-icon"><ArrowLeft /></el-icon>
      <span>填写订单</span>
      <div style="width: 24px"></div>
    </div>
    <div class="scroll-container">
      <!-- Companion Info -->
      <div class="section-card" @click="handleCompanionCardClick">
        <div class="card-title">陪诊师</div>
        <div v-if="selectedCompanion" class="companion-card-inner horizontal-layout">
          <div class="card-left">
            <el-avatar :size="60" :src="selectedCompanion.avatar" class="avatar" />
          </div>
          <div class="card-right">
            <div class="info-content">
              <div class="top-row">
                <span class="name">{{ selectedCompanion.name }}</span>
                <el-icon v-if="selectedCompanion.gender === 'female'" class="gender-icon female"
                  ><Female
                /></el-icon>
                <el-icon v-else class="gender-icon male"><Male /></el-icon>
                <span class="age" v-if="selectedCompanion.age">{{ selectedCompanion.age }}</span>
                <span class="experience-tag" v-if="selectedCompanion.experience">{{
                  selectedCompanion.experience
                }}</span>
              </div>
              <div class="stats-row">
                <div class="stat-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ (selectedCompanion.orders ?? 0) + '单' }}</span>
                </div>
                <div class="stat-item">
                  <el-icon color="#F7BA2A"><StarFilled /></el-icon>
                  <span class="score-text">{{ selectedCompanion.score || 5.0 }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><ChatLineRound /></el-icon>
                  <span>{{ selectedCompanion.comments ?? 0 }}</span>
                </div>
              </div>
            </div>
            <div class="action-column">
              <div class="view-details">
                查看详情 <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-selection">
          <span>请选择陪诊师</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- Patient Selection -->
      <div class="section-card" @click="selectPatient">
        <div class="card-title">就诊人信息</div>
        <div v-if="currentPatient" class="patient-info">
          <div class="info-content">
            <div class="row-1">
              <span class="name">{{ currentPatient.name }}</span>
              <span class="phone">{{ currentPatient.phone }}</span>
            </div>
            <div class="row-2">
              <el-icon class="addr-icon"><Location /></el-icon>
              <span class="address">{{ currentPatient.address || '暂无地址' }}</span>
            </div>
          </div>
          <div class="switch-action">
            <span>重新选择</span>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
        <div v-else class="empty-patient">
          <span>请选择就诊人</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- Service Selection -->
      <div class="section-card" @click="navigateToServiceDetail">
        <div class="card-title">服务项目</div>
        <div v-if="selectedService" class="selected-service-card">
          <el-image :src="selectedService.image" class="service-image" fit="cover" />
          <div class="service-info">
            <div class="service-name">{{ selectedService.name }}</div>
            <div class="service-desc">{{ selectedService.description }}</div>
            <div class="service-price">¥{{ selectedService.price }}</div>
          </div>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
        <div v-else class="empty-selection">
          <span>请选择服务</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- Service Time -->
      <div class="section-card" @click="openTimeSelector">
        <div class="service-time-container">
          <div class="card-title" style="margin-bottom: 0">服务时间</div>
          <div class="right-content">
            <span v-if="appointmentTime" class="selected-time">{{ formattedServiceTime }}</span>
            <div class="select-prompt">
              <span class="action-text"> &gt; 选择时间</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pickup Option -->
      <div class="section-card">
        <div class="card-title">是否接送</div>
        <SlidingSegment v-model="pickupOption" :options="pickupOptions" />
      </div>

      <!-- Remarks -->
      <div class="section-card remarks-card">
        <div class="card-title">订单备注</div>
        <el-input
          v-model="remarks"
          type="textarea"
          placeholder="请填写订单备注（选填，不超过100字）"
          :rows="3"
          maxlength="100"
          show-word-limit
          class="remarks-input"
        />
      </div>

      <!-- Payment Method -->
      <div class="section-card">
        <div class="card-title">支付方式</div>
        <el-radio-group v-model="paymentMethod" class="payment-group">
          <el-radio value="wechat" border class="payment-radio">
            <div class="payment-label">
              <div class="label-left">
                <el-icon color="#09BB07" size="20"><ChatDotRound /></el-icon>
                <span>微信支付</span>
              </div>
            </div>
          </el-radio>
          <el-radio value="balance" border class="payment-radio">
            <div class="payment-label">
              <div class="label-left">
                <el-icon color="#E6A23C" size="20"><Wallet /></el-icon>
                <span>账户余额</span>
              </div>
              <span class="balance-info">余额 {{ userStore.userInfo?.balance || 0 }} 元</span>
            </div>
          </el-radio>
        </el-radio-group>
      </div>
    </div>

    <!-- Payment Bar -->
    <div class="bottom-bar">
      <div class="price-section">
        <span class="label">合计:</span>
        <span class="price">¥{{ totalPrice }}</span>
      </div>
      <el-button type="primary" round class="pay-btn" ref="payBtnRef" @click="handlePay">
        立即支付
      </el-button>
    </div>

    <!-- Service Time Selection Drawer -->
    <el-drawer
      v-model="showTimeSelector"
      :with-header="false"
      direction="btt"
      size="70%"
      :show-close="true"
    >
      <div class="drawer-header">
        <div style="width: 24px"></div>
        <span class="title">选择服务时间</span>
        <el-icon class="close-icon" @click="showTimeSelector = false"><Close /></el-icon>
      </div>
      <div class="time-selector">
        <!-- Left Sidebar: Dates -->
        <div class="date-sidebar">
          <div
            v-for="(date, index) in dateList"
            :key="index"
            class="date-tab"
            :class="{ active: selectedDateIndex === index }"
            @click="selectDate(index)"
          >
            <div class="week">{{ date.week }}</div>
            <div class="day">{{ date.dateStr }}</div>
          </div>
        </div>

        <!-- Right Content: Time Slots -->
        <div class="time-content" ref="timeContentRef">
          <div v-if="availableTimes.length > 0" class="time-grid">
            <div
              v-for="(slot, index) in availableTimes"
              :key="index"
              class="time-slot"
              :class="{
                active: isSlotSelected(slot),
                disabled: slot.status === 'booked',
              }"
              @click="selectTime(slot)"
            >
              <div class="time-text">{{ slot.time }}</div>
              <div class="status-text">
                {{ slot.status === 'booked' ? '已预约' : '可预约' }}
              </div>
            </div>
          </div>
          <div v-else class="no-time">暂无可用时间</div>
        </div>
      </div>
    </el-drawer>

    <!-- Companion Selector -->
    <CompanionSelector
      v-model:visible="showCompanionSelector"
      :service="selectedService"
      :companions="companionList"
      @book="handleCompanionSelect"
      @search="handleCompanionSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { storeToRefs } from 'pinia'
import {
  ArrowLeft,
  ArrowRight,
  ChatDotRound,
  Wallet,
  Check,
  Female,
  Male,
  Close,
  Location,
  Document,
  Star,
  StarFilled,
  ChatLineRound,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import SlidingSegment from '@/components/UI/SlidingSegment.vue'
import CompanionSelector from '@/components/appointment/CompanionSelector.vue'
import { getServices } from '@/api/service'
import { getCompanions } from '@/api/companion'
import { getAvailableTimes, createUserOrder, payUserOrder } from '@/api/order'
import type { ServiceItem } from '@/types/api'
import type { Companion } from '@/types/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const orderStore = useOrderStore()
const {
  selectedService,
  selectedCompanion,
  appointmentTime,
  pickupOption,
  remarks,
  paymentMethod,
} = storeToRefs(orderStore)

const pickupOptions = [
  { label: '否', value: 'none' },
  { label: '要接', value: 'pick' },
  { label: '要送', value: 'drop' },
  { label: '要接送', value: 'both' },
]
const showTimeSelector = ref(false)
const showCompanionSelector = ref(false)

const selectPatient = () => {
  router.push('/user/patient')
}

const openCompanionSelector = () => {
  showCompanionSelector.value = true
}

const handleCompanionSelect = (companion: any) => {
  selectedCompanion.value = companion
  showCompanionSelector.value = false
}

const handleCompanionCardClick = () => {
  if (selectedCompanion.value) {
    router.push({
      name: 'companion-detail',
      params: { id: selectedCompanion.value.id },
    })
  } else {
    openCompanionSelector()
  }
}

const currentPatient = computed(() => {
  return userStore.getSelectedPatient()
})

// 从 API 获取的数据
const companionList = ref<Companion[]>([])
const serviceList = ref<ServiceItem[]>([])
const loading = ref(false)

// 获取数据
async function fetchData() {
  loading.value = true
  try {
    const [servicesRes, companionsRes] = await Promise.allSettled([
      getServices(),
      getCompanions({ page: 1, size: 50 }),
    ])

    if (servicesRes.status === 'fulfilled') {
      serviceList.value = servicesRes.value?.list || servicesRes.value || []
    }

    if (companionsRes.status === 'fulfilled') {
      companionList.value = companionsRes.value.list
    }

    // 数据获取后初始化从 query params 传来的服务/陪诊师
    initDataFromQuery()
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理陪诊师搜索
async function handleCompanionSearch(keyword: string) {
  try {
    const result = await getCompanions({
      page: 1,
      size: 50,
      keyword: keyword || undefined,
    })
    companionList.value = result.list
  } catch (error) {
    console.error('搜索陪诊师失败:', error)
  }
}

// 从 query params 初始化服务和陪诊师
const initDataFromQuery = () => {
  const sId = Number(route.query.serviceId)
  if (sId) {
    const found = serviceList.value.find((s) => s.id === sId)
    if (found) {
      if (!selectedService.value || selectedService.value.id !== sId) {
        orderStore.setService(found)
      }
    }
  }

  const cId = Number(route.query.companionId)
  if (cId) {
    const foundC = companionList.value.find((c) => c.id === cId)
    if (foundC) {
      if (!selectedCompanion.value || selectedCompanion.value.id !== cId) {
        orderStore.setCompanion(foundC)
      }
    }
  }
}

const totalPrice = computed(() => {
  return selectedService.value ? selectedService.value.price : 0
})

const formattedServiceTime = computed(() => {
  return appointmentTime.value
})

onMounted(() => {
  // 重置预约时间，确保每次进入都是新的
  appointmentTime.value = ''

  fetchData()
  // 刷新用户余额
  userStore.fetchBalance()
})

const navigateToServiceDetail = () => {
  // Jump to corresponding service details page
  // If selectedService exists, use its ID. Otherwise default to first one or specific ID.
  const serviceId = selectedService.value?.id || 101
  router.push({
    name: 'service',
    params: { id: serviceId },
    query: { from: 'order-create' },
  })
}

// Time Selection Logic
const dateList = ref<any[]>([])
const selectedDateIndex = ref(0)
const selectedTimeSlot = ref('')
const selectedDateForTime = ref('')
const availableTimes = ref<{ time: string; status: string }[]>([])
const timeContentRef = ref<HTMLElement | null>(null)
const payBtnRef = ref<any>(null)

const generateDates = () => {
  const dates = []
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const realWeek = weeks[d.getDay()]
    dates.push({
      date: d,
      week: i === 0 ? '今天' : realWeek,
      realWeek: realWeek,
      dateStr: `${d.getMonth() + 1}-${d.getDate()}`,
    })
  }
  dateList.value = dates
  generateTimes(0)
}

const generateTimes = async (dateIndex: number) => {
  // 获取选定日期的日期字符串
  const selectedDate = dateList.value[dateIndex]
  if (!selectedDate) return

  // 如果已选择陪诊师，调用API获取可用时间段
  if (selectedCompanion.value?.id) {
    try {
      const times = await getAvailableTimes(selectedCompanion.value.id, selectedDate.dateStr)
      availableTimes.value = times
      return
    } catch (error) {
      console.error('获取可用时间段失败，使用本地生成:', error)
    }
  }

  // API调用失败或未选择陪诊师时，使用本地生成
  generateLocalTimes(dateIndex)
}

// 本地生成时间段（备用，当 API 调用失败或未选择服务时使用）
const generateLocalTimes = (dateIndex: number) => {
  const times = []
  const now = new Date()

  // Start from 00:00 to 23:30
  let startHour = 0
  let startMinute = 0

  // If today, start from now + 30 mins
  if (dateIndex === 0) {
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Round up to next 30 min slot
    if (currentMinute < 30) {
      startHour = currentHour
      startMinute = 30
    } else {
      startHour = currentHour + 1
      startMinute = 0
    }
  }

  for (let h = startHour; h < 24; h++) {
    for (let m = h === startHour ? startMinute : 0; m < 60; m += 30) {
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      // Mock random booked status (e.g., if hour is 10 or 14)
      const isBooked = (h === 10 && m === 0) || (h === 14 && m === 30)
      times.push({
        time: timeStr,
        status: isBooked ? 'booked' : 'available',
      })
    }
  }
  availableTimes.value = times
}

const openTimeSelector = () => {
  generateDates()
  if (selectedDateForTime.value) {
    const idx = dateList.value.findIndex((d) => d.dateStr === selectedDateForTime.value)
    if (idx !== -1) {
      selectedDateIndex.value = idx
    } else {
      selectedDateIndex.value = 0
    }
  } else {
    selectedDateIndex.value = 0
  }
  generateTimes(selectedDateIndex.value)
  showTimeSelector.value = true
  scrollToSelection()
}

const scrollToSelection = () => {
  nextTick(() => {
    if (!timeContentRef.value) return

    const currentDateStr = dateList.value[selectedDateIndex.value].dateStr
    // Check if current view contains the selected time
    if (selectedDateForTime.value === currentDateStr && selectedTimeSlot.value) {
      // Find active element
      const activeEl = timeContentRef.value.querySelector('.time-slot.active') as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      timeContentRef.value.scrollTop = 0
    }
  })
}

const selectDate = (index: number) => {
  selectedDateIndex.value = index
  generateTimes(index)
  scrollToSelection()
}

const isSlotSelected = (slot: { time: string; status: string }) => {
  return (
    selectedTimeSlot.value === slot.time &&
    selectedDateForTime.value === dateList.value[selectedDateIndex.value].dateStr
  )
}

const selectTime = (slot: { time: string; status: string }) => {
  if (slot.status === 'booked') return
  selectedTimeSlot.value = slot.time
  const dateItem = dateList.value[selectedDateIndex.value]
  const dateStr = dateItem.dateStr
  selectedDateForTime.value = dateStr
  // Use realWeek even if it's today
  const week = dateItem.realWeek

  // Delay closing to show selection state and prevent flicker
  setTimeout(() => {
    appointmentTime.value = `${dateStr} ${week} ${slot.time}`
    showTimeSelector.value = false
  }, 150)
}

const handlePay = async () => {
  // 移除焦点，防止按钮保持激活状态
  if (payBtnRef.value && payBtnRef.value.$el) {
    payBtnRef.value.$el.blur()
  }

  // 验证必填信息
  if (!selectedService.value) {
    ElMessage.warning('请选择服务项目')
    return
  }
  if (!appointmentTime.value) {
    ElMessage.warning('请选择服务时间')
    return
  }
  if (!currentPatient.value) {
    ElMessage.warning('请选择就诊人')
    return
  }
  if (!selectedCompanion.value) {
    ElMessage.warning('请选择陪诊师')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: '支付中...',
    background: 'rgba(0, 0, 0, 0.7)',
    customClass: 'payment-loading-mask',
  })

  try {
    // 转换接送选项为数字格式（后端要求）
    const pickupOptionMap: Record<string, number> = {
      none: 1, // 医院门口
      pick: 2, // 指定地点接
      drop: 2, // 指定地点送
      both: 2, // 指定地点接送
    }

    // 解析预约时间字符串，转换为标准格式
    const parseAppointmentTime = (timeStr: string) => {
      try {
        // timeStr 格式: "12-17 周二 14:30"
        const parts = timeStr.split(' ')
        if (parts.length !== 3) {
          throw new Error('时间格式错误')
        }

        const [dateStr, , time] = parts
        const currentYear = new Date().getFullYear()
        const [month, day] = dateStr.split('-').map(Number)
        const [hour, minute] = time.split(':').map(Number)

        const appointmentDate = new Date(currentYear, month - 1, day, hour, minute)
        // 格式化为 "YYYY-MM-DD HH:mm:ss" 格式
        const year = appointmentDate.getFullYear()
        const monthStr = String(appointmentDate.getMonth() + 1).padStart(2, '0')
        const dayStr = String(appointmentDate.getDate()).padStart(2, '0')
        const hourStr = String(appointmentDate.getHours()).padStart(2, '0')
        const minuteStr = String(appointmentDate.getMinutes()).padStart(2, '0')
        const secondStr = '00'

        return `${year}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}:${secondStr}`
      } catch (error) {
        console.error('时间解析失败:', error)
        // 如果解析失败，使用当前时间加1小时作为默认值
        const defaultTime = new Date()
        defaultTime.setHours(defaultTime.getHours() + 1)
        const year = defaultTime.getFullYear()
        const month = String(defaultTime.getMonth() + 1).padStart(2, '0')
        const day = String(defaultTime.getDate()).padStart(2, '0')
        const hour = String(defaultTime.getHours()).padStart(2, '0')
        const minute = String(defaultTime.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}:00`
      }
    }

    // 构建订单数据
    const orderData = {
      serviceId: selectedService.value.id,
      companionId: selectedCompanion.value.id,
      patientId: currentPatient.value.id,
      hospital: '默认医院', // 这里可以后续添加医院选择功能
      department: '默认科室', // 这里可以后续添加科室选择功能
      appointmentTime: parseAppointmentTime(appointmentTime.value),
      pickupOption: pickupOptionMap[pickupOption.value] || 1,
      pickupAddress: pickupOption.value !== 'none' ? '用户指定接送地址' : undefined,
      remarks: remarks.value || null,
    }

    console.log('创建订单数据:', orderData)

    // 调用创建订单API
    const orderId = await createUserOrder(orderData)

    // 订单创建成功后，立即调用支付接口
    if (orderId) {
      await payUserOrder(orderId, { paymentMethod: paymentMethod.value })
    }

    loading.close()

    // 显示支付成功提示
    ElMessageBox.alert('支付成功！我们将尽快为您安排服务。', '提示', {
      confirmButtonText: '确定',
      callback: () => {
        // 重置订单状态
        orderStore.resetOrder()
        // 跳转到订单列表页面
        router.push({ name: 'order-list', query: { status: '2' } })
      },
    })
  } catch (error) {
    loading.close()
    console.error('创建订单失败:', error)
    ElMessage.error('支付失败，请重试')
  }
}
</script>

<style lang="scss">
.payment-loading-mask {
  z-index: 9999 !important;
}
</style>

<style scoped lang="scss">
.order-create-page {
  height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #eee;

  .back-icon {
    font-size: 20px;
    cursor: pointer;
  }
}

.section-card {
  background-color: #fff;
  margin: 12px;
  padding: 12px 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  cursor: pointer;

  .card-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #333;
  }

  .empty-patient,
  .empty-selection {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #999;
    font-size: 14px;
  }

  .companion-card-inner {
    &.horizontal-layout {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px 0;
      gap: 12px;

      .avatar {
        margin-right: 0;
        flex-shrink: 0;
      }

      .card-left {
        flex-shrink: 0;
      }

      .card-right {
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 8px;

        .info-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;

          .top-row {
            display: flex;
            align-items: center;

            .name {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-right: 8px;
            }

            .gender-icon {
              font-size: 14px;
              margin-right: 8px;

              &.female {
                color: #f56c6c;
              }
              &.male {
                color: #409eff;
              }
            }

            .age {
              font-size: 13px;
              color: #999;
              margin-right: 8px;
            }

            .experience-tag {
              font-size: 11px;
              color: #fff;
              background-color: #409eff;
              padding: 1px 6px;
              border-radius: 4px;
            }
          }

          .stats-row {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 4px;

            .stat-item {
              display: flex;
              align-items: center;
              font-size: 12px;
              color: #909399;
              gap: 4px;

              .el-icon {
                font-size: 14px;
              }
            }
          }
        }

        .action-column {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          flex-shrink: 0;

          .view-details {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #999;
            cursor: pointer;
          }
        }
      }
    }
  }

  .patient-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .row-1 {
        display: flex;
        align-items: center;
        gap: 10px;

        .name {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        .phone {
          font-size: 14px;
          color: #666;
        }
      }

      .row-2 {
        display: flex;
        align-items: flex-start;
        gap: 4px;
        color: #999;
        font-size: 13px;
        line-height: 1.4;

        .addr-icon {
          margin-top: 2px;
          flex-shrink: 0;
        }
      }
    }

    .switch-action {
      display: flex;
      align-items: center;
      gap: 2px;
      color: #999;
      font-size: 14px;
      flex-shrink: 0;
      margin-left: 10px;

      .arrow-icon {
        color: #ccc;
      }
    }
  }
}

/* .remarks-card removed */

.selected-service-card {
  display: flex;
  align-items: center;
  gap: 10px;

  .service-image {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .service-info {
    flex: 1;

    .service-name {
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .service-desc {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }

    .service-price {
      color: #f56c6c;
      font-weight: bold;
    }
  }

  .arrow-icon {
    color: #ccc;
  }
}

.selected-time {
  font-size: 15px;
  color: #409eff;
  font-weight: bold;
}

/* Payment Styles */
.payment-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;

  .payment-radio {
    margin-right: 0;
    width: 100%;
    height: auto;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    :deep(.el-radio__input) {
      order: 2; /* Ensure circle is on the right */
      margin-right: 10px; /* Add distance from the right edge */
    }

    :deep(.el-radio__label) {
      padding-left: 0;
      flex: 1;
      order: 1; /* Content on the left */
    }

    .payment-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-size: 16px;
      width: 100%;

      .label-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .balance-info {
        font-size: 15px;
        color: #999;
        margin-right: 10px;
      }
    }

    &.is-bordered {
      border: 1px solid #dcdfe6;
    }

    &.is-checked {
      border-color: #409eff;
      background-color: #ecf5ff;
    }
  }
}

/* Service Time Row */
.service-time-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .right-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    justify-content: flex-end;
  }

  .select-prompt {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #999;
    font-size: 14px;
    cursor: pointer;

    .action-text {
      color: #999;
      font-size: 13px;
    }
  }
}

/* Remarks Input */
.remarks-input {
  :deep(.el-textarea__inner) {
    resize: none; /* Disable manual resizing */
  }
}

/* Bottom Bar */
.bottom-bar {
  position: relative;
  background-color: #fff;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 9;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));

  .price-section {
    .label {
      font-size: 14px;
      color: #666;
      margin-right: 8px;
    }
    .price {
      font-size: 20px;
      color: #f56c6c;
      font-weight: bold;
    }
  }

  .pay-btn {
    width: 120px;
    height: 44px;
    font-size: 16px;
    box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
    font-weight: bold;
    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    background: #409eff;
    border-color: #409eff;
    color: #fff;

    &:active {
      transform: scale(0.96);
      background: #f5f5f5;
      color: #333;
      border-color: #f5f5f5;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
  }
}

.companion-card {
  .card-left {
    flex-shrink: 0;
  }

  display: flex;
  gap: 10px;
  align-items: center;

  .card-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .row-1 {
      display: flex;
      align-items: center;
      gap: 8px;

      .name {
        font-size: 18px;
        font-weight: bold;
      }

      .rating {
        display: flex;
        align-items: center;
        color: #e6a23c;
        font-size: 14px;
        gap: 2px;
        margin-left: auto;
      }
    }

    .row-2 {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .tag {
        font-size: 12px;
        color: #f56c6c;
        background-color: #fef0f0;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .stats {
        display: flex;
        gap: 10px;
        color: #999;
        font-size: 13px;
        align-items: center;
        margin-left: auto;
      }
    }
  }
}

/* Service Selector Drawer Styles */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #eee;

  .close-icon {
    font-size: 24px;
    padding: 5px; /* Increase hit area */
    cursor: pointer;
    color: #999;
  }
}

.service-selection-list {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 365px;
  overflow-y: auto;
  box-sizing: border-box;
}

/* Time Selector Styles */
:deep(.el-drawer__body) {
  padding: 0; /* Remove default padding */
  display: flex;
  flex-direction: column;
}

.time-selector {
  display: flex;
  flex: 1; /* Fill the drawer body flex space */
  min-height: 0; /* Important for nested flex scroll */
  box-sizing: border-box;

  .date-sidebar {
    width: 100px;
    background-color: #fff;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    height: 100%; /* Fill the selector height */
    overflow-y: hidden; /* Prevent scrolling */
    padding-bottom: 0;
    box-sizing: border-box;

    .date-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0;
      min-height: auto; /* Let flex handle height */
      text-align: center;
      cursor: pointer;
      border-bottom: 1px solid #f5f5f5;
      box-sizing: border-box;

      &.active {
        background-color: #fff;
        color: #409eff;
        font-weight: bold;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 15px;
          bottom: 15px;
          width: 3px;
          background-color: #409eff;
        }
      }

      .week {
        font-size: 14px;
        margin-bottom: 2px;
      }
      .day {
        font-size: 11px;
        color: #999;
      }
    }
  }

  .time-content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    padding-bottom: 80px;
    background-color: #fff;
    box-sizing: border-box;

    .time-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .time-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60px;
      border: 1px solid #eee;
      border-radius: 8px;
      cursor: pointer;
      font-size: 15px;
      color: #333;
      transition: all 0.3s;

      .time-text {
        font-weight: bold;
      }

      .status-text {
        font-size: 11px;
        color: #67c23a;
        margin-top: 2px;
      }

      &.active {
        background-color: #ecf5ff;
        border-color: #409eff;
        color: #409eff;

        .status-text {
          color: #409eff;
        }
      }

      &.disabled {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #c0c4cc;
        cursor: not-allowed;

        .status-text {
          color: #c0c4cc;
        }
      }
    }

    .no-time {
      text-align: center;
      color: #999;
      margin-top: 50px;
    }
  }
}
</style>
