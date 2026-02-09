<template>
  <div class="patient-list-page">
    <div class="header-nav">
      <el-icon @click="router.back()" class="back-icon"><ArrowLeft /></el-icon>
      <span>选择就诊人</span>
      <div style="width: 24px"></div>
    </div>

    <div class="patient-list">
      <div
        v-for="patient in userStore.patients"
        :key="patient.id"
        class="patient-card"
        :class="{
          'is-selected': userStore.selectedPatientId === patient.id,
          'active-state': activeCardId === patient.id,
        }"
        @click="handleSelect(patient)"
        @touchstart="activeCardId = patient.id"
        @touchend="activeCardId = null"
        @mousedown="activeCardId = patient.id"
        @mouseup="activeCardId = null"
        @mouseleave="activeCardId = null"
      >
        <div class="card-left">
          <div class="row-1">
            <span class="name">{{ patient.name }}</span>
            <span class="phone">{{ patient.phone }}</span>
            <span v-if="patient.default" class="tag">默认</span>
          </div>
          <div class="row-2">地址: {{ patient.address || '未填写' }}</div>
        </div>
        <div class="card-right">
          <el-icon v-if="userStore.selectedPatientId === patient.id" class="check-icon"
            ><Check
          /></el-icon>
          <div class="edit-btn" @click.stop="openOptions(patient)" @touchstart.stop @mousedown.stop>
            <el-icon><Edit /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-action-bar">
      <el-button class="action-btn" @click="goToAdd">
        <el-icon><Plus /></el-icon> 添加就诊人
      </el-button>
    </div>

    <el-drawer
      v-model="drawerVisible"
      direction="btt"
      :show-close="false"
      :with-header="false"
      size="auto"
      class="options-drawer"
    >
      <div class="drawer-content">
        <div class="drawer-item" @click="handleEdit">编辑</div>
        <div class="drawer-item delete" @click="handleDelete">删除</div>
        <div class="drawer-item cancel" @click="drawerVisible = false">取消</div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PatientList'
})
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, Plus, Edit } from '@element-plus/icons-vue'
import { useUserStore, type Patient } from '@/stores/user'
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useDrawerNavigation } from '@/composables/useDrawerNavigation'

const router = useRouter()
const userStore = useUserStore()

const drawerVisible = ref(false)
const { navigateWithDelay, backWithDelay } = useDrawerNavigation(drawerVisible)
const currentPatient = ref<Patient | null>(null)
const activeCardId = ref<number | null>(null)

const handleSelect = (patient: Patient) => {
  userStore.selectPatient(patient.id)
  setTimeout(() => {
    router.back()
  }, 150)
}

const goToAdd = () => {
  router.push({ name: 'patient-add' })
}

const openOptions = (patient: Patient) => {
  currentPatient.value = patient
  drawerVisible.value = true
}

const handleEdit = () => {
  if (currentPatient.value) {
    navigateWithDelay({
      name: 'patient-add',
      query: { id: currentPatient.value.id },
    })
  }
}

const handleDelete = () => {
  if (currentPatient.value) {
    ElMessageBox.confirm('确定要删除该就诊人吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        if (currentPatient.value) {
          userStore.deletePatient(currentPatient.value.id)
          ElMessage.success('删除成功')
          drawerVisible.value = false
        }
      })
      .catch(() => {
        // cancel
      })
  }
}
</script>

<style scoped lang="scss">
.patient-list-page {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f7f8fa;
  padding-bottom: 140px;
  overscroll-behavior-y: none;
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

.patient-list {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.patient-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;

  &.active-state {
    transform: scale(0.98);
    background-color: #f5f7fa;
  }

  &.is-selected {
    border-color: #409eff;
    background-color: #ecf5ff; /* Lighter, mobile-friendly background */
  }

  .card-left {
    .row-1 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;

      .name {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .phone {
        font-size: 14px;
        color: #666;
      }

      .tag {
        background-color: #ecf5ff;
        color: #409eff;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }

    .row-2 {
      font-size: 14px;
      color: #999;
    }
  }

  .card-right {
    display: flex;
    align-items: center;
    gap: 15px;

    .check-icon {
      color: #409eff;
      font-size: 20px;
    }

    .edit-btn {
      font-size: 20px;
      color: #999;
      padding: 5px;
      display: flex;
      align-items: center;

      &:active {
        color: #409eff;
      }
    }
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
    display: flex;
    justify-content: center;
    align-items: center;

    &:active {
      opacity: 0.9;
    }

    .el-icon {
      margin-right: 4px;
    }
  }
}

.drawer-content {
  padding: 0;
}

.drawer-item {
  height: 56px;
  line-height: 56px;
  text-align: center;
  font-size: 16px;
  color: #333;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;

  &.delete {
    color: #f56c6c;
  }

  &.cancel {
    margin-top: 8px;
    border-top: none;
    border-bottom: none;
  }
}

:deep(.el-drawer__body) {
  padding: 0;
  background-color: #f7f8fa;
}
</style>
