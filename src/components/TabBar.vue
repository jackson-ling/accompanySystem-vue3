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
      <el-icon v-else :size="24">
        <component :is="item.icon" />
      </el-icon>
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const aiIcon = new URL('../assets/ai-icon.svg', import.meta.url).href

const router = useRouter()
const route = useRoute()

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
</style>
