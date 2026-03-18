import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MessageConversation, MessageConversationDisplay } from '@/types/api'
import {
  getMessageConversations,
  deleteMessage as deleteMessageApi,
  markMessageRead,
} from '@/api/message'
import { getChatMessages } from '@/api/chat'
export type { ChatMessage } from '@/types/api'

// 简化的聊天消息类型（用于 store 内部，不含 id）
export interface SimpleChatMessage {
  text: string
  isMe?: boolean
  time?: string
  type?: string
}

/**
 * 将后端返回的MessageConversation转换为前端显示格式
 */
function mapToDisplay(item: MessageConversation): MessageConversationDisplay {
  return {
    ...item,
    time: item.lastMessageTime || '',
    preview: item.lastMessage || '',
    bgColor: item.type === 'service' ? '#409eff' : undefined,
  }
}

export const useMessageStore = defineStore('message', () => {
  // Chat History Storage - key: 聊天类型，value: 消息列表
  const chatHistory = ref<Record<string, SimpleChatMessage[]>>({})
  const messageList = ref<MessageConversationDisplay[]>([])
  const loading = ref(false)
  // 未读消息数量
  const unreadCount = ref(0)

  // 标记消息已读
  async function markAsRead(id: string) {
    try {
      await markMessageRead(id)
      // 更新本地消息列表的未读状态
      const messageItem = messageList.value.find((item) => item.id === id)
      if (messageItem && messageItem.unreadCount && messageItem.unreadCount > 0) {
        // 减少全局未读数量
        unreadCount.value = Math.max(0, unreadCount.value - messageItem.unreadCount)
        // 清除该会话的未读数量
        messageItem.unreadCount = 0
      }
    } catch (error) {
      console.error('标记已读失败:', error)
      throw error
    }
  }

  // 获取消息会话列表
  async function fetchConversations() {
    loading.value = true
    try {
      const data = await getMessageConversations()
      // 将后端数据映射为前端显示格式
      messageList.value = data.map(mapToDisplay)

      // 计算总的未读消息数量（基于会话列表中的未读数量）
      const totalUnread = messageList.value.reduce((total, item) => {
        return total + (item.unreadCount || 0)
      }, 0)
      unreadCount.value = totalUnread
    } catch (error) {
      console.error('获取消息列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取聊天历史
  async function fetchChatHistory(type: string, targetId?: number) {
    loading.value = true
    try {
      const params = targetId ? { targetId } : undefined
      const data = await getChatMessages(type, params)
      chatHistory.value[type] = data
    } catch (error) {
      console.error('获取聊天历史失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 删除消息会话
  const deleteMessage = async (id: string) => {
    try {
      await deleteMessageApi(id)

      // 查找要删除的消息项
      const index = messageList.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        const deletedItem = messageList.value[index]
        // 如果删除的会话有未读消息，需要减少全局未读数量
        if (deletedItem.unreadCount && deletedItem.unreadCount > 0) {
          unreadCount.value = Math.max(0, unreadCount.value - deletedItem.unreadCount)
        }
        // 从消息列表中移除
        messageList.value.splice(index, 1)
      }

      // 清除对应的聊天历史
      if (chatHistory.value[id]) {
        delete chatHistory.value[id]
      }
    } catch (error) {
      console.error('删除消息失败:', error)
      throw error
    }
  }

  // 添加消息到历史记录
  const addMessage = (id: string, message: any) => {
    if (!chatHistory.value[id]) {
      chatHistory.value[id] = []
    }
    chatHistory.value[id].push(message)

    // 更新消息列表中的预览信息
    const listItem = messageList.value.find((item) => item.id === id)
    if (listItem) {
      listItem.preview = message.text
      listItem.time = message.time || '刚刚'

      // 如果是接收到的消息（不是自己发送的），增加未读数量
      if (!message.isMe) {
        listItem.unreadCount = (listItem.unreadCount || 0) + 1
        unreadCount.value += 1
      }
    }
  }

  // 清除消息内容但保留会话项
  const clearMessages = (id: string) => {
    const item = messageList.value.find((item) => item.id === id)
    if (item) {
      // 如果清除的会话有未读消息，需要减少全局未读数量
      if (item.unreadCount && item.unreadCount > 0) {
        unreadCount.value = Math.max(0, unreadCount.value - item.unreadCount)
      }
      item.preview = ''
      item.time = ''
      item.unreadCount = 0
    }
    // 清除聊天历史
    if (chatHistory.value[id]) {
      chatHistory.value[id] = []
    }
  }

  // 重置消息（用于测试或重新登录）
  const resetMessages = () => {
    chatHistory.value = {}
    messageList.value = []
    unreadCount.value = 0
  }

  return {
    chatHistory,
    messageList,
    loading,
    unreadCount,
    fetchConversations,
    fetchChatHistory,
    markAsRead,
    addMessage,
    deleteMessage,
    clearMessages,
    resetMessages,
  }
})
