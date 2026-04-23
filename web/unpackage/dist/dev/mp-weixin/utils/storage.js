"use strict";
const common_vendor = require("../common/vendor.js");
const STORAGE_KEYS = {
  WORKS: "pindou_works",
  FAVORITES: "pindou_favorites",
  SETTINGS: "pindou_settings",
  TEMPLATES: "pindou_templates",
  HISTORY: "pindou_history"
};
function saveWork(work) {
  const works = getWorks();
  const existingIndex = works.findIndex((w) => w.id === work.id);
  if (existingIndex >= 0) {
    works[existingIndex] = {
      ...works[existingIndex],
      ...work,
      updateTime: Date.now()
    };
  } else {
    works.unshift({
      ...work,
      id: work.id || generateId(),
      createTime: Date.now(),
      updateTime: Date.now()
    });
  }
  common_vendor.index.setStorageSync(STORAGE_KEYS.WORKS, JSON.stringify(works));
  return work.id || works[0].id;
}
function getWorks() {
  try {
    const data = common_vendor.index.getStorageSync(STORAGE_KEYS.WORKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function getWorkById(id) {
  const works = getWorks();
  return works.find((w) => w.id === id);
}
function deleteWork(id) {
  const works = getWorks();
  const filtered = works.filter((w) => w.id !== id);
  common_vendor.index.setStorageSync(STORAGE_KEYS.WORKS, JSON.stringify(filtered));
}
function duplicateWork(id) {
  const works = getWorks();
  const original = works.find((w) => w.id === id);
  if (!original)
    return null;
  const duplicate = {
    ...original,
    id: generateId(),
    title: original.title + " (\u526F\u672C)",
    createTime: Date.now(),
    updateTime: Date.now()
  };
  works.unshift(duplicate);
  common_vendor.index.setStorageSync(STORAGE_KEYS.WORKS, JSON.stringify(works));
  return duplicate;
}
function addFavorite(workId) {
  const favorites = getFavorites();
  if (!favorites.includes(workId)) {
    favorites.push(workId);
    common_vendor.index.setStorageSync(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }
}
function removeFavorite(workId) {
  let favorites = getFavorites();
  favorites = favorites.filter((id) => id !== workId);
  common_vendor.index.setStorageSync(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}
function getFavorites() {
  try {
    const data = common_vendor.index.getStorageSync(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function getTemplates() {
  try {
    const data = common_vendor.index.getStorageSync(STORAGE_KEYS.TEMPLATES);
    return data ? JSON.parse(data) : getDefaultTemplates();
  } catch {
    return getDefaultTemplates();
  }
}
function getDefaultTemplates() {
  return [
    {
      id: "tpl_heart",
      title: "\u7231\u5FC3",
      thumbnail: "",
      gridData: generateHeartPattern(),
      width: 11,
      height: 9,
      colorCount: 1
    },
    {
      id: "tpl_star",
      title: "\u661F\u661F",
      thumbnail: "",
      gridData: generateStarPattern(),
      width: 11,
      height: 11,
      colorCount: 1
    },
    {
      id: "tpl_smiley",
      title: "\u7B11\u8138",
      thumbnail: "",
      gridData: generateSmileyPattern(),
      width: 11,
      height: 11,
      colorCount: 2
    }
  ];
}
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
  ];
  return pattern.map((row) => row.map((v) => v ? 4 : 0));
}
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
  ];
  return pattern.map((row) => row.map((v) => v ? 17 : 0));
}
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
  ];
  return pattern.map((row) => row.map((v) => v ? 15 : 2));
}
function generateId() {
  return "work_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
exports.addFavorite = addFavorite;
exports.deleteWork = deleteWork;
exports.duplicateWork = duplicateWork;
exports.getFavorites = getFavorites;
exports.getTemplates = getTemplates;
exports.getWorkById = getWorkById;
exports.getWorks = getWorks;
exports.removeFavorite = removeFavorite;
exports.saveWork = saveWork;
