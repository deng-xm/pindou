"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/editor/editor.js";
  "./pages/works/works.js";
  "./pages/library/library.js";
  "./pages/detail/detail.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      console.log("App Launch");
      initStorage();
    });
    common_vendor.onShow(() => {
      console.log("App Show");
    });
    common_vendor.onHide(() => {
      console.log("App Hide");
    });
    function initStorage() {
      try {
        const works = common_vendor.index.getStorageSync("pindou_works");
        if (!works) {
          common_vendor.index.setStorageSync("pindou_works", JSON.stringify([]));
        }
        const favorites = common_vendor.index.getStorageSync("pindou_favorites");
        if (!favorites) {
          common_vendor.index.setStorageSync("pindou_favorites", JSON.stringify([]));
        }
        const settings = common_vendor.index.getStorageSync("pindou_settings");
        if (!settings) {
          common_vendor.index.setStorageSync("pindou_settings", JSON.stringify({
            gridSize: 29,
            beadSize: 10,
            showGrid: true,
            showNumbers: false
          }));
        }
      } catch (e) {
        console.error("\u521D\u59CB\u5316\u5B58\u50A8\u5931\u8D25:", e);
      }
    }
    return () => {
    };
  }
};
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/private/code/myproject/huohuopindou/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
