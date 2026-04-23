// 本地存储工具

const STORAGE_KEYS = {
  WORKS: 'pindou_works',
  FAVORITES: 'pindou_favorites',
  SETTINGS: 'pindou_settings',
  TEMPLATES: 'pindou_templates',
  HISTORY: 'pindou_history'
}

// 作品管理
export function saveWork(work) {
  const works = getWorks()
  const existingIndex = works.findIndex(w => w.id === work.id)
  
  if (existingIndex >= 0) {
    works[existingIndex] = {
      ...works[existingIndex],
      ...work,
      updateTime: Date.now()
    }
  } else {
    works.unshift({
      ...work,
      id: work.id || generateId(),
      createTime: Date.now(),
      updateTime: Date.now()
    })
  }
  
  uni.setStorageSync(STORAGE_KEYS.WORKS, JSON.stringify(works))
  return work.id || works[0].id
}

export function getWorks() {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.WORKS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getWorkById(id) {
  const works = getWorks()
  return works.find(w => w.id === id)
}

export function deleteWork(id) {
  const works = getWorks()
  const filtered = works.filter(w => w.id !== id)
  uni.setStorageSync(STORAGE_KEYS.WORKS, JSON.stringify(filtered))
}

export function duplicateWork(id) {
  const works = getWorks()
  const original = works.find(w => w.id === id)
  if (!original) return null
  
  const duplicate = {
    ...original,
    id: generateId(),
    title: original.title + ' (副本)',
    createTime: Date.now(),
    updateTime: Date.now()
  }
  
  works.unshift(duplicate)
  uni.setStorageSync(STORAGE_KEYS.WORKS, JSON.stringify(works))
  return duplicate
}

// 收藏管理
export function addFavorite(workId) {
  const favorites = getFavorites()
  if (!favorites.includes(workId)) {
    favorites.push(workId)
    uni.setStorageSync(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites))
  }
}

export function removeFavorite(workId) {
  let favorites = getFavorites()
  favorites = favorites.filter(id => id !== workId)
  uni.setStorageSync(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites))
}

export function getFavorites() {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.FAVORITES)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function isFavorite(workId) {
  return getFavorites().includes(workId)
}

// 设置管理
export function getSettings() {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.SETTINGS)
    return data ? JSON.parse(data) : {
      gridSize: 29,
      beadSize: 10,
      showGrid: true,
      showNumbers: false,
      defaultPalette: 'basic'
    }
  } catch {
    return {
      gridSize: 29,
      beadSize: 10,
      showGrid: true,
      showNumbers: false,
      defaultPalette: 'basic'
    }
  }
}

export function saveSettings(settings) {
  const current = getSettings()
  uni.setStorageSync(STORAGE_KEYS.SETTINGS, JSON.stringify({
    ...current,
    ...settings
  }))
}

// 模板管理
export function saveTemplate(template) {
  const templates = getTemplates()
  const existingIndex = templates.findIndex(t => t.id === template.id)
  
  if (existingIndex >= 0) {
    templates[existingIndex] = {
      ...templates[existingIndex],
      ...template,
      updateTime: Date.now()
    }
  } else {
    templates.unshift({
      ...template,
      id: template.id || generateId(),
      createTime: Date.now(),
      updateTime: Date.now()
    })
  }
  
  uni.setStorageSync(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates))
  return template.id
}

export function getTemplates() {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.TEMPLATES)
    return data ? JSON.parse(data) : getDefaultTemplates()
  } catch {
    return getDefaultTemplates()
  }
}

export function deleteTemplate(id) {
  const templates = getTemplates()
  const filtered = templates.filter(t => t.id !== id)
  uni.setStorageSync(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered))
}

// 默认模板
function getDefaultTemplates() {
  return [
    {
      id: 'tpl_heart',
      title: '爱心',
      thumbnail: '',
      gridData: generateHeartPattern(),
      width: 11,
      height: 9,
      colorCount: 1
    },
    {
      id: 'tpl_star',
      title: '星星',
      thumbnail: '',
      gridData: generateStarPattern(),
      width: 11,
      height: 11,
      colorCount: 1
    },
    {
      id: 'tpl_smiley',
      title: '笑脸',
      thumbnail: '',
      gridData: generateSmileyPattern(),
      width: 11,
      height: 11,
      colorCount: 2
    }
  ]
}

// 生成爱心图案
function generateHeartPattern() {
  const pattern = [
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0]
  ]
  return pattern.map(row => row.map(v => v ? 4 : 0))  // 4 = 红色
}

// 生成星星图案
function generateStarPattern() {
  const pattern = [
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
  ]
  return pattern.map(row => row.map(v => v ? 17 : 0))  // 17 = 金黄
}

// 生成笑脸图案
function generateSmileyPattern() {
  const pattern = [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
  // 黄色底，黑色眼睛和嘴巴
  return pattern.map(row => row.map(v => v ? 15 : 2))
}

// 生成唯一ID
function generateId() {
  return 'work_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// 历史记录
export function addToHistory(action) {
  const history = getHistory()
  history.unshift({
    ...action,
    id: generateId(),
    time: Date.now()
  })
  // 只保留最近100条
  if (history.length > 100) {
    history.splice(100)
  }
  uni.setStorageSync(STORAGE_KEYS.HISTORY, JSON.stringify(history))
}

export function getHistory() {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.HISTORY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function clearHistory() {
  uni.setStorageSync(STORAGE_KEYS.HISTORY, JSON.stringify([]))
}
