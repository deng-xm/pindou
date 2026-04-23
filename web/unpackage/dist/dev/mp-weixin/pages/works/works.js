"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const _sfc_main = {
  __name: "works",
  setup(__props) {
    const currentTab = common_vendor.ref("all");
    const searchKeyword = common_vendor.ref("");
    const sortBy = common_vendor.ref("time");
    const works = common_vendor.ref([]);
    const hasMore = common_vendor.ref(false);
    const showActionSheet = common_vendor.ref(false);
    const selectedWork = common_vendor.ref(null);
    const filteredWorks = common_vendor.computed$1(() => {
      let result = works.value;
      if (currentTab.value === "favorite") {
        const favIds = utils_storage.getFavorites();
        result = result.filter((w) => favIds.includes(w.id));
      }
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(
          (w) => {
            var _a;
            return (_a = w.title) == null ? void 0 : _a.toLowerCase().includes(keyword);
          }
        );
      }
      if (sortBy.value === "time") {
        result = [...result].sort((a, b) => b.updateTime - a.updateTime);
      } else if (sortBy.value === "size") {
        result = [...result].sort((a, b) => b.width * b.height - a.width * a.height);
      }
      return result;
    });
    common_vendor.onMounted(() => {
      loadWorks();
    });
    function loadWorks() {
      works.value = utils_storage.getWorks();
    }
    function switchTab(tab) {
      currentTab.value = tab;
    }
    function handleSearch() {
    }
    function clearSearch() {
      searchKeyword.value = "";
    }
    function loadMore() {
      hasMore.value = false;
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
        "#FF00FF"
      ];
      return colors[colorId % colors.length] || "#CCCCCC";
    }
    function formatDate(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    function openWork(work) {
      common_vendor.index.setStorageSync("editor_params", {
        workId: work.id
      });
      common_vendor.index.switchTab({
        url: "/pages/editor/editor"
      });
    }
    function createNew() {
      common_vendor.index.removeStorageSync("editor_params");
      common_vendor.index.switchTab({
        url: "/pages/editor/editor"
      });
    }
    function toggleFavorite(work) {
      if (isFavorite(work.id)) {
        utils_storage.removeFavorite(work.id);
        common_vendor.index.showToast({
          title: "\u5DF2\u53D6\u6D88\u6536\u85CF",
          icon: "success"
        });
      } else {
        utils_storage.addFavorite(work.id);
        common_vendor.index.showToast({
          title: "\u5DF2\u6DFB\u52A0\u6536\u85CF",
          icon: "success"
        });
      }
      loadWorks();
    }
    function isFavorite(workId) {
      return utils_storage.getFavorites().includes(workId);
    }
    function shareWork(work) {
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    }
    function moreActions(work) {
      selectedWork.value = work;
      showActionSheet.value = true;
    }
    function editWork() {
      showActionSheet.value = false;
      if (selectedWork.value) {
        openWork(selectedWork.value);
      }
    }
    function downloadWork() {
      showActionSheet.value = false;
      common_vendor.index.showToast({
        title: "\u56FE\u7247\u5DF2\u4FDD\u5B58\u5230\u76F8\u518C",
        icon: "success"
      });
    }
    function duplicateWork() {
      showActionSheet.value = false;
      if (selectedWork.value) {
        utils_storage.duplicateWork(selectedWork.value.id);
        loadWorks();
        common_vendor.index.showToast({
          title: "\u590D\u5236\u6210\u529F",
          icon: "success"
        });
      }
    }
    function exportWorkPdf() {
      showActionSheet.value = false;
      common_vendor.index.showToast({
        title: "PDF\u5BFC\u51FA\u529F\u80FD\u5F00\u53D1\u4E2D",
        icon: "none"
      });
    }
    function deleteWork() {
      showActionSheet.value = false;
      common_vendor.index.showModal({
        title: "\u786E\u8BA4\u5220\u9664",
        content: "\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u4F5C\u54C1\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500",
        success: (res) => {
          if (res.confirm && selectedWork.value) {
            utils_storage.deleteWork(selectedWork.value.id);
            loadWorks();
            common_vendor.index.showToast({
              title: "\u5220\u9664\u6210\u529F",
              icon: "success"
            });
          }
        }
      });
    }
    common_vendor.onShareAppMessage(() => {
      return {
        title: "\u6211\u7684\u62FC\u8C46\u4F5C\u54C1\u96C6",
        path: "/pages/works/works"
      };
    });
    common_vendor.onPullDownRefresh(() => {
      loadWorks();
      setTimeout(() => {
        common_vendor.index.stopPullDownRefresh();
      }, 500);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentTab.value === "all" ? 1 : "",
        b: common_vendor.o(($event) => switchTab("all")),
        c: currentTab.value === "favorite" ? 1 : "",
        d: common_vendor.o(($event) => switchTab("favorite")),
        e: common_vendor.o(handleSearch),
        f: searchKeyword.value,
        g: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        h: searchKeyword.value
      }, searchKeyword.value ? {
        i: common_vendor.o(clearSearch)
      } : {}, {
        j: common_vendor.t(common_vendor.unref(filteredWorks).length),
        k: sortBy.value === "time" ? 1 : "",
        l: common_vendor.o(($event) => sortBy.value = "time"),
        m: sortBy.value === "size" ? 1 : "",
        n: common_vendor.o(($event) => sortBy.value = "size"),
        o: common_vendor.unref(filteredWorks).length > 0
      }, common_vendor.unref(filteredWorks).length > 0 ? {
        p: common_vendor.f(common_vendor.unref(filteredWorks), (work, k0, i0) => {
          return {
            a: common_vendor.f(work.gridData.slice(0, 30), (row, y, i1) => {
              return {
                a: common_vendor.f(row.slice(0, 30), (cell, x, i2) => {
                  return {
                    a: x,
                    b: getCellColor(cell)
                  };
                }),
                b: y
              };
            }),
            b: common_vendor.t(isFavorite(work.id) ? "\u2764\uFE0F" : "\u{1F90D}"),
            c: common_vendor.o(($event) => toggleFavorite(work), work.id),
            d: common_vendor.o(($event) => shareWork(), work.id),
            e: common_vendor.o(($event) => moreActions(work), work.id),
            f: common_vendor.o(($event) => openWork(work), work.id),
            g: common_vendor.t(work.title || "\u672A\u547D\u540D\u4F5C\u54C1"),
            h: common_vendor.t(work.width),
            i: common_vendor.t(work.height),
            j: common_vendor.t(formatDate(work.updateTime)),
            k: work.id
          };
        })
      } : common_vendor.e({
        q: common_vendor.t(currentTab.value === "favorite" ? "\u6682\u65E0\u6536\u85CF\u4F5C\u54C1" : "\u6682\u65E0\u4F5C\u54C1"),
        r: currentTab.value === "all"
      }, currentTab.value === "all" ? {
        s: common_vendor.o(createNew)
      } : {}), {
        t: hasMore.value && common_vendor.unref(filteredWorks).length > 0
      }, hasMore.value && common_vendor.unref(filteredWorks).length > 0 ? {} : {}, {
        v: common_vendor.o(loadMore),
        w: common_vendor.o(createNew),
        x: showActionSheet.value
      }, showActionSheet.value ? {
        y: common_vendor.o(editWork),
        z: common_vendor.o(downloadWork),
        A: common_vendor.o(duplicateWork),
        B: common_vendor.o(exportWorkPdf),
        C: common_vendor.o(deleteWork),
        D: common_vendor.o(($event) => showActionSheet.value = false),
        E: common_vendor.o(() => {
        }),
        F: common_vendor.o(($event) => showActionSheet.value = false)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2475a018"], ["__file", "E:/private/code/myproject/huohuopindou/pages/works/works.vue"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
