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
    <view class="canvas-container" id="canvasContainer">
      <scroll-view 
        class="canvas-scroll" 
        scroll-x 
        scroll-y 
        enhanced 
        :show-scrollbar="false"
      >
        <!-- Wrapper with actual scaled dimensions for proper scrolling -->
        <view 
          class="canvas-scroll-wrapper"
          :style="{ 
            width: gridWidth + 'px', 
            height: gridHeight + 'px'
          }"
        >
          <!-- Inner container with transform scale -->
          <view 
            id="canvasWrapper"
            class="canvas-wrapper" 
            :style="{ 
              transform: `scale(${canvasScale})`,
              transformOrigin: 'top left'
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
                  :class="{
                    'grid-cell cell-active': currentCell.x === x && currentCell.y === y,
                    'grid-cell cell-filled': cell.id > 0
                  }"
                  :style="getCellStyle(cell.id, x, y)"
                  @tap="handleCellTap(x, y)"
                  @longpress="handleCellLongPress(x, y)"
                >
                  <text 
                    v-if="showNumbers&&(cell.name||x==0||y==0||x==row.length-1||y==gridData.length-1)"
                    class="cell-number"
                  >{{ getCellName(y,x) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 颜色统计 -->
      <view class="color-statistics" :style="{ width: gridWidth + 'px' }">
        <view class="stats-header">
          <image class="stats-logo" src="/static/tabbar/logo.png" mode="aspectFit"></image>
          <text class="stats-title">HuoHuo | MARD</text>
          <text class="stats-summary">（ 总：{{ colorStatistics.totalPixels }}）</text>
        </view>
        <scroll-view class="stats-list" scroll-y v-if="colorStatistics.colors.length > 0">
          <view 
            v-for="stat in colorStatistics.colors" 
            :key="stat.id"
            class="stat-item"
          >
            <view class="stat-color-info">
              <view 
                class="stat-color-swatch" 
                :style="{ backgroundColor: stat.color}"
              >
              <text :style="{color: stat.textColor }">{{ stat.name }}</text>
              <text :style="{color: stat.countTextColor }">{{ '\u00A0' + '\u00A0'+ '\u00A0' + '(' + stat.count + ')'  }}</text>
              </view>
              <!-- <text class="stat-color-name">{{ stat.name }}</text> -->
            </view>
            <!-- <text class="stat-count">{{ '(' + stat.count + ')' }}</text> -->
          </view>
        </scroll-view>
        <view class="stats-empty" v-else>
          <text>暂无颜色数据</text>
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
              >
              <view class="color-picker-name">
                <text stroke="black" stroke-width="1" fill="white">{{color.name}}</text>
              </view>
            </view>
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
        <!-- <view class="menu-item" @tap="saveWorkAction">
          <text class="menu-icon">💾</text>
          <text class="menu-text">保存作品</text>
        </view> -->
        <view class="menu-item" @tap="generatePoster">
          <text class="menu-icon">📥</text>
          <text class="menu-text">导出图片</text>
        </view>
        <!-- <view class="menu-item" @tap="exportPdf">
          <text class="menu-icon">📄</text>
          <text class="menu-text">导出PDF图纸</text>
        </view> -->
        <!-- <view class="menu-item" @tap="shareWork">
          <text class="menu-icon">📤</text>
          <text class="menu-text">分享作品</text>
        </view> -->
        <!-- <view class="menu-item" @tap="showSettings">
          <text class="menu-icon">⚙</text>
          <text class="menu-text">画布设置</text>
        </view> -->
      </view>
    </view>

    <!-- 设置弹窗 -->
    <view class="modal-overlay" v-if="showSettingsModal" @tap="showSettingsModal = false">
      <canvas-setting :button-text="settingButtonText" :width="canvasWidth" :height="canvasHeight" :cellSize="cellSize" :grid-data="gridData" @close="showSettingsModal=false" @updateCanvas="applySetting"></canvas-setting>
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
import { mard291 } from '@/utils/colorPalette'
import { saveWork, getWorkById, getTemplates } from '@/utils/storage'
import { processImage, exportAsImage } from '@/utils/imageProcessor'
import CanvasSetting from '@/components/canvasSetting.vue'


// 待处理的图片转换队列
let pendingImage = null

// 画布配置
const gridWidth = ref(290)
const gridHeight = ref(290)
const gridWidthOneX = ref(290)
const gridHeightOneX = ref(290)
const cellSize = ref(16)
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
const showNumbers = ref(true)
const canvasScale = ref(1)

// UI状态
const workTitle = ref('')
const showMenu = ref(false)
const showSettingsModal = ref(false)
const isLoading = ref(false)
const loadingText = ref('')
const canvasWidth = ref(29)
const canvasHeight = ref(29)
const settingButtonText = ref('应用')
const applyType = ref('updateCanvas')
const applyImgPath = ref('')

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
  return mard291.filter(c => c.color !== 'transparent' && c.color !== 'rainbow')
})

