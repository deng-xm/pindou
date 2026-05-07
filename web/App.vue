<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // 初始化本地存储
  initStorage()
  
  // 检查并请求隐私授权
  checkPrivacyAuthorization()
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

// 检查隐私授权
function checkPrivacyAuthorization() {
  // #ifdef MP-WEIXIN
  if (wx.getPrivacySetting) {
    wx.getPrivacySetting({
      success: (res) => {
        console.log('隐私协议状态:', res)
        if (res.needAuthorization) {
          // 需要用户授权，显示隐私协议弹窗
          wx.requirePrivacyAuthorize({
            success: () => {
              console.log('用户同意隐私协议')
            },
            fail: (err) => {
              console.log('用户拒绝隐私协议:', err)
            }
          })
        }
      },
      fail: (err) => {
        console.log('获取隐私设置失败:', err)
      }
    })
  }
  // #endif
}
</script>

<style lang="scss">
// @import url("/uni.scss");
</style>
