<template>
  <Teleport to="body">
    <transition name="viewer-fade">
      <div v-if="visible" class="mobile-image-viewer-mask" @click="close">
        <div class="mobile-image-viewer-container" @click.stop>
          <div
            class="viewer-canvas"
            ref="canvasRef"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
            @click.stop
          >
            <img
              :src="url"
              class="viewer-image"
              ref="imageRef"
              :style="imageStyle"
              draggable="false"
              @load="onImageLoad"
              @click="handleDoubleTap"
            />
          </div>

          <!-- Zoom Controls -->
          <div class="zoom-controls" @click.stop>
            <div class="zoom-btn" @click="zoomIn">
              <el-icon><ZoomIn /></el-icon>
            </div>
            <div class="zoom-btn" @click="zoomOut">
              <el-icon><ZoomOut /></el-icon>
            </div>
          </div>

          <!-- Close Button (Simulate Element Plus style) -->
          <div class="viewer-close" @click.stop="close">
            <el-icon><Close /></el-icon>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script lang="ts">
export default {
  name: 'MobileImageViewer',
}
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Close, ZoomIn, ZoomOut } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  url: string
}>()

const emit = defineEmits(['update:visible', 'close'])

const canvasRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)

// State
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const isAnimating = ref(false)

// Touch State
let startX = 0
let startY = 0
let lastX = 0
let lastY = 0
let startTranslateX = 0
let startTranslateY = 0

// Pinch Zoom State
let initialDistance = 0
let startScale = 1
const minScale = 1
const maxScale = 3

// Double Tap State
let lastTapTime = 0

// Image Dimensions
const imgWidth = ref(0)
const imgHeight = ref(0)

const imageStyle = computed(() => ({
  width: imgWidth.value ? `${imgWidth.value}px` : 'auto',
  height: imgHeight.value ? `${imgHeight.value}px` : 'auto',
  transform: `translate3d(${translateX.value}px, ${translateY.value}px, 0) scale(${scale.value})`,
  transition: isAnimating.value ? 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
}))

const close = () => {
  emit('update:visible', false)
  emit('close')
}

const zoomIn = () => {
  isAnimating.value = true
  let newScale = scale.value + 0.5
  if (newScale > maxScale) newScale = maxScale
  scale.value = newScale
}

const zoomOut = () => {
  isAnimating.value = true
  let newScale = scale.value - 0.5
  if (newScale < minScale) newScale = minScale
  scale.value = newScale

  // Reset position if zoomed out to 1
  if (newScale === 1) {
    translateX.value = 0
    translateY.value = 0
  } else {
    // Check bounds
    const bounds = getBounds(newScale)
    let newTx = translateX.value
    let newTy = translateY.value

    if (newTx > bounds.maxX) newTx = bounds.maxX
    if (newTx < bounds.minX) newTx = bounds.minX
    if (newTy > bounds.maxY) newTy = bounds.maxY
    if (newTy < bounds.minY) newTy = bounds.minY

    translateX.value = newTx
    translateY.value = newTy
  }
}

const calculateDimensions = () => {
  if (!imageRef.value) return

  const img = imageRef.value
  const viewportWidth = canvasRef.value?.clientWidth || window.innerWidth
  const viewportHeight = canvasRef.value?.clientHeight || window.innerHeight
  const naturalWidth = img.naturalWidth
  const naturalHeight = img.naturalHeight

  if (!naturalWidth || !naturalHeight) return

  const naturalRatio = naturalWidth / naturalHeight
  const viewportRatio = viewportWidth / viewportHeight

  // Calculate the size that fits the viewport (contain)
  // User Requirement: 20% margin on left and right (total 40% reduction in width availability)
  const paddingPercentage = 0.2
  const availableWidth = viewportWidth * (1 - paddingPercentage * 2)
  const availableHeight = viewportHeight // Use full height? Or maybe padding there too? User specified left/right.

  const scaleFactor = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight)

  imgWidth.value = naturalWidth * scaleFactor
  imgHeight.value = naturalHeight * scaleFactor
}

const onImageLoad = () => {
  if (imageRef.value) {
    // Reset state
    scale.value = 1
    translateX.value = 0
    translateY.value = 0

    // Calculate display dimensions based on natural size and viewport
    // Use getBoundingClientRect for accuracy after layout
    // We use nextTick (or setTimeout) to ensure image is rendered
    setTimeout(() => {
      calculateDimensions()
    }, 0)
  }
}

