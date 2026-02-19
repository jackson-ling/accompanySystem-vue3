<template>
  <div class="patient-add-page">
    <div class="header-nav">
      <el-icon @click="router.back()" class="back-icon"><ArrowLeft /></el-icon>
      <span>添加就诊人</span>
      <div style="width: 24px"></div>
    </div>

    <div class="form-container">
      <div class="form-header">
        <span class="title">默认就诊人</span>
        <el-switch v-model="form.default" />
      </div>
      <el-form :model="form" label-width="80px" class="patient-form">
        <el-form-item label="姓名" :error="errors.name">
          <el-input
            v-model="form.name"
            placeholder="请输入真实姓名"
            @blur="validateField('name')"
          />
        </el-form-item>
        <el-form-item label="手机号" :error="errors.phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
            type="tel"
            @blur="validateField('phone')"
          />
        </el-form-item>
        <el-form-item label="地址" :error="errors.address">
          <el-input
            v-model="form.address"
            placeholder="请输入详细地址"
            @blur="validateField('address')"
          />
        </el-form-item>
        <el-form-item label="关系">
          <SlidingSegment v-model="form.relationship" :options="relationshipOptions" />
        </el-form-item>
      </el-form>
    </div>

    <div class="bottom-action-bar">
      <el-button class="action-btn" @click="handleSave"> 保存 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import SlidingSegment from '@/components/UI/SlidingSegment.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isEdit = ref(false)
const editId = ref<number | null>(null)

const form = ref({
  name: '',
  phone: '',
  address: '',
  relationship: '家属',
  default: false,
})

const relationshipOptions = [
  { label: '本人', value: '本人' },
  { label: '家属', value: '家属' },
  { label: '朋友', value: '朋友' },
  { label: '其他', value: '其他' },
]

const errors = ref({
  name: '',
  phone: '',
  address: '',
})

const validateField = (field: string) => {
  if (field === 'name' && !form.value.name) {
    errors.value.name = '请输入姓名'
  } else if (field === 'name') {
    errors.value.name = ''
  }

  if (field === 'phone' && !form.value.phone) {
    errors.value.phone = '请输入手机号'
  } else if (field === 'phone') {
    errors.value.phone = ''
  }

  if (field === 'address' && !form.value.address) {
    errors.value.address = '请输入地址'
  } else if (field === 'address') {
    errors.value.address = ''
  }

  // Update document title if any error exists
  if (errors.value.name || errors.value.phone || errors.value.address) {
    document.title = 'Error: Form Validation Failed'
  } else {
    document.title = '添加就诊人'
  }
}

onMounted(() => {
  document.title = '添加就诊人'
  const id = route.query.id
  if (id) {
    const patient = userStore.patients.find((p) => p.id === Number(id))
    if (patient) {
      isEdit.value = true
      editId.value = patient.id
      form.value = {
        name: patient.name,
        phone: patient.phone,
        address: patient.address || '',
        relationship: patient.relationship || '家属',
        default: patient.default || false,
      }
    }
  }
})

const handleSave = () => {
  if (!form.value.name || !form.value.phone || !form.value.address) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (isEdit.value && editId.value) {
    userStore.updatePatient({
      id: editId.value,
      name: form.value.name,
      phone: form.value.phone,
      address: form.value.address,
      relationship: form.value.relationship,
      default: form.value.default,
    })
    ElMessage.success('修改成功')
  } else {
    userStore.addPatient({
      name: form.value.name,
      phone: form.value.phone,
      address: form.value.address,
      relationship: form.value.relationship,
      default: form.value.default,
    })
    ElMessage.success('添加成功')
  }

  router.back()
}
</script>

<style scoped lang="scss">
.patient-add-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #eee;

  .back-icon {
    font-size: 20px;
    cursor: pointer;
  }
}

.form-container {
  margin: 15px; /* Adjusted margin */
  background-color: #fff;
  padding: 20px;
  border-radius: 10px; /* Added rounded corners */
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f5f5f5;

  .title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
}

.patient-form {
  :deep(.el-form-item) {
    display: block; /* Vertical layout */
    margin-bottom: 24px; /* Requirement: 24dp vertical spacing */
    border-bottom: none;
    padding: 0;
    position: relative; /* For error positioning */
  }

  :deep(.el-form-item__label) {
    text-align: left;
    font-size: 15px; /* Adjusted size */
    color: #333; /* Darker color */
    font-weight: bold; /* Bold labels */
    padding-bottom: 8px;
    line-height: normal;
    display: block;
    width: 100%;
  }

  :deep(.el-form-item__content) {
    line-height: normal;
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    padding: 0 16px; /* Requirement: 16dp padding */
    background-color: #fff;
    height: 56px; /* Requirement: 56dp height */
    border-radius: 8px; /* Slightly more rounded */
    transition: none; /* Disable default transition */

    &.is-focus {
      box-shadow: 0 0 0 2px #409eff inset !important; /* Requirement: 2dp active border */
    }
  }

  :deep(.el-input__inner) {
    font-size: 16px;
    color: #333;
    text-align: left;
    height: 56px;
    line-height: 56px;
    font-weight: normal;

    &::placeholder {
      font-weight: normal;
      color: #c0c4cc;
    }
  }

  :deep(.el-form-item__error) {
    position: absolute;
    top: auto;
    bottom: -20px; /* Adjust to sit below input without pushing layout */
    left: 0;
    padding-top: 4px; /* Requirement: bottom 4dp red text (implies spacing) */
    color: #f56c6c;
    font-size: 12px;
  }

  :deep(.el-radio-group) {
    justify-content: flex-start;
    width: 100%;
    margin-top: 8px;
  }

  :deep(.el-switch) {
    margin-left: 0;
    margin-top: 8px;
  }
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  padding: 10px 15px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background-color: #fff;
  box-sizing: border-box;
  z-index: 999;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

  .action-btn {
    width: 100%;
    height: 44px;
    border-radius: 22px;
    font-size: 16px;
    font-weight: 500;
    background-color: #409eff;
    color: #fff;
    border: none;
  }
}
</style>
