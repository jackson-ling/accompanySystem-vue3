<template>
  <div class="tab-bar">
    <div
      v-for="item in tabs"
      :key="item.path"
      class="tab-item"
      :class="{ active: currentPath === item.path, 'is-ai': !!item.image }"
      @click="handleTabClick(item)"
    >
      <div v-if="item.image" class="tab-icon-img">
        <img :src="item.image" alt="" />
      </div>
      <div v-else class="tab-icon-wrapper">
        <el-icon :size="24">
          <component :is="item.icon" />
        </el-icon>
        <!-- 未读消息红标 -->
        <span v-if="item.path === '/messages' && unreadCount > 0" class="unread-badge">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </div>
      <span class="tab-text">{{ item.text }}</span>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TabBar',
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUnreadMessageCount } from '@/api/message'

const aiIcon = new URL('../assets/ai-icon.svg', import.meta.url).href

const router = useRouter()
const route = useRoute()

const unreadCount = ref(0)

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const count = await getUnreadMessageCount()
    unreadCount.value = count || 0
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

onMounted(() => {
  fetchUnreadCount()
})

const currentPath = computed(() => route.path)

const tabs = [
  { text: '首页', icon: 'House', path: '/' },
  { text: '陪诊师', icon: 'User', path: '/companion' },
  { text: 'AI助手', icon: 'Cpu', path: '/ai-chat', image: aiIcon },
  { text: '消息', icon: 'ChatDotRound', path: '/messages' },
  { text: '我的', icon: 'UserFilled', path: '/profile' },
]

const handleTabClick = (item: any) => {
  router.push(item.path)
}
</script>

<style scoped lang="scss">
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  border-top: 1px solid #eee; /* This is the line user mentioned? */
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom);
  max-width: 750px;
  margin: 0 auto;
  -webkit-tap-highlight-color: transparent; /* Remove blue highlight */
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 10px;
  cursor: pointer;
  flex: 1;
  -webkit-tap-highlight-color: transparent;

  &.active {
    color: #409eff;
  }

  .tab-text {
    margin-top: 2px;
  }
}

.tab-item.is-ai {
  justify-content: flex-end;
  padding-bottom: 6px;

  .tab-text {
    margin-top: 0;
  }
}

.tab-icon-img {
  width: 34px;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.tab-icon-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: #f56c6c;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  transform: translate(50%, -50%);
}
</style>
