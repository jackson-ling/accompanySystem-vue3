<template>
  <div class="ai-chat-page">
    <div class="page-header">
      <div class="back-btn" @click="handleBack">
        <el-icon :size="24" color="#333"><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">AI 助手</div>
      <div class="header-right" @click.stop="toggleMenu">
        <div class="more-btn">
          <el-icon :size="24" color="#333"><MoreFilled /></el-icon>
        </div>
        <!-- Custom Menu -->
        <div class="custom-menu-mask" v-if="showMenu" @click.stop="showMenu = false"></div>
        <Transition name="menu-fade">
          <div class="custom-menu" v-if="showMenu">
            <div class="menu-arrow"></div>
            <div class="menu-item" @click.stop="handleMenuAction('clear')">清空聊天记录</div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="chat-container" ref="chatContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message-row"
        :class="msg.isMe ? 'right' : 'left'"
      >
        <el-avatar v-if="!msg.isMe" :size="40" :icon="Cpu" class="avatar ai-avatar" />
        <el-avatar v-else :size="40" :icon="UserFilled" class="avatar user-avatar" />

        <div class="bubble" style="white-space: pre-wrap">
          {{ msg.text }}
        </div>
      </div>

      <!-- 建议问题 -->
      <div v-if="suggestions.length > 0" class="suggestions-container">
        <div class="suggestions-title">猜你想问</div>
        <div class="suggestions-list">
          <div
            v-for="(item, index) in suggestions"
            :key="index"
            class="suggestion-item"
            @click="sendSuggestion(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-area">
      <div class="input-box">
        <el-input
          v-model="inputText"
          placeholder="请输入您的问题..."
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
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Cpu, UserFilled, MoreFilled } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { clearAiChat, getAiChatHistory, chatWithAi } from '@/api/ai'

const router = useRouter()
const inputText = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const messages = ref<{ text: string; isMe: boolean }[]>([])
const showMenu = ref(false)
const hasInitialized = ref(false) // 标记是否已经初始化过
const isLoading = ref(false) // 标记AI是否正在回复
const suggestions = ref<string[]>([]) // AI回复的建议问题

// 获取聊天历史记录
const fetchChatHistory = async () => {
  try {
    const history = await getAiChatHistory()
    if (history && history.length > 0) {
      messages.value = history
      hasInitialized.value = true
    } else {
      // 检查是否已经初始化过（清空过）
      const isCleared = localStorage.getItem('ai_chat_cleared') === 'true'
      if (isCleared || hasInitialized.value) {
        // 如果已经清空过，显示空白
        messages.value = []
      } else {
        // 首次进入显示初始消息
        messages.value = [{ text: '您好！我是您的智能陪诊助手，请问有什么可以帮您？', isMe: false }]
        hasInitialized.value = true
      }
    }
  } catch (error) {
    // 获取失败时显示初始消息
    messages.value = [{ text: '您好！我是您的智能陪诊助手，请问有什么可以帮您？', isMe: false }]
  }
}

onMounted(() => {
  fetchChatHistory()
})

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

const handleMenuAction = async (command: string) => {
  showMenu.value = false
  if (command === 'clear') {
    try {
      await ElMessageBox.confirm('确定要清空当前聊天记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      // 调用清空API
      await clearAiChat()
      // 清空本地聊天记录，标记已清空状态
      messages.value = []
      hasInitialized.value = true
      localStorage.setItem('ai_chat_cleared', 'true')
      ElMessage.success('已清空聊天记录')
    } catch (error) {
      // 用户取消时不提示
      if (error !== 'cancel') {
        console.error('清空聊天记录失败:', error)
        ElMessage.error('清空失败，请重试')
      }
    }
  }
}

const sendMessage = async () => {
  if (!inputText.value.trim()) return

  const userQuery = inputText.value
  await doSendMessage(userQuery)
}

// 发送建议问题
const sendSuggestion = async (text: string) => {
  await doSendMessage(text)
}

// 统一的发送消息逻辑
const doSendMessage = async (userQuery: string) => {
  // User message
  messages.value.push({ text: userQuery, isMe: true })
  inputText.value = ''

  // 清除之前的建议问题
  suggestions.value = []

  // 显示加载状态
  isLoading.value = true

  await scrollToBottom()

  // 调用AI聊天API
  try {
    const res = await chatWithAi({ message: userQuery })
    messages.value.push({
      text: res.reply,
      isMe: false,
    })
    // 保存建议问题
    if (res.suggestions && res.suggestions.length > 0) {
      suggestions.value = res.suggestions
    }
  } catch (error) {
    console.error('AI回复失败:', error)
    ElMessage.error('AI回复失败，请重试')
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped lang="scss">
.ai-chat-page {
  background-color: #f7f8fa;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
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

  .header-title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }

  .back-btn,
  .header-right {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;
    position: relative;

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
    right: -4px;
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
      right: 24px;
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

    .ai-avatar {
      background-color: #e6a23c;
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

// 建议问题样式
.suggestions-container {
  margin-top: 10px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-left: 50px;

  .suggestions-title {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
  }

  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .suggestion-item {
    padding: 8px 12px;
    background-color: #fff;
    border-radius: 6px;
    font-size: 14px;
    color: #409eff;
    cursor: pointer;
    transition: background-color 0.2s;

    &:active {
      background-color: #e4e7ed;
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
