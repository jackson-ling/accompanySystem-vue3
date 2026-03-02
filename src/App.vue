<template>
  <div class="app-container">
    <router-view v-slot="{ Component, route }">
      <transition :name="transitionName" @before-leave="onBeforeLeave" @enter="onEnter">
        <keep-alive :include="cachedViews">
          <component
            :is="Component"
            :key="route.path"
            class="app-page"
            :class="{
              'has-tabbar': route.meta.showTabBar,
              'page-top': !route.meta.showTabBar,
            }"
          />
        </keep-alive>
      </transition>
    </router-view>
    <TabBar v-show="tabBarVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const transitionName = ref('')
const previousPath = ref('')
const tabBarVisible = ref(false)
let tabBarTimer: ReturnType<typeof setTimeout> | null = null

// 初始化登录状态
onMounted(() => {
  userStore.init()
})

// 清理定时器，避免内存泄漏
onUnmounted(() => {
  if (tabBarTimer) {
    clearTimeout(tabBarTimer)
    tabBarTimer = null
  }
})

// State to track navigation context
const isFromTab = ref(false)
const fromRouteName = ref<string | null | undefined>(null)

// Watch for tab bar visibility changes with delay logic
watch(
  () => route.meta.showTabBar,
  (newVal) => {
    if (tabBarTimer) {
      clearTimeout(tabBarTimer)
      tabBarTimer = null
    }

    if (newVal) {
      tabBarVisible.value = true
    } else {
      // Delay hiding the tab bar to avoid flash before transition starts
      // The entering page (z-index 2001) will cover the tab bar (z-index 999)
      tabBarTimer = setTimeout(() => {
        tabBarVisible.value = false
        tabBarTimer = null
      }, 350)
    }
  },
  { immediate: true },
)

// Track history position
const historyPosition = ref(history.state?.position || 0)

// Cache views that need to preserve state (Home, Lists, etc.)
const alwaysCached = ['HomeView', 'ServiceCategory', 'CompanionList', 'PatientList', 'UserProfile']
const cachedViews = ref([...alwaysCached])

// Scroll Position Management
const scrollPositions = new Map<string, number>()

// Capture the leaving path before route updates
router.beforeEach((to, from, next) => {
  previousPath.value = from.fullPath
  isFromTab.value = !!from.meta.isTab
  fromRouteName.value = from.name as string

  // Special handling for 'profile' tab:
  // If entering Profile from another Tab, clear its saved scroll position to ensure it starts at top.
  // If entering from a sub-page (not a tab), we preserve the scroll position (handled by onEnter).
  if (to.name === 'profile' && from.meta.isTab) {
    scrollPositions.delete(to.fullPath)
  }

  next()
})

const onBeforeLeave = (el: Element) => {
  // If going back (slide-right), do not save scroll position for the leaving page
  // We also explicitly delete any existing record to ensure a fresh start next time
  if (transitionName.value === 'slide-right') {
    if (previousPath.value) {
      scrollPositions.delete(previousPath.value)
    }
    return
  }

  // Save scroll position of the leaving element using the captured path
  if (previousPath.value) {
    const scrollTarget = el.querySelector('.scroll-content') || el
    scrollPositions.set(previousPath.value, scrollTarget.scrollTop)
  }
}

const onEnter = (el: Element) => {
  // Restore scroll position for the entering element
  const key = route.fullPath
  const savedPos = scrollPositions.get(key) || 0
  const scrollTarget = el.querySelector('.scroll-content') || el
  // Use nextTick to ensure content is rendered before scrolling
  nextTick(() => {
    scrollTarget.scrollTop = savedPos
  })
}

router.afterEach((to, from) => {
  const newPos = history.state?.position || 0
  const oldPos = historyPosition.value

  // Transition Logic
  if (to.meta.isTab && from.meta.isTab) {
    transitionName.value = ''
  } else if (from.name === 'login' && to.meta.isTab) {
    transitionName.value = 'slide-right'
  } else if (to.name === 'login') {
    transitionName.value = 'slide-left'
  } else if (to.meta.isTab && newPos > oldPos) {
    transitionName.value = ''
  } else if (newPos > oldPos) {
    transitionName.value = 'slide-left'
  } else if (newPos < oldPos) {
    transitionName.value = 'slide-right'
  } else {
    transitionName.value = ''
  }

  // Cache Management (Dynamic KeepAlive)
  // If going forward (slide-left), cache the target page
  if (transitionName.value === 'slide-left') {
    if (to.name && !cachedViews.value.includes(to.name as string)) {
      cachedViews.value.push(to.name as string)
    }
  }

  // If going back (slide-right), remove the 'from' page from cache (unless it's always cached)
  if (transitionName.value === 'slide-right') {
    if (from.name && !alwaysCached.includes(from.name as string)) {
      const index = cachedViews.value.indexOf(from.name as string)
      if (index > -1) {
        cachedViews.value.splice(index, 1)
      }
    }
  }

  historyPosition.value = newPos
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #f7f8fa;
}

/* 
  Force all pages to be absolute and scroll internally.
  This solves the 'jitter' and layout shift issues during transitions.
*/
:deep(.app-page) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: #f7f8fa;
  box-sizing: border-box;
  /* Ensure content doesn't get hidden behind TabBar */
  /* We can't apply padding-bottom globally because not all pages have TabBar. 
     But most mobile layouts handle this with safe-area padding. 
     Pages with TabBar should handle their own padding or we handle it here. */
}

:deep(.app-page.has-tabbar) {
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}

:deep(.app-page.page-top) {
  z-index: 1001;
}

/* Base Transition Styles */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
  /* position: absolute; already set on .app-page */
}

/* Slide Left (Push) */
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-enter-active {
  z-index: 2001 !important;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
}
.slide-left-leave-active {
  z-index: 1;
}
.slide-left-leave-to {
  transform: translateX(-30%);
}

/* Slide Right (Pop) */
.slide-right-enter-from {
  transform: translateX(-30%);
}
.slide-right-enter-active {
  z-index: 1;
}
.slide-right-leave-active {
  z-index: 2001 !important;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
}
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
