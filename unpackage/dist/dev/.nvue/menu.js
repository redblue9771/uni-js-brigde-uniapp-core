import { resolveComponent, openBlock, createElementBlock, createElementVNode, withModifiers, toDisplayString, Fragment, renderList, createVNode, normalizeStyle, withCtx, createTextVNode } from "vue";
function getCurrentSubNVue() {
  return uni.getSubNVueById(plus.webview.currentWebview().id);
}
function formatAppLog(type, filename, ...args) {
  if (uni.__log__) {
    uni.__log__(type, filename, ...args);
  } else {
    console[type].apply(console, [...args, filename]);
  }
}
const _style_0 = { "wrap": { "": { "display": "flex", "justifyContent": "flex-end" } }, "content": { "": { "borderTopLeftRadius": 16, "borderTopRightRadius": 16, "borderBottomRightRadius": 0, "borderBottomLeftRadius": 0, "backgroundColor": "#ffffff" } }, "title": { "": { "paddingTop": 16, "paddingRight": 16, "paddingBottom": 16, "paddingLeft": 16, "textAlign": "center", "fontSize": 16, "fontWeight": "bold" } }, "list": { "": { "display": "flex", "flexDirection": "row", "flexWrap": "wrap", "paddingTop": 12, "paddingRight": 12, "paddingBottom": 12, "paddingLeft": 12, "justifyContent": "space-around" } }, "item": { "": { "display": "flex", "alignItems": "center", "justifyContent": "center", "flexDirection": "column", "marginTop": 0, "marginRight": 4, "marginBottom": 12, "marginLeft": 4, "width": 54 } }, "text": { "": { "fontSize": 12, "lines": 2, "textAlign": "center" } }, "icon": { "": { "backgroundColor": "#f0f0f0", "borderRadius": 8, "width": 54, "height": 54, "display": "flex", "alignItems": "center", "justifyContent": "center", "marginBottom": 4, "!backgroundColor:active": "#f8f8f8" } } };
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main = {
  data() {
    return {
      title: "",
      content: "",
      menuList: [
        {
          name: "刷新",
          action: "reload",
          type: "reload"
        }
      ],
      safeAreaHeight: 0,
      windowWidth: 0,
      appInfo: {}
    };
  },
  computed: {
    itemNum() {
      const lineNum = Math.floor((this.windowWidth - 24) / 62);
      return lineNum - this.menuList.length % lineNum;
    }
  },
  onLoad() {
    uni.$on("webView-menu", ({ action, payload }) => {
      formatAppLog("log", "at pages/web-view/menu.vue:61", "init", action, payload);
      if (action === "init") {
        this.appInfo = payload;
      }
    });
    plus.key.addEventListener("backbutton", this.backListener, false);
    getCurrentSubNVue().setStyle({
      popGesture: "none"
    });
    const { safeAreaInsets, windowWidth } = uni.getSystemInfoSync();
    this.safeAreaHeight = safeAreaInsets.bottom;
    this.subNVue = getCurrentSubNVue();
    this.windowWidth = windowWidth;
  },
  onUnload() {
    uni.$off("webView-menu");
    plus.key.removeEventListener("backbutton", this.backListener);
  },
  methods: {
    // sendMessage() {
    // 	const subNVue = uni.getCurrentSubNVue()
    // 	uni.$emit('popup-page', {
    // 		title: '已读完!',
    // 	})
    // },
    backListener() {
    },
    handle({ action }) {
      uni.$emit("menu-webView", {
        action
      });
      this.handleHide();
    },
    handleHide() {
      this.subNVue.hide("slide-out-bottom");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_uni_icons = resolveComponent("uni-icons");
  const _component_button = resolveComponent("button");
  return openBlock(), createElementBlock("view", {
    class: "wrap",
    onClick: _cache[1] || (_cache[1] = (...args) => $options.handleHide && $options.handleHide(...args)),
    renderWhole: true
  }, [
    createElementVNode("view", {
      class: "content",
      onClick: _cache[0] || (_cache[0] = withModifiers(() => {
      }, ["stop"]))
    }, [
      createElementVNode(
        "u-text",
        { class: "title" },
        toDisplayString($data.appInfo.name),
        1
        /* TEXT */
      ),
      createElementVNode("view", { class: "list" }, [
        (openBlock(true), createElementBlock(
          Fragment,
          null,
          renderList($data.menuList, (item, index) => {
            return openBlock(), createElementBlock("view", {
              class: "item",
              key: index,
              onClick: ($event) => $options.handle(item)
            }, [
              createElementVNode("view", {
                class: "icon",
                onClick: ($event) => $options.handle(item),
                hoverClass: "icon--active"
              }, [
                createVNode(_component_uni_icons, {
                  type: item.type,
                  size: 36,
                  color: "#000",
                  onClick: ($event) => $options.handle(item)
                }, null, 8, ["type", "onClick"])
              ], 8, ["onClick"]),
              createElementVNode("u-text", {
                class: "text",
                onClick: ($event) => $options.handle(item)
              }, toDisplayString(item.name), 9, ["onClick"])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        (openBlock(true), createElementBlock(
          Fragment,
          null,
          renderList($options.itemNum, (_, index) => {
            return openBlock(), createElementBlock("view", {
              class: "item",
              key: index
            });
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      createVNode(_component_button, {
        type: "default",
        style: normalizeStyle({ paddingBottom: $data.safeAreaHeight }),
        onClick: $options.handleHide
      }, {
        default: withCtx(() => [
          createTextVNode(" 取消 ")
        ]),
        _: 1
        /* STABLE */
      }, 8, ["style", "onClick"])
    ])
  ]);
}
const menu = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__file", "/Volumes/Workspace/Codes/uni-js-bridge-uniapp-core/pages/web-view/menu.vue"]]);
export {
  menu as default
};
