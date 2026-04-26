<template>
  <view class="index-page">
    <!-- 顶部Banner -->
    <view class="banner">
      <view class="banner-content">
        <text class="banner-title">趣味拼豆</text>
        <text class="banner-subtitle">将图片转换为拼豆创作图纸</text>
      </view>
      <view class="banner-decoration">
        <view class="bead bead-1"></view>
        <view class="bead bead-2"></view>
        <view class="bead bead-3"></view>
      </view>
    </view>

    <!-- 快捷功能入口 -->
    <view class="quick-actions">
      <view class="action-item" @tap="handleCreate">
        <view class="action-icon create-icon">
          <text class="icon">+</text>
        </view>
        <text class="action-text">新建创作</text>
      </view>
      <view class="action-item" @tap="handleUpload">
        <view class="action-icon upload-icon">
          <text class="icon">⬆</text>
        </view>
        <text class="action-text">图片转换</text>
      </view>
      <view class="action-item" @tap="goToTemplates">
        <view class="action-icon template-icon">
          <text class="icon">◈</text>
        </view>
        <text class="action-text">模板素材</text>
      </view>
      <view class="action-item" @tap="goToWorks">
        <view class="action-icon works-icon">
          <text class="icon">▦</text>
        </view>
        <text class="action-text">我的作品</text>
      </view>
    </view>

    <!-- 功能介绍 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">功能特点</text>
      </view>
      <view class="feature-list">
        <view class="feature-item">
          <view class="feature-icon">🎨</view>
          <view class="feature-content">
            <text class="feature-title">图片转图纸</text>
            <text class="feature-desc">上传任意图片，自动转换为拼豆图纸</text>
          </view>
        </view>
        <view class="feature-item">
          <view class="feature-icon">✏️</view>
          <view class="feature-content">
            <text class="feature-title">像素画编辑</text>
            <text class="feature-desc">强大的画布编辑工具，自由创作像素画</text>
          </view>
        </view>
        <view class="feature-item">
          <view class="feature-icon">📥</view>
          <view class="feature-content">
            <text class="feature-title">高清下载</text>
            <text class="feature-desc">导出高清图纸，方便打印和使用</text>
          </view>
        </view>
        <view class="feature-item">
          <view class="feature-icon">📤</view>
          <view class="feature-content">
            <text class="feature-title">一键分享</text>
            <text class="feature-desc">分享作品给好友，展示创意成果</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 最近作品 -->
    <view class="section" v-if="recentWorks.length > 0">
      <view class="section-header">
        <text class="section-title">最近作品</text>
        <text class="section-more" @tap="goToWorks">查看全部</text>
      </view>
      <scroll-view class="works-scroll" scroll-x>
        <view class="works-list">
          <view 
            class="work-card" 
            v-for="work in recentWorks" 
            :key="work.id"
            @tap="openWork(work)"
          >
            <view class="work-preview" :style="{ backgroundColor: '#f5f5f5' }">
              <canvas 
                :canvas-id="'preview-' + work.id" 
                class="preview-canvas"
              ></canvas>
            </view>
            <text class="work-title">{{ work.title || '未命名作品' }}</text>
            <text class="work-date">{{ formatDate(work.updateTime) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 热门模板 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门模板</text>
        <text class="section-more" @tap="goToTemplates">更多模板</text>
      </view>
      <view class="template-grid">
        <view 
          class="template-item" 
          v-for="template in templates" 
          :key="template.id"
          @tap="useTemplate(template)"
        >
          <view class="template-preview">
            <canvas 
              :canvas-id="'template-' + template.id" 
              class="preview-canvas"
            ></canvas>
          </view>
          <text class="template-title">{{ template.title }}</text>
          <view class="template-badge">{{ template.width }}x{{ template.height }}</view>
        </view>
      </view>
    </view>

    <!-- 使用提示 -->
    <view class="tips-section">
      <view class="tips-header">
        <text class="tips-icon">💡</text>
        <text class="tips-title">使用小贴士</text>
      </view>
      <view class="tips-content">
        <text class="tip-item">• 建议使用清晰的图片以获得更好的转换效果</text>
        <text class="tip-item">• 方形的图案最适合拼豆创作</text>
        <text class="tip-item">• 编辑时可缩放画布查看细节</text>
        <text class="tip-item">• 完成作品后可下载高清图纸</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getWorks, getTemplates, getSettings } from '/utils/storage'

const recentWorks = ref([])
const templates = ref([])


onMounted(() => {
  loadData()
})

function loadData() {
  // 加载最近作品
  const works = getWorks()
  recentWorks.value = works.slice(0, 5)
  
  // 加载模板
  templates.value = getTemplates().slice(0, 6)
}

function handleCreate() {
  // 跳转前清除之前的参数
  uni.removeStorageSync('editor_params')
  uni.switchTab({
    url: '/pages/editor/editor'
  })
}

function handleUpload() {

  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // 验证路径是否有效
      if (!tempFilePath || tempFilePath === '') {
        console.error('临时路径为空')
        uni.showToast({
          title: '图片路径无效',
          icon: 'none'
        })
        return
      }
      
      // 立即验证图片是否可访问
      uni.getImageInfo({
        src: tempFilePath,
        success: (infoRes) => {
          console.log('图片尺寸:', infoRes.width, 'x', infoRes.height)
          
          // 关键：将临时文件保存为持久化文件
          uni.saveFile({
            tempFilePath: tempFilePath,
            success: (saveRes) => {
              const savedFilePath = saveRes.savedFilePath
              console.log('文件保存成功，持久化路径:', savedFilePath)
              
              // 再次验证保存后的文件
              uni.getImageInfo({
                src: savedFilePath,
                success: (savedInfo) => {
                  console.log('保存后图片验证成功:', savedInfo)
                  
                  // 使用本地存储传递参数
                  const params = {
                    image: savedFilePath,
                    mode: 'convert'
                  }
                  console.log('准备存储editor_params:', params)
                  
                  try {
                    uni.setStorageSync('editor_params', params)
                    console.log('editor_params存储成功')
                    
                    // 验证存储是否成功
                    const verifyParams = uni.getStorageSync('editor_params')
                    console.log('验证存储内容:', verifyParams)
                    
                    // 选择色卡、网格数量
                    // 延迟跳转，让用户看到调试信息
                    setTimeout(() => {
                      uni.switchTab({
                        url: '/pages/editor/editor'
                      })
                    }, 1000)
                  } catch (err) {
                    console.error('存储参数失败:', err)
                    uni.showToast({
                      title: '存储参数失败',
                      icon: 'none'
                    })
                  }
                },
                fail: (savedErr) => {
                  console.error('保存后图片验证失败:', savedErr)
                  uni.showToast({
                    title: '图片保存后损坏',
                    icon: 'none'
                  })
                }
              })
            },
            fail: (err) => {
              console.error('保存文件失败:', err)
              uni.showToast({
                title: '保存图片失败',
                icon: 'none'
              })
            }
          })
        },
        fail: (err) => {
          console.error('图片信息验证失败:', err)
          console.error('失败的路径:', tempFilePath)
          uni.showToast({
            title: '图片无法读取',
            icon: 'none'
          })
        }
      })
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      uni.showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  })
}

