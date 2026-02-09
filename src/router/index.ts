import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/user'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    showTabBar?: boolean
    isTab?: boolean
  }
}

import HomeView from '@/views/HomeView.vue'
import CategoryDetail from '@/views/CategoryDetail.vue'
import ServiceDetail from '@/views/ServiceDetail.vue'

// Lazy load new views
const CompanionList = () => import('@/views/Companion/CompanionList.vue')
const CompanionDetail = () => import('@/views/Companion/CompanionDetail.vue')
const OrderCreate = () => import('@/views/Order/OrderCreate.vue')
const AIChat = () => import('@/views/AIChat/AIChat.vue')
const ServiceCategory = () => import('@/views/ServiceCategory.vue')
const PatientList = () => import('@/views/User/PatientList.vue')
const PatientAdd = () => import('@/views/User/PatientAdd.vue')
const MessageList = () => import('@/views/Message/MessageList.vue')
const ChatDetail = () => import('@/views/Message/ChatDetail.vue')
const UserProfile = () => import('@/views/User/UserProfile.vue')
const Search = () => import('@/views/Search.vue')
const Login = () => import('@/views/Login.vue')
const CompanionWorkbench = () => import('@/views/Companion/CompanionWorkbench.vue')
const CompanionProfileEdit = () => import('@/views/Companion/CompanionProfileEdit.vue')
const OrderHall = () => import('@/views/Companion/OrderHall.vue')
const IncomeDetails = () => import('@/views/Companion/IncomeDetails.vue')
const ServiceOrders = () => import('@/views/Companion/ServiceOrders.vue')
const ServiceOrderDetail = () => import('@/views/Companion/ServiceOrderDetail.vue')
const OrderList = () => import('@/views/Order/OrderList.vue')
const Recharge = () => import('@/views/User/Recharge.vue')
const RechargeRecord = () => import('@/views/User/RechargeRecord.vue')
const ConsumptionRecord = () => import('@/views/User/ConsumptionRecord.vue')
const Favorites = () => import('@/views/User/Favorites.vue')
const Settings = () => import('@/views/User/Settings.vue')
const ChangePassword = () => import('@/views/User/ChangePassword.vue')
const Feedback = () => import('@/views/User/Feedback.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { showTabBar: true, isTab: true },
  },
  {
    path: '/search',
    name: 'search',
    component: Search,
    meta: { showTabBar: false },
  },
  {
    path: '/service-category',
    name: 'service-category',
    component: ServiceCategory,
    meta: { showTabBar: false, isTab: false },
  },
  {
    path: '/category/:id',
    name: 'category',
    component: CategoryDetail,
  },
  {
    path: '/service/:id',
    name: 'service',
    component: ServiceDetail,
  },
  {
    path: '/companion',
    name: 'companion',
    component: CompanionList,
    meta: { showTabBar: true, isTab: true },
  },
  {
    path: '/companion/:id',
    name: 'companion-detail',
    component: CompanionDetail,
    meta: { showTabBar: false },
  },
  {
    path: '/companion/profile-edit',
    name: 'companion-profile-edit',
    component: CompanionProfileEdit,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/companion/order-hall',
    name: 'order-hall',
    component: OrderHall,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/companion/income-details',
    name: 'income-details',
    component: IncomeDetails,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/companion/service-orders',
    name: 'service-orders',
    component: ServiceOrders,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/companion/service-order/:id',
    name: 'service-order-detail',
    component: ServiceOrderDetail,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/order/create',
    name: 'order-create',
    component: OrderCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/user/patient',
    name: 'patient-list',
    component: PatientList,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/user/patient/add',
    name: 'patient-add',
    component: PatientAdd,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/ai-chat',
    name: 'ai-chat',
    component: AIChat,
    meta: { showTabBar: true, isTab: true },
  },
  {
    path: '/messages',
    name: 'messages',
    component: MessageList,
    meta: { showTabBar: true, isTab: true, requiresAuth: true },
  },
  {
    path: '/message/chat/:id',
    name: 'chat-detail',
    component: ChatDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfile,
    meta: { showTabBar: true, isTab: true, requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { showTabBar: false },
  },
  {
    path: '/user/settings',
    name: 'settings',
    component: Settings,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/user/change-password',
    name: 'change-password',
    component: ChangePassword,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/user/recharge',
    name: 'recharge',
    component: Recharge,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/user/recharge-record',
    name: 'recharge-record',
    component: RechargeRecord,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/user/consumption-record',
    name: 'consumption-record',
    component: ConsumptionRecord,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/user/favorites',
    name: 'favorites',
    component: Favorites,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/user/feedback',
    name: 'feedback',
    component: Feedback,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/order/list',
    name: 'order-list',
    component: OrderList,
    meta: { showTabBar: false, requiresAuth: true },
  },
  {
    path: '/companion/workbench',
    name: 'companion-workbench',
    component: CompanionWorkbench,
    meta: { showTabBar: false, requiresAuth: true },
  },
  // Catch-all redirect to home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLogin) {
    next({
      path: '/login',
      query: { from: 'guard', redirect: to.fullPath },
    })
  } else {
    next()
  }
})

export default router
