"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_colorPalette = require("../../utils/colorPalette.js");
const utils_storage = require("../../utils/storage.js");
const utils_imageProcessor = require("../../utils/imageProcessor.js");
const _sfc_main = {
  __name: "editor",
  setup(__props) {
    let pendingImage = null;
    const gridWidth = common_vendor.ref(290);
    const gridHeight = common_vendor.ref(290);
    const cellSize = common_vendor.ref(10);
    const gridWidthCells = common_vendor.ref(29);
    const gridHeightCells = common_vendor.ref(29);
    const gridData = common_vendor.ref([]);
    const history = common_vendor.ref([]);
    const historyIndex = common_vendor.ref(-1);
    const currentTool = common_vendor.ref("pencil");
    const currentColorIndex = common_vendor.ref(0);
    const currentSelectedColor = common_vendor.ref({});
    const currentCell = common_vendor.ref({ x: -1, y: -1 });
    const showGrid = common_vendor.ref(true);
    const showNumbers = common_vendor.ref(false);
    const canvasScale = common_vendor.ref(1);
    const workTitle = common_vendor.ref("");
    const showMenu = common_vendor.ref(false);
    const showSettingsModal = common_vendor.ref(false);
    const isLoading = common_vendor.ref(false);
    const loadingText = common_vendor.ref("");
    const canvasWidth = common_vendor.ref(29);
    const canvasHeight = common_vendor.ref(29);
    const tools = [
      { id: "pencil", name: "\u753B\u7B14", icon: "\u270F" },
      { id: "eraser", name: "\u6A61\u76AE", icon: "\u25FB" },
      { id: "fill", name: "\u586B\u5145", icon: "\u{1FAA3}" },
      { id: "picker", name: "\u53D6\u8272", icon: "\u{1F4A7}" },
      { id: "move", name: "\u79FB\u52A8", icon: "\u2725" }
    ];
    const colorPalette = common_vendor.computed$1(() => {
      return utils_colorPalette.pindouColors.filter((c) => c.color !== "transparent" && c.color !== "rainbow");
    });
    const currentColor = common_vendor.computed$1(() => {
      return colorPalette.value[currentColorIndex.value] || utils_colorPalette.pindouColors[0];
    });
    const scalePercent = common_vendor.computed$1(() => {
      const val = canvasScale.value;
      console.log("scalePercent val:", val);
      if (typeof val !== "number" || isNaN(val))
        return 100;
      return Math.round(val * 100);
    });
    const sizePresets = [
      { label: "\u5C0F 15x15", w: 15, h: 15 },
      { label: "\u4E2D 29x29", w: 29, h: 29 },
      { label: "\u5927 41x41", w: 41, h: 41 },
      { label: "\u8D85\u5927 51x51", w: 51, h: 51 }
    ];
    common_vendor.onMounted(() => {
      console.log("Editor\u9875\u9762\u52A0\u8F7D");
      initGrid();
      currentSelectedColor.value = utils_colorPalette.pindouColors[0];
      try {
        const params = common_vendor.index.getStorageSync("editor_params");
        console.log("\u8BFB\u53D6editor_params:", params);
        if (params) {
          console.log("\u53D1\u73B0editor_params\uFF0C\u51C6\u5907\u6E05\u9664");
          common_vendor.index.removeStorageSync("editor_params");
          if (params.workId) {
            console.log("\u52A0\u8F7D\u4F5C\u54C1:", params.workId);
            loadWork(params.workId);
          } else if (params.templateId) {
            console.log("\u52A0\u8F7D\u6A21\u677F:", params.templateId);
            loadTemplate(params.templateId);
          } else if (params.image) {
            console.log("\u53D1\u73B0\u56FE\u7247\u53C2\u6570:", params.image);
            pendingImage = params.image;
            console.log("\u8BBE\u7F6EpendingImage:", pendingImage);
          }
        } else {
          console.log("\u672A\u627E\u5230editor_params");
        }
      } catch (e) {
        console.log("\u8BFB\u53D6\u53C2\u6570\u5931\u8D25", e);
      }
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      console.log("\u9875\u9762options:", options);
      if (options.workId) {
        loadWork(options.workId);
      } else if (options.templateId) {
        loadTemplate(options.templateId);
      } else if (options.image) {
        pendingImage = decodeURIComponent(options.image);
      }
      console.log("\u6700\u7EC8pendingImage:", pendingImage);
      if (pendingImage) {
        console.log("\u51C6\u5907\u5904\u7406\u56FE\u7247\uFF0C500ms\u540E\u6267\u884C");
        common_vendor.nextTick(() => {
          setTimeout(() => {
            if (pendingImage) {
              console.log("\u5F00\u59CB\u5904\u7406pendingImage:", pendingImage);
              const image = pendingImage;
              pendingImage = null;
              convertImage(image);
            } else {
              console.log("pendingImage\u5DF2\u4E3A\u7A7A");
            }
          }, 500);
        });
      } else {
        console.log("\u6CA1\u6709\u5F85\u5904\u7406\u7684\u56FE\u7247");
      }
    });
    function initGrid() {
      const data = [];
      for (let y = 0; y < gridHeightCells.value; y++) {
        data[y] = [];
        for (let x = 0; x < gridWidthCells.value; x++) {
          data[y][x] = {};
        }
      }
      gridData.value = data;
      updateCanvasSize();
      saveToHistory();
    }
    function updateCanvasSize() {
      gridWidth.value = gridWidthCells.value * cellSize.value;
      gridHeight.value = gridHeightCells.value * cellSize.value;
      gridWidthCells.value = Math.max(5, Math.min(100, canvasWidth.value));
      gridHeightCells.value = Math.max(5, Math.min(100, canvasHeight.value));
    }
    function getCellStyle(colorId, x, y) {
      const color = colorId > 0 ? utils_colorPalette.pindouColors[colorId - 1] : null;
      const bgColor = color ? color.color : "transparent";
      const borderColor = showGrid.value ? "rgba(0,0,0,0.1)" : "transparent";
      return {
        width: cellSize.value + "px",
        height: cellSize.value + "px",
        backgroundColor: bgColor,
        borderColor,
        borderWidth: showGrid.value ? "0.5px" : "0"
      };
    }
    function selectTool(toolId) {
      currentTool.value = toolId;
    }
    function selectColor(color, index) {
      currentColorIndex.value = index;
      currentSelectedColor.value = color;
      currentTool.value = "pencil";
    }
    function handleCellTap(x, y) {
      var _a;
      switch (currentTool.value) {
        case "pencil":
          setCell(x, y, currentSelectedColor.value);
          break;
        case "eraser":
          setCell(x, y, {});
          break;
        case "fill":
          floodFill(x, y, currentSelectedColor.value);
          break;
        case "picker":
          const colorId = (_a = gridData.value[y][x]) == null ? void 0 : _a.id;
          if (colorId > 0) {
            currentColorIndex.value = colorId - 1;
          }
          currentTool.value = "pencil";
          break;
      }
    }
    function handleCellLongPress(x, y) {
      setCell(x, y, {});
    }
    function setCell(x, y, color) {
      if (x < 0 || x >= gridWidthCells.value || y < 0 || y >= gridHeightCells.value)
        return;
      gridData.value[y][x] = color;
      gridData.value = [...gridData.value];
    }
    function floodFill(x, y, newColor) {
      var _a, _b;
      const targetColorId = (_a = gridData.value[y][x]) == null ? void 0 : _a.id;
      if (targetColorId === newColor.id)
        return;
      const stack = [[x, y]];
      const visited = /* @__PURE__ */ new Set();
      while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        const key = `${cx},${cy}`;
        if (visited.has(key))
          continue;
        if (cx < 0 || cx >= gridWidthCells.value || cy < 0 || cy >= gridHeightCells.value)
          continue;
        if (((_b = gridData.value[cy][cx]) == null ? void 0 : _b.id) !== targetColorId)
          continue;
        visited.add(key);
        gridData.value[cy][cx] = newColor;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
      gridData.value = [...gridData.value];
      saveToHistory();
    }
    function handleTouchStart(e) {
    }
    function handleTouchMove(e) {
    }
    function handleTouchEnd(e) {
      saveToHistory();
    }
    function zoomIn() {
      canvasScale.value = Math.min(3, canvasScale.value + 0.25);
    }
    function zoomOut() {
      canvasScale.value = Math.max(0.5, canvasScale.value - 0.25);
    }
    function clearCanvas() {
      common_vendor.index.showModal({
        title: "\u786E\u8BA4\u6E05\u7A7A",
        content: "\u786E\u5B9A\u8981\u6E05\u7A7A\u753B\u5E03\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500",
        success: (res) => {
          if (res.confirm) {
            initGrid();
          }
        }
      });
    }
    function fillCanvas() {
      for (let y = 0; y < gridHeightCells.value; y++) {
        for (let x = 0; x < gridWidthCells.value; x++) {
          gridData.value[y][x] = currentColorIndex.value + 1;
        }
      }
      gridData.value = [...gridData.value];
      saveToHistory();
    }
    function undoAction() {
      if (historyIndex.value > 0) {
        historyIndex.value--;
        gridData.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
      }
    }
    function saveToHistory() {
      if (historyIndex.value < history.value.length - 1) {
        history.value = history.value.slice(0, historyIndex.value + 1);
      }
      history.value.push(JSON.parse(JSON.stringify(gridData.value)));
      historyIndex.value = history.value.length - 1;
      if (history.value.length > 50) {
        history.value.shift();
        historyIndex.value--;
      }
    }
    function toggleGrid() {
      showGrid.value = !showGrid.value;
    }
    function toggleNumbers() {
      showNumbers.value = !showNumbers.value;
    }
    function handleBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        common_vendor.index.reLaunch({ url: "/pages/index/index" });
      }
    }
    function exportImage() {
      showMenu.value = false;
      isLoading.value = true;
      loadingText.value = "\u6B63\u5728\u751F\u6210\u56FE\u7247...";
      setTimeout(() => {
        isLoading.value = false;
        common_vendor.index.showToast({
          title: "\u56FE\u7247\u5DF2\u4FDD\u5B58\u5230\u76F8\u518C",
          icon: "success"
        });
      }, 1e3);
    }
    function exportPdf() {
      showMenu.value = false;
      common_vendor.index.showToast({
        title: "PDF\u5BFC\u51FA\u529F\u80FD\u5F00\u53D1\u4E2D",
        icon: "none"
      });
    }
    function shareWork() {
      showMenu.value = false;
      common_vendor.index.showShareMenu({
        withShareTicket: true
      });
    }
    function showSettings() {
      showMenu.value = false;
      showSettingsModal.value = true;
    }
    function updateCellSize(e) {
      cellSize.value = e.detail.value;
      updateCanvasSize();
    }
    function applyPreset(preset) {
      canvasWidth.value = preset.w;
      canvasHeight.value = preset.h;
    }
    function applySettings() {
      var _a;
      const newWidth = Math.max(5, Math.min(100, canvasWidth.value));
      const newHeight = Math.max(5, Math.min(100, canvasHeight.value));
      const oldData = gridData.value;
      gridData.value = [];
      for (let y = 0; y < newHeight; y++) {
        gridData.value[y] = [];
        for (let x = 0; x < newWidth; x++) {
          gridData.value[y][x] = ((_a = oldData[y]) == null ? void 0 : _a[x]) || 0;
        }
      }
      gridWidthCells.value = newWidth;
      gridHeightCells.value = newHeight;
      updateCanvasSize();
      showSettingsModal.value = false;
    }
    function loadWork(workId) {
      const work = utils_storage.getWorkById(workId);
      if (work) {
        workTitle.value = work.title;
        gridData.value = work.gridData;
        gridWidthCells.value = work.width;
        gridHeightCells.value = work.height;
        updateCanvasSize();
        saveToHistory();
      }
    }
    function loadTemplate(templateId) {
      const templates = utils_storage.getTemplates();
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        workTitle.value = template.title;
        gridData.value = template.gridData;
        gridWidthCells.value = template.width;
        gridHeightCells.value = template.height;
        updateCanvasSize();
        saveToHistory();
      }
    }
    async function convertImage(imagePath) {
      console.log("\u5F00\u59CB\u8F6C\u6362\u56FE\u7247\uFF0C\u8DEF\u5F84:", imagePath);
      isLoading.value = true;
      loadingText.value = "\u6B63\u5728\u8F6C\u6362\u56FE\u7247...";
      try {
        console.log("\u9A8C\u8BC1\u56FE\u7247\u8DEF\u5F84...");
        const isValid = await validateImagePath(imagePath);
        console.log("\u56FE\u7247\u9A8C\u8BC1\u7ED3\u679C:", isValid);
        if (!isValid) {
          throw new Error("\u56FE\u7247\u8DEF\u5F84\u65E0\u6548\u6216\u6587\u4EF6\u4E0D\u5B58\u5728: " + imagePath);
        }
        console.log("\u5F00\u59CB\u5904\u7406\u56FE\u7247...");
        const result = await utils_imageProcessor.processImage(imagePath, {
          maxWidth: 41,
          maxHeight: 41,
          canvasId: "processCanvas"
        });
        console.log("\u56FE\u7247\u5904\u7406\u7ED3\u679C\uFF1A", result);
        if (!result || !result.grid) {
          throw new Error("\u56FE\u7247\u5904\u7406\u8FD4\u56DE\u7A7A\u7ED3\u679C");
        }
        workTitle.value = "\u56FE\u7247\u8F6C\u6362";
        gridData.value = result.grid;
        gridWidthCells.value = result.width;
        gridHeightCells.value = result.height;
        updateCanvasSize();
        saveToHistory();
        common_vendor.index.showToast({
          title: "\u8F6C\u6362\u6210\u529F",
          icon: "success"
        });
      } catch (err) {
        console.error("\u56FE\u7247\u8F6C\u6362\u5931\u8D25:", err);
        console.error("\u9519\u8BEF\u8BE6\u60C5:", err.message, err.stack);
        common_vendor.index.showToast({
          title: "\u8F6C\u6362\u5931\u8D25: " + (err.message || "\u672A\u77E5\u9519\u8BEF"),
          icon: "none",
          duration: 3e3
        });
      } finally {
        isLoading.value = false;
      }
    }
    function validateImagePath(imagePath) {
      return new Promise((resolve) => {
        console.log("\u9A8C\u8BC1\u56FE\u7247\u8DEF\u5F84:", imagePath);
        common_vendor.index.getImageInfo({
          src: imagePath,
          success: (res) => {
            console.log("\u56FE\u7247\u9A8C\u8BC1\u6210\u529F:", res);
            resolve(true);
          },
          fail: (err) => {
            console.error("\u56FE\u7247\u9A8C\u8BC1\u5931\u8D25:", err);
            console.error("\u5931\u8D25\u8DEF\u5F84:", imagePath);
            resolve(false);
          }
        });
      });
    }
    common_vendor.onShareAppMessage(() => {
      return {
        title: workTitle.value || "\u6211\u7684\u62FC\u8C46\u4F5C\u54C1",
        path: "/pages/editor/editor",
        imageUrl: ""
      };
    });
    common_vendor.onShareTimeline(() => {
      return {
        title: workTitle.value || "\u6211\u7684\u62FC\u8C46\u4F5C\u54C1",
        query: ""
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleBack),
        b: workTitle.value,
        c: common_vendor.o(($event) => workTitle.value = $event.detail.value),
        d: common_vendor.o(($event) => showMenu.value = !showMenu.value),
        e: gridWidth.value + "px",
        f: gridHeight.value + "px",
        g: common_vendor.f(gridData.value, (row, y, i0) => {
          return {
            a: common_vendor.f(row, (cell, x, i1) => {
              return common_vendor.e({
                a: showNumbers.value && cell.id > 0
              }, showNumbers.value && cell.id > 0 ? {
                b: common_vendor.t(cell.name)
              } : {}, {
                c: x,
                d: currentCell.value.x === x && currentCell.value.y === y ? 1 : "",
                e: cell.id > 0 ? 1 : "",
                f: common_vendor.s(getCellStyle(cell.id)),
                g: common_vendor.o(($event) => handleCellTap(x, y), x),
                h: common_vendor.o(($event) => handleCellLongPress(x, y), x)
              });
            }),
            b: y
          };
        }),
        h: gridWidth.value + "px",
        i: gridHeight.value + "px",
        j: `scale(${canvasScale.value})`,
        k: common_vendor.o(handleTouchStart),
        l: common_vendor.o(handleTouchMove),
        m: common_vendor.o(handleTouchEnd),
        n: common_vendor.o(zoomOut),
        o: common_vendor.t(common_vendor.unref(scalePercent)),
        p: common_vendor.o(zoomIn),
        q: common_vendor.f(tools, (tool, k0, i0) => {
          return {
            a: common_vendor.t(tool.icon),
            b: common_vendor.t(tool.name),
            c: tool.id,
            d: currentTool.value === tool.id ? 1 : "",
            e: common_vendor.o(($event) => selectTool(tool.id), tool.id)
          };
        }),
        r: common_vendor.unref(currentColor).color,
        s: common_vendor.t(common_vendor.unref(currentColor).name),
        t: common_vendor.f(common_vendor.unref(colorPalette), (color, index, i0) => {
          return {
            a: color.color,
            b: color.id,
            c: currentColorIndex.value === index ? 1 : "",
            d: common_vendor.o(($event) => selectColor(color, index), color.id)
          };
        }),
        v: common_vendor.o(clearCanvas),
        w: common_vendor.o(fillCanvas),
        x: common_vendor.o(undoAction),
        y: common_vendor.t(showGrid.value ? "\u25A6" : "\u25A2"),
        z: common_vendor.o(toggleGrid),
        A: common_vendor.o(toggleNumbers),
        B: showMenu.value
      }, showMenu.value ? {
        C: common_vendor.o((...args) => common_vendor.unref(utils_storage.saveWork) && common_vendor.unref(utils_storage.saveWork)(...args)),
        D: common_vendor.o(exportImage),
        E: common_vendor.o(exportPdf),
        F: common_vendor.o(shareWork),
        G: common_vendor.o(showSettings),
        H: common_vendor.o(() => {
        }),
        I: common_vendor.o(($event) => showMenu.value = false)
      } : {}, {
        J: showSettingsModal.value
      }, showSettingsModal.value ? {
        K: common_vendor.o(($event) => showSettingsModal.value = false),
        L: common_vendor.o(updateCanvasSize),
        M: canvasWidth.value,
        N: common_vendor.o(($event) => canvasWidth.value = $event.detail.value),
        O: common_vendor.o(updateCanvasSize),
        P: canvasHeight.value,
        Q: common_vendor.o(($event) => canvasHeight.value = $event.detail.value),
        R: cellSize.value,
        S: common_vendor.o(updateCellSize),
        T: common_vendor.f(sizePresets, (preset, k0, i0) => {
          return {
            a: common_vendor.t(preset.label),
            b: preset.label,
            c: canvasWidth.value === preset.w && canvasHeight.value === preset.h ? 1 : "",
            d: common_vendor.o(($event) => applyPreset(preset), preset.label)
          };
        }),
        U: common_vendor.o(($event) => showSettingsModal.value = false),
        V: common_vendor.o(applySettings),
        W: common_vendor.o(() => {
        }),
        X: common_vendor.o(($event) => showSettingsModal.value = false)
      } : {}, {
        Y: isLoading.value
      }, isLoading.value ? {
        Z: common_vendor.t(loadingText.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-17f547cb"], ["__file", "E:/private/code/myproject/huohuopindou/pages/editor/editor.vue"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
