<template>
  <div class="companion-list-page">
    <!-- Header Nav -->
    <div class="header-nav">
      <div class="nav-left" @click="router.back()">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
      </div>
      <span class="page-title">选择陪诊师</span>
      <div class="nav-right"></div>
    </div>

    <!-- Top Search -->
    <div class="search-header">
      <el-input
        v-model="searchText"
        placeholder="请输入陪诊师姓名"
        class="search-input"
        :prefix-icon="Search"
        clearable
      />
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div
        class="filter-item"
        :class="{ active: currentFilter === 'score' }"
        @click="onSortChange('score')"
      >
        评分优先
      </div>
      <div
        class="filter-item"
        :class="{ active: currentFilter === 'sales' }"
        @click="onSortChange('sales')"
      >
        服务量优先
      </div>
      <div class="filter-item filter-btn" @click="showFilter = true">
        筛选
        <el-icon class="filter-icon"><Filter /></el-icon>
      </div>
    </div>

    <!-- Companion List -->
    <div class="companion-list">
      <div
        v-for="item in filteredCompanions"
        :key="item.id"
        class="companion-card"
        @click="goToDetail(item.id)"
      >
        <div class="card-left">
          <el-avatar :size="60" :src="getCompanionAvatar(item.avatar)" />
        </div>
        <div class="card-right">
          <div class="info-content">
            <div class="row-1">
              <span class="name">{{ item.name }}</span>
              <el-icon v-if="item.gender === 'female'" class="gender-icon female"
                ><Female
              /></el-icon>
              <el-icon v-else class="gender-icon male"><Male /></el-icon>
              <span class="age" v-if="item.age">{{ item.age }}</span>
              <span class="experience-tag" v-if="item.experience">{{ item.experience }}</span>
            </div>
            <div class="stats-row">
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>{{ item.orders || '0单' }}</span>
              </div>
              <div class="stat-item">
                <el-icon color="#F7BA2A"><StarFilled /></el-icon>
                <span class="score-text">{{ item.score || 0 }}</span>
              </div>
              <div class="stat-item">
                <el-icon><ChatLineRound /></el-icon>
                <span>{{ item.comments || 0 }}</span>
              </div>
            </div>
          </div>
          <div class="action-column">
            <div class="view-details">
              查看详情 <el-icon><ArrowRight /></el-icon>
            </div>
            <el-button type="primary" size="small" class="book-btn" @click.stop="openBooking(item)">
              立即预约
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Service Drawer -->
    <el-drawer
      v-model="showBookingSheet"
      :with-header="false"
      direction="btt"
      size="auto"
      class="booking-drawer"
    >
      <div class="drawer-header">
        <div class="header-left"></div>
        <span class="title">选择服务</span>
        <div class="header-right" @click="showBookingSheet = false">
          <el-icon class="close-icon"><ArrowDown /></el-icon>
        </div>
      </div>

      <!-- Task 2: Companion Info Card -->
      <div v-if="selectedCompanion" class="companion-header-card">
        <div class="card-left">
          <el-avatar :size="50" :src="selectedCompanion.avatar" />
        </div>
        <div class="card-right">
          <div class="info-content">
            <div class="row-1">
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
                <span>{{ selectedCompanion.orders || '0单' }}</span>
              </div>
              <div class="stat-item">
                <el-icon color="#F7BA2A"><StarFilled /></el-icon>
                <span>{{ selectedCompanion.score || 0 }}</span>
              </div>
              <div class="stat-item">
                <el-icon><ChatLineRound /></el-icon>
                <span>{{ selectedCompanion.comments || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="service-selection">
        <div
          v-for="service in serviceList"
          :key="service.id"
          class="service-card-select"
          @click="goToServiceDetail(service)"
        >
          <el-image :src="service.image" class="service-image" fit="cover" loading="lazy" />
          <div class="service-info">
            <div class="service-name">{{ service.name }}</div>
            <div class="service-desc">{{ service.description }}</div>
            <div class="service-price">¥{{ service.price }}</div>
          </div>
          <div class="action-column">
            <div class="view-details">
              查看详情 <el-icon><ArrowRight /></el-icon>
            </div>
            <el-button
              type="primary"
              size="small"
              class="book-btn"
              round
              @click.stop="selectService(service)"
            >
              立即预约
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- Filter Drawer -->
    <el-drawer
      v-model="showFilter"
      title="筛选"
      direction="rtl"
      :with-header="false"
      class="filter-drawer"
    >
      <div class="filter-container">
        <div class="filter-section">
          <div class="section-title">性别要求</div>
          <div class="tag-group">
            <div
              class="tag-item"
              :class="{ active: filterForm.gender === '' }"
              @click="filterForm.gender = ''"
            >
              全部
            </div>
            <div
              class="tag-item"
              :class="{ active: filterForm.gender === 'male' }"
              @click="filterForm.gender = 'male'"
            >
              男
            </div>
            <div
              class="tag-item"
              :class="{ active: filterForm.gender === 'female' }"
              @click="filterForm.gender = 'female'"
            >
              女
            </div>
          </div>
        </div>

        <div class="filter-section">
          <div class="section-title">服务分类</div>
          <div class="tag-group">
            <div
              class="tag-item"
              v-for="service in serviceList"
              :key="service.id"
              :class="{ active: filterForm.categories.includes(service.id) }"
              @click="toggleCategory(service.id)"
            >
              {{ service.name }}
            </div>
          </div>
        </div>

        <div class="filter-footer">
          <el-button class="footer-btn" @click="resetFilter">重置</el-button>
          <el-button type="primary" class="footer-btn" @click="applyFilter">确定</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CompanionList',
})
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCompanionStore } from '@/stores/companion'
import { useUserStore } from '@/stores/user'
import { useDrawerNavigation } from '@/composables/useDrawerNavigation'
import {
  Search,
  ArrowLeft,
  Filter,
  ArrowDown,
  Female,
  Male,
  StarFilled,
  Star,
  Document,
  ChatLineRound,
  ArrowRight,
} from '@element-plus/icons-vue'
import { getServices } from '@/api/service'
import { getCompanionAvatar } from '@/constants/avatar'
import type { ServiceItem } from '@/types/api'

