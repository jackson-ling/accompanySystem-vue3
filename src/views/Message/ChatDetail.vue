<template>
  <div class="chat-detail-page">
    <div class="page-header">
      <div class="back-btn" @click="handleBack">
        <el-icon :size="24" color="#333"><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">{{ pageTitle }}</div>
      <div
        class="header-right"
        @click.stop="toggleMenu"
        :style="{ visibility: chatType === 'system' ? 'hidden' : 'visible' }"
      >
        <template v-if="chatType !== 'system'">
          <div class="more-btn">
            <el-icon :size="24" color="#333"><MoreFilled /></el-icon>
          </div>

          <!-- Custom Menu -->
          <div class="custom-menu-mask" v-if="showMenu" @click.stop="showMenu = false"></div>
          <Transition name="menu-fade">
            <div class="custom-menu" v-if="showMenu">
              <div class="menu-arrow"></div>
              <div
                class="menu-item"
                v-if="chatType === 'companion'"
                @click.stop="handleMenuAction('delete')"
              >
                删除该聊天
              </div>
              <div class="menu-item" @click.stop="handleMenuAction('clear')">清空聊天记录</div>
            </div>
          </Transition>
        </template>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="chat-container" ref="chatContainer">
      <template v-for="(msg, index) in messages" :key="index">
        <div class="time-divider" v-if="msg.time">{{ msg.time }}</div>
        <div class="message-row" :class="msg.isMe ? 'right' : 'left'">
          <!-- Different avatars based on chat type -->
          <template v-if="!msg.isMe">
            <el-avatar
              v-if="chatType === 'service'"
              :size="40"
              :icon="Headset"
              class="avatar service-avatar"
            />
            <el-avatar
              v-else-if="chatType === 'system'"
              :size="40"
              :icon="Bell"
              class="avatar system-avatar"
            />
            <el-avatar
              v-else
              :size="40"
              src="https://placehold.co/100x100/ff99cc/fff?text=武"
              class="avatar companion-avatar"
            />
          </template>

          <el-avatar v-else :size="40" :icon="UserFilled" class="avatar user-avatar" />

          <div class="bubble" style="white-space: pre-wrap">
            {{ msg.text }}
          </div>
        </div>
      </template>
    </div>

    <!-- Input Area -->
    <div class="chat-input-area" v-if="chatType !== 'system'">
      <div class="input-box">
        <el-input
          v-model="inputText"
          placeholder="请输入消息..."
          @keyup.enter="sendMessage"
          class="chat-input"
        />
      </div>
      <el-button
        type="primary"
        class="send-btn"
        :disabled="!inputText.trim()"
        @click="sendMessage"
        round
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Headset, UserFilled, MoreFilled, Bell } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useMessageStore, type ChatMessage } from '@/stores/message'
import { sendChatMessage, deleteChat } from '@/api/chat'

const router = useRouter()
const route = useRoute()
const messageStore = useMessageStore()
const inputText = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const chatType = computed(() => route.params.id as string)
const pageTitle = computed(() => {
  if (chatType.value === 'system') return '系统通知'
  if (chatType.value === 'companion') return '武海艳'
  return '在线客服'
})

// Use messages from store
const messages = computed(() => {
  const type = Array.isArray(chatType.value) ? chatType.value[0] : chatType.value
  return messageStore.chatHistory[type] || []
})

const showMenu = ref(false)

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleMenuAction = (command: string) => {
  showMenu.value = false
  if (command === 'clear') {
    ElMessageBox.confirm('确定要清空当前聊天记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        // Ensure chatType is string
        const type = Array.isArray(chatType.value) ? chatType.value[0] : chatType.value

        // Clear messages in store
        messageStore.clearMessages(type)

        // If service chat, we might want to keep/restore welcome message, but for "clear" action,
        // usually user expects empty screen. If we want welcome message, we should re-add it.
        // For now, consistent with "clear", we leave it empty.

        ElMessage.success('已清空聊天记录')
      })
      .catch(() => {})
  } else if (command === 'delete') {
    // 使用 window.confirm 作为备选方案，或者确保 ElMessageBox 正确引入
    // 这里使用 ElMessageBox，并添加完整的错误处理
    ElMessageBox.confirm('确定要删除该聊天吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      // 移动端优化：防止点击遮罩层关闭导致无响应感觉
      closeOnClickModal: false,
      closeOnPressEscape: false,
      lockScroll: true,
    })
      .then(async () => {
        // 确保 chatType 是字符串
        const type = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
        console.log('Deleting chat type:', type)

        if (type) {
          try {
            // 调用API删除聊天
            await deleteChat(type)
          } catch (error) {
            console.error('删除聊天失败:', error)
          }
          // 同时清理本地store
          messageStore.deleteMessage(type)
          ElMessage.success('删除成功')
          router.back()
        } else {
          ElMessage.error('无法获取聊天类型')
        }
      })
      .catch((action) => {
        // 捕获取消或其他错误
        if (action !== 'cancel') {
          console.error('Delete failed:', action)
        }
      })
  }
}

