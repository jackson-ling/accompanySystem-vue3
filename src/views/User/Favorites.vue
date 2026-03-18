<template>
  <div class="favorites-page">
    <div class="header">
      <div class="back-icon" @click="router.back()">
        <el-icon :size="24" color="#333"><ArrowLeft /></el-icon>
      </div>
      <div class="title">我的收藏</div>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div v-if="favoriteCompanions.length > 0" class="companion-list">
        <div
          v-for="item in favoriteCompanions"
          :key="item.id"
          class="companion-card"
          @click="goToDetail(item.itemId)"
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
              <div class="heart-action" @click.stop="handleToggleFavorite(item.itemId)">
                <svg viewBox="0 0 1024 1024" width="28" height="28">
                  <path
                    d="M923 283.6a260.04 260.04 0 0 0-56.9-82.8 264.4 264.4 0 0 0-84-55.5A266.34 266.34 0 0 0 679.7 125c-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5a258.44 258.44 0 0 0-56.9 82.8c-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3 0.1-35.3-7-69.6-20.9-101.9z"
                    fill="#F56C6C"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无收藏" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanionStore } from '@/stores/companion'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Female,
  Male,
  Document,
  StarFilled,
  ChatLineRound,
  ArrowRight,
} from '@element-plus/icons-vue'
import { getCompanionAvatar } from '@/constants/avatar'

const router = useRouter()
const companionStore = useCompanionStore()

const favoriteCompanions = computed(() => {
  return companionStore.favoritesList
})

// 页面加载时获取收藏列表和陪诊师列表
onMounted(async () => {
  await Promise.all([companionStore.fetchFavorites(), companionStore.fetchCompanions()])
})

// 处理取消收藏
const handleToggleFavorite = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用取消收藏接口（store会自动更新favoritesList）
    await companionStore.toggleFavorite(id)

    ElMessage.success('已取消收藏')
  } catch (error) {
    // 用户点击取消或发生错误
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败')
    }
  }
}

const goToDetail = (id: number) => {
  router.push(`/companion/${id}`)
}
</script>

<style scoped lang="scss">
.favorites-page {
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
  padding: 10px 15px;
}

.companion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.companion-card {
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
        }
      }
    }

    .action-column {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      margin-left: 10px;

      .heart-action {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: background-color 0.3s;

        &:active {
          background-color: #f5f7fa;
        }
      }
    }
  }
}
</style>
