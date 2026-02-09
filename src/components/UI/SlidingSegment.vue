<template>
  <div class="sliding-segment">
    <div class="segment-bg" :style="bgStyle"></div>
    <div
      v-for="option in options"
      :key="option.value"
      class="segment-item"
      :class="{ active: modelValue === option.value }"
      @click="select(option.value)"
    >
      {{ option.label }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SlidingSegment'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

export interface Option {
  label: string
  value: string | number
}

const props = defineProps<{
  modelValue: string | number
  options: Option[]
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const select = (value: string | number) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const currentIndex = computed(() => {
  return props.options.findIndex((opt) => opt.value === props.modelValue)
})

const bgStyle = computed(() => {
  const count = props.options.length
  if (count === 0) return {}
  const index = currentIndex.value === -1 ? 0 : currentIndex.value

  return {
    width: `calc((100% - 8px) / ${count})`,
    transform: `translateX(${index * 100}%)`,
    left: '4px',
  }
})
</script>

<style scoped lang="scss">
.sliding-segment {
  position: relative;
  display: flex;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 4px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* Ensure rounded corners clip content */
}

.segment-bg {
  position: absolute;
  top: 4px;
  bottom: 4px;
  background-color: #409eff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  z-index: 1;
}

.segment-item {
  flex: 1;
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: color 0.3s;
  user-select: none;
  white-space: nowrap;

  &.active {
    color: #fff;
    font-weight: 500;
  }
}
</style>
