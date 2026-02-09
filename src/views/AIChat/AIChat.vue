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

const router = useRouter()
const inputText = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const messages = ref([{ text: '您好！我是您的智能陪诊助手，请问有什么可以帮您？', isMe: false }])
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
        messages.value = [{ text: '您好！我是您的智能陪诊助手，请问有什么可以帮您？', isMe: false }]
        ElMessage.success('已清空聊天记录')
      })
      .catch(() => {})
  }
}

const sendMessage = async () => {
  if (!inputText.value.trim()) return

  // User message
  messages.value.push({ text: inputText.value, isMe: true })
  const userQuery = inputText.value
  inputText.value = ''

  await scrollToBottom()

  // Mock AI response
  setTimeout(async () => {
    messages.value.push({
      text: `收到您的问题：“${userQuery}”。我们的陪诊服务包括全天、半天及代办服务，您可以直接在首页预约。`,
      isMe: false,
    })
    await scrollToBottom()
  }, 1000)
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
