<template>
  <view class="color-picker">
    <view class="current-selection">
      <view 
        class="color-preview" 
        :style="{ backgroundColor: currentColor.color }"
      ></view>
      <text class="color-label">{{ currentColor.name }}</text>
    </view>
    
    <!-- 预设调色板 -->
    <view class="palette-section" v-if="showPreset">
      <text class="palette-title">快捷调色板</text>
      <scroll-view class="palette-scroll" scroll-x>
        <view class="preset-list">
          <view 
            v-for="preset in presets" 
            :key="preset.name"
            class="preset-item"
            @tap="selectPreset(preset)"
          >
            <view class="preset-colors">
              <view 
                v-for="color in preset.colors.slice(0, 5)" 
                :key="color.id"
                class="preset-color"
                :style="{ backgroundColor: color.color }"
              ></view>
            </view>
            <text class="preset-name">{{ preset.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 完整调色板 -->
    <view class="full-palette">
      <text class="palette-title">全部颜色 ({{ colors.length }})</text>
      <view class="color-grid">
        <view 
          v-for="color in colors" 
          :key="color.id"
          class="color-item"
          :class="{ active: currentIndex === colors.findIndex(c => c.id === color.id) }"
          @tap="selectColor(color)"
        >
          <view 
            class="color-swatch" 
            :style="{ backgroundColor: color.color }"
          >
            <view class="color-check" v-if="currentIndex === colors.findIndex(c => c.id === color.id)}">✓</view>
          </view>
          <text class="color-name">{{ color.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { pindouColors, presetPalettes } from '@/utils/colorPalette'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  showPreset: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentIndex = ref(props.modelValue)

const colors = computed(() => {
  return pindouColors.filter(c => c.color !== 'transparent' && c.color !== 'rainbow')
})

const currentColor = computed(() => {
  return colors.value[currentIndex.value] || colors.value[0]
})

const presets = computed(() => {
  const result = []
  for (const [key, ids] of Object.entries(presetPalettes)) {
    const presetColors = ids.map(id => pindouColors.find(c => c.id === id)).filter(Boolean)
    if (presetColors.length > 0) {
      result.push({
        name: getPresetName(key),
        colors: presetColors
      })
    }
  }
  return result
})

function getPresetName(key) {
  const names = {
    basic: '基础色',
    rainbow: '彩虹色',
    pastel: '马卡龙',
    nature: '自然色',
    skin: '肤色系',
    warm: '暖色系',
    cool: '冷色系'
  }
  return names[key] || key
}

function selectColor(color) {
  const index = colors.value.findIndex(c => c.id === color.id)
  currentIndex.value = index
  emit('update:modelValue', index)
  emit('change', color)
}

function selectPreset(preset) {
  // 选择预设中的第一个颜色
  if (preset.colors.length > 0) {
    selectColor(preset.colors[0])
  }
}
</script>

<style lang="scss" scoped>
.color-picker {
  background: $bg-white;
  border-radius: $radius-lg;
  padding: 24rpx;
}

.current-selection {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  
  .color-preview {
    width: 64rpx;
    height: 64rpx;
    border-radius: 16rpx;
    border: 2px solid $border-color;
    margin-right: 16rpx;
  }
  
  .color-label {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-color;
  }
}

.palette-section {
  margin-bottom: 24rpx;
}

.palette-title {
  display: block;
  font-size: 24rpx;
  color: $text-color-secondary;
  margin-bottom: 16rpx;
}

.palette-scroll {
  width: 100%;
}

.preset-list {
  display: flex;
  gap: 20rpx;
  padding: 4rpx 0;
}

.preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120rpx;
  
  .preset-colors {
    display: flex;
    margin-bottom: 8rpx;
  }
  
  .preset-color {
    width: 24rpx;
    height: 40rpx;
    margin-right: 2rpx;
    border-radius: 4rpx;
  }
  
  .preset-name {
    font-size: 20rpx;
    color: $text-color-secondary;
  }
}

.full-palette {
  .color-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16rpx;
  }
  
  .color-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    &.active .color-swatch {
      outline: 3px solid $primary-color;
      outline-offset: 2rpx;
    }
    
    .color-swatch {
      width: 48rpx;
      height: 48rpx;
      border-radius: 10rpx;
      border: 1px solid $border-light;
      margin-bottom: 6rpx;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .color-check {
      color: #FFFFFF;
      font-size: 20rpx;
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
    }
    
    .color-name {
      font-size: 16rpx;
      color: $text-color-placeholder;
      text-align: center;
      max-width: 60rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