// 当前颜色
const currentColor = computed(() => {
  return colorPalette.value[currentColorIndex.value] || mard291[0]
})

// 缩放百分比显示
const scalePercent = computed(() => {
  const val = canvasScale.value
  if (typeof val !== 'number' || isNaN(val)) return 100
  return Math.round(val * 100)
})

// 颜色统计
const colorStatistics = computed(() => {
  const colorCount = new Map()
  let totalCount = 0
  
  // Count each color usage
  for (let y = 0; y < gridData.value.length; y++) {
    for (let x = 0; x < gridData.value[y].length; x++) {
      const cell = gridData.value[y][x]
      const colorId = cell?.id || 0
      if (colorId > 0) {
        const count = colorCount.get(colorId) || 0
        colorCount.set(colorId, count + 1)
        totalCount++
      }
    }
  }
  
  // Convert to array with color info and sort by count (descending)
  const stats = Array.from(colorCount.entries())
    .map(([colorId, count]) => {
      const color = mard291[colorId - 1]
      // 设置字体颜色（根据背景色自动调整）
      const bgColorNumber = color?.color?.replace('#', '')||'FFFFFF'
      const midColor='7FFFFF'
      return {
        id: colorId,
        name: color?.name || `颜色${colorId}`,
        color: color?.color || 'transparent',
        textColor: parseInt(bgColorNumber,16)>parseInt(midColor,16) ? 'black' : 'white',
        countTextColor: parseInt(bgColorNumber,16)>parseInt(midColor,16) ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
        count: count
      }
    })
    .sort((a, b) => b.count - a.count)
  
  return {
    totalColors: stats.length,
    totalPixels: totalCount,
    colors: stats
  }
})

