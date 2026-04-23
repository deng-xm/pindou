<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // 初始化本地存储
  initStorage()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})

// 初始化本地存储
function initStorage() {
  try {
    const works = uni.getStorageSync('pindou_works')
    if (!works) {
      uni.setStorageSync('pindou_works', JSON.stringify([]))
    }
    
    const favorites = uni.getStorageSync('pindou_favorites')
    if (!favorites) {
      uni.setStorageSync('pindou_favorites', JSON.stringify([]))
    }
    
    const settings = uni.getStorageSync('pindou_settings')
    if (!settings) {
      uni.setStorageSync('pindou_settings', JSON.stringify({
        gridSize: 29,  // 默认格子数
        beadSize: 10,  // 单个珠子像素大小
        showGrid: true,
        showNumbers: false
      }))
    }
  } catch (e) {
    console.error('初始化存储失败:', e)
  }
}
</script>

<style lang="scss">
// @import url("/uni.scss");
</style>