const getDistance = (touches: TouchList) => {
  if (touches.length < 2) return 0
  const touch1 = touches[0]
  const touch2 = touches[1]
  if (!touch1 || !touch2) return 0
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    // Single finger - Drag
    const touch = e.touches[0]
    if (!touch) return

    isDragging.value = true
    isAnimating.value = false

    startX = touch.clientX
    startY = touch.clientY
    startTranslateX = translateX.value
    startTranslateY = translateY.value
  } else if (e.touches.length === 2) {
    // Two fingers - Zoom
    isDragging.value = true
    isAnimating.value = false

    initialDistance = getDistance(e.touches)
    startScale = scale.value
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()

  if (e.touches.length === 1) {
    // Lock dragging if scale is 1 (or very close to 1)
    if (scale.value <= 1.05) {
      // Allow slight drag with resistance (feedback) but do not return early
      // return // REMOVED to allow rubber band effect at scale 1
    }

    const touch = e.touches[0]
    if (!touch) return

    // Drag Logic
    const currentX = touch.clientX
    const currentY = touch.clientY

    const deltaX = currentX - startX
    const deltaY = currentY - startY

    // Apply damping if out of bounds
    let newTx = startTranslateX + deltaX
    let newTy = startTranslateY + deltaY

    const bounds = getBounds()

    // Apply resistance when pulling outside bounds
    if (newTx > bounds.maxX) {
      newTx = bounds.maxX + (newTx - bounds.maxX) * 0.4
    } else if (newTx < bounds.minX) {
      newTx = bounds.minX + (newTx - bounds.minX) * 0.4
    }

    if (newTy > bounds.maxY) {
      newTy = bounds.maxY + (newTy - bounds.maxY) * 0.4
    } else if (newTy < bounds.minY) {
      newTy = bounds.minY + (newTy - bounds.minY) * 0.4
    }

    translateX.value = newTx
    translateY.value = newTy
  } else if (e.touches.length === 2) {
    // Pinch Zoom Logic
    const currentDistance = getDistance(e.touches)
    if (initialDistance > 0) {
      const newScale = startScale * (currentDistance / initialDistance)
      // Allow slight overzoom for rubber band effect, but limit it
      scale.value = Math.max(0.5, Math.min(newScale, maxScale * 1.5))
    }
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  // If we still have fingers on screen (e.g. lifted one finger during pinch),
  // we might want to reset the drag start point to avoid jumps,
  // but for simplicity, we just end the current gesture logic.
  if (e.touches.length > 0) return

  isDragging.value = false
  isAnimating.value = true

  // 1. Correct Scale
  let newScale = scale.value
  if (newScale < minScale) newScale = minScale
  if (newScale > maxScale) newScale = maxScale

  scale.value = newScale

  // 2. Correct Position (Bounds Check) based on corrected scale
  // We need to wait for scale to be applied or calculate bounds based on newScale
  // Since we update scale.value immediately above, getBounds will use it if we are careful
  // But bounds depend on imgWidth * scale.

  const bounds = getBounds(newScale)
  let newTx = translateX.value
  let newTy = translateY.value

  // Rebound logic
  if (newTx > bounds.maxX) newTx = bounds.maxX
  if (newTx < bounds.minX) newTx = bounds.minX
  if (newTy > bounds.maxY) newTy = bounds.maxY
  if (newTy < bounds.minY) newTy = bounds.minY

  translateX.value = newTx
  translateY.value = newTy
}

// Mouse Event Handlers
const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault()

  isDragging.value = true
  isAnimating.value = false

  startX = e.clientX
  startY = e.clientY
  startTranslateX = translateX.value
  startTranslateY = translateY.value
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  e.preventDefault()

  // Lock dragging if scale is 1 (or very close to 1)
  if (scale.value <= 1.05) {
    // Allow slight drag with resistance (feedback) but do not return early
    // return // REMOVED to allow rubber band effect at scale 1
  }

  // Drag Logic
  const currentX = e.clientX
  const currentY = e.clientY

  const deltaX = currentX - startX
  const deltaY = currentY - startY

  // Apply damping if out of bounds
  let newTx = startTranslateX + deltaX
  let newTy = startTranslateY + deltaY

  const bounds = getBounds()

  // Apply resistance when pulling outside bounds
  if (newTx > bounds.maxX) {
    newTx = bounds.maxX + (newTx - bounds.maxX) * 0.4
  } else if (newTx < bounds.minX) {
    newTx = bounds.minX + (newTx - bounds.minX) * 0.4
  }

  if (newTy > bounds.maxY) {
    newTy = bounds.maxY + (newTy - bounds.maxY) * 0.4
  } else if (newTy < bounds.minY) {
    newTy = bounds.minY + (newTy - bounds.minY) * 0.4
  }

  translateX.value = newTx
  translateY.value = newTy
}

