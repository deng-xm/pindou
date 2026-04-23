// Pinia Store - 可选的状态管理
import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    // 当前画布数据
    gridData: [],
    gridWidth: 29,
    gridHeight: 29,
    
    // 当前工具
    currentTool: 'pencil',
    currentColorId: 1,
    
    // 显示设置
    showGrid: true,
    showNumbers: false,
    canvasScale: 1,
    
    // 历史记录
    history: [],
    historyIndex: -1,
    
    // 作品信息
    workId: null,
    workTitle: '',
    
    // 撤销栈
    undoStack: [],
    redoStack: []
  }),
  
  getters: {
    hasUndo: (state) => state.historyIndex > 0,
    hasRedo: (state) => state.historyIndex < state.history.length - 1,
    
    colorCount: (state) => {
      const colors = new Set()
      for (const row of state.gridData) {
        for (const cell of row) {
          if (cell > 0) colors.add(cell)
        }
      }
      return colors.size
    },
    
    pixelCount: (state) => {
      let count = 0
      for (const row of state.gridData) {
        for (const cell of row) {
          if (cell > 0) count++
        }
      }
      return count
    }
  },
  
  actions: {
    // 初始化画布
    initGrid(width = 29, height = 29) {
      this.gridWidth = width
      this.gridHeight = height
      this.gridData = []
      
      for (let y = 0; y < height; y++) {
        this.gridData[y] = []
        for (let x = 0; x < width; x++) {
          this.gridData[y][x] = 0
        }
      }
      
      this.saveToHistory()
    },
    
    // 设置格子颜色
    setCell(x, y, colorId) {
      if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return
      
      const oldValue = this.gridData[y][x]
      if (oldValue === colorId) return
      
      // 记录操作
      this.redoStack.push({ x, y, oldValue, newValue: colorId })
      
      this.gridData[y][x] = colorId
      this.gridData = [...this.gridData]  // 触发响应式更新
    },
    
    // 批量设置（用于填充）
    setCells(cells) {
      for (const { x, y, colorId } of cells) {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
          this.gridData[y][x] = colorId
        }
      }
      this.gridData = [...this.gridData]
      this.saveToHistory()
    },
    
    // 清除画布
    clearCanvas() {
      this.initGrid(this.gridWidth, this.gridHeight)
    },
    
    // 填充画布
    fillCanvas(colorId) {
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          this.gridData[y][x] = colorId
        }
      }
      this.gridData = [...this.gridData]
      this.saveToHistory()
    },
    
    // 洪水填充
    floodFill(startX, startY, newColorId) {
      const targetColor = this.gridData[startY][startX]
      if (targetColor === newColorId) return
      
      const stack = [[startX, startY]]
      const visited = new Set()
      const changes = []
      
      while (stack.length > 0) {
        const [x, y] = stack.pop()
        const key = `${x},${y}`
        
        if (visited.has(key)) continue
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) continue
        if (this.gridData[y][x] !== targetColor) continue
        
        visited.add(key)
        changes.push({ x, y, colorId: newColorId })
        
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
      }
      
      this.setCells(changes)
    },
    
    // 保存历史
    saveToHistory() {
      const snapshot = JSON.parse(JSON.stringify(this.gridData))
      
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }
      
      this.history.push(snapshot)
      this.historyIndex = this.history.length - 1
      
      if (this.history.length > 50) {
        this.history.shift()
        this.historyIndex--
      }
    },
    
    // 撤销
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--
        this.gridData = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      }
    },
    
    // 重做
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++
        this.gridData = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      }
    },
    
    // 加载作品
    loadWork(work) {
      this.workId = work.id
      this.workTitle = work.title
      this.gridWidth = work.width
      this.gridHeight = work.height
      this.gridData = JSON.parse(JSON.stringify(work.gridData))
      this.saveToHistory()
    },
    
    // 重置大小
    resize(width, height) {
      const oldData = this.gridData
      this.gridWidth = width
      this.gridHeight = height
      this.gridData = []
      
      for (let y = 0; y < height; y++) {
        this.gridData[y] = []
        for (let x = 0; x < width; x++) {
          this.gridData[y][x] = oldData[y]?.[x] || 0
        }
      }
      
      this.saveToHistory()
    }
  }
})