const sendMessage = async () => {
  if (!inputText.value.trim()) return

  const type = Array.isArray(chatType.value) ? chatType.value[0] : chatType.value
  const userQuery = inputText.value

  // User message
  messageStore.addMessage(type, { text: userQuery, isMe: true })

  inputText.value = ''

  await scrollToBottom()

  // 调用API发送消息
  try {
    await sendChatMessage(type, { text: userQuery, type: 'text' })
    // 发送成功后，刷新消息列表获取最新回复
    await messageStore.fetchChatHistory(type)
    await scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

onMounted(() => {
  // 获取聊天历史
  const type = Array.isArray(chatType.value) ? chatType.value[0] : chatType.value
  messageStore.fetchChatHistory(type)
  scrollToBottom()
})
</script>

<style scoped lang="scss">
.chat-detail-page {
  background-color: #f7f8fa;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.page-header {
  background-color: #fff;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  position: relative;
  /* Allow header-right to extend to edge */
  overflow: visible;

  .header-title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .back-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;

    &:active {
      background-color: #f5f5f5;
    }
  }

  .header-right {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;
    position: relative;
    margin-right: -10px; /* Extend to edge (counteract page-header padding) */

    &:active {
      background-color: #f5f5f5;
    }
  }

  .more-btn {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-menu-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 998;
    background: transparent;
  }

  .custom-menu {
    position: absolute;
    top: 50px;
    right: 0; /* Align to right edge of header-right (which is now at screen edge) */
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    padding: 0;
    min-width: 130px;
    z-index: 999;
    transform-origin: top right;

    .menu-arrow {
      position: absolute;
      top: -6px;
      right: 18px; /* Adjust arrow position relative to new right alignment */
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid #fff;
    }

    .menu-item {
      padding: 12px 20px;
      font-size: 14px;
      color: #333;
      transition: background 0.2s;
      text-align: center;
      border-bottom: 1px solid #f5f5f5;

      &:first-of-type {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }

      &:last-child {
        border-bottom: none;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }

      &:active {
        background-color: #f5f5f5;
      }
    }
  }
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;

  .time-divider {
    font-size: 12px;
    color: #999;
    margin-bottom: 20px;
    text-align: center;
    width: 100%;
  }

  .message-row {
    display: flex;
    margin-bottom: 20px;

    &.left {
      justify-content: flex-start;

      .bubble {
        background-color: #fff;
        color: #333;
        border: 1px solid #e4e7ed;
        border-top-left-radius: 2px;
        margin-left: 10px;
      }
    }

    &.right {
      justify-content: flex-end;

      .bubble {
        background-color: #409eff; /* Element Plus Primary */
        color: #fff;
        border-top-right-radius: 2px;
        margin-right: 10px;
      }

      .avatar {
        order: 1;
      }

      .bubble {
        order: 0;
      }
    }

    .avatar {
      flex-shrink: 0;
      border-radius: 6px;
    }

    .service-avatar {
      background-color: #ff9800;
    }

    .system-avatar {
      background-color: #ff9900;
    }

    .user-avatar {
      background-color: #409eff;
    }

    .bubble {
      max-width: 70%;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 15px;
      line-height: 1.5;
      position: relative;
      word-break: break-all;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
  }
}

.chat-input-area {
  background-color: #fff;
  padding: 10px 15px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  border-top: 1px solid #e5e5e5;
  gap: 10px;

  .input-box {
    flex: 1;

    :deep(.el-input__wrapper) {
      border-radius: 20px;
      box-shadow: none;
      background-color: #f5f5f5;
    }
  }

  .send-btn {
    width: 80px;
    height: 36px;
  }
}
</style>
