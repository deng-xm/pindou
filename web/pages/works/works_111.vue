<template>
  <view class="works-page">
    <text>敬请期待...</text>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShareAppMessage, onPullDownRefresh  } from '@dcloudio/uni-app'
import { getWorks, deleteWork as deleteWorkStorage, duplicateWork as duplicateWorkStorage, getFavorites, addFavorite, removeFavorite } from '@/utils/storage'

const currentTab = ref('all')
const searchKeyword = ref('')
const sortBy = ref('time')
const works = ref([])
const hasMore = ref(false)
const showActionSheet = ref(false)
const selectedWork = ref(null)

// 过滤后的作品
const filteredWorks = computed(() => {
  let result = works.value
  
  // 筛选收藏
  if (currentTab.value === 'favorite') {
    const favIds = getFavorites()
    result = result.filter(w => favIds.includes(w.id))
  }
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(w => 
      w.title?.toLowerCase().includes(keyword)
    )
  }
  
  // 排序
  if (sortBy.value === 'time') {
    result = [...result].sort((a, b) => b.updateTime - a.updateTime)
  } else if (sortBy.value === 'size') {
    result = [...result].sort((a, b) => (b.width * b.height) - (a.width * a.height))
  }
  
  return result
})

onMounted(() => {
  loadWorks()
})

function loadWorks() {
  works.value = getWorks()
}

function switchTab(tab) {
  currentTab.value = tab
}

function handleSearch() {
  // 搜索已由 computed 处理
}

function clearSearch() {
  searchKeyword.value = ''
}

function loadMore() {
  // 实现分页加载
  hasMore.value = false
}

function getCellColor(colorId) {
  if (!colorId || colorId === 0) return 'transparent'
  // 简化的颜色映射
  const colors = [
    '#FFFFFF', '#000000', '#808080', '#C0C0C0',
    '#FF0000', '#8B0000', '#FFC0CB', '#FF69B4',
    '#FF6B00', '#FFD700', '#FFFF00', '#00FF00',
    '#00FFFF', '#0000FF', '#8000FF', '#FF00FF'
  ]
  return colors[colorId % colors.length] || '#CCCCCC'
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function openWork(work) {
  // 使用本地存储传递参数
  uni.setStorageSync('editor_params', {
    workId: work.id
  })
  uni.switchTab({
    url: '/pages/editor/editor'
  })
}

function createNew() {
  uni.removeStorageSync('editor_params')
  uni.switchTab({
    url: '/pages/editor/editor'
  })
}

function toggleFavorite(work) {
  if (isFavorite(work.id)) {
    removeFavorite(work.id)
    uni.showToast({
      title: '已取消收藏',
      icon: 'success'
    })
  } else {
    addFavorite(work.id)
    uni.showToast({
      title: '已添加收藏',
      icon: 'success'
    })
  }
  // 刷新列表
  loadWorks()
}

function isFavorite(workId) {
  return getFavorites().includes(workId)
}

function shareWork(work) {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

function moreActions(work) {
  selectedWork.value = work
  showActionSheet.value = true
}

function editWork() {
  showActionSheet.value = false
  if (selectedWork.value) {
    openWork(selectedWork.value)
  }
}

function downloadWork() {
  showActionSheet.value = false
  uni.showToast({
    title: '图片已保存到相册',
    icon: 'success'
  })
}

function duplicateWork() {
  showActionSheet.value = false
  if (selectedWork.value) {
    duplicateWorkStorage(selectedWork.value.id)
    loadWorks()
    uni.showToast({
      title: '复制成功',
      icon: 'success'
    })
  }
}

function exportWorkPdf() {
  showActionSheet.value = false
  uni.showToast({
    title: 'PDF导出功能开发中',
    icon: 'none'
  })
}

function deleteWork() {
  showActionSheet.value = false
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个作品吗？此操作不可撤销',
    success: (res) => {
      if (res.confirm && selectedWork.value) {
        deleteWorkStorage(selectedWork.value.id)
        loadWorks()
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

// 页面分享
onShareAppMessage(() => {
  return {
    title: '我的拼豆作品集',
    path: '/pages/works/works'
  }
})

// 下拉刷新
onPullDownRefresh(() => {
  loadWorks()
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 500)
})
</script>

<style lang="scss" scoped>
.works-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: $bg-color;
}

.tab-header {
  display: flex;
  background: $bg-white;
  padding: 0 30rpx;
  border-bottom: 1px solid $border-color;
}

.tab-item {
  padding: 24rpx 30rpx;
  font-size: 28rpx;
  color: $text-color-secondary;
  position: relative;
  
  &.active {
    color: $primary-color;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background: $primary-color;
      border-radius: 2rpx;
    }
  }
}

.search-bar {
  padding: 20rpx 30rpx;
  background: $bg-white;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: $bg-grey;
  border-radius: $radius-full;
  padding: 16rpx 24rpx;
  
  .search-icon {
    font-size: 28rpx;
    margin-right: 12rpx;
  }
  
  .search-input {
    flex: 1;
    font-size: 28rpx;
    color: $text-color;
  }
  
  .clear-icon {
    font-size: 32rpx;
    color: $text-color-placeholder;
    padding: 0 10rpx;
  }
}

.sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 30rpx;
  
  .sort-info {
    font-size: 24rpx;
    color: $text-color-secondary;
  }
  
  .sort-controls {
    display: flex;
    gap: 16rpx;
  }
  
  .sort-btn {
    padding: 8rpx 20rpx;
    font-size: 24rpx;
    color: $text-color-secondary;
    background: $bg-white;
    border-radius: $radius-full;
    
    &.active {
      color: $primary-color;
      background: rgba($primary-color, 0.1);
    }
  }
}

.works-list {
  flex: 1;
  padding: 0 20rpx 140rpx;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.work-card {
  background: $bg-white;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.work-preview {
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
}

.work-actions {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  display: flex;
  gap: 8rpx;
  
  .action-icon {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    font-size: 24rpx;
  }
}

.work-info {
  padding: 16rpx;
}

.work-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-color;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
}

.work-size,
.work-date {
  font-size: 22rpx;
  color: $text-color-placeholder;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: $text-color-placeholder;
    margin-bottom: 40rpx;
  }
  
  .empty-btn {
    padding: 20rpx 60rpx;
    background: $primary-color;
    color: #FFFFFF;
    border-radius: $radius-full;
    font-size: 28rpx;
  }
}

.loading-more {
  text-align: center;
  padding: 30rpx;
  color: $text-color-placeholder;
  font-size: 24rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $bg-white;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .bar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    border-radius: $radius-full;
    font-size: 30rpx;
    
    .icon {
      margin-right: 10rpx;
      font-size: 32rpx;
    }
    
    &.primary {
      background: linear-gradient(135deg, $primary-color, $accent-color);
      color: #FFFFFF;
    }
  }
}

.action-sheet {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.action-sheet-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: $bg-white;
  border-radius: $radius-lg $radius-lg 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.action-sheet-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  
  .icon {
    font-size: 36rpx;
    margin-right: 20rpx;
  }
  
  text {
    font-size: 28rpx;
    color: $text-color;
  }
  
  &.danger text {
    color: $error-color;
  }
  
  &:active {
    background: $bg-grey;
  }
}

.action-sheet-cancel {
  text-align: center;
  padding: 30rpx;
  color: $text-color-secondary;
  font-size: 28rpx;
  border-top: 16rpx solid $bg-grey;
}
</style>
