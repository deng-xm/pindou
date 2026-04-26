+<template>
    <view class="settings-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">画布设置</text>
          <view class="close-btn" @tap="showSettingsModal = false">×</view>
        </view>
        
        <view class="settings-content">
          <view class="setting-item">
            <text class="setting-label">画布宽度</text>
            <view class="setting-control">
              <input 
                type="number" 
                v-model="canvasWidth" 
                class="setting-input"
              />
              <text class="setting-unit">格</text>
            </view>
          </view>
          
          <view class="setting-item">
            <text class="setting-label">画布高度</text>
            <view class="setting-control">
              <input 
                type="number" 
                v-model="canvasHeight" 
                class="setting-input"
              />
              <text class="setting-unit">格</text>
            </view>
          </view>
          
          <view class="setting-item">
            <text class="setting-label">格子大小</text>
            <view class="setting-control">
              <slider 
                :value="cellSize" 
                :min="10" 
                :max="30" 
                :step="2"
                :show-value="true"
              />
            </view>
          </view>
          
          <view class="setting-item">
            <text class="setting-label">快捷模板</text>
            <view class="template-presets">
              <view 
                v-for="preset in sizePresets" 
                :key="preset.label"
                class="preset-btn"
                :class="{ active: canvasWidth === preset.w && canvasHeight === preset.h }"
                @tap="applyPreset(preset)"
              >
                {{ preset.label }}
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel" @tap="showSettingsModal = false">取消</button>
          <button class="modal-btn confirm" @tap="applySettings">{{confirmButtonText}}</button>
        </view>
      </view>
</template>
<script setup>
import { ref, watch } from 'vue'
// 画布配置
const cellSize = ref(10)
const gridWidthCells = ref(100)
const gridHeightCells = ref(100)
const confirmButtonText = ref('应用')

// 尺寸预设
const sizePresets = [
  { label: '小 29x29', w: 29, h: 29 },
  { label: '中 51x51', w: 51, h: 51 },
  { label: '大 102x102', w: 102, h: 102 },
  { label: '超大 204x204', w: 204, h: 204 },
]

// 应用预设
function applyPreset(preset) {
  canvasWidth.value = preset.w
  canvasHeight.value = preset.h
}
// 应用设置
function applySettings() {
  const newWidth = Math.max(5, Math.min(100, canvasWidth.value))
  const newHeight = Math.max(5, Math.min(100, canvasHeight.value))
  
  // 调整画布大小
  const oldData = gridData.value
  gridData.value = []
  
  for (let y = 0; y < newHeight; y++) {
    gridData.value[y] = []
    for (let x = 0; x < newWidth; x++) {
      gridData.value[y][x] = oldData[y]?.[x] || 0
    }
  }
  
  gridWidthCells.value = newWidth
  gridHeightCells.value = newHeight
//   updateCanvasSize()
  
//   showSettingsModal.value = false
this.$emit('updateCanvas',)
}
</script>
<style lang="scss" scoped>
.settings-modal {
  background: #FFFFFF;
  border-radius: $radius-lg;
  width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid $border-color;
  
  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
  }
  
  .close-btn {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: $text-color-secondary;
  }
}

.settings-content {
  padding: 30rpx;
}

.setting-item {
  margin-bottom: 30rpx;
  
  .setting-label {
    display: block;
    font-size: 28rpx;
    color: $text-color;
    margin-bottom: 12rpx;
  }
  
  .setting-control {
    display: flex;
    align-items: center;
  }
  
  .setting-input {
    flex: 1;
    height: 70rpx;
    border: 1px solid $border-color;
    border-radius: $radius-sm;
    padding: 0 20rpx;
    font-size: 28rpx;
  }
  
  .setting-unit {
    margin-left: 12rpx;
    color: $text-color-secondary;
  }
}

.template-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  
  .preset-btn {
    padding: 12rpx 20rpx;
    background: $bg-grey;
    border-radius: $radius-sm;
    font-size: 24rpx;
    
    &.active {
      background: $primary-color;
      color: #FFFFFF;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1px solid $border-color;
  
  .modal-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-full;
    font-size: 28rpx;
    
    &.cancel {
      background: $bg-grey;
      color: $text-color;
    }
    
    &.confirm {
      background: $primary-color;
      color: #FFFFFF;
    }
  }
}
</style>
