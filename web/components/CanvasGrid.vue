<template>
  <view 
    class="pixel-canvas"
    :style="canvasStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- 网格层 -->
    <view class="grid-layer">
      <view 
        v-for="(row, y) in gridData" 
        :key="'row-' + y"
        class="grid-row"
      >
        <view 
          v-for="(cell, x) in row" 
          :key="'cell-' + x"
          class="grid-cell"
          :style="getCellStyle(cell, x, y)"
          @tap="handleCellTap(x, y)"
          @longpress="handleCellLongPress(x, y)"
        >
          <!-- 编号 -->
          <text 
            v-if="showNumbers && cell > 0 && cellSize >= 15" 
            class="cell-number"
          >{{ cell }}</text>
        </view>
      </view>
    </view>
    
    <!-- 辅助线层 -->
    <view 
      class="guide-layer" 
      v-if="showGuide"
      :style="{ 
        backgroundSize: `${cellSize * 5}px ${cellSize * 5}px` 
      }"
    ></view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  gridData: {
    type: Array,
    default: () => []
  },
  width: {
    type: Number,
    default: 29
  },
  height: {
    type: Number,
    default: 29
  },
  cellSize: {
    type: Number,
    default: 20
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  showNumbers: {
    type: Boolean,
    default: false
  },
  showGuide: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  currentColor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:gridData', 'cellClick', 'change'])

const isDrawing = ref(false)
const lastCell = ref({ x: -1, y: -1 })

const canvasStyle = computed(() => ({
  width: props.width * props.cellSize + 'px',
  height: props.height * props.cellSize + 'px'
}))

function getCellStyle(colorId, x, y) {
  const bgColor = colorId > 0 ? `rgb(${(colorId * 20) % 256}, ${(colorId * 40) % 256}, ${(colorId * 60) % 256})` : 'transparent'
  return {
    width: props.cellSize + 'px',
    height: props.cellSize + 'px',
    backgroundColor: bgColor,
    borderColor: props.showGrid ? 'rgba(0,0,0,0.1)' : 'transparent'
  }
}

function handleCellTap(x, y) {
  if (props.readonly) return
  emit('cellClick', { x, y, color: props.currentColor })
}

function handleCellLongPress(x, y) {
  if (props.readonly) return
  // 长按清除
  emit('cellClick', { x, y, color: null })
}

function handleTouchStart(e) {
  if (props.readonly) return
  isDrawing.value = true
  updateDrawingCell(e)
}

function handleTouchMove(e) {
  if (props.readonly || !isDrawing.value) return
  updateDrawingCell(e)
}

function handleTouchEnd() {
  isDrawing.value = false
  lastCell.value = { x: -1, y: -1 }
}

function updateDrawingCell(e) {
  const touch = e.touches[0]
  const rect = e.currentTarget.getBoundingClientRect()
  const x = Math.floor((touch.clientX - rect.left) / props.cellSize)
  const y = Math.floor((touch.clientY - rect.top) / props.cellSize)
  
  if (x >= 0 && x < props.width && y >= 0 && y < props.height) {
    if (lastCell.value.x !== x || lastCell.value.y !== y) {
      emit('cellClick', { x, y, color: props.currentColor })
      lastCell.value = { x, y }
    }
  }
}
</script>

<style lang="scss" scoped>
.pixel-canvas {
  position: relative;
  user-select: none;
  touch-action: none;
}

.grid-layer {
  display: flex;
  flex-direction: column;
}

.grid-row {
  display: flex;
}

.grid-cell {
  box-sizing: border-box;
  border-style: solid;
  border-width: 0.5px;
  position: relative;
  
  .cell-number {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 8px;
    color: rgba(0, 0, 0, 0.4);
    pointer-events: none;
  }
}

.guide-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background-image: 
    linear-gradient(to right, rgba(255, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
}
</style>
