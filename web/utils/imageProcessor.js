// 图片处理工具
import { findClosestColor, mard291 } from './colorPalette'

// 图像处理配置
const defaultConfig = {
  maxWidth: 50,      // 最大宽度（格子数）
  maxHeight: 50,    // 最大高度（格子数）
  colorCount: 48,   // 使用的颜色数量
  dithering: false,  // 是否启用抖动
  backgroundColor: '#FFFFFF'
}

/**
 * 处理图片为拼豆图案数据
 * @param {string} imageUrl - 图片地址或Base64
 * @param {Object} config - 配置参数
 * @param {string} config.canvasId - canvas ID（微信小程序必需）
 * @returns {Promise<{grid: number[][], width: number, height: number, colors: string[]}>}
 */
export async function processImage(imageUrl, config = {}) {
  const options = { ...defaultConfig, ...config }
  const canvasId = options.canvasId || 'processCanvas'

  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: imageUrl,
      success: async (res) => {
        console.log('图片信息：', res)
        try {
          const result = await createPatternFromImage(res.path, options, canvasId)
          resolve(result)
        } catch (err) {
          reject(err)
        }
      },
      fail: (err) => {
        reject(new Error('图片加载失败: ' + err.errMsg))
      }
    })
  })
}

/**
 * 创建拼豆图案数据
 * @param {string} imagePath - 图片路径
 * @param {Object} options - 配置
 * @param {string} canvasId - canvas ID
 */
async function createPatternFromImage(imagePath, options, canvasId = 'processCanvas') {
  // 计算目标尺寸
  const info = await getImageInfo(imagePath)
  let { width, height } = info

  // 等比缩放
  const ratio = Math.min(options.maxWidth / width, options.maxHeight / height, 1)
  width = Math.round(width * ratio)
  height = Math.round(height * ratio)

  // 确保尺寸为奇数（方便对称设计）
  width = width % 2 === 0 ? width + 1 : width
  height = height % 2 === 0 ? height + 1 : height

  // 创建网格数据
  const grid = []
  for (let y = 0; y < height+6; y++) {
    grid[y] = []
    for (let x = 0; x < width+6; x++) {
      grid[y][x] = 0  // 0 表示空/透明
    }
  }

  // 获取使用的颜色列表
  const usedColors = new Set()

  // 使用 Canvas 采样像素
  let pixelData
  try {
    pixelData = await samplePixels(imagePath, width, height, canvasId)
  } catch (e) {
    console.error('Canvas 采样失败，使用默认透明像素：', e)
    pixelData = Array(width * height).fill({ r: 255, g: 255, b: 255, a: 0 })
  }

  for (let y = 0; y < height+6; y++) {
    for (let x = 0; x < width+6; x++) {
      if(x>2&&y>2&&x<width+3&&y<height+3){
        let pixY=y-3
        let pixX=x-3
        const pixel = pixelData[pixY * width + pixX]
        if (pixel && pixel.a > 128) {  // 有不透明度
          const closestColor = findClosestColor(pixel)
          const colorIndex = mard291.findIndex(c => c.id === closestColor.id)
          if (colorIndex >= 0) {
            grid[y][x] = closestColor
            usedColors.add(closestColor.color)
          }
        }
      }
    }
  }

  return {
    grid,
    width,
    height,
    colors: Array.from(usedColors),
    config: options
  }
}

/**
 * 获取图片信息
 */
