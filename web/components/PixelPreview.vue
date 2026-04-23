<template>
  <view class="export-modal" v-if="visible" @tap="close">
    <view class="export-content" @tap.stop>
      <view class="export-header">
        <text class="export-title">导出设置</text>
        <view class="close-btn" @tap="close">×</view>
      </view>
      
      <view class="export-options">
        <!-- 导出格式 -->
        <view class="option-section">
          <text class="option-label">导出格式</text>
          <view class="format-options">
            <view 
              class="format-item"
              :class="{ active: format === 'png' }"
              @tap="format = 'png'"
            >
              <text class="format-icon">🖼</text>
              <text class="format-name">PNG图片</text>
            </view>
            <view 
              class="format-item"
              :class="{ active: format === 'pdf' }"
              @tap="format = 'pdf'"
            >
              <text class="format-icon">📄</text>
              <text class="format-name">PDF图纸</text>
            </view>
          </view>
        </view>
        
        <!-- 尺寸设置 -->
        <view class="option-section">
          <text class="option-label">输出尺寸</text>
          <view class="size-options">
            <slider 
              :value="outputSize" 
              :min="10" 
              :max="50" 
              :step="5"
              :show-value="true"
              @change="outputSize = $event.detail.value"
            />
            <text class="size-hint">每个格子的像素大小</text>
          </view>
        </view>
        
        <!-- 选项 -->
        <view class="option-section">
          <text class="option-label">显示选项</text>
          <view class="checkbox-options">
            <label class="checkbox-item" @tap="showGrid = !showGrid">
              <checkbox :checked="showGrid" />
              <text>显示网格线</text>
            </label>
            <label class="checkbox-item" @tap="showNumbers = !showNumbers">
              <checkbox :checked="showNumbers" />
              <text>显示颜色编号</text>
            </label>
            <label class="checkbox-item" @tap="includeLegend = !includeLegend">
              <checkbox :checked="includeLegend" />
              <text>包含图例说明</text>
            </label>
          </view>
        </view>
      </view>
      
      <view class="export-footer">
        <button class="export-btn cancel" @tap="close">取消</button>
        <button class="export-btn confirm" @tap="handleExport">导出</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  workData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'export'])

const format = ref('png')
const outputSize = ref(20)
const showGrid = ref(true)
const showNumbers = ref(false)
const includeLegend = ref(true)

function close() {
  emit('close')
}

function handleExport() {
  emit('export', {
    format: format.value,
    outputSize: outputSize.value,
    showGrid: showGrid.value,
    showNumbers: showNumbers.value,
    includeLegend: includeLegend.value
  })
  close()
}
</script>

<style lang="scss" scoped>
.export-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-content {
  background: $bg-white;
  border-radius: $radius-lg;
  width: 90%;
  max-width: 600rpx;
  overflow: hidden;
}

.export-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid $border-color;
  
  .export-title {
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

.export-options {
  padding: 30rpx;
}

.option-section {
  margin-bottom: 30rpx;
  
  .option-label {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 16rpx;
  }
}

.format-options {
  display: flex;
  gap: 20rpx;
  
  .format-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx;
    background: $bg-grey;
    border-radius: $radius-md;
    border: 2px solid transparent;
    
    &.active {
      border-color: $primary-color;
      background: rgba($primary-color, 0.1);
    }
    
    .format-icon {
      font-size: 48rpx;
      margin-bottom: 8rpx;
    }
    
    .format-name {
      font-size: 24rpx;
      color: $text-color;
    }
  }
}

.size-options {
  background: $bg-grey;
  padding: 20rpx;
  border-radius: $radius-md;
  
  .size-hint {
    display: block;
    font-size: 22rpx;
    color: $text-color-placeholder;
    margin-top: 8rpx;
    text-align: center;
  }
}

.checkbox-options {
  .checkbox-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    
    checkbox {
      margin-right: 12rpx;
    }
    
    text {
      font-size: 28rpx;
      color: $text-color;
    }
  }
}

.export-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1px solid $border-color;
  
  .export-btn {
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
