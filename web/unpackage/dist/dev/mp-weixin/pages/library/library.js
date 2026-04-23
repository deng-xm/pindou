"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const _sfc_main = {
  __name: "library",
  setup(__props) {
    const categories = [
      { id: "all", name: "\u5168\u90E8", icon: "\u{1F4CB}" },
      { id: "simple", name: "\u7B80\u7EA6", icon: "\u25C7" },
      { id: "emoji", name: "\u8868\u60C5", icon: "\u{1F60A}" },
      { id: "animal", name: "\u52A8\u7269", icon: "\u{1F431}" },
      { id: "food", name: "\u7F8E\u98DF", icon: "\u{1F355}" },
      { id: "nature", name: "\u81EA\u7136", icon: "\u{1F338}" },
      { id: "character", name: "\u4EBA\u7269", icon: "\u{1F464}" },
      { id: "pattern", name: "\u56FE\u6848", icon: "\u2740" }
    ];
    const currentCategory = common_vendor.ref("all");
    const viewMode = common_vendor.ref("grid");
    const templates = common_vendor.ref([]);
    const showPreview = common_vendor.ref(false);
    const selectedTemplate = common_vendor.ref(null);
    const filteredTemplates = common_vendor.computed$1(() => {
      if (currentCategory.value === "all") {
        return templates.value;
      }
      return templates.value;
    });
    common_vendor.onMounted(() => {
      loadTemplates();
    });
    function loadTemplates() {
      templates.value = utils_storage.getTemplates();
    }
    function switchCategory(categoryId) {
      currentCategory.value = categoryId;
    }
    function loadMore() {
    }
    function getCellColor(colorId) {
      if (!colorId || colorId === 0)
        return "transparent";
      const colors = [
        "#FFFFFF",
        "#000000",
        "#808080",
        "#C0C0C0",
        "#FF0000",
        "#8B0000",
        "#FFC0CB",
        "#FF69B4",
        "#FF6B00",
        "#FFD700",
        "#FFFF00",
        "#00FF00",
        "#00FFFF",
        "#0000FF",
        "#8000FF",
        "#FF00FF",
        "#8B4513",
        "#F5DEB3",
        "#4169E1",
        "#32CD32",
        "#FF6347",
        "#DA70D6",
        "#40E0D0",
        "#FF7F50"
      ];
      return colors[colorId % colors.length] || "#CCCCCC";
    }
    function previewTemplate(template) {
      selectedTemplate.value = template;
      showPreview.value = true;
    }
    function useTemplate() {
      showPreview.value = false;
      common_vendor.index.setStorageSync("editor_params", {
        templateId: selectedTemplate.value.id
      });
      common_vendor.index.switchTab({
        url: "/pages/editor/editor"
      });
    }
    common_vendor.onPullDownRefresh(() => {
      loadTemplates();
      setTimeout(() => {
        common_vendor.index.stopPullDownRefresh();
      }, 500);
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e;
      return common_vendor.e({
        a: common_vendor.f(categories, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.icon),
            b: common_vendor.t(category.name),
            c: category.id,
            d: currentCategory.value === category.id ? 1 : "",
            e: common_vendor.o(($event) => switchCategory(category.id), category.id)
          };
        }),
        b: common_vendor.t(common_vendor.unref(filteredTemplates).length),
        c: viewMode.value === "grid" ? 1 : "",
        d: common_vendor.o(($event) => viewMode.value = "grid"),
        e: viewMode.value === "list" ? 1 : "",
        f: common_vendor.o(($event) => viewMode.value = "list"),
        g: viewMode.value === "grid"
      }, viewMode.value === "grid" ? {
        h: common_vendor.f(common_vendor.unref(filteredTemplates), (template, k0, i0) => {
          return {
            a: common_vendor.f(template.gridData.slice(0, 20), (row, y, i1) => {
              return {
                a: common_vendor.f(row.slice(0, 20), (cell, x, i2) => {
                  return {
                    a: x,
                    b: getCellColor(cell)
                  };
                }),
                b: y
              };
            }),
            b: common_vendor.t(template.title),
            c: common_vendor.t(template.width),
            d: common_vendor.t(template.height),
            e: common_vendor.t(template.colorCount),
            f: template.id,
            g: common_vendor.o(($event) => previewTemplate(template), template.id)
          };
        })
      } : {
        i: common_vendor.f(common_vendor.unref(filteredTemplates), (template, k0, i0) => {
          return {
            a: common_vendor.f(template.gridData.slice(0, 15), (row, y, i1) => {
              return {
                a: common_vendor.f(row.slice(0, 15), (cell, x, i2) => {
                  return {
                    a: x,
                    b: getCellColor(cell)
                  };
                }),
                b: y
              };
            }),
            b: common_vendor.t(template.title),
            c: common_vendor.t(template.width),
            d: common_vendor.t(template.height),
            e: common_vendor.t(template.colorCount),
            f: template.id,
            g: common_vendor.o(($event) => previewTemplate(template), template.id)
          };
        })
      }, {
        j: common_vendor.unref(filteredTemplates).length === 0
      }, common_vendor.unref(filteredTemplates).length === 0 ? {} : {}, {
        k: common_vendor.o(loadMore),
        l: showPreview.value
      }, showPreview.value ? {
        m: common_vendor.t((_a = selectedTemplate.value) == null ? void 0 : _a.title),
        n: common_vendor.o(($event) => showPreview.value = false),
        o: common_vendor.f(((_b = selectedTemplate.value) == null ? void 0 : _b.gridData) || [], (row, y, i0) => {
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
        p: common_vendor.t((_c = selectedTemplate.value) == null ? void 0 : _c.width),
        q: common_vendor.t((_d = selectedTemplate.value) == null ? void 0 : _d.height),
        r: common_vendor.t((_e = selectedTemplate.value) == null ? void 0 : _e.colorCount),
        s: common_vendor.o(($event) => showPreview.value = false),
        t: common_vendor.o(useTemplate),
        v: common_vendor.o(() => {
        }),
        w: common_vendor.o(($event) => showPreview.value = false)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b5c5788b"], ["__file", "E:/private/code/myproject/huohuopindou/pages/library/library.vue"]]);
wx.createPage(MiniProgramPage);
