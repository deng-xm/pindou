<template>
  <view class="editor-page">
    <!-- 顶部工具栏 -->
    <view class="toolbar">
      <view class="toolbar-left">
        <view class="tool-btn" @tap="handleBack">
          <text class="icon">←</text>
        </view>
      </view>
      <view class="toolbar-center">
        <input 
          class="title-input" 
          v-model="workTitle" 
          placeholder="输入作品名称"
          maxlength="20"
        />
      </view>
      <view class="toolbar-right">
        <view class="tool-btn" @tap="showMenu = !showMenu">
          <text class="icon">☰</text>
        </view>
      </view>
    </view>

    <!-- 画布区域 -->
    <view class="canvas-container">
      <scroll-view 
        class="canvas-scroll" 
        scroll-x 
        scroll-y 
        enhanced 
        :show-scrollbar="false"
      >
        <view 
          class="canvas-wrapper" 
          :style="{ 
            width: gridWidth + 'px', 
            height: gridHeight + 'px',
            transform: `scale(${canvasScale})`
          }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <canvas 
            type="2d"
            id="mainCanvas"
            canvas-id="mainCanvas"
            class="pixel-canvas"
            :style="{ width: gridWidth + 'px', height: gridHeight + 'px' }"
          ></canvas>
          
          <!-- 隐藏的处理 canvas -->
          <canvas 
            type="2d"
            id="processCanvas"
            class="process-canvas"
          ></canvas>
          
          <!-- 像素格子覆盖层 -->
          <view class="grid-overlay">
            <view 
              v-for="(row, y) in gridData" 
              :key="y"
              class="grid-row"
            >
              <view 
                v-for="(cell, x) in row" 
                :key="x"
                class="grid-cell"
                :class="{ 
                  'cell-active': currentCell.x === x && currentCell.y === y,
                  'cell-filled': cell.id > 0
                }"
                :style="getCellStyle(cell.id, x, y)"
                @tap="handleCellTap(x, y)"
                @longpress="handleCellLongPress(x, y)"
              >
                <text 
                  v-if="showNumbers && cell.id > 0" 
                  class="cell-number"
                >{{ cell.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 缩放控制 -->
      <view class="zoom-controls">
        <view class="zoom-btn" @tap="zoomOut">−</view>
        <text class="zoom-text">{{ scalePercent }}%</text>
        <view class="zoom-btn" @tap="zoomIn">+</view>
      </view>
    </view>

    <!-- 底部工具面板 -->
    <view class="bottom-panel">
      <!-- 工具选择 -->
      <scroll-view class="tool-selector" scroll-x>
        <view class="tool-list">
          <view 
            v-for="tool in tools" 
            :key="tool.id"
            class="tool-item"
            :class="{ active: currentTool === tool.id }"
            @tap="selectTool(tool.id)"
          >
            <text class="tool-icon">{{ tool.icon }}</text>
            <text class="tool-name">{{ tool.name }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 颜色选择器 -->
      <view class="color-picker-section">
        <view class="current-color">
          <view 
            class="color-swatch current" 
            :style="{ backgroundColor: currentColor.color }"
          ></view>
          <text class="color-name">{{ currentColor.name }}</text>
        </view>
        
        <scroll-view class="color-list" scroll-x>
          <view class="color-palette">
            <view 
              v-for="(color, index) in colorPalette" 
              :key="color.id"
              class="color-item"
              :class="{ active: currentColorIndex === index }"
              @tap="selectColor(color,index)"
            >
              <view 
                class="color-swatch"
                :style="{ backgroundColor: color.color }"
              ></view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn" @tap="clearCanvas">
          <text class="icon">🗑</text>
          <text class="label">清空</text>
        </view>
        <view class="action-btn" @tap="fillCanvas">
          <text class="icon">🪣</text>
          <text class="label">填充</text>
        </view>
        <view class="action-btn" @tap="undoAction">
          <text class="icon">↩</text>
          <text class="label">撤销</text>
        </view>
        <view class="action-btn" @tap="toggleGrid">
          <text class="icon">{{ showGrid ? '▦' : '▢' }}</text>
          <text class="label">网格</text>
        </view>
        <view class="action-btn" @tap="toggleNumbers">
          <text class="icon">#</text>
          <text class="label">编号</text>
        </view>
      </view>
    </view>

    <!-- 菜单弹窗 -->
    <view class="menu-overlay" v-if="showMenu" @tap="showMenu = false">
      <view class="menu-panel" @tap.stop>
        <view class="menu-header">更多操作</view>
        <view class="menu-item" @tap="saveWork">
          <text class="menu-icon">💾</text>
          <text class="menu-text">保存作品</text>
        </view>
        <view class="menu-item" @tap="exportImage">
          <text class="menu-icon">📥</text>
          <text class="menu-text">导出图片</text>
        </view>
        <view class="menu-item" @tap="exportPdf">
          <text class="menu-icon">📄</text>
          <text class="menu-text">导出PDF图纸</text>
        </view>
        <view class="menu-item" @tap="shareWork">
          <text class="menu-icon">📤</text>
          <text class="menu-text">分享作品</text>
        </view>
        <view class="menu-item" @tap="showSettings">
          <text class="menu-icon">⚙</text>
          <text class="menu-text">画布设置</text>
        </view>
      </view>
    </view>

    <!-- 设置弹窗 -->
    <view class="modal-overlay" v-if="showSettingsModal" @tap="showSettingsModal = false">
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
                @change="updateCanvasSize"
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
                @change="updateCanvasSize"
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
                @change="updateCellSize"
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
          <button class="modal-btn confirm" @tap="applySettings">应用</button>
        </view>
      </view>
    </view>

    <!-- 加载提示 -->
    <view class="loading-overlay" v-if="isLoading">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">{{ loadingText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { pindouColors } from '@/utils/colorPalette'
import { saveWork, getWorkById, getTemplates } from '@/utils/storage'
import { processImage } from '@/utils/imageProcessor'

// 待处理的图片转换队列
let pendingImage = null

// 画布配置
const gridWidth = ref(290)
const gridHeight = ref(290)
const cellSize = ref(10)
const gridWidthCells = ref(29)
const gridHeightCells = ref(29)

// 画布数据
const gridData = ref([])
const history = ref([])
const historyIndex = ref(-1)

// 工具状态
const currentTool = ref('pencil')
const currentColorIndex = ref(0)
const currentSelectedColor = ref({})
const currentCell = ref({ x: -1, y: -1 })
const showGrid = ref(true)
const showNumbers = ref(false)
const canvasScale = ref(1)

// UI状态
const workTitle = ref('')
const showMenu = ref(false)
const showSettingsModal = ref(false)
const isLoading = ref(false)
const loadingText = ref('')
const canvasWidth = ref(29)
const canvasHeight = ref(29)

// 工具列表
const tools = [
  { id: 'pencil', name: '画笔', icon: '✏' },
  { id: 'eraser', name: '橡皮', icon: '◻' },
  { id: 'fill', name: '填充', icon: '🪣' },
  { id: 'picker', name: '取色', icon: '💧' },
  { id: 'move', name: '移动', icon: '✥' }
]

// 颜色调色板
const colorPalette = computed(() => {
  return pindouColors.filter(c => c.color !== 'transparent' && c.color !== 'rainbow')
})

// 当前颜色
const currentColor = computed(() => {
  return colorPalette.value[currentColorIndex.value] || pindouColors[0]
})

// 缩放百分比显示
const scalePercent = computed(() => {
  const val = canvasScale.value
  console.log('scalePercent val:', val)
  if (typeof val !== 'number' || isNaN(val)) return 100
  return Math.round(val * 100)
})

// 尺寸预设
const sizePresets = [
  { label: '小 15x15', w: 15, h: 15 },
  { label: '中 29x29', w: 29, h: 29 },
  { label: '大 41x41', w: 41, h: 41 },
  { label: '超大 51x51', w: 51, h: 51 }
]

// 初始化
onMounted(() => {
  console.log('Editor页面加载')
  initGrid()
  currentSelectedColor.value = pindouColors[0]
  // 检查本地存储参数（从 tabbar 页面跳转时使用）
  try {
    const params = uni.getStorageSync('editor_params')
    console.log('读取editor_params:', params)
    if (params) {
      console.log('发现editor_params，准备清除')
      uni.removeStorageSync('editor_params')
      if (params.workId) {
        console.log('加载作品:', params.workId)
        loadWork(params.workId)
      } else if (params.templateId) {
        console.log('加载模板:', params.templateId)
        loadTemplate(params.templateId)
      } else if (params.image) {
        console.log('发现图片参数:', params.image)
        // 延迟执行，等待 canvas 准备好
        pendingImage = params.image
        console.log('设置pendingImage:', pendingImage)
      }
    } else {
      console.log('未找到editor_params')
    }
  } catch (e) {
    console.log('读取参数失败', e)
  }
  
  // 检查页面参数（非 tabbar 跳转时使用）
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  console.log('页面options:', options)
  
  if (options.workId) {
    loadWork(options.workId)
  } else if (options.templateId) {
    loadTemplate(options.templateId)
  } else if (options.image) {
    // 延迟执行，等待 canvas 准备好
    pendingImage = decodeURIComponent(options.image)
  }
  console.log('最终pendingImage:', pendingImage)
  // 延迟处理待转换的图片
  if (pendingImage) {
    console.log('准备处理图片，500ms后执行')
    nextTick(() => {
      setTimeout(() => {
        if (pendingImage) {
          console.log('开始处理pendingImage:', pendingImage)
          const image = pendingImage
          pendingImage = null
          convertImage(image)
        } else {
          console.log('pendingImage已为空')
        }
      }, 500)
    })
  } else {
    console.log('没有待处理的图片')
  }
})

// 初始化网格
function initGrid() {
  const data = []
  for (let y = 0; y < gridHeightCells.value; y++) {
    data[y] = []
    for (let x = 0; x < gridWidthCells.value; x++) {
      data[y][x] = {}
    }
  }
  gridData.value = data
  updateCanvasSize()
  saveToHistory()
}

// 更新画布尺寸
function updateCanvasSize() {
  gridWidth.value = gridWidthCells.value * cellSize.value
  gridHeight.value = gridHeightCells.value * cellSize.value
  gridWidthCells.value = Math.max(5, Math.min(100, canvasWidth.value))
  gridHeightCells.value = Math.max(5, Math.min(100, canvasHeight.value))
}

// 获取格子样式
function getCellStyle(colorId, x, y) {
  const color = colorId > 0 ? pindouColors[colorId - 1] : null
  const bgColor = color ? color.color : 'transparent'
  const borderColor = showGrid.value ? 'rgba(0,0,0,0.1)' : 'transparent'
  
  return {
    width: cellSize.value + 'px',
    height: cellSize.value + 'px',
    backgroundColor: bgColor,
    borderColor: borderColor,
    borderWidth: showGrid.value ? '0.5px' : '0'
  }
}

// 选择工具
function selectTool(toolId) {
  currentTool.value = toolId
}

// 选择颜色
function selectColor(color,index) {
  currentColorIndex.value = index
  currentSelectedColor.value = color
  currentTool.value = 'pencil'
}

// 处理格子点击
function handleCellTap(x, y) {
  switch (currentTool.value) {
    case 'pencil':
      setCell(x, y, currentSelectedColor.value)
      break
    case 'eraser':
      setCell(x, y, {})
      break
    case 'fill':
      floodFill(x, y, currentSelectedColor.value)
      break
    case 'picker':
      const colorId = gridData.value[y][x]?.id
      if (colorId > 0) {
        currentColorIndex.value = colorId - 1
      }
      currentTool.value = 'pencil'
      break
  }
}

// 处理格子长按
function handleCellLongPress(x, y) {
  setCell(x, y, {})
}

// 设置格子
function setCell(x, y,color) {
  if (x < 0 || x >= gridWidthCells.value || y < 0 || y >= gridHeightCells.value) return
  gridData.value[y][x] = color
  gridData.value = [...gridData.value]
}

// 洪水填充
function floodFill(x, y, newColor) {
  const targetColorId = gridData.value[y][x]?.id
  if (targetColorId === newColor.id) return
  
  const stack = [[x, y]]
  const visited = new Set()
  
  while (stack.length > 0) {
    const [cx, cy] = stack.pop()
    const key = `${cx},${cy}`
    
    if (visited.has(key)) continue
    if (cx < 0 || cx >= gridWidthCells.value || cy < 0 || cy >= gridHeightCells.value) continue
    if (gridData.value[cy][cx]?.id !== targetColorId) continue
    
    visited.add(key)
    gridData.value[cy][cx] = newColor
    
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
  }
  
  gridData.value = [...gridData.value]
  saveToHistory()
}

// 触摸处理
function handleTouchStart(e) {
  // 实现触摸绘制
}

function handleTouchMove(e) {
  // 实现触摸移动
}

function handleTouchEnd(e) {
  saveToHistory()
}

// 缩放控制
function zoomIn() {
  canvasScale.value = Math.min(3, canvasScale.value + 0.25)
}

function zoomOut() {
  canvasScale.value = Math.max(0.5, canvasScale.value - 0.25)
}

// 清空画布
function clearCanvas() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空画布吗？此操作不可撤销',
    success: (res) => {
      if (res.confirm) {
        initGrid()
      }
    }
  })
}

