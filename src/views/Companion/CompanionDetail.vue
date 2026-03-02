<template>
  <div class="companion-detail-page">
    <div class="scroll-content">
      <div class="header-nav">
        <div class="nav-left" @click="router.back()">
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
        </div>
        <span class="page-title">陪诊师详情</span>
        <div class="nav-right"></div>
      </div>

      <!-- Profile Header -->
      <template v-if="companion">
        <!-- Cover Image -->
        <div class="cover-image-container">
          <el-image
            :src="companion.avatar"
            fit="cover"
            class="cover-image"
            @click="showViewer = true"
          />
        </div>

        <MobileImageViewer
          v-model:visible="showViewer"
          :url="getCompanionAvatar(companion.avatar)"
        />

        <div class="profile-header">
          <div class="info-card">
            <div class="card-top">
              <div class="left-avatar">
                <el-avatar :size="60" :src="getCompanionAvatar(companion.avatar)" />
              </div>

              <div class="center-info">
                <div class="name-row">
                  <span class="name">{{ companion.name }}</span>
                  <el-icon v-if="companion.gender === 'female'" class="gender-icon female"
                    ><Female
                  /></el-icon>
                  <el-icon v-else class="gender-icon male"><Male /></el-icon>
                  <span class="age" v-if="companion.age">{{ companion.age }}岁</span>
                </div>

                <div class="tags-row">
                  <span class="experience-tag" v-if="companion.experience">{{
                    companion.experience
                  }}</span>
                </div>
              </div>

              <div class="right-action">
                <div class="heart-action" @click="toggleCollection">
                  <svg viewBox="0 0 1024 1024" width="28" height="28">
                    <path
                      d="M923 283.6a260.04 260.04 0 0 0-56.9-82.8 264.4 264.4 0 0 0-84-55.5A266.34 266.34 0 0 0 679.7 125c-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5a258.44 258.44 0 0 0-56.9 82.8c-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3 0.1-35.3-7-69.6-20.9-101.9z"
                      :fill="companionStore.isFavorite(companion.id) ? '#F56C6C' : '#FFFFFF'"
                      :stroke="companionStore.isFavorite(companion.id) ? 'none' : '#333333'"
                      stroke-width="50"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-value">{{
                  (companion.orders || '0').toString().replace('+', '')
                }}</span>
                <span class="stat-label">累计接单</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ companion.score || 5.0 }}</span>
                <span class="stat-label">综合评分</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ companion.collected || 0 }}</span>
                <span class="stat-label">关注收藏</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Intro Section -->
        <div class="intro-section">
          <div class="section-title">
            <span>个人介绍</span>
          </div>
          <div class="intro-box">
            <div class="intro-content" :class="{ collapsed: !isExpanded }" ref="introContentRef">
              {{ companion.intro }}
            </div>
            <div class="expand-btn" @click="isExpanded = !isExpanded" v-if="shouldShowExpand">
              {{ isExpanded ? '收起' : '展开' }}
              <el-icon :class="{ 'is-expanded': isExpanded }"><ArrowDown /></el-icon>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="detail-tabs">
          <div
            class="tab-item"
            :class="{ active: currentTab === 'services' }"
            @click="currentTab = 'services'"
          >
            选择项目
          </div>
          <div
            class="tab-item"
            :class="{ active: currentTab === 'comments' }"
            @click="currentTab = 'comments'"
          >
            TA的评价
          </div>
        </div>

        <!-- Content -->
        <div class="tab-content">
          <div v-if="currentTab === 'services'" class="service-list">
            <div
              class="service-card"
              v-for="service in serviceList"
              :key="service.id"
              @click="goToServiceDetail(service)"
            >
              <el-image :src="service.image" class="service-image" fit="cover" loading="lazy" />
              <div class="service-info">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-desc">{{ service.description }}</div>
                <div class="service-meta">
                  <span class="service-price">¥{{ service.price }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    class="book-btn"
                    round
                    @click.stop="goToOrder(service)"
                    >立即预约</el-button
                  >
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentTab === 'comments'" class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <el-avatar :size="30" :src="getCompanionAvatar(comment.userAvatar)" />
                <span class="username">{{ comment.userName }}</span>
                <div class="score-display">
                  <el-icon color="#F7BA2A"><StarFilled /></el-icon>
                  <span class="score-text">{{ comment.score.toFixed(1) }}</span>
                </div>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-date">{{ comment.time }}</div>
            </div>
          </div>
        </div>
      </template>
      <div v-else style="padding: 50px; text-align: center; color: #999">
        加载中或未找到该陪诊师...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'companion-detail',
})
import { ref, onMounted, watch, onUnmounted, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCompanionStore } from '@/stores/companion'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  StarFilled,
  Star,
  Female,
  Male,
  Document,
  ChatLineRound,
  ArrowDown,
} from '@element-plus/icons-vue'
import MobileImageViewer from '../../components/MobileImageViewer.vue'
import { getCompanions, getCompanionDetail, getCompanionReviews } from '@/api/companion'
import { getServices } from '@/api/service'
import { getCompanionAvatar } from '@/constants/avatar'
import type { Companion } from '@/types/api'
import type { ServiceItem } from '@/types/api'
import type { CompanionReview } from '@/types/api'

