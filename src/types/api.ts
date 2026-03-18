/**
 * 统一响应格式
 * @example 成功响应 { code: 200, msg: "success", data: {...} }
 * @example 失败响应 { code: 400, msg: "错误信息", data: null }
 */
export interface ApiResponse<T> {
  /** 响应码：200=成功，400=请求错误，401=未授权，500=服务器错误 */
  code: number
  /** 响应消息：成功时返回 "success"，失败时返回错误信息 */
  msg?: string
  message?: string
  /** 响应数据 */
  data: T
  timestamp?: number
}

export interface PageParams {
  page?: number
  size?: number
}

export interface PaginatedResult<T> {
  total: number
  list: T[]
  page?: number
  size?: number
  pageSize?: number
}

export interface UserProfile {
  id: number
  nickname: string
  avatar: string
  phone: string
  balance: number
}

// 登录/注册返回的数据结构（与后端LoginVo保持一致）
export interface AuthResult {
  token: string
  userId: number
  nickname: string
  avatar: string
  userType: number
  phone: string
}

export interface Patient {
  id: number
  name: string
  phone: string
  address: string
  relationship: string
  default?: boolean
}

export interface ServiceItem {
  id: number
  name: string
  description: string
  price: number
  type?: string
  sales?: number
  image?: string
  cover?: string
  duration?: string
}

export interface ServiceCategory {
  id: number
  name: string
  icon?: string
}

export interface Companion {
  id: number
  name: string
  avatar: string
  gender?: string
  age?: number
  score?: number
  orders?: number
  collected?: boolean
  comments?: number
  certified?: boolean
  qualified?: boolean
  experience?: string
  services?: number[]
  rating?: number
  tags?: string[]
  intro?: string
}

export interface CompanionReview {
  id: number
  userName: string
  userAvatar?: string
  score: number
  content: string
  images?: string[]
  time: string
}

export interface Order {
  id: string | number
  serviceId: number
  serviceName: string
  image?: string
  companionId?: number
  companionName?: string
  companionPhone?: string
  companionAvatar?: string
  patientName?: string
  hospital: string
  department: string
  appointmentTime: string
  pickupOption: string
  remarks?: string
  remark?: string
  amount: number
  price: number
  status: number
  createTime?: string
  payTime?: string
  time?: string
  phone?: string
  clientComment?: {
    score: number
    content: string
    time?: string
  }
}

export interface AvailableOrder {
  id: string | number
  serviceName: string
  hospital: string
  department: string
  appointmentTime: string
  pickupOption: string
  amount: number
  distance?: string
  publishTime?: string
  patientName?: string
}

export interface CreateOrderPayload {
  serviceId: number
  companionId?: number
  patientId: number
  hospital: string
  department: string
  appointmentTime: string // 格式: "2026-03-17 15:00:00"
  pickupOption: number // 1-医院门口, 2-指定地点
  pickupAddress?: string // pickupOption=2时必填
  remarks?: string
}

export interface MessageConversation {
  id: string
  type: string
  name: string
  lastMessageTime: string // 后端返回的字段名
  lastMessage: string // 后端返回的字段名
  icon?: string
  avatar?: string
  unreadCount?: number
  targetId?: number
}

// 前端展示用的扩展类型
export interface MessageConversationDisplay extends Omit<
  MessageConversation,
  'lastMessage' | 'lastMessageTime'
> {
  time: string // 用于前端显示的时间
  preview: string // 用于前端显示的消息预览
  bgColor?: string
}

export interface ChatMessage {
  id: number
  text: string
  isMe: boolean
  time: string
  type: string
}

export interface RechargeRecord {
  id: number
  amount: number
  method: string
  time: string
  status: string
}

export interface RechargeConfig {
  amounts: number[]
  methods: string[]
}

export interface FavoriteItem {
  id: number
  type: string
  itemId: number
  name: string
  avatar?: string
  description?: string
  time: string
  gender?: string
  age?: number
  experience?: string
  orders?: number
  score?: number
  comments?: number
}

export interface ConsumptionRecord {
  id: number
  type: string
  title: string
  amount: number
  balance: number
  time: string
}

export interface UploadResult {
  url: string
}

export interface DictItem {
  id: number
  name: string
}

export interface HospitalItem extends DictItem {
  address?: string
  level?: string
}

export interface DepartmentItem extends DictItem {
  hospitalId?: number
}

// 陪诊师统计数据
export interface CompanionStatistics {
  todayIncome: number
  todayOrders: number
  rating: number
  followers: number
  totalOrders: number
  workDays: number
}

// 陪诊师收入明细
export interface IncomeRecord {
  id: number
  orderId: string
  serviceName: string
  amount: number
  time: string
  status: 'pending' | 'completed' | 'cancelled'
}

export interface FeedbackItem {
  id: number
  content: string
  images?: string[]
  contact?: string
  status?: string
  reply?: string
  time: string
}
