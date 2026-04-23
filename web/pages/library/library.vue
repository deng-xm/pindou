<template>
  <view class="library-page">
    <!-- 分类标签 -->
    <scroll-view class="category-tabs" scroll-x>
      <view class="tab-list">
        <view 
          v-for="category in categories" 
          :key="category.id"
          class="tab-item"
          :class="{ active: currentCategory === category.id }"
          @tap="switchCategory(category.id)"
        >
          <text class="tab-icon">{{ category.icon }}</text>
          <text class="tab-name">{{ category.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 筛选和搜索 -->
    <view class="filter-bar">
      <view class="filter-info">
        <text>{{ filteredTemplates.length }} 个素材</text>
      </view>
      <view class="filter-actions">
        <view 
          class="filter-btn" 
          :class="{ active: viewMode === 'grid' }"
          @tap="viewMode = 'grid'"
        >
          ▦
        </view>
        <view 
          class="filter-btn"
          :class="{ active: viewMode === 'list' }"
          @tap="viewMode = 'list'"
        >
          ☰
        </view>
      </view>
    </view>

    <!-- 素材列表 -->
    <scroll-view 
      class="template-list" 
      scroll-y 
      @scrolltolower="loadMore"
    >
      <!-- 网格视图 -->
      <view class="template-grid" v-if="viewMode === 'grid'">
        <view 
          class="template-card" 
          v-for="template in filteredTemplates" 
          :key="template.id"
          @tap="previewTemplate(template)"
        >
          <view class="template-preview">
            <view class="preview-canvas">
              <view 
                v-for="(row, y) in template.gridData.slice(0, 20)" 
                :key="y"
                class="preview-row"
              >
                <view 
                  v-for="(cell, x) in row.slice(0, 20)" 
                  :key="x"
                  class="preview-cell"
                  :style="{ backgroundColor: getCellColor(cell) }"
                ></view>
              </view>
            </view>
            <view class="template-overlay">
              <text class="use-btn">立即使用</text>
            </view>
          </view>
          <view class="template-info">
            <text class="template-title">{{ template.title }}</text>
            <view class="template-meta">
              <text class="template-size">{{ template.width }}x{{ template.height }}</text>
              <text class="template-colors">{{ template.colorCount }}色</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 列表视图 -->
      <view class="template-list-view" v-else>
        <view 
          class="template-row" 
          v-for="template in filteredTemplates" 
          :key="template.id"
          @tap="previewTemplate(template)"
        >
          <view class="row-preview">
            <view class="mini-canvas">
              <view 
                v-for="(row, y) in template.gridData.slice(0, 15)" 
                :key="y"
                class="preview-row"
              >
                <view 
                  v-for="(cell, x) in row.slice(0, 15)" 
                  :key="x"
                  class="preview-cell mini"
                  :style="{ backgroundColor: getCellColor(cell) }"
                ></view>
              </view>
            </view>
          </view>
          <view class="row-info">
            <text class="row-title">{{ template.title }}</text>
            <view class="row-meta">
              <text>尺寸: {{ template.width }}x{{ template.height }}</text>
              <text>颜色: {{ template.colorCount }}</text>
            </view>
          </view>
          <view class="row-action">
            <text>使用</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredTemplates.length === 0">
        <text class="empty-icon">📂</text>
        <text class="empty-text">该分类下暂无素材</text>
      </view>
    </scroll-view>

    <!-- 预览弹窗 -->
    <view class="preview-modal" v-if="showPreview" @tap="showPreview = false">
      <view class="preview-content" @tap.stop>
        <view class="preview-header">
          <text class="preview-title">{{ selectedTemplate?.title }}</text>
          <view class="preview-close" @tap="showPreview = false">×</view>
        </view>
        
        <view class="preview-canvas-container">
          <scroll-view class="preview-scroll" scroll-x scroll-y>
            <view class="full-preview">
              <view 
                v-for="(row, y) in selectedTemplate?.gridData || []" 
                :key="y"
                class="preview-row"
              >
                <view 
                  v-for="(cell, x) in row" 
                  :key="x"
                  class="preview-cell large"
                  :style="{ backgroundColor: getCellColor(cell) }"
                ></view>
              </view>
            </view>
          </scroll-view>
        </view>
        
        <view class="preview-info">
          <view class="info-item">
            <text class="info-label">尺寸</text>
            <text class="info-value">{{ selectedTemplate?.width }}x{{ selectedTemplate?.height }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">颜色数</text>
            <text class="info-value">{{ selectedTemplate?.colorCount }}</text>
          </view>
        </view>
        
        <view class="preview-actions">
          <button class="action-btn secondary" @tap="showPreview = false">取消</button>
          <button class="action-btn primary" @tap="useTemplate">使用此模板</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTemplates } from '@/utils/storage'
import { onPullDownRefresh } from '@dcloudio/uni-app'

const categories = [
  { id: 'all', name: '全部', icon: '📋' },
  { id: 'simple', name: '简约', icon: '◇' },
  { id: 'emoji', name: '表情', icon: '😊' },
  { id: 'animal', name: '动物', icon: '🐱' },
  { id: 'food', name: '美食', icon: '🍕' },
  { id: 'nature', name: '自然', icon: '🌸' },
  { id: 'character', name: '人物', icon: '👤' },
  { id: 'pattern', name: '图案', icon: '❀' }
]

const currentCategory = ref('all')
const viewMode = ref('grid')
const templates = ref([])
const showPreview = ref(false)
const selectedTemplate = ref(null)

// 过滤后的模板
const filteredTemplates = computed(() => {
  if (currentCategory.value === 'all') {
    return templates.value
  }
  // 实际项目中应该有分类字段，这里简化处理
  return templates.value
})

onMounted(() => {
  loadTemplates()
})

function loadTemplates() {
  templates.value = getTemplates()
}

function switchCategory(categoryId) {
  currentCategory.value = categoryId
}

function loadMore() {
  // 实现分页加载
}

function getCellColor(colorId) {
  if (!colorId || colorId === 0) return 'transparent'
  const colors = [
    '#FFFFFF', '#000000', '#808080', '#C0C0C0',
    '#FF0000', '#8B0000', '#FFC0CB', '#FF69B4',
    '#FF6B00', '#FFD700', '#FFFF00', '#00FF00',
    '#00FFFF', '#0000FF', '#8000FF', '#FF00FF',
    '#8B4513', '#F5DEB3', '#4169E1', '#32CD32',
    '#FF6347', '#DA70D6', '#40E0D0', '#FF7F50'
  ]
  return colors[colorId % colors.length] || '#CCCCCC'
}

function previewTemplate(template) {
  selectedTemplate.value = template
  showPreview.value = true
}

function useTemplate() {
  showPreview.value = false
  // 使用本地存储传递参数
  uni.setStorageSync('editor_params', {
    templateId: selectedTemplate.value.id
  })
  uni.switchTab({
    url: '/pages/editor/editor'
  })
}

// 下拉刷新
onPullDownRefresh(() => {
  loadTemplates()
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 500)
})
</script>

<style lang="scss" scoped>
.library-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: $bg-color;
}

