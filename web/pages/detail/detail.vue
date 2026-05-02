<template>
  <view class="detail-page">
    <!-- 顶部图片展示 -->
    <view class="preview-section">
      <scroll-view class="preview-scroll" scroll-x scroll-y>
        <view class="full-preview">
          <view 
            v-for="(row, y) in work?.gridData || []" 
            :key="y"
            class="preview-row"
          >
            <view 
              v-for="(cell, x) in row" 
              :key="x"
              class="preview-cell"
              :style="{ backgroundColor: getCellColor(cell) }"
            ></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 作品信息 -->
    <view class="info-section">
      <view class="work-header">
        <text class="work-title">{{ work?.title || '未命名作品' }}</text>
        <view class="work-date">{{ formatDate(work?.createTime) }}</view>
      </view>

      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">画布尺寸</text>
          <text class="info-value">{{ work?.width }}x{{ work?.height }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">颜色数量</text>
          <text class="info-value">{{ work?.colorCount || 0 }}种</text>
        </view>
        <view class="info-item">
          <text class="info-label">像素总数</text>
          <text class="info-value">{{ pixelCount }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-btn" @tap="editWork">
        <text class="icon">✏️</text>
        <text>编辑</text>
      </view>
      <view class="action-btn" @tap="downloadImage">
        <text class="icon">📥</text>
        <text>下载</text>
      </view>
      <view class="action-btn" @tap="shareWork">
        <text class="icon">📤</text>
        <text>分享</text>
      </view>
      <view class="action-btn" @tap="toggleFavorite">
        <text class="icon">{{ isFav ? '❤️' : '🤍' }}</text>
        <text>收藏</text>
      </view>
    </view>

    <!-- 颜色统计 -->
    <view class="colors-section">
      <view class="section-title">使用的颜色</view>
      <view class="color-list">
        <view 
          class="color-chip" 
          v-for="color in usedColors" 
          :key="color.id"
        >
          <view 
            class="color-swatch" 
            :style="{ backgroundColor: color.color }"
          ></view>
          <text class="color-name">{{ color.name }}</text>
        </view>
      </view>
    </view>

    <!-- 使用说明 -->
    <view class="guide-section">
      <view class="section-title">拼豆制作小贴士</view>
      <view class="guide-content">
        <text class="guide-item">1. 根据图纸颜色购买对应颜色的拼豆珠子</text>
        <text class="guide-item">2. 使用拼豆熨斗熨烫定型，温度适中</text>
        <text class="guide-item">3. 熨烫时可在珠子表面覆盖薄纸</text>
        <text class="guide-item">4. 建议从中心向外围熨烫，确保持久定型</text>
      </view>
    </view>
    
    <!-- Hidden canvas for export -->
    <canvas 
      type="2d"
      id="exportCanvas"
      canvas-id="exportCanvas"
      class="export-canvas"
    ></canvas>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getWorkById, addFavorite, removeFavorite, getFavorites } from '@/utils/storage'
import { mard291 } from '@/utils/colorPalette'

const work = ref(null)
const isFav = ref(false)

const pixelCount = computed(() => {
  if (!work.value?.gridData) return 0
  let count = 0
  for (const row of work.value.gridData) {
    for (const cell of row) {
      if (cell > 0) count++
    }
  }
  return count
})

const usedColors = computed(() => {
  if (!work.value?.gridData) return []
  const colorIds = new Set()
  for (const row of work.value.gridData) {
    for (const cell of row) {
      if (cell > 0) colorIds.add(cell)
    }
  }
  return Array.from(colorIds)
    .map(id => mard291[id - 1])
    .filter(Boolean)
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  if (options.id) {
    work.value = getWorkById(options.id)
    isFav.value = getFavorites().includes(options.id)
  }
})

function getCellColor(colorId) {
  if (!colorId || colorId === 0) return 'transparent'
  const color = mard291[colorId - 1]
  return color?.color || '#CCCCCC'
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function editWork() {
  if (work.value) {
    uni.navigateTo({
      url: `/pages/editor/editor?workId=${work.value.id}`
    })
  }
}

function downloadImage() {
  if (!work.value) return
  
  uni.showLoading({ title: '生成图片中...' })
  
  // Create offscreen canvas for export
  const query = uni.createSelectorQuery()
  query.select('#exportCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        // If canvas not found in template, create one dynamically
        createExportCanvas()
        return
      }
      
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      
      const width = work.value.width
      const height = work.value.height
      const cellSizeExport = 20 // Fixed size for export
      
      const exportWidth = width * cellSizeExport
      const exportHeight = height * cellSizeExport
      
      canvas.width = exportWidth * dpr
      canvas.height = exportHeight * dpr
      ctx.scale(dpr, dpr)
      
      // Draw white background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, exportWidth, exportHeight)
      
      // Draw each cell
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let colorId = 0
          if (y < work.value.gridData.length && x < work.value.gridData[y].length) {
            colorId = work.value.gridData[y][x]
          }
          
          if (colorId > 0) {
            const pindouColor = mard291[colorId - 1]
            if (pindouColor && pindouColor.color !== 'transparent') {
              ctx.fillStyle = pindouColor.color
              ctx.fillRect(x * cellSizeExport, y * cellSizeExport, cellSizeExport, cellSizeExport)
            }
          }
          
          // Draw grid lines
          ctx.strokeStyle = 'rgba(0,0,0,0.1)'
          ctx.lineWidth = 0.5
          ctx.strokeRect(x * cellSizeExport, y * cellSizeExport, cellSizeExport, cellSizeExport)
        }
      }
      
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvas: canvas,
          x: 0,
          y: 0,
          width: exportWidth,
          height: exportHeight,
          destWidth: exportWidth,
          destHeight: exportHeight,
          fileType: 'png',
          quality: 1,
          success: (res) => {
            saveImageToAlbum(res.tempFilePath)
          },
          fail: (err) => {
            console.error('导出失败:', err)
            uni.hideLoading()
            uni.showToast({
              title: '导出失败',
              icon: 'none'
            })
          }
        })
      }, 200)
    })
}