const router = useRouter()
const route = useRoute()
const companionStore = useCompanionStore()
const userStore = useUserStore()
const currentTab = ref('services')
const introContentRef = ref<HTMLElement | null>(null)
const showViewer = ref(false)

// 从 API 获取的数据
type CompanionDetailModel = Omit<Companion, 'collected'> & { collected: number }
const companion = ref<CompanionDetailModel | null>(null)
const serviceList = ref<ServiceItem[]>([])
const comments = ref<CompanionReview[]>([])
const loading = ref(false)

// 获取评论数据
async function fetchComments() {
  if (!companion.value) return
  try {
    const res = await getCompanionReviews(companion.value.id, { page: 1, size: 10 })
    comments.value = res.list || []
  } catch (error) {
    console.error('获取评论失败:', error)
  }
}

const isExpanded = ref(false)
const shouldShowExpand = ref(false)

// 获取陪诊师列表（用于查找当前陪诊师）
const companionListData = ref<CompanionDetailModel[]>([])

// 获取陪诊师详情
async function fetchCompanionDetail() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    // 使用 getCompanionDetail 获取单个陪诊师详情
    const res = await getCompanionDetail(id)
    if (res) {
      companion.value = {
        ...res,
        collected: typeof res.collected === 'number' ? res.collected : res.collected ? 1 : 0,
      } as CompanionDetailModel
      checkIntroOverflow()
      // 获取评论数据
      fetchComments()
    }
  } catch (error) {
    console.error('获取陪诊师详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取服务列表
async function fetchServices() {
  try {
    serviceList.value = await getServices()
  } catch (error) {
    console.error('获取服务列表失败:', error)
  }
}

onMounted(() => {
  fetchCompanionDetail()
  fetchServices()
  fetchComments()
})

const checkIntroOverflow = async () => {
  shouldShowExpand.value = false
  await nextTick()
  if (introContentRef.value) {
    const lineHeight = parseFloat(getComputedStyle(introContentRef.value).lineHeight)
    // Check if scrollHeight is significantly larger than 2 lines (allow small buffer)
    if (introContentRef.value.scrollHeight > lineHeight * 2 + 5) {
      shouldShowExpand.value = true
    }
  }
}

const toggleCollection = async () => {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }
  if (!companion.value) return

  const wasFavorite = companionStore.isFavorite(companion.value.id)
  await companionStore.toggleFavorite(companion.value.id)
  const isNowFavorite = companionStore.isFavorite(companion.value.id)

  if (wasFavorite === isNowFavorite) return

  if (isNowFavorite) {
    ElMessage.success('收藏成功')
    const current = typeof companion.value.collected === 'number' ? companion.value.collected : 0
    companion.value.collected = current + 1
  } else {
    ElMessage.success('已取消收藏')
    const current = typeof companion.value.collected === 'number' ? companion.value.collected : 0
    if (current > 0) companion.value.collected = current - 1
  }
}

// 监听路由变化，重新获取数据
watch(
  () => route.params.id,
  () => {
    fetchCompanionDetail()
  },
)

const goToOrder = (service: any) => {
  if (!userStore.isLogin) {
    setTimeout(() => {
      router.push('/login')
    }, 100)
    return
  }
  router.push({
    name: 'order-create',
    query: { serviceId: service.id, companionId: companion.value?.id },
  })
}

const goToServiceDetail = (service: any) => {
  router.push({
    path: `/service/${service.id}`,
    query: { companionId: companion.value?.id },
  })
}
</script>

<style scoped lang="scss">
.companion-detail-page {
  background-color: #fff;
  height: 100%;
  overflow: hidden !important;
  display: flex;
  flex-direction: column;
  max-width: 750px;
  margin: 0 auto;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 40px; /* Space for content */
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  height: 44px;
  padding-top: env(safe-area-inset-top);
  height: calc(44px + env(safe-area-inset-top));
  box-sizing: border-box;
  background-color: #fff;
  font-size: 18px;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .nav-left {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    width: 80px;

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
    width: 80px;
  }
}

.cover-image-container {
  width: 100%;
  padding-bottom: 60%; /* Adjusted Aspect Ratio */
  position: relative;

  .cover-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.profile-header {
  padding: 0 15px;
  margin-top: 15px;
  position: relative;
  z-index: 10;
  margin-bottom: 15px;

  .info-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 20px 15px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 20px;

    .card-top {
      display: flex;
      align-items: flex-start;
      gap: 15px;

      .left-avatar {
        flex-shrink: 0;
      }

      .center-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 5px;

        .name-row {
          display: flex;
          align-items: center;
          gap: 8px;

          .name {
            font-size: 20px;
            font-weight: bold;
            color: #333;
          }

          .gender-icon {
            font-size: 14px;
            &.female {
              color: #ff6699;
            }
            &.male {
              color: #409eff;
            }
          }

          .age {
            font-size: 13px;
            color: #666;
          }
        }

        .tags-row {
          display: flex;
          gap: 6px;

          .experience-tag {
            font-size: 11px;
            color: #fff;
            background-color: #409eff;
            padding: 2px 8px;
            border-radius: 10px;
          }
        }
      }

      .right-action {
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

    .card-stats {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding-top: 10px;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;

        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
        }
      }

      .stat-divider {
        width: 1px;
        height: 20px;
        background-color: #eee;
      }
    }
  }
}

