"use strict";
const common_vendor = require("../common/vendor.js");
const utils_colorPalette = require("./colorPalette.js");
const defaultConfig = {
  maxWidth: 50,
  maxHeight: 50,
  colorCount: 48,
  dithering: false,
  backgroundColor: "#FFFFFF"
};
async function processImage(imageUrl, config = {}) {
  const options = { ...defaultConfig, ...config };
  const canvasId = options.canvasId || "processCanvas";
  return new Promise((resolve, reject) => {
    common_vendor.index.getImageInfo({
      src: imageUrl,
      success: async (res) => {
        console.log("\u56FE\u7247\u4FE1\u606F\uFF1A", res);
        try {
          const result = await createPatternFromImage(res.path, options, canvasId);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      fail: (err) => {
        reject(new Error("\u56FE\u7247\u52A0\u8F7D\u5931\u8D25: " + err.errMsg));
      }
    });
  });
}
async function createPatternFromImage(imagePath, options, canvasId = "processCanvas") {
  const info = await getImageInfo(imagePath);
  let { width, height } = info;
  const ratio = Math.min(options.maxWidth / width, options.maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);
  width = width % 2 === 0 ? width + 1 : width;
  height = height % 2 === 0 ? height + 1 : height;
  const grid = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = 0;
    }
  }
  const usedColors = /* @__PURE__ */ new Set();
  let pixelData;
  try {
    pixelData = await samplePixels(imagePath, width, height, canvasId);
  } catch (e) {
    console.error("Canvas \u91C7\u6837\u5931\u8D25\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u900F\u660E\u50CF\u7D20\uFF1A", e);
    pixelData = Array(width * height).fill({ r: 255, g: 255, b: 255, a: 0 });
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = pixelData[y * width + x];
      if (pixel && pixel.a > 128) {
        const closestColor = utils_colorPalette.findClosestColor(
          `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`
        );
        const colorIndex = utils_colorPalette.pindouColors.findIndex((c) => c.id === closestColor.id);
        if (colorIndex >= 0) {
          grid[y][x] = colorIndex + 1;
          usedColors.add(closestColor.color);
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
  };
}
function getImageInfo(path) {
  return new Promise((resolve, reject) => {
    common_vendor.index.getImageInfo({
      src: path,
      success: resolve,
      fail: reject
    });
  });
}
async function samplePixels(imagePath, width, height, canvasId = "processCanvas") {
  console.log("\u91C7\u6837\u50CF\u7D20\uFF0C\u56FE\u7247\u8DEF\u5F84\uFF1A", imagePath, "\u5C3A\u5BF8\uFF1A", width, height);
  return new Promise((resolve, reject) => {
    const query = common_vendor.index.createSelectorQuery();
    query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res) => {
      if (res && res[0] && res[0].node) {
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        const img = canvas.createImage();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const imageData = ctx.getImageData(0, 0, width, height);
            const pixels = [];
            for (let i = 0; i < imageData.data.length; i += 4) {
              pixels.push({
                r: imageData.data[i],
                g: imageData.data[i + 1],
                b: imageData.data[i + 2],
                a: imageData.data[i + 3]
              });
            }
            console.log("\u50CF\u7D20\u91C7\u6837\u6210\u529F\uFF0C\u6570\u91CF\uFF1A", pixels.length);
            resolve(pixels);
          } catch (e) {
            console.error("\u83B7\u53D6\u50CF\u7D20\u6570\u636E\u5931\u8D25\uFF1A", e);
            reject(e);
          }
        };
        img.onerror = (e) => {
          console.error("\u56FE\u7247\u52A0\u8F7D\u5931\u8D25\uFF1A", e);
          reject(new Error("\u56FE\u7247\u52A0\u8F7D\u5931\u8D25"));
        };
        img.src = imagePath;
      } else {
        console.error("Canvas \u8282\u70B9\u672A\u627E\u5230\uFF1A", canvasId);
        reject(new Error("Canvas \u8282\u70B9\u672A\u627E\u5230"));
      }
    });
  });
}
exports.processImage = processImage;
