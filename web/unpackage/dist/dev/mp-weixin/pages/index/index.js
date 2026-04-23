"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const recentWorks = common_vendor.ref([]);
    const templates = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      loadData();
    });
    function loadData() {
      const works = utils_storage.getWorks();
      recentWorks.value = works.slice(0, 5);
      templates.value = utils_storage.getTemplates().slice(0, 6);
    }
    function handleCreate() {
      common_vendor.index.removeStorageSync("editor_params");
      common_vendor.index.switchTab({
        url: "/pages/editor/editor"
      });
    }
    function handleUpload() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          console.log("chooseImage\u5B8C\u6574\u8FD4\u56DE:", JSON.stringify(res));
          const tempFilePath = res.tempFilePaths[0];
          console.log("\u9009\u62E9\u56FE\u7247\u6210\u529F\uFF0C\u4E34\u65F6\u8DEF\u5F84:", tempFilePath);
          console.log("\u8DEF\u5F84\u7C7B\u578B:", typeof tempFilePath);
          console.log("\u8DEF\u5F84\u957F\u5EA6:", tempFilePath ? tempFilePath.length : 0);
          if (!tempFilePath || tempFilePath === "") {
            console.error("\u4E34\u65F6\u8DEF\u5F84\u4E3A\u7A7A");
            common_vendor.index.showToast({
              title: "\u56FE\u7247\u8DEF\u5F84\u65E0\u6548",
              icon: "none"
            });
            return;
          }
          common_vendor.index.getImageInfo({
            src: tempFilePath,
            success: (infoRes) => {
              console.log("\u56FE\u7247\u4FE1\u606F\u9A8C\u8BC1\u6210\u529F:", infoRes);
              console.log("\u56FE\u7247\u5C3A\u5BF8:", infoRes.width, "x", infoRes.height);
              common_vendor.index.saveFile({
                tempFilePath,
                success: (saveRes) => {
                  const savedFilePath = saveRes.savedFilePath;
                  console.log("\u6587\u4EF6\u4FDD\u5B58\u6210\u529F\uFF0C\u6301\u4E45\u5316\u8DEF\u5F84:", savedFilePath);
                  common_vendor.index.getImageInfo({
                    src: savedFilePath,
                    success: (savedInfo) => {
                      console.log("\u4FDD\u5B58\u540E\u56FE\u7247\u9A8C\u8BC1\u6210\u529F:", savedInfo);
                      const params = {
                        image: savedFilePath,
                        mode: "convert"
                      };
                      console.log("\u51C6\u5907\u5B58\u50A8editor_params:", params);
                      try {
                        common_vendor.index.setStorageSync("editor_params", params);
                        console.log("editor_params\u5B58\u50A8\u6210\u529F");
                        const verifyParams = common_vendor.index.getStorageSync("editor_params");
                        console.log("\u9A8C\u8BC1\u5B58\u50A8\u5185\u5BB9:", verifyParams);
                        setTimeout(() => {
                          common_vendor.index.switchTab({
                            url: "/pages/editor/editor"
                          });
                        }, 1e3);
                      } catch (err) {
                        console.error("\u5B58\u50A8\u53C2\u6570\u5931\u8D25:", err);
                        common_vendor.index.showToast({
                          title: "\u5B58\u50A8\u53C2\u6570\u5931\u8D25",
                          icon: "none"
                        });
                      }
                    },
                    fail: (savedErr) => {
                      console.error("\u4FDD\u5B58\u540E\u56FE\u7247\u9A8C\u8BC1\u5931\u8D25:", savedErr);
                      common_vendor.index.showToast({
                        title: "\u56FE\u7247\u4FDD\u5B58\u540E\u635F\u574F",
                        icon: "none"
                      });
                    }
                  });
                },
                fail: (err) => {
                  console.error("\u4FDD\u5B58\u6587\u4EF6\u5931\u8D25:", err);
                  common_vendor.index.showToast({
                    title: "\u4FDD\u5B58\u56FE\u7247\u5931\u8D25",
                    icon: "none"
                  });
                }
              });
            },
            fail: (err) => {
              console.error("\u56FE\u7247\u4FE1\u606F\u9A8C\u8BC1\u5931\u8D25:", err);
              console.error("\u5931\u8D25\u7684\u8DEF\u5F84:", tempFilePath);
              common_vendor.index.showToast({
                title: "\u56FE\u7247\u65E0\u6CD5\u8BFB\u53D6",
                icon: "none"
              });
            }
          });
        },
        fail: (err) => {
          console.error("\u9009\u62E9\u56FE\u7247\u5931\u8D25:", err);
          common_vendor.index.showToast({
            title: "\u9009\u62E9\u56FE\u7247\u5931\u8D25",
            icon: "none"
          });
        }
      });
    }
    function goToTemplates() {
      common_vendor.index.switchTab({
        url: "/pages/library/library"
      });
    }
    function goToWorks() {
      common_vendor.index.switchTab({
        url: "/pages/works/works"
      });
    }
    function openWork(work) {
      common_vendor.index.setStorageSync("editor_params", {
        workId: work.id
      });
      common_vendor.index.switchTab({
        url: "/pages/editor/editor"
      });
    }
    function useTemplate(template) {
      common_vendor.index.setStorageSync("editor_params", {
        templateId: template.id
      });
      common_vendor.index.switchTab({
        url: "/pages/editor/editor"
      });
    }
    function formatDate(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}\u6708${day}\u65E5`;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleCreate),
        b: common_vendor.o(handleUpload),
        c: common_vendor.o(goToTemplates),
        d: common_vendor.o(goToWorks),
        e: recentWorks.value.length > 0
      }, recentWorks.value.length > 0 ? {
        f: common_vendor.o(goToWorks),
        g: common_vendor.f(recentWorks.value, (work, k0, i0) => {
          return {
            a: "preview-" + work.id,
            b: common_vendor.t(work.title || "\u672A\u547D\u540D\u4F5C\u54C1"),
            c: common_vendor.t(formatDate(work.updateTime)),
            d: work.id,
            e: common_vendor.o(($event) => openWork(work), work.id)
          };
        })
      } : {}, {
        h: common_vendor.o(goToTemplates),
        i: common_vendor.f(templates.value, (template, k0, i0) => {
          return {
            a: "template-" + template.id,
            b: common_vendor.t(template.title),
            c: common_vendor.t(template.width),
            d: common_vendor.t(template.height),
            e: template.id,
            f: common_vendor.o(($event) => useTemplate(template), template.id)
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"], ["__file", "E:/private/code/myproject/huohuopindou/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