function onDebugImageLoad(e) {
  console.log('调试图片加载成功:', e)
}

function onDebugImageError(e) {
  console.error('调试图片加载失败:', e)
}

function goToTemplates() {
  uni.switchTab({
    url: '/pages/library/library'
  })
}

function goToWorks() {
  uni.switchTab({
    url: '/pages/works/works'
  })
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

function useTemplate(template) {
  // 使用本地存储传递参数
  uni.setStorageSync('editor_params', {
    templateId: template.id
  })
  uni.switchTab({
    url: '/pages/editor/editor'
  })
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F8 0%, #FFFFFF 100%);
  padding-bottom: 40rpx;
}

.banner {
  position: relative;
  background: linear-gradient(135deg, #fade05 0%, #FFE105 100%);
  padding: 60rpx 40rpx 80rpx;
  border-radius: 0 0 40rpx 40rpx;
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #FFFFFF;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.banner-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 12rpx;
}

.banner-decoration {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  z-index: 1;
}

.bead {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  box-shadow: inset -4rpx -4rpx 8rpx rgba(0, 0, 0, 0.2);
  
  &.bead-1 {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    right: 0;
    bottom: 60rpx;
  }
  
  &.bead-2 {
    background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%);
    right: 50rpx;
    bottom: 20rpx;
  }
  
  &.bead-3 {
    background: linear-gradient(135deg, #87CEEB 0%, #4169E1 100%);
    right: 100rpx;
    bottom: 0;
  }
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 40rpx 20rpx;
  // margin-top: -40rpx;
  position: relative;
  z-index: 10;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .action-icon {
      width: 120rpx;
      height: 120rpx;
      border-radius: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
      margin-bottom: 16rpx;
      
      .icon {
        font-size: 48rpx;
        color: #FFFFFF;
      }
      
      &.create-icon {
        background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
      }
      
      &.upload-icon {
        background: linear-gradient(135deg, #4ECDC4 0%, #45B7AA 100%);
      }
      
      &.template-icon {
        background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
      }
      
      &.works-icon {
        background: linear-gradient(135deg, #F093FB 0%, #F5576C 100%);
      }
    }
    
    .action-text {
      font-size: 24rpx;
      // color: $text-color;
    }
  }
}

.section {
  padding: 30rpx 30rpx 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  // color: $text-color;
}

.section-more {
  font-size: 26rpx;
  color: $primary-color;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.feature-item {
  display: flex;
  background: #FFFFFF;
  border-radius: $radius-md;
  padding: 24rpx;
  box-shadow: $shadow-sm;
  
  .feature-icon {
    font-size: 48rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
  }
  
  .feature-content {
    display: flex;
    flex-direction: column;
  }
  
  .feature-title {
    font-size: 28rpx;
    font-weight: 600;
    // color: $text-color;
    margin-bottom: 8rpx;
  }
  
  .feature-desc {
    font-size: 22rpx;
    // color: $text-color-secondary;
    line-height: 1.4;
  }
}

.works-scroll {
  white-space: nowrap;
}

.works-list {
  display: inline-flex;
  gap: 24rpx;
  padding-right: 30rpx;
}

.work-card {
  width: 200rpx;
  flex-shrink: 0;
  
  .work-preview {
    width: 200rpx;
    height: 200rpx;
    border-radius: $radius-md;
    overflow: hidden;
    margin-bottom: 12rpx;
  }
  
  .preview-canvas {
    width: 200rpx;
    height: 200rpx;
  }
  
  .work-title {
    display: block;
    font-size: 26rpx;
    // color: $text-color;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .work-date {
    display: block;
    font-size: 22rpx;
    // color: $text-color-placeholder;
    margin-top: 4rpx;
  }
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.template-item {
  position: relative;
  
  .template-preview {
    width: 100%;
    aspect-ratio: 1;
    background: #FFFFFF;
    border-radius: $radius-md;
    overflow: hidden;
    box-shadow: $shadow-sm;
    margin-bottom: 12rpx;
  }
  
  .preview-canvas {
    width: 100%;
    height: 100%;
  }
  
  .template-title {
    display: block;
    font-size: 24rpx;
    // color: $text-color;
    text-align: center;
  }
  
  .template-badge {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    background: rgba(0, 0, 0, 0.6);
    color: #FFFFFF;
    font-size: 18rpx;
    padding: 4rpx 10rpx;
    border-radius: 20rpx;
  }
}

.tips-section {
  margin: 40rpx 30rpx 0;
  background: #FFF9E6;
  border-radius: $radius-md;
  padding: 24rpx;
  
  .tips-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
  }
  
  .tips-icon {
    font-size: 32rpx;
    margin-right: 8rpx;
  }
  
  .tips-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #B8860B;
  }
  
  .tips-content {
    .tip-item {
      display: block;
      font-size: 24rpx;
      color: #8B6914;
      line-height: 1.8;
    }
  }
}

.debug-section {
  margin: 30rpx;
  background: #FFFFFF;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
  overflow: hidden;
  
  .debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    
    .debug-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #FFFFFF;
    }
    
    .debug-close {
      width: 50rpx;
      height: 50rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      color: #FFFFFF;
    }
  }
  
  .debug-content {
    padding: 20rpx;
    
    .debug-image {
      width: 100%;
      height: 400rpx;
      background: #f5f5f5;
      border-radius: $radius-sm;
      margin-bottom: 16rpx;
    }
    
    .debug-path {
      display: block;
      font-size: 22rpx;
      color: #666;
      word-break: break-all;
      line-height: 1.6;
    }
  }
}
</style>