function createExportCanvas() {
  // Fallback: use the imageProcessor utility
  import('@/utils/imageProcessor').then(module => {
    module.exportAsImage(work.value.gridData, {
      cellSize: 20,
      showGrid: true,
      backgroundColor: '#FFFFFF'
    }).then(filePath => {
      saveImageToAlbum(filePath)
    }).catch(err => {
      console.error('导出失败:', err)
      uni.hideLoading()
      uni.showToast({
        title: '导出失败',
        icon: 'none'
      })
    })
  })
}

function saveImageToAlbum(filePath) {
  wx.saveImageToPhotosAlbum({
    filePath: filePath,
    success: () => {
      uni.hideLoading()
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },
    fail: (err) => {
      uni.hideLoading()
      if (err.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      } else {
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    }
  })
}

function shareWork() {
  uni.showShareMenu({
    withShareTicket: true
  })
}

function toggleFavorite() {
  if (!work.value) return
  
  if (isFav.value) {
    removeFavorite(work.value.id)
    isFav.value = false
    uni.showToast({ title: '已取消收藏', icon: 'success' })
  } else {
    addFavorite(work.value.id)
    isFav.value = true
    uni.showToast({ title: '已添加收藏', icon: 'success' })
  }
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 40rpx;
}

.preview-section {
  background: $bg-white;
  padding: 40rpx;
}

.preview-scroll {
  max-height: 600rpx;
}

.full-preview {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: fit-content;
}

.preview-row {
  display: flex;
}

.preview-cell {
  width: 15rpx;
  height: 15rpx;
}

.info-section {
  background: $bg-white;
  margin: 20rpx 0;
  padding: 30rpx;
}

.work-header {
  margin-bottom: 30rpx;
}

.work-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: $text-color;
  margin-bottom: 8rpx;
}

.work-date {
  font-size: 24rpx;
  color: $text-color-placeholder;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.info-item {
  text-align: center;
  
  .info-label {
    display: block;
    font-size: 22rpx;
    color: $text-color-placeholder;
    margin-bottom: 8rpx;
  }
  
  .info-value {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-color;
  }
}

.action-section {
  display: flex;
  justify-content: space-around;
  background: $bg-white;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .icon {
      font-size: 40rpx;
      margin-bottom: 8rpx;
    }
    
    text {
      font-size: 22rpx;
      color: $text-color-secondary;
    }
  }
}

.colors-section,
.guide-section {
  background: $bg-white;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-color;
  margin-bottom: 20rpx;
}

.color-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.color-chip {
  display: flex;
  align-items: center;
  background: $bg-grey;
  padding: 8rpx 16rpx;
  border-radius: $radius-full;
  
  .color-swatch {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    margin-right: 10rpx;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .color-name {
    font-size: 22rpx;
    color: $text-color-secondary;
  }
}

.guide-content {
  .guide-item {
    display: block;
    font-size: 26rpx;
    color: $text-color-secondary;
    line-height: 2;
  }
}

.export-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}
</style>