.intro-section {
  padding: 0 15px;
  margin-bottom: 20px;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }

  .intro-box {
    background-color: #f7f8fa;
    border-radius: 8px;
    padding: 12px;
    position: relative;

    .intro-content {
      font-size: 14px;
      color: #333;
      line-height: 1.6;
      text-align: justify;

      &.collapsed {
        display: -webkit-box;
        -webkit-line-clamp: 2; /* Show 2 lines initially */
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .expand-btn {
      position: absolute;
      bottom: 8px;
      right: 12px;
      font-size: 12px;
      color: #409eff;
      cursor: pointer;
      display: flex;
      align-items: center;
      background: linear-gradient(90deg, rgba(247, 248, 250, 0) 0%, rgba(247, 248, 250, 1) 20%);
      padding-left: 20px;

      .el-icon {
        margin-left: 2px;
        transition: transform 0.3s;
        &.is-expanded {
          transform: rotate(180deg);
        }
      }
    }
  }
}

.detail-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #eee;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 15px 0;
    font-size: 15px;
    cursor: pointer;
    transition: none;

    &.active {
      color: #409eff;
      font-weight: bold;
      border-bottom: 2px solid #409eff;
    }
  }
}

.tab-content {
  padding: 15px;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.service-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  padding: 10px;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: none;

  .service-image {
    width: 90px;
    height: 90px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .service-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .service-name {
      font-size: 16px;
      font-weight: bold;
    }

    .service-desc {
      font-size: 12px;
      color: #999;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .service-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .service-price {
        color: #f56c6c;
        font-size: 16px;
        font-weight: bold;
      }

      .book-btn {
        height: 32px;
        border-radius: 16px;
        padding: 0 15px;
        font-weight: 500;
        box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
      }
    }
  }
}

/* Fix for Image Viewer to match mobile width */
/* Removed scoped style for image viewer as it needs to be global when teleported */
</style>

<style lang="scss">
/* Global fix for Image Viewer to match mobile width */
.el-image-viewer__wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 750px;

  .el-image-viewer__mask {
    width: 100%;
    height: 100%;
  }

  /* Ensure canvas/image is also contained if necessary, 
     but wrapper constraint usually handles the mask and interaction area */
}
</style>

<style scoped lang="scss">
.comment-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;

  .comment-item {
    padding: 15px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;

      .username {
        font-size: 14px;
        font-weight: 500;
        flex: 1;
      }

      .score-display {
        display: flex;
        align-items: center;
        gap: 2px;

        .score-text {
          font-size: 14px;
          color: #f7ba2a;
          font-weight: bold;
          margin-left: 2px;
        }
      }
    }

    .comment-content {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }

    .comment-date {
      font-size: 12px;
      color: #999;
    }
  }
}

.detail-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background-color: #fff;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  z-index: 99;
  max-width: 750px;

  .action-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: bold;
  }
}

:deep(.appointment-drawer) {
  border-radius: 16px 16px 0 0;
  max-width: 750px;
  margin: 0 auto;

  .el-drawer__body {
    padding: 0;
    overflow: hidden; /* Manage internal scroll */
    display: flex;
    flex-direction: column;
    max-height: 85vh;
  }
}

.appointment-content {
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
  height: 100%;
}

.modal-companion-card {
  background-color: #fff;
  height: 104px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .card-name {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .card-tag {
      height: 20px;
      line-height: 18px;
      padding: 0 6px;
    }
  }
}

.modal-service-container {
  padding: 16px;
  overflow-y: auto;
  overscroll-behavior: none;
  flex: 1;
}

.modal-service-grid {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 5px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.modal-service-item {
  background-color: #fff;
  border-radius: 8px;
  width: calc((100% - 36px) / 4); /* Show 4 items (3 gaps of 12px) */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
    border-color: #409eff;
    background-color: #ecf5ff;
  }

  .item-icon {
    width: 100%;
    height: 0;
    padding-bottom: 100%; /* Square aspect ratio */
    display: block;
    border-radius: 8px 8px 0 0;
    position: relative;

    :deep(img) {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .item-info {
    padding: 8px;
    text-align: center;

    .item-name {
      font-size: 13px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .item-desc {
      display: none; /* Hide description in small card to match "Image 2" concise style */
    }
  }

  .item-price {
    font-size: 14px;
    color: #f56c6c;
    font-weight: bold;
    text-align: center;
    padding-bottom: 8px;
    line-height: 1.2;
  }
}

.view-more-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  margin-top: 8px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 8px;

  &:active {
    background-color: #f5f5f5;
  }
}
</style>
