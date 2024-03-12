<template>
	<view class="loading-wrapper" v-if="!wv.ready">
		<view class="thorui-loading__2">
			<view class="thorui-ani__1"></view>
			<view class="thorui-ani__2"></view>
			<view></view>
		</view>
		<text v-if="name">{{ name }}</text>
		<text>加载中…</text>
	</view>
</template>

<script>
	import {
		webViewActions,
		destroyWebView,
		registerWebView,
		getAppInfo,
		getWebView,
	} from "./web-view.helper.js";

	export default {
		data() {
			return {
				wv: {
					ready: false,
				},
				name: undefined,
			};
		},
		onLoad(option) {
			const appInfo = getAppInfo();
			this.name = option.name ? option.name : appInfo.name;
		},
		onReady() {
			// #ifdef APP-PLUS
			const currentWebview = this.$scope
				.$getAppWebview(); //此对象相当于html5plus里的plus.webview.currentWebview()。在uni-app里vue页面直接使用plus.webview.currentWebview()无效

			const currentWebviewParent = currentWebview.parent();
			const webViewId = currentWebviewParent ?
				currentWebviewParent.id :
				currentWebview.id;

			const wv = registerWebView(
				webViewId,
				currentWebviewParent || currentWebview
			);

			this.wv = wv;

			// #endif
			uni.$emit("webView-menu", {
				action: "init",
				payload: getAppInfo(),
			});
			uni.$on("menu-webView", (data) => {
				switch (data.action) {
					case "reload":
						this.wv.reload();
						break;
					default:
						uni.showToast({
							title: data.title,
						});
						break;
				}
			});
			this.watchWebViewSize();
		},
		onShow() {
			if (this.wv.ready) {
				webViewActions({
					action: "onShow",
				});
			}
		},
		onHide() {
			if (this.wv.ready) {
				webViewActions({
					action: "onHide",
				});
			}
		},
		onError(e) {
			console.log(e);
		},
		onUnload() {
			uni.$off("menu-webView");
			uni.$emit("webviewDestory");
			destroyWebView();
		},
		onBackPress(options) {
			if (options.from == "navigateBack") {
				return false;
			}
			if (this.wv) {
				this.wv.canBack((e) => {
					// 查询Webview窗口是否可后退 返回true即返回H5上一级
					if (e.canBack) {
						this.wv.back();
					} else {
						uni.navigateBack();
					}
				});
			}
			return true;
		},
		onNavigationBarButtonTap(button) {
			console.log("ok");
			if (button.type == "menu") {
				this.showPopup();
				webViewActions({
					action: "tapMenu",
				});
			}
			if (button.type == "close") {
				uni.navigateBack();
			}
			webViewActions({
				action: "onNavBarButtonTap",
				payload: button,
			});
		},

		methods: {
			showPopup() {
				// 向 popup 传递消息
				// uni.$emit('page-popup', {
				// 	title: '请阅读软件内容',
				// 	content: 'uni-app 是一个使用 Vue.js 开发跨平台应用的前端框架，开发者编写一套代码，可编译到iOS、Android、H5、小程序等多个平台。'
				// });
				const subNVue = uni.getSubNVueById("application-menu");
				subNVue.show("slide-in-bottom");
			},
			// 监听页面大小
			watchWebViewSize() {
				const wv = getWebView();
				if (!wv) {
					return;
				}
				const windowResizeCallback = (res) => {
					const {
						statusBarHeight,
						windowHeight
					} = uni.getSystemInfoSync();

					if (res.size.windowHeight < windowHeight) {
						//高度缩小

						wv.setStyle({
							//设置web-view距离顶部的距离以及自己的高度，单位为px
							top: statusBarHeight + 44, //此处是距离顶部的高度，应该是你页面的头部
							bottom: 0, //防止输入框被软键盘遮挡
							height: windowHeight - 280, // webview的高度
							scalable: false, //webview的页面是否可以缩放，双指放大缩小
						});
					} else {
						//高度还原

						wv.setStyle({
							//设置web-view距离顶部的距离以及自己的高度，单位为px
							top: statusBarHeight + 44,
							bottom: 0,
							height: windowHeight - 20,
							scalable: false,
						});
					}
				};
				uni.onWindowResize(windowResizeCallback);
			},
		},
	};
</script>

<style scoped>
	.thorui-loading__2 {
		z-index: 100;
	}

	.thorui-loading {
		width: 50px;
		height: 50px;
	}

	.thorui-loading-line {
		width: 8px;
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
	}

	.thorui-ani2 {
		left: 14px;
	}

	.thorui-ani3 {
		left: 25px;
	}
</style>