function getImageInfo(path) {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: path,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 采样像素 - 使用 Canvas 2D 读取图片
 * @param {string} imagePath - 图片路径
 * @param {number} width - 目标宽度
 * @param {number} height - 目标高度
 * @param {string} canvasId - canvas ID（可选，用于微信小程序）
 */
async function samplePixels(imagePath, width, height, canvasId = 'processCanvas') {
  console.log('采样像素，图片路径：', imagePath, '尺寸：', width, height)

  return new Promise((resolve, reject) => {
    // 微信小程序使用 createSelectorQuery 获取 canvas
    const query = uni.createSelectorQuery()
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res && res[0] && res[0].node) {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          // 设置 canvas 尺寸
          canvas.width = width
          canvas.height = height

          // 创建图片对象
          const img = canvas.createImage()
          img.onload = () => {
            // 绘制缩放后的图片
            ctx.drawImage(img, 0, 0, width, height)

            // 获取像素数据
            try {
              const imageData = ctx.getImageData(0, 0, width, height)
              const pixels = []

              for (let i = 0; i < imageData.data.length; i += 4) {
                pixels.push({
                  r: imageData.data[i],
                  g: imageData.data[i + 1],
                  b: imageData.data[i + 2],
                  a: imageData.data[i + 3]
                })
              }
              console.log('像素采样成功，数量：', pixels.length)
              resolve(pixels)
            } catch (e) {
              console.error('获取像素数据失败：', e)
              reject(e)
            }
          }
          img.onerror = (e) => {
            console.error('图片加载失败：', e)
            reject(new Error('图片加载失败'))
          }
          img.src = imagePath
        } else {
          console.error('Canvas 节点未找到：', canvasId)
          reject(new Error('Canvas 节点未找到'))
        }
      })
  })
}

/**
 * 生成图纸数据
 */
export function generatePatternData(grid, width, height) {
  const colorMap = new Map()
  let colorIndex = 1

  // 建立颜色映射
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorId = grid[y][x]
      if (colorId > 0 && !colorMap.has(colorId)) {
        colorMap.set(colorId, colorIndex++)
      }
    }
  }

  // 生成简化的图案数据
  const pattern = []
  for (let y = 0; y < height; y++) {
    let row = ''
    for (let x = 0; x < width; x++) {
      const colorId = grid[y][x]
      row += colorId > 0 ? colorMap.get(colorId).toString(36) : '0'
    }
    pattern.push(row)
  }

  return {
    pattern: pattern.join('-'),
    colorCount: colorMap.size,
    gridData: grid
  }
}

/**
 * 导出为可下载的图片
 */
export async function exportAsImage(gridData, options = {}) {
  const {
    cellSize = 20,  // 每个格子的像素大小
    showGrid = true,
    backgroundColor = '#FFFFFF'
  } = options

  const height = gridData.length
  const width = gridData[0]?.length || 0

  // 计算画布尺寸
  const canvasWidth = width * cellSize
  const canvasHeight = height * cellSize

  // 创建离屏画布
  const offCanvas = uni.createOffscreenCanvas ?
    uni.createOffscreenCanvas({ type: '2d', width: canvasWidth, height: canvasHeight }) :
    uni.createCanvasContext('exportCanvas')

  const ctx = offCanvas.getContext ? offCanvas.getContext('2d') : offCanvas

  // 绘制背景
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 绘制每个格子
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorId = gridData[y][x]
      if (colorId > 0) {
        const pindouColor = mard291[colorId - 1]
        if (pindouColor && pindouColor.color !== 'transparent') {
          // Fill with solid color to match display
          ctx.fillStyle = pindouColor.color
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
        }
      } else {
        // Empty cell
        ctx.fillStyle = 'transparent'
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }

      // 绘制网格线
      if (showGrid) {
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }

  // 导出为临时文件
  return new Promise((resolve, reject) => {
    if (offCanvas.toTempFilePath) {
      offCanvas.toTempFilePath({
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        destWidth: canvasWidth,
        destHeight: canvasHeight,
        fileType: 'png',
        quality: 1,
        success: resolve,
        fail: reject
      })
    } else {
      reject(new Error('不支持导出'))
    }
  })
}

/**
 * 使颜色变亮
 */
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
  const B = Math.min(255, (num & 0x0000FF) + amt)
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

/**
 * 保存图片到相册
 */
export function saveImageToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        resolve()
      },
      fail: (err) => {
        // 需要授权
        if (err.errMsg?.includes('auth deny')) {
          uni.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting()
              }
            }
          })
        }
        reject(err)
      }
    })
  })
}
