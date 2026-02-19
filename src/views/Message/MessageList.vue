<template>
  <div class="message-list-page">
    <div class="page-header">
      <div class="header-left" @click="goHome">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">消息中心</div>
    </div>

    <div class="message-list">
      <div
        v-for="item in messageList"
        :key="item.id"
        class="message-item"
        @click="handleItemClick(item)"
      >
        <div class="icon-box-wrapper" :style="item.bgColor ? { backgroundColor: item.bgColor } : {}">
          <div class="icon-box">
            <el-icon v-if="item.icon" :size="28" color="#fff">
              <component :is="iconMap[item.icon]" />
            </el-icon>
            <el-avatar
              v-else-if="item.avatar"
              :size="48"
              :src="item.avatar"
              shape="square"
              style="border-radius: 8px"
            />
          </div>
          <!-- 未读红标 -->
          <span v-if="item.unreadCount && item.unreadCount > 0" class="unread-badge-avatar">
            {{ item.unreadCount > 99 ? '99+' : item.unreadCount }}
          </span>
        </div>
        <div class="content-box">
          <div class="title-row">
            <span class="name">{{ item.name }}</span>
            <span class="time">{{ item.time }}</span>
          </div>
          <div class="message-preview">
            {{ item.preview }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { Headset, Bell, ArrowLeft } from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/message'
import { storeToRefs } from 'pinia'
import { markMessageRead } from '@/api/message'

const router = useRouter()
const messageStore = useMessageStore()
const { messageList } = storeToRefs(messageStore)

// 组件挂载时获取消息列表
onMounted(() => {
  messageStore.fetchConversations()
})

const iconMap: Record<string, any> = {
  Headset,
  Bell,
}

const goHome = () => {
  router.push('/')
}

const handleItemClick = async (item: any) => {
  const { type, id } = item

  // 如果有未读消息，标记已读
  if (item.unreadCount && item.unreadCount > 0) {
    try {
      await markMessageRead(id)
      // 更新本地状态
      item.unreadCount = 0
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  try {
    if (type === 'service') {
      router.push('/message/chat/service')
    } else if (type === 'system') {
      router.push('/message/chat/system')
    } else if (type === 'companion') {
      router.push('/message/chat/companion')
    }
  } catch (error) {
    console.error('Navigation error:', error)
  }
}
</script>

<style scoped lang="scss">
.message-list-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 60px; /* 留出 TabBar 高度 */
}

.page-header {
  background-color: #fff;
  padding: 12px 15px;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-left {
  position: absolute;
  left: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.message-list {
  background-color: #fff;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  position: relative;
  transition: background-color 0.2s;
  cursor: pointer;

  &:active {
    background-color: #fafafa;
  }

  &::after {
    content: '';
    position: absolute;
    left: 76px;
    right: 0;
    bottom: 0;
    height: 1px;
    background-color: #f5f5f5;
  }

  .icon-box-wrapper {
    position: relative;
    width: 48px;
    height: 48px;
    margin-right: 12px;
    flex-shrink: 0;

    .icon-box {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      &.service {
        background-color: #409eff;
      }

      &.system {
        background-color: #ff9900;
      }
    }

    .unread-badge-avatar {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background-color: #f56c6c;
      color: #fff;
      font-size: 12px;
      line-height: 18px;
      text-align: center;
      border-radius: 9px;
      border: 2px solid #fff;
    }
  }

  .content-box {
    flex: 1;
    min-width: 0;

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;

      .name {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }

      .time {
        font-size: 12px;
        color: #999;
      }
    }

    .message-preview {
      font-size: 14px;
      color: #999;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