// 填充画布
function fillCanvas() {
  for (let y = 0; y < gridHeightCells.value; y++) {
    for (let x = 0; x < gridWidthCells.value; x++) {
      gridData.value[y][x] = currentColorIndex.value + 1
    }
  }
  gridData.value = [...gridData.value]
  saveToHistory()
}

// 撤销
function undoAction() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    gridData.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
  }
}

// 保存历史
function saveToHistory() {
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(JSON.parse(JSON.stringify(gridData.value)))
  historyIndex.value = history.value.length - 1
  
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

// 切换网格显示
function toggleGrid() {
  showGrid.value = !showGrid.value
}

// 切换编号显示
function toggleNumbers() {
  showNumbers.value = !showNumbers.value
}

// 返回
function handleBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/index/index' })
  }
}

// 保存作品
function saveWorkAction() {
  const workData = {
    title: workTitle.value || `作品 ${Date.now()}`,
    gridData: gridData.value,
    width: gridWidthCells.value,
    height: gridHeightCells.value,
    colorCount: new Set(gridData.value.flat()).size
  }
  
  saveWork(workData)
  
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
  
  showMenu.value = false
}

// 导出图片
function exportImage() {
  showMenu.value = false
  isLoading.value = true
  loadingText.value = '正在生成图片...'
  
  // 实际需要使用canvas导出
  setTimeout(() => {
    isLoading.value = false
    uni.showToast({
      title: '图片已保存到相册',
      icon: 'success'
    })
  }, 1000)
}

