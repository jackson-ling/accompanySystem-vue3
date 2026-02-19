import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MessageConversation } from '@/types/api'
import { getMessageConversations, deleteMessage as deleteMessageApi } from '@/api/message'
import { getChatMessages } from '@/api/chat'
export type { ChatMessage } from '@/types/api'

// 扩展消息会话类型，添加 bgColor 字段
export interface MessageConversationEx extends MessageConversation {
  bgColor?: string
}

// 简化的聊天消息类型（用于 store 内部，不含 id）
export interface SimpleChatMessage {
  text: string
  isMe?: boolean
  time?: string
  type?: string
}

export const useMessageStore = defineStore('message', () => {
  // Chat History Storage - key: 聊天类型，value: 消息列表
  const chatHistory = ref<Record<string, SimpleChatMessage[]>>({})
  const messageList = ref<MessageConversationEx[]>([])
  const loading = ref(false)

  // 获取消息会话列表
  async function fetchConversations() {
    loading.value = true
    try {
      const data = await getMessageConversations()
      messageList.value = data
    } catch (error) {
      console.error('获取消息列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取聊天历史
  async function fetchChatHistory(type: string) {
    loading.value = true
    try {
      const data = await getChatMessages(type)
      chatHistory.value[type] = data
    } catch (error) {
      console.error('获取聊天历史失败:', error)
    } finally {
      loading.value = false
    }
  }

  // Delete a message conversation by type/id
  const deleteMessage = async (id: string) => {
    try {
      await deleteMessageApi(id)

      // Remove from message list
      const index = messageList.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        messageList.value.splice(index, 1)
      }

      // Also clear chat history for this conversation
      if (chatHistory.value[id]) {
        delete chatHistory.value[id]
      }
    } catch (error) {
      console.error('删除消息失败:', error)
    }
  }

  // Add a message to history
  const addMessage = (id: string, message: any) => {
    if (!chatHistory.value[id]) {
      chatHistory.value[id] = []
    }
    chatHistory.value[id].push(message)
    // Update preview
    const listItem = messageList.value.find((item) => item.id === id)
    if (listItem) {
      listItem.preview = message.text
      listItem.time = message.time || '刚刚'
    }
  }

  // Clear messages content but keep the conversation item
  const clearMessages = (id: string) => {
    const item = messageList.value.find((item) => item.id === id)
    if (item) {
      item.preview = ''
      item.time = ''
    }
    // Clear history
    if (chatHistory.value[id]) {
      chatHistory.value[id] = []
    }
  }

  // Reset messages (optional, for testing or re-login)
  const resetMessages = () => {
    chatHistory.value = {}
    messageList.value = []
  }

  return {
    chatHistory,
    messageList,
    loading,
    fetchConversations,
    fetchChatHistory,
    addMessage,
    deleteMessage,
    clearMessages,
    resetMessages,
  }
})