const router = useRouter()
const companionStore = useCompanionStore()
const userStore = useUserStore()
const { searchText, currentFilter, showFilter, filterForm, companionList } =
  storeToRefs(companionStore)

const showBookingSheet = ref(false)
const { navigateWithDelay } = useDrawerNavigation(showBookingSheet)
const selectedCompanion = ref<any>(null)

// 从 API 获取的服务列表
const serviceList = ref<ServiceItem[]>([])

// 获取服务数据
async function fetchServices() {
  try {
    const res = await getServices()
    serviceList.value = res?.list || res || []
  } catch (error) {
    console.error('获取服务列表失败:', error)
  }
}

// 组件挂载时获取服务列表和陪诊师数据
onMounted(async () => {
  fetchServices()
  await companionStore.fetchCompanions()
})

// 存储已应用的筛选条件（只在点击确定后更新）
const appliedFilter = ref({
  gender: '',
  categories: [] as number[],
})

// 提取通用的 API 调用逻辑
const fetchCompanionsData = async () => {
  const params: any = {
    page: 1,
    size: 50,
    keyword: searchText.value,
  }
  // 保持当前的排序和筛选条件
  if (appliedFilter.value.gender) {
    params.gender = appliedFilter.value.gender
  }
  if (appliedFilter.value.categories.length > 0) {
    params.service = appliedFilter.value.categories[0]
  }
  if (currentFilter.value === 'score') {
    params.sort = 'score_desc'
  } else if (currentFilter.value === 'sales') {
    params.sort = 'orders_desc'
  }
  await companionStore.fetchCompanions(params)
}