// 初始化
onMounted(() => {
  initGrid()
  currentSelectedColor.value = mard291[0]
  // 检查本地存储参数（从 tabbar 页面跳转时使用）
  try {
    const params = uni.getStorageSync('editor_params')
    if (params) {
      uni.removeStorageSync('editor_params')
      if (params.workId) {
        loadWork(params.workId)
      } else if (params.templateId) {
        loadTemplate(params.templateId)
      } else if (params.image) {
        // 延迟执行，等待 canvas 准备好
        pendingImage = params.image
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
  
  if (options.workId) {
    loadWork(options.workId)
  } else if (options.templateId) {
    loadTemplate(options.templateId)
  } else if (options.image) {
    // 延迟执行，等待 canvas 准备好
    pendingImage = decodeURIComponent(options.image)
  }
  // 延迟处理待转换的图片
  if (pendingImage) {
    nextTick(() => {
      const image = pendingImage
      pendingImage = null
      beforeConvertImage(image)
    })
  } else {
    console.log('没有待处理的图片')
  }
})

// 初始化网格
function initGrid() {
  // 设置画布
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

function applySetting(config){
  updateCanvasSize(config)
  if(applyType.value==='convertImage'&&applyImgPath.value){
    convertImage(applyImgPath.value)
  }
}

// 更新画布尺寸
function updateCanvasSize(config) {
  const width = config?.width || canvasWidth.value
  const height = config?.height || canvasHeight.value
  const cellSizeNew = config?.cellSize || cellSize.value
  gridWidthCells.value = width
  gridHeightCells.value = height
  const gridH = width * cellSizeNew
  // const row = gridData.value?.[0]
  const gridw = height * cellSizeNew
  gridWidth.value = gridw
  gridHeight.value = gridH
  gridWidthOneX.value = gridw
  gridHeightOneX.value = gridH
  canvasScale.value = 1
}

function getCellName(y, x) {
  const row = gridData.value[y]
  if(row[x].name){return row[x].name}
  if((y===0||y===gridData.value.length-1)&&x>0&&x<row.length-1){
    return x
  }
  if((x===0||x===row.length-1)&&y>0&&y<gridData.value.length-1){
    return y
  }
  return null
}

// 获取格子样式
function getCellStyle(colorId, x, y) {
  const color = colorId > 0 ? mard291[colorId - 1] : null
  const bgColor = color ? color.color : 'transparent'
  const borderColor = showGrid.value ? 'rgba(0,0,0,0.1)' : 'transparent'
  // 设置字体颜色（根据背景色自动调整）
  const bgColorNumber = color?color.color.replace('#', ''):'FFFFFF'
  const midColor='7FFFFF'
  const borderWidth = showGrid.value ? '0.5' : '0'
  const styleObj = {
    width: cellSize.value + 'px',
    height: cellSize.value + 'px',
    backgroundColor: bgColor,
    borderColor: borderColor,
    borderWidth: borderWidth+'px',
    font: `${(cellSize.value - (borderWidth * 2) - 1) / 3}px sans-serif`,
    textAlign: 'center',
    lineHeight: cellSize.value + 'px',
    color: parseInt(bgColorNumber,16)>parseInt(midColor,16) ? 'black' : 'white',
  }
  console.log('font', styleObj.font)
  return styleObj
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
  gridWidth.value = gridWidthOneX.value * canvasScale.value
  gridHeight.value = gridHeightOneX.value * canvasScale.value
}

function zoomOut() {
  canvasScale.value = Math.max(0.5, canvasScale.value - 0.25)
  gridWidth.value=gridWidthOneX.value * canvasScale.value
  gridHeight.value=gridHeightOneX.value * canvasScale.value
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

async function generatePoster() {
  isLoading.value = true
  loadingText.value = '正在生成图片...'
  
  try {
    const result = await exportCanvasToImage()
  
    console.log('导出图片结果:', result)
    if (result && result.tempFilePath) {
      await saveImageToAlbum(result.tempFilePath)
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } else {
      throw new Error('图片生成失败')
    }
  } catch (err) {
    console.error('导出图片失败:', err)
    uni.showToast({
      title: '导出失败: ' + (err.message || '未知错误'),
      icon: 'none',
      duration: 3000
    })
  } finally {
    isLoading.value = false
    showMenu.value = false
  }
}

async function exportCanvasToImage() {
  return new Promise((resolve, reject) => {
    const query = uni.createSelectorQuery()
    query.select('#mainCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res || !res[0] || !res[0].node) {
          reject(new Error('Canvas 节点未找到'))
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio

        const width = gridWidthCells.value + 6
        const height = gridHeightCells.value + 6
        const cellSizeExport = cellSize.value // Use the same cell size as displayed

        const exportWidth = width * cellSizeExport
        const exportHeight = height * cellSizeExport

        // Calculate total height including color statistics
        const statsStartY = exportHeight + 10
        const statsPadding = 15
        const lineHeight = 25
        let currentY = statsStartY + 50
        const maxStatsToShow = Math.min(colorStatistics.value.colors.length, 20)
        currentY += maxStatsToShow * lineHeight
        if (colorStatistics.value.colors.length > maxStatsToShow) {
          currentY += 30
        }
        const totalHeight = currentY + 20

        // Set canvas size to include both grid and statistics
        canvas.width = exportWidth * dpr
        canvas.height = totalHeight * dpr
        ctx.scale(dpr, dpr)

        // Draw white background for entire canvas
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, exportWidth, totalHeight)
        
        // Draw each cell to match the grid-overlay exactly
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let cellData = {}
            if (y < gridData.value.length && x < gridData.value[y].length) {
              cellData = gridData.value[y][x]
            }
            
            const colorId = cellData?.id || 0
            // Draw cell background - solid color matching the grid overlay
            if (colorId > 0) {
              const pindouColor = mard291[colorId - 1]
              if (pindouColor && pindouColor.color !== 'transparent') {
                // Fill with solid color to match display
                ctx.fillStyle = pindouColor.color
                ctx.fillRect(x * cellSizeExport, y * cellSizeExport, cellSizeExport, cellSizeExport)
              }
            } else {
              // Empty cell - transparent or white
              ctx.fillStyle = 'transparent'
              ctx.fillRect(x * cellSizeExport, y * cellSizeExport, cellSizeExport, cellSizeExport)
            }
            
            // Draw grid lines/borders (matching .grid-cell border-color: rgba(0, 0, 0, 0.1))
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
            ctx.lineWidth = 0.5
            ctx.strokeRect(x * cellSizeExport, y * cellSizeExport, cellSizeExport, cellSizeExport)
            
            // Draw numbers if enabled (matching .cell-number styling)
            const row = gridData.value[y]
            if ((showNumbers.value&&colorId > 0)||((y===0||y===gridData.value.length-1)&&x>0&&x<row.length-1)||((x===0||x===row.length-1)&&y>0&&y<gridData.value.length-1)) {
              // Convert 6rpx to pixels (assuming 750rpx = screen width)
              const fontSizePx = cellSizeExport * 0.3
              // 设置字体颜色（根据背景色自动调整）
              ctx.font = `${fontSizePx}px sans-serif`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              const centerX = x * cellSizeExport + cellSizeExport / 2
              const centerY = y * cellSizeExport + cellSizeExport / 2
              const pindouColor = colorId ? mard291[colorId - 1] : null
              if (pindouColor) {
                const bgColorNumber = pindouColor.color?.replace('#', '') || 'FFFFFF'
                const midColor = '7FFFFF'
                ctx.fillStyle = parseInt(bgColorNumber,16)>parseInt(midColor,16) ? 'black' : 'white'
                ctx.fillText(pindouColor.name, centerX, centerY)
                continue
              }
              if((y===0||y===gridData.value.length-1)&&x>0&&x<row.length-1){
                ctx.fillStyle = 'black'
                ctx.fillText(x, centerX, centerY)
                continue
              }
              if((x===0||x===row.length-1)&&y>0&&y<gridData.value.length-1){
                ctx.fillStyle = 'black'
                ctx.fillText(y, centerX, centerY)
                continue
              }
            }
          }
        }
        
        // Draw color statistics section
        // Stats header background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.fillRect(0, statsStartY - 5, exportWidth, 40)
        
        // Draw logo
        const logoSize = 20
        const logoX = statsPadding
        const logoY = statsStartY + 5
        
        // Load and draw logo image
        const logoImg = canvas.createImage()
        logoImg.src = '/static/tabbar/logo.png'
        
        // Wait for logo to load, then continue drawing
        await new Promise((resolveLogo) => {
          logoImg.onload = () => {
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
            resolveLogo()
          }
          logoImg.onerror = () => {
            console.warn('Logo failed to load, skipping')
            resolveLogo()
          }
        })
        
        // Draw title after logo
        ctx.fillStyle = 'black'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText('HuoHuo | MARD', statsPadding + logoSize + 8, statsStartY + 17)
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        ctx.font = '14px sans-serif'
        ctx.textBaseline = 'middle'
        ctx.fillText(`（ 总：${colorStatistics.value.totalPixels}）`, statsPadding + logoSize + 150, statsStartY + 17)
        
        // Draw each color stat
        currentY = statsStartY + 50
        const swatchHeight = 20
        const swatchPadding = 4
        const swatchX = statsPadding
        // const swatchY = currentY - swatchHeight / 2
        let itemX=swatchX
        let itemY=currentY - swatchHeight / 2
        for (let i = 0; i < maxStatsToShow; i++) {
          const stat = colorStatistics.value.colors[i]
          
          // Draw color swatch background
          ctx.fillStyle = stat.color
          ctx.fillRect(itemX, itemY, 70, swatchHeight)
          
          // Draw border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
          ctx.lineWidth = 1
          ctx.strokeRect(itemX, itemY, 70, swatchHeight)
          
          // Draw shadow effect
          ctx.shadowColor = '#CCC'
          ctx.shadowBlur = 3
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1
          ctx.fillRect(itemX, itemY, 70, swatchHeight)
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
          
          // Draw color name inside swatch
          ctx.fillStyle = stat.textColor || 'black'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          const metrics = ctx.measureText(stat.name);
          const textWidth = metrics.width;
          ctx.fillText(stat.name, itemX + swatchPadding + 2, itemY + swatchHeight / 2)
          
          // Draw count inside swatch
          const countX = itemX + swatchPadding + 2 + textWidth
          ctx.fillStyle = stat.countTextColor || 'black'
          ctx.fillText('\u00A0\u00A0\u00A0(' + stat.count + ')', countX, itemY + swatchHeight / 2)
  
          if ((itemX + 80 + 70) > exportWidth) {
            itemX = swatchX
            itemY += swatchHeight + 10
          } else {
            itemX = itemX + 80
          }
          currentY += lineHeight
        }
        
        // If there are more colors than shown
        if (colorStatistics.value.colors.length > maxStatsToShow) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`...还有 ${colorStatistics.value.colors.length - maxStatsToShow} 种颜色`, exportWidth / 2, currentY + 10)
        }
        
        // Use setTimeout instead of await to avoid promise issues in callback
        setTimeout(() => {
          try {
            wx.canvasToTempFilePath({
              canvas: canvas,
              x: 0,
              y: 0,
              width: exportWidth,
              height: totalHeight,
              destWidth: exportWidth * 4,
              destHeight: totalHeight * 4,
              fileType: 'png',
              quality: 1,
              success: (res) => {
                resolve(res)
              },
              fail: (err) => {
                console.error('canvasToTempFilePath 失败:', err)
                reject(new Error('图片导出失败: ' + (err.errMsg || '未知错误')))
              }
            })
          } catch (exportErr) {
            console.error('导出异常:', exportErr)
            reject(exportErr)
          }
        }, 300)
      })
  })
}

function saveImageToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        resolve()
      },
      fail: (err) => {
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
        }
        reject(err)
      }
    })
  })
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
  applyType.value = 'updateCanvas'
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
function beforeConvertImage(imagePath){
  settingButtonText.value="开始转换"
  showSettingsModal.value = true 
  applyType.value = 'convertImage'
  applyImgPath.value=imagePath
}

// 图片转换
async function convertImage(imagePath) {
  isLoading.value = true
  loadingText.value = '正在转换图片...'
  try {
    // 首先验证图片路径是否有效
    const isValid = await validateImagePath(imagePath)
    
    if (!isValid) {
      throw new Error('图片路径无效或文件不存在: ' + imagePath)
    }
    const result = await processImage(imagePath, {
      maxWidth: gridWidthCells.value,
      maxHeight: gridHeightCells.value,
      canvasId: 'processCanvas'
    })
    
    if (!result || !result.grid) {
      throw new Error('图片处理返回空结果')
    }
    
    workTitle.value = '图片转换'
    gridData.value = result.grid
    gridWidthCells.value = result.width 
    gridHeightCells.value = result.height
    gridWidth.value = (result.width + 6) * cellSize.value  // 四边各空出3行/列
    gridHeight.value = (result.height + 6) * cellSize.value
    gridWidthOneX.value = (result.width + 6) * cellSize.value  // 四边各空出3行/列
    gridHeightOneX.value = (result.height + 6) * cellSize.value
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
    uni.getImageInfo({
      src: imagePath,
      success: (res) => {
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
  background-color: #FFFFFF;
}

.canvas-scroll {
  width: 100%;
  height: 100%;
}

.canvas-scroll-wrapper {
  position: relative;
  margin: 40rpx auto;
}

.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
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
    font-family: 'sans-serif';
    // color: rgba(0, 0, 0, 0.5);
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

.color-statistics {
  padding: 0 20rpx 20rpx 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  width: 100%;
  margin: 0 auto;
  
  .stats-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;
    padding-bottom: 12rpx;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    
    .stats-logo {
      width: 40rpx;
      height: 40rpx;
      flex-shrink: 0;
    }
    
    .stats-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }
    
    .stats-summary {
      font-size: 22rpx;
      color: #000;
    }
  }
  
  .stats-list {
    max-height: 300rpx;
    
    .stat-item {
      display: flex;
      float: left;
      justify-content: space-between;
      align-items: center;
      padding: 12rpx 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      margin-right: 12rpx;
      
      &:last-child {
        border-bottom: none;
      }
      
      .stat-color-info {
        display: flex;
        align-items: center;
        gap: 12rpx;
        flex: 1;
        
        .stat-color-swatch {
          // width: 40rpx;
          padding: 4rpx;
          line-height: 40rpx;
          height: 40rpx;
          border-radius: 8rpx;
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
          font-size: 20rpx;
          box-shadow: 1px 1px 3px 1px #CCC;
        }
        
        .stat-color-name {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.9);
        }
      }
      
      .stat-count {
        font-size: 24rpx;
        color: $text-color;
      }
    }
  }
  
  .stats-empty {
    text-align: center;
    padding: 40rpx 0;
    
    text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.4);
    }
  }
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
  .color-swatch{
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .color-picker-name{
    width: 36rpx;
    padding: 2rpx;
    background-color: rgba(255, 255, 255, 0.5);
    text-align: center; 
    border-radius: 4rpx;
    // line-height: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    text{
      color: #181717;
      font-size: 16rpx;
    }
  }
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
  text-align: center;
  
  .color-swatch {
    width: 44rpx;
    height: 44rpx;
    border-radius: 8rpx;
    border: 2px solid transparent;
    text-align: center;
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