.category-tabs {
  background: $bg-white;
  padding: 10rpx 0;
  white-space: nowrap;
}

.tab-list {
  display: inline-flex;
  padding: 0 20rpx;
  gap: 16rpx;
}

.tab-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: $radius-md;
  background: $bg-grey;
  min-width: 100rpx;
  
  &.active {
    background: $primary-color;
    
    .tab-icon,
    .tab-name {
      color: #FFFFFF;
    }
  }
  
  .tab-icon {
    font-size: 28rpx;
    margin-bottom: 4rpx;
  }
  
  .tab-name {
    font-size: 22rpx;
    color: $text-color;
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: $bg-white;
  border-bottom: 1px solid $border-light;
  
  .filter-info {
    font-size: 24rpx;
    color: $text-color-secondary;
  }
  
  .filter-actions {
    display: flex;
    gap: 12rpx;
  }
  
  .filter-btn {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-grey;
    border-radius: $radius-sm;
    color: $text-color-secondary;
    font-size: 24rpx;
    
    &.active {
      background: $primary-color;
      color: #FFFFFF;
    }
  }
}

.template-list {
  flex: 1;
  padding: 20rpx;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.template-card {
  background: $bg-white;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.template-preview {
  position: relative;
  aspect-ratio: 1;
  background: $bg-grey;
}

.preview-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-row {
  display: flex;
  flex: 1;
}

.preview-cell {
  flex: 1;
  
  &.mini {
    min-width: 4rpx;
    min-height: 4rpx;
  }
  
  &.large {
    min-width: 12rpx;
    min-height: 12rpx;
  }
}

.template-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  
  .template-card:active & {
    opacity: 1;
  }
  
  .use-btn {
    padding: 16rpx 40rpx;
    background: $primary-color;
    color: #FFFFFF;
    border-radius: $radius-full;
    font-size: 26rpx;
  }
}

.template-info {
  padding: 16rpx;
}

.template-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-color;
  margin-bottom: 8rpx;
}

.template-meta {
  display: flex;
  gap: 16rpx;
}

.template-size,
.template-colors {
  font-size: 22rpx;
  color: $text-color-placeholder;
}

.template-list-view {
  .template-row {
    display: flex;
    align-items: center;
    background: $bg-white;
    border-radius: $radius-md;
    padding: 20rpx;
    margin-bottom: 16rpx;
  }
  
  .row-preview {
    width: 120rpx;
    height: 120rpx;
    background: $bg-grey;
    border-radius: $radius-sm;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .mini-canvas {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .row-info {
    flex: 1;
    margin-left: 20rpx;
  }
  
  .row-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 8rpx;
  }
  
  .row-meta {
    display: flex;
    gap: 20rpx;
    
    text {
      font-size: 22rpx;
      color: $text-color-placeholder;
    }
  }
  
  .row-action {
    padding: 12rpx 24rpx;
    background: $primary-color;
    color: #FFFFFF;
    border-radius: $radius-full;
    font-size: 24rpx;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: $text-color-placeholder;
  }
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-content {
  background: $bg-white;
  border-radius: $radius-lg;
  width: 90%;
  max-width: 700rpx;
  max-height: 80vh;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid $border-color;
  
  .preview-title {
    font-size: 32rpx;
    font-weight: 600;
  }
  
  .preview-close {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: $text-color-secondary;
  }
}

.preview-canvas-container {
  padding: 30rpx;
  background: $bg-grey;
}

.preview-scroll {
  max-height: 500rpx;
}

.full-preview {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: fit-content;
}

.preview-info {
  display: flex;
  justify-content: center;
  gap: 60rpx;
  padding: 20rpx;
  
  .info-item {
    text-align: center;
    
    .info-label {
      display: block;
      font-size: 22rpx;
      color: $text-color-placeholder;
      margin-bottom: 4rpx;
    }
    
    .info-value {
      font-size: 28rpx;
      font-weight: 600;
      color: $text-color;
    }
  }
}

.preview-actions {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1px solid $border-color;
  
  .action-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-full;
    font-size: 28rpx;
    
    &.secondary {
      background: $bg-grey;
      color: $text-color;
    }
    
    &.primary {
      background: $primary-color;
      color: #FFFFFF;
    }
  }
}
</style>