// 排序切换
const onSortChange = async (type: 'score' | 'sales') => {
  if (currentFilter.value === type) return
  currentFilter.value = type
  await fetchCompanionsData()
}

// 监听搜索文本变化，防抖调用 API
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchText, (newVal: string) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchCompanionsData()
  }, 500)
})

const filteredCompanions = computed(() => {
  // 由于 API 已经根据 keyword 返回了过滤后的结果，
  // 这里不再需要在前端进行 name.includes 过滤，除非 API 不支持模糊搜索。
  // 但为了兼容性，如果 API 返回了所有数据，这里的前端过滤也不会有副作用（只要包含关键词）。
  // 考虑到分页，最好依赖 API。
  // 此处仅做前端排序兜底（如果 API 返回未排序）
  let list = [...companionList.value]

  // Filter by gender (前端兜底)
  if (appliedFilter.value.gender) {
    list = list.filter((c) => c.gender === appliedFilter.value.gender)
  }
  // ... 其他前端兜底逻辑保持不变 ...

  // Filter by categories (使用已应用的条件)
  if (appliedFilter.value.categories.length > 0) {
    list = list.filter(
      (c) => c.services && c.services.some((sId) => appliedFilter.value.categories.includes(sId)),
    )
  }

  // Filter by search text (API 已处理，前端不再重复过滤，除非需要高亮)
  // if (searchText.value) {
  //   list = list.filter((c) => c.name.includes(searchText.value))
  // }

  // Sort
  if (currentFilter.value === 'score') {
    list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  } else if (currentFilter.value === 'sales') {
    list.sort((a, b) => (b.orders ?? 0) - (a.orders ?? 0))
  }

  return list
})

const toggleCategory = (id: number) => {
  const index = filterForm.value.categories.indexOf(id)
  if (index > -1) {
    filterForm.value.categories.splice(index, 1)
  } else {
    filterForm.value.categories.push(id)
  }
}

const resetFilter = async () => {
  // 清空表单选项，并发送请求查询所有数据
  filterForm.value.gender = ''
  filterForm.value.categories = []
  filterForm.value.serviceType = ''
  // 重置已应用的筛选条件
  appliedFilter.value.gender = ''
  appliedFilter.value.categories = []
  // 发送请求查询数据
  await fetchCompanionsData()
}

const applyFilter = async () => {
  showFilter.value = false
  // 保存已应用的筛选条件
  appliedFilter.value.gender = filterForm.value.gender
  appliedFilter.value.categories = [...filterForm.value.categories]
  await fetchCompanionsData()
}

const goToDetail = (id: number) => {
  router.push(`/companion/${id}`)
}

const openBooking = (item: any) => {
  selectedCompanion.value = item
  showBookingSheet.value = true
}

const goToServiceDetail = (service: any) => {
  const query: any = {}
  if (selectedCompanion.value) {
    query.companionId = selectedCompanion.value.id
  }
  navigateWithDelay({
    path: `/service/${service.id}`,
    query,
  })
}

const selectService = (service: any) => {
  if (!userStore.isLogin) {
    navigateWithDelay('/login')
    return
  }
  const query: any = { serviceId: service.id }
  if (selectedCompanion.value) {
    query.companionId = selectedCompanion.value.id
  }
  navigateWithDelay({
    name: 'order-create',
    query,
  })
}
</script>

<style scoped lang="scss">
.book-btn {
  height: 28px;
  border-radius: 14px;
  padding: 0 12px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.companion-list-page {
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background-color: #f7f8fa;
  min-height: 100vh;
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  padding-top: calc(15px + env(safe-area-inset-top));
  background-color: #fff;
  font-size: 18px;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 101;
  border-bottom: 1px solid #f5f5f5;

  .nav-left {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: normal;
    color: #333;
    width: 40px; /* Fixed width */
    z-index: 1;

    .back-icon {
      font-size: 20px;
    }
  }

  .page-title {
    font-size: 18px;
    font-weight: bold;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    text-align: center;
  }

  .nav-right {
    width: 40px; /* Balance left side */
  }
}

.search-header {
  padding: 10px 15px;
  background-color: #fff;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;

  .search-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      border-radius: 20px;
    }
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;

  .filter-item {
    flex: 1;
    display: flex;
    justify-content: center;
    font-size: 14px;
    color: #666;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: none;
    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 14px;
      width: 1px;
      background-color: #eee;
    }

    &.active {
      color: #409eff;
      font-weight: bold;
    }
  }
}