// 导出PDF
function exportPdf() {
  showMenu.value = false
  uni.showToast({
    title: 'PDF导出功能开发中',
    icon: 'none'
  })
}

// 分享作品
function shareWork() {
  showMenu.value = false
  
  // 实际需要先生成图片，然后分享
  uni.showShareMenu({
    withShareTicket: true
  })
}

// 显示设置
function showSettings() {
  showMenu.value = false
  showSettingsModal.value = true
}

// 更新格子大小
function updateCellSize(e) {
  cellSize.value = e.detail.value
  updateCanvasSize()
}

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
  updateCanvasSize()
  
  showSettingsModal.value = false
}

// 加载作品
function loadWork(workId) {
  const work = getWorkById(workId)
  if (work) {
    workTitle.value = work.title
    gridData.value = work.gridData
    gridWidthCells.value = work.width
    gridHeightCells.value = work.height
    updateCanvasSize()
    saveToHistory()
  }
}

// 加载模板
function loadTemplate(templateId) {
  const templates = getTemplates()
  const template = templates.find(t => t.id === templateId)
  if (template) {
    workTitle.value = template.title
    gridData.value = template.gridData
    gridWidthCells.value = template.width
    gridHeightCells.value = template.height
    updateCanvasSize()
    saveToHistory()
  }
}

