<template>
  <div class="profile-edit-page">
    <div class="header">
      <div class="left" @click="router.back()">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </div>
      <div class="title">编辑个人资料</div>
      <div class="right">
        <span class="save-btn" @click="handleSave">保存</span>
      </div>
    </div>

    <div class="form-content">
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="triggerFileUpload">
          <el-avatar :size="80" :src="form.avatar || defaultAvatar" />
          <div class="edit-overlay">
            <el-icon><Camera /></el-icon>
          </div>
        </div>
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          style="display: none"
          @change="handleFileChange"
        />
        <div class="tip">点击修改头像</div>
      </div>

      <div class="form-group">
        <div class="form-item">
          <div class="label">昵称</div>
          <input
            v-model="form.nickname"
            type="text"
            placeholder="请输入昵称"
            class="custom-input"
          />
        </div>

        <div class="form-item">
          <div class="label">手机号</div>
          <input v-model="form.phone" type="tel" placeholder="请输入手机号" class="custom-input" />
        </div>

        <div class="form-item">
          <div class="label">年龄</div>
          <input v-model="form.age" type="number" placeholder="请输入年龄" class="custom-input" />
        </div>

        <div class="form-item">
          <div class="label">从业年限</div>
          <input
            v-model="form.experience"
            type="text"
            placeholder="例如：3年"
            class="custom-input"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="form-item vertical">
          <div class="label">个人介绍</div>
          <textarea
            v-model="form.introduction"
            placeholder="请输入个人介绍，展示您的专业能力..."
            class="custom-textarea"
            rows="6"
          ></textarea>
          <div class="word-count">{{ form.introduction.length }}/200</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowLeft, Camera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { updateUserProfile, updateUserAvatar } from '@/api/user'
import { getCompanionProfile } from '@/api/companion'

const router = useRouter()
const userStore = useUserStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  nickname: userStore.userInfo?.nickname || '',
  avatar: userStore.userInfo?.avatar || '',
  phone: '',
  age: '',
  experience: '',
  introduction: '',
})

// 获取陪诊师资料
const fetchProfile = async () => {
  try {
    const profile = await getCompanionProfile()
    if (profile) {
      form.nickname = profile.name || profile.nickname || ''
      form.avatar = profile.avatar || ''
      form.phone = profile.phone || ''
      form.age = profile.age ? String(profile.age) : ''
      form.experience = profile.experience || ''
      form.introduction = profile.intro || ''
    }
  } catch (error) {
    console.error('获取陪诊师资料失败:', error)
  }
}

onMounted(() => {
  fetchProfile()
})

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      form.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleSave = async () => {
  if (!form.nickname.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }

  try {
    // 调用API更新用户资料
    await updateUserProfile({ nickname: form.nickname })

    // 如果头像有更新，调用API更新头像
    if (form.avatar) {
      await updateUserAvatar({ avatar: form.avatar })
    }

    // 更新本地store
    userStore.updateUserInfo({
      nickname: form.nickname,
      avatar: form.avatar,
    })

    ElMessage.success('保存成功')
    setTimeout(() => {
      router.back()
    }, 500)
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}
</script>

<style scoped lang="scss">
.profile-edit-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  height: 44px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .save-btn {
    color: #409eff;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
  }
}

.form-content {
  padding: 20px 16px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;

  .avatar-wrapper {
    position: relative;
    cursor: pointer;

    .edit-overlay {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #409eff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      border: 2px solid #fff;
    }
  }

  .tip {
    margin-top: 10px;
    font-size: 13px;
    color: #909399;
  }
}

.form-group {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);

  .form-item {
    padding: 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f5f7fa;

    &:last-child {
      border-bottom: none;
    }

    &.vertical {
      flex-direction: column;
      align-items: flex-start;

      .label {
        width: 100%;
        margin-bottom: 12px;
      }
    }

    .label {
      width: 80px;
      font-size: 15px;
      color: #333;
      flex-shrink: 0;
    }

    .custom-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 15px;
      color: #333;
      text-align: right;

      &::placeholder {
        color: #c0c4cc;
      }
    }

    .custom-textarea {
      width: 100%;
      border: none;
      outline: none;
      font-size: 15px;
      color: #333;
      resize: none;
      line-height: 1.5;
      padding: 0;

      &::placeholder {
        color: #c0c4cc;
      }
    }

    .word-count {
      align-self: flex-end;
      font-size: 12px;
      color: #909399;
      margin-top: 8px;
    }
  }
}
</style>