.companion-list {
  padding: 10px 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.companion-card {
  position: relative;
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  gap: 15px;
  cursor: pointer;
  transition: none;
  align-items: center;

  .card-left {
    flex-shrink: 0;
  }

  .card-right {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .info-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;

      .row-1 {
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
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
      margin-left: 10px;

      .view-details {
        position: absolute;
        top: 15px;
        right: 15px;
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .book-btn {
        margin-top: 25px;
      }

      .rating-stars {
        transform: scale(0.9);
        transform-origin: right center;
      }
    }
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #eee;

  .header-left,
  .header-right {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-right {
    justify-content: flex-end;
    cursor: pointer;
  }

  .title {
    flex: 1;
    text-align: center;
  }

  .close-icon {
    font-size: 24px;
    color: #333;
    transition: transform 0.3s;
  }
}

.service-selection {
  padding: 0 15px;
  height: 400px; /* 4 items * 100px */
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  .service-card-select {
    width: 100%;
    height: 100px; /* Fixed height */
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 0;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    gap: 12px;

    .service-image {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .service-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;

      .service-name {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .service-desc {
        font-size: 12px;
        color: #999;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .service-price {
        color: #f56c6c;
        font-weight: bold;
        font-size: 16px;
      }
    }

    .action-column {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 15px;
      flex-shrink: 0;

      .view-details {
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .book-btn {
        height: 28px;
        border-radius: 14px;
        padding: 0 12px;
        font-weight: 500;
        box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
      }
    }
  }
}

.filter-content {
  padding: 15px;

  .filter-group {
    margin-bottom: 20px;

    .group-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
  }
}

.companion-header-card {
  margin: 15px;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 15px;
  align-items: center;
  border: 1px solid #f0f0f0;

  .card-left {
    flex-shrink: 0;
  }

  .card-right {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .info-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;

      .row-1 {
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

    .rating-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
      margin-left: 10px;

      .rating-stars {
        transform: scale(0.9);
        transform-origin: right center;
      }
    }
  }
}

/* Filter Drawer Styles */
:global(.filter-drawer) {
  width: 100% !important;
  max-width: 300px;
}

:global(.filter-drawer .el-drawer__body) {
  padding: 0;
  overflow-y: auto;
}

:global(.filter-drawer .el-drawer__footer) {
  padding: 0;
}

.filter-container {
  padding: 20px 20px 0;
}

.filter-section {
  margin-bottom: 30px;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
  }
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .tag-item {
    padding: 8px 20px;
    background-color: #f5f7fa;
    border-radius: 20px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.3s;

    &.active {
      background-color: #ecf5ff;
      color: #409eff;
      border-color: #409eff;
      font-weight: bold;
    }
  }
}

.filter-footer {
  width: 100%;
  padding: 0;
  margin-top: 10px;
  padding-bottom: 20px;
  display: flex;
  gap: 15px;
  box-sizing: border-box;

  .footer-btn {
    flex: 1;
    height: 44px;
    font-size: 16px;
    border-radius: 22px;

    // Fix reset button interaction on mobile
    &:not(.el-button--primary) {
      // Prevent sticky hover/focus state on mobile
      &:focus,
      &:hover {
        background-color: #fff;
        border-color: #dcdfe6;
        color: #606266;
      }

      // Active state feedback
      &:active {
        background-color: #f5f7fa;
        border-color: #c0c4cc;
      }
    }
  }
}
</style>