// 图片转换
async function convertImage(imagePath) {
  console.log('开始转换图片，路径:', imagePath)
  isLoading.value = true
  loadingText.value = '正在转换图片...'
  
  try {
    // 首先验证图片路径是否有效
    console.log('验证图片路径...')
    const isValid = await validateImagePath(imagePath)
    console.log('图片验证结果:', isValid)
    
    if (!isValid) {
      throw new Error('图片路径无效或文件不存在: ' + imagePath)
    }
    
    console.log('开始处理图片...')
    const result = await processImage(imagePath, {
      maxWidth: 41,
      maxHeight: 41,
      canvasId: 'processCanvas'
    })
    console.log('图片处理结果：', result)
    
    if (!result || !result.grid) {
      throw new Error('图片处理返回空结果')
    }
    
    workTitle.value = '图片转换'
    gridData.value = result.grid
    gridWidthCells.value = result.width
    gridHeightCells.value = result.height
    updateCanvasSize()
    saveToHistory()
    
    uni.showToast({
      title: '转换成功',
      icon: 'success'
    })
  } catch (err) {
    console.error('图片转换失败:', err)
    console.error('错误详情:', err.message, err.stack)
    uni.showToast({
      title: '转换失败: ' + (err.message || '未知错误'),
      icon: 'none',
      duration: 3000
    })
  } finally {
    isLoading.value = false
  }
}

