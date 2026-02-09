<template>
  <div class="feedback-page">
    <div class="header">
      <el-icon class="back-icon" @click="router.back()"><ArrowLeft /></el-icon>
      <span class="title">意见反馈</span>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="form-group">
        <div class="label">问题和意见</div>
        <el-input
          v-model="content"
          type="textarea"
          :rows="6"
          placeholder="请填写您的问题或建议，我们将不断改进..."
          resize="none"
          maxlength="500"
          show-word-limit
          class="custom-input"
        />
      </div>

      <div class="form-group">
        <div class="label">订单编号</div>
        <el-input v-model="orderNo" placeholder="请输入订单编号" class="custom-input" />
      </div>

      <div class="form-group">
        <div class="label">联系方式（选填）</div>
        <el-input
          v-model="contact"
          placeholder="请填写您的手机号/邮箱，方便我们联系您"
          class="custom-input"
        />
      </div>

      <el-button type="primary" class="submit-btn" :loading="submitting" @click="handleSubmit" round
        >提交反馈</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { submitFeedback } from '@/api/feedback'

const router = useRouter()
const content = ref('')
const orderNo = ref('')
const contact = ref('')
const submitting = ref(false)

const handleSubmit = async () => {
  if (!content.value.trim()) {
    ElMessage.warning('请填写反馈内容')
    return
  }

  submitting.value = true
  try {
    await submitFeedback({
      content: content.value,
      contact: contact.value || undefined,
    })
    ElMessage.success('提交成功，感谢您的反馈')
    setTimeout(() => {
      router.back()
    }, 1000)
  } catch (error) {
    console.error('提交反馈失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.feedback-page {
  min-height: 100vh;
  background-color: #fff; /* Page background white */
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;

  .header {
    height: 44px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    z-index: 10;

    .back-icon {
      font-size: 20px;
      color: #333;
      cursor: pointer;
    }

    .title {
      font-size: 17px;
      font-weight: 500;
      color: #333;
    }

    .placeholder {
      width: 20px;
    }
  }

  .content {
    /* Feedback interface background white */
    background-color: #fff;
    padding: 20px 16px 40px; /* Add padding bottom inside content too */
    /* Remove flex: 1 to allow gray background to show below if content is short, 
       but if we want scrolling, we might want it to fill and then scroll.
       However, "extend gray background display range" suggests a visible gray area.
    */

    .form-group {
      margin-bottom: 24px;

      .label {
        font-size: 15px;
        font-weight: 500;
        color: #333;
        margin-bottom: 12px;
      }

      /* Custom Input Styles */
      :deep(.el-textarea__inner),
      :deep(.el-input__wrapper) {
        background-color: #f5f7fa; /* Box background gray */
        box-shadow: none; /* Remove default border/shadow */
        border-radius: 12px; /* Rounded corners */
        padding: 12px;
      }

      :deep(.el-textarea__inner) {
        font-size: 14px;
      }

      :deep(.el-input__inner) {
        height: 24px; /* Adjust inner height */
      }
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-top: 30px;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      border-radius: 24px;
    }
  }
}
</style>
