<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :with-header="false"
    direction="btt"
    class="companion-drawer"
  >
    <div class="drawer-container">
      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="header-left"></div>
        <span class="title">选择陪诊师</span>
        <div class="header-right" @click="$emit('update:visible', false)">
          <el-icon class="close-icon"><ArrowDown /></el-icon>
        </div>
      </div>

      <!-- Search in Drawer -->
      <div class="drawer-search">
        <el-input
          v-model="searchText"
          placeholder="请输入陪诊师姓名"
          :prefix-icon="Search"
          clearable
        />
      </div>

      <!-- Companion List -->
      <div class="companion-list">
        <div
          v-for="companion in filteredCompanions"
          :key="companion.id"
          class="companion-card"
          @click="goToDetail(companion.id)"
        >
          <div class="card-left">
            <el-avatar :size="60" :src="getCompanionAvatar(companion.avatar)" />
          </div>
          <div class="card-right">
            <div class="info-content">
              <div class="row-1">
                <span class="name">{{ companion.name }}</span>
                <el-icon v-if="companion.gender === 'female'" class="gender-icon female"
                  ><Female
                /></el-icon>
                <el-icon v-else class="gender-icon male"><Male /></el-icon>
                <span class="age" v-if="companion.age">{{ companion.age }}</span>
                <span class="experience-tag" v-if="companion.experience">{{
                  companion.experience
                }}</span>
              </div>
              <div class="stats-row">
                <div class="stat-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ companion.orderCount || '0单' }}</span>
                </div>
                <div class="stat-item">
                  <el-icon color="#F7BA2A"><StarFilled /></el-icon>
                  <span class="score-text">{{ companion.rating || 0 }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><ChatLineRound /></el-icon>
                  <span>{{ companion.commentCount || 0 }}</span>
                </div>
              </div>
            </div>
            <div class="action-column">
              <div class="view-details">
                查看详情 <el-icon><ArrowRight /></el-icon>
              </div>
              <el-button
                type="primary"
                size="small"
                class="book-btn"
                @click.stop="handleBook(companion)"
              >
                立即预约
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts">
export default {
  name: 'CompanionSelector',
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  ArrowDown,
  Female,
  Male,
  StarFilled,
  Location,
  ChatLineRound,
  Star,
  Document,
  ArrowRight,
} from '@element-plus/icons-vue'
import { getCompanionAvatar } from '@/constants/avatar'

const props = defineProps<{
  visible: boolean
  service?: any
  companions?: any[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'book', companion: any): void
  (e: 'search', keyword: string): void
}>()

const router = useRouter()
const searchText = ref('')

// 防抖搜索
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(searchText, (newValue) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    emit('search', newValue)
  }, 300)
})

const filteredCompanions = computed(() => {
  if (!props.companions) return []
  if (!searchText.value) return props.companions
  return props.companions.filter((c) => c.name.includes(searchText.value))
})

const handleBook = (companion: any) => {
  emit('book', companion)
}

const goToDetail = (id: number) => {
  emit('update:visible', false)
  setTimeout(() => {
    router.push(`/companion/${id}`)
  }, 350)
}
</script>

<style lang="scss">
.el-drawer.btt.companion-drawer {
  height: auto !important;
  max-height: 550px !important;
  border-radius: 16px 16px 0 0;

  .el-drawer__body {
    padding: 0 !important;
    overflow: hidden !important; /* Prevent body scroll */
  }
}
</style>

<style scoped lang="scss">
.drawer-container {
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
  max-height: 550px;
  height: 100%; /* Ensure it fills the drawer */
  overflow: hidden; /* Prevent container scroll */
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .header-right {
    cursor: pointer;
    .close-icon {
      font-size: 20px;
      color: #999;
    }
  }
}

.drawer-search {
  padding: 10px 15px;
  background-color: #fff;

  :deep(.el-input__wrapper) {
    border-radius: 20px;
  }
}

.companion-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 15px 30px; /* Increase bottom padding */
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
        height: 28px;
        border-radius: 14px;
        padding: 0 12px;
        font-weight: 500;
        box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
      }
    }
  }
}
</style>