const handleMouseUp = (e: MouseEvent) => {
  if (!isDragging.value) return

  isDragging.value = false
  isAnimating.value = true

  // 1. Correct Scale (Mouse interaction usually doesn't change scale, but we keep logic consistent)
  let newScale = scale.value
  if (newScale < minScale) newScale = minScale
  if (newScale > maxScale) newScale = maxScale

  scale.value = newScale

  // 2. Correct Position (Bounds Check) based on corrected scale
  const bounds = getBounds(newScale)
  let newTx = translateX.value
  let newTy = translateY.value

  // Rebound logic
  if (newTx > bounds.maxX) newTx = bounds.maxX
  if (newTx < bounds.minX) newTx = bounds.minX
  if (newTy > bounds.maxY) newTy = bounds.maxY
  if (newTy < bounds.minY) newTy = bounds.minY

  translateX.value = newTx
  translateY.value = newTy
}

const handleDoubleTap = (e: MouseEvent) => {
  const now = Date.now()
  if (now - lastTapTime < 300) {
    // Double tap detected
    isAnimating.value = true
    if (scale.value > 1.2) {
      // Zoom out
      scale.value = 1
      translateX.value = 0
      translateY.value = 0
    } else {
      // Zoom in
      scale.value = 2.5
      // Ideally zoom towards tap position, but center zoom is acceptable for simple implementation
      translateX.value = 0
      translateY.value = 0
    }
  }
  lastTapTime = now
}

const getBounds = (currentScale = scale.value) => {
  if (!canvasRef.value) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Dimensions with current scale
  const currentWidth = imgWidth.value * currentScale
  const currentHeight = imgHeight.value * currentScale

  let maxX = 0,
    minX = 0,
    maxY = 0,
    minY = 0

  // Horizontal bounds
  if (currentWidth <= viewportWidth) {
    maxX = 0
    minX = 0
  } else {
    const overflowX = (currentWidth - viewportWidth) / 2
    maxX = overflowX
    minX = -overflowX
  }

  // Vertical bounds
  if (currentHeight <= viewportHeight) {
    maxY = 0
    minY = 0
  } else {
    const overflowY = (currentHeight - viewportHeight) / 2
    maxY = overflowY
    minY = -overflowY
  }

  return { minX, maxX, minY, maxY }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
      translateX.value = 0
      translateY.value = 0
      scale.value = 1
    } else {
      document.body.style.overflow = ''
    }
  },
)

const updateDimensions = () => {
  if (imageRef.value) {
    // Recalculate dimensions on resize to ensure responsiveness
    calculateDimensions()

    // Optional: Reset zoom on major resize if desired, or keep it.
    // Keeping it might be better, but if the aspect ratio changes significantly,
    // we might want to ensure bounds are correct.
    // Since calculateDimensions updates imgWidth/imgHeight, the computed imageStyle will update.
    // We should re-check bounds if scaled.
    if (scale.value > 1) {
      const bounds = getBounds(scale.value)
      let newTx = translateX.value
      let newTy = translateY.value

      if (newTx > bounds.maxX) newTx = bounds.maxX
      if (newTx < bounds.minX) newTx = bounds.minX
      if (newTy > bounds.maxY) newTy = bounds.maxY
      if (newTy < bounds.minY) newTy = bounds.minY

      translateX.value = newTx
      translateY.value = newTy
    }
  }
}

onMounted(() => {
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
  document.body.style.overflow = ''
})
</script>

<style scoped lang="scss">
.mobile-image-viewer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 750px;
  height: 100%;
  margin: 0 auto;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.4); /* Consistent background opacity */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: none;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); /* Shadow for PC view boundary */
}

.mobile-image-viewer-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: transparent;
}

.viewer-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-image {
  /* Dimensions are controlled by JS */
  /* max-width: 100%; max-height: 100%; REMOVED to allow JS to set exact size */
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  transform-origin: center center;
  will-change: transform; /* Performance hint */
}

.viewer-close {
  position: absolute;
  top: 40px;
  right: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  z-index: 10000;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.zoom-controls {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 10000;

  .zoom-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.4);
    }
  }
}

/* Transitions */
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}
</style>