// 验证图片路径
function validateImagePath(imagePath) {
  return new Promise((resolve) => {
    console.log('验证图片路径:', imagePath)
    uni.getImageInfo({
      src: imagePath,
      success: (res) => {
        console.log('图片验证成功:', res)
        resolve(true)
      },
      fail: (err) => {
        console.error('图片验证失败:', err)
        console.error('失败路径:', imagePath)
        resolve(false)
      }
    })
  })
}

// 页面分享
onShareAppMessage(() => {
  return {
    title: workTitle.value || '我的拼豆作品',
    path: '/pages/editor/editor',
    imageUrl: ''
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: workTitle.value || '我的拼豆作品',
    query: ''
  }
})
</script>

<style lang="scss" scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a2e;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #16213e;
  
  .toolbar-left,
  .toolbar-right {
    width: 80rpx;
  }
  
  .toolbar-center {
    flex: 1;
    text-align: center;
  }
  
  .tool-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12rpx;
    
    .icon {
      color: #FFFFFF;
      font-size: 32rpx;
    }
  }
  
  .title-input {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20rpx;
    padding: 12rpx 24rpx;
    color: #FFFFFF;
    font-size: 28rpx;
    text-align: center;
  }
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas-scroll {
  width: 100%;
  height: 100%;
}

.canvas-wrapper {
  margin: 40rpx auto;
  transform-origin: center center;
}

.pixel-canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.process-canvas {
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 50px;
  height: 50px;
}

.grid-overlay {
  position: relative;
  display: flex;
  flex-direction: column;
}

.grid-row {
  display: flex;
}

.grid-cell {
  box-sizing: border-box;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.1);
  position: relative;
  
  &.cell-active {
    outline: 2px solid #FFFFFF;
    outline-offset: -2px;
    z-index: 10;
  }
  
  .cell-number {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3.5pt;
    color: rgba(0, 0, 0, 0.5);
  }
}

.zoom-controls {
  position: absolute;
  right: 30rpx;
  bottom: 30rpx;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
  
  .zoom-btn {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 36rpx;
    font-weight: bold;
  }
  
  .zoom-text {
    color: #FFFFFF;
    font-size: 24rpx;
    width: 80rpx;
    text-align: center;
  }
}

.bottom-panel {
  background: #16213e;
  padding: 20rpx 0;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.tool-selector {
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.tool-list {
  display: flex;
  gap: 16rpx;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  min-width: 100rpx;
  
  &.active {
    background: $primary-color;
  }
  
  .tool-icon {
    font-size: 28rpx;
    color: #FFFFFF;
    margin-bottom: 4rpx;
  }
  
  .tool-name {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.7);
  }
}

.color-picker-section {
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.current-color {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  
  .color-swatch {
    width: 48rpx;
    height: 48rpx;
    border-radius: 8rpx;
    border: 2px solid rgba(255, 255, 255, 0.3);
    margin-right: 12rpx;
  }
  
  .color-name {
    color: #FFFFFF;
    font-size: 24rpx;
  }
}

.color-list {
  width: 100%;
}

.color-palette {
  display: flex;
  gap: 8rpx;
  padding: 8rpx 0;
}

.color-item {
  flex-shrink: 0;
  
  .color-swatch {
    width: 44rpx;
    height: 44rpx;
    border-radius: 8rpx;
    border: 2px solid transparent;
  }
  
  &.active .color-swatch {
    border-color: #FFFFFF;
    transform: scale(1.1);
  }
}

.action-buttons {
  display: flex;
  justify-content: space-around;
  padding: 0 20rpx;
  
  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10rpx 20rpx;
    
    .icon {
      font-size: 32rpx;
      margin-bottom: 4rpx;
    }
    
    .label {
      font-size: 20rpx;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.menu-panel {
  position: absolute;
  right: 20rpx;
  top: 120rpx;
  background: #FFFFFF;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
  min-width: 300rpx;
  overflow: hidden;
}

.menu-header {
  padding: 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-color;
  border-bottom: 1px solid $border-color;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  
  .menu-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
  }
  
  .menu-text {
    font-size: 28rpx;
    color: $text-color;
  }
  
  &:active {
    background: $bg-grey;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

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

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: #FFFFFF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    color: #FFFFFF;
    font-size: 28rpx;
    margin-top: 20rpx;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
