"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_colorPalette = require("../../utils/colorPalette.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const work = common_vendor.ref(null);
    const isFav = common_vendor.ref(false);
    const pixelCount = common_vendor.computed$1(() => {
      var _a;
      if (!((_a = work.value) == null ? void 0 : _a.gridData))
        return 0;
      let count = 0;
      for (const row of work.value.gridData) {
        for (const cell of row) {
          if (cell > 0)
            count++;
        }
      }
      return count;
    });
    const usedColors = common_vendor.computed$1(() => {
      var _a;
      if (!((_a = work.value) == null ? void 0 : _a.gridData))
        return [];
      const colorIds = /* @__PURE__ */ new Set();
      for (const row of work.value.gridData) {
        for (const cell of row) {
          if (cell > 0)
            colorIds.add(cell);
        }
      }
      return Array.from(colorIds).map((id) => utils_colorPalette.pindouColors[id - 1]).filter(Boolean);
    });
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      if (options.id) {
        work.value = utils_storage.getWorkById(options.id);
        isFav.value = utils_storage.getFavorites().includes(options.id);
      }
    });
    function getCellColor(colorId) {
      if (!colorId || colorId === 0)
        return "transparent";
      const color = utils_colorPalette.pindouColors[colorId - 1];
      return (color == null ? void 0 : color.color) || "#CCCCCC";
    }
    function formatDate(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}\u5E74${date.getMonth() + 1}\u6708${date.getDate()}\u65E5`;
    }
    function editWork() {
      if (work.value) {
        common_vendor.index.navigateTo({
          url: `/pages/editor/editor?workId=${work.value.id}`
        });
      }
    }
    function downloadImage() {
      common_vendor.index.showToast({
        title: "\u56FE\u7247\u5DF2\u4FDD\u5B58\u5230\u76F8\u518C",
        icon: "success"
      });
    }
    function shareWork() {
      common_vendor.index.showShareMenu({
        withShareTicket: true
      });
    }
    function toggleFavorite() {
      if (!work.value)
        return;
      if (isFav.value) {
        utils_storage.removeFavorite(work.value.id);
        isFav.value = false;
        common_vendor.index.showToast({ title: "\u5DF2\u53D6\u6D88\u6536\u85CF", icon: "success" });
      } else {
        utils_storage.addFavorite(work.value.id);
        isFav.value = true;
        common_vendor.index.showToast({ title: "\u5DF2\u6DFB\u52A0\u6536\u85CF", icon: "success" });
      }
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f;
      return {
        a: common_vendor.f(((_a = work.value) == null ? void 0 : _a.gridData) || [], (row, y, i0) => {
          return {
            a: common_vendor.f(row, (cell, x, i1) => {
              return {
                a: x,
                b: getCellColor(cell)
              };
            }),
            b: y
          };
        }),
        b: common_vendor.t(((_b = work.value) == null ? void 0 : _b.title) || "\u672A\u547D\u540D\u4F5C\u54C1"),
        c: common_vendor.t(formatDate((_c = work.value) == null ? void 0 : _c.createTime)),
        d: common_vendor.t((_d = work.value) == null ? void 0 : _d.width),
        e: common_vendor.t((_e = work.value) == null ? void 0 : _e.height),
        f: common_vendor.t(((_f = work.value) == null ? void 0 : _f.colorCount) || 0),
        g: common_vendor.t(common_vendor.unref(pixelCount)),
        h: common_vendor.o(editWork),
        i: common_vendor.o(downloadImage),
        j: common_vendor.o(shareWork),
        k: common_vendor.t(isFav.value ? "\u2764\uFE0F" : "\u{1F90D}"),
        l: common_vendor.o(toggleFavorite),
        m: common_vendor.f(common_vendor.unref(usedColors), (color, k0, i0) => {
          return {
            a: color.color,
            b: common_vendor.t(color.name),
            c: color.id
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-eca06f3c"], ["__file", "E:/private/code/myproject/huohuopindou/pages/detail/detail.vue"]]);
wx.createPage(MiniProgramPage);
