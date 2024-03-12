// import { setPrintImage } from "@/pages/printer/printer.helper.js";
import permission from "@/js_sdk/wa-permission/permission.js";
const setPrintImage = () => {}
let appInfo = {
	url: "",
	name: "",
};

// 当前 web-view 对象
let currWebView = null;
let parentWebView = null;
let titleNViewDefaultStyles = null;
let additionalHttpHeaders = {};

// 处理 h5 发送的数据
const handlePlusMessage = function(e) {
	if (!currWebView) {
		return;
	}
	if (e.data.type == "WEB_INVOKE_APPSERVICE") {
		if (e.data.args && e.data.args.data && e.data.args.webviewIds) {
			console.log(e.data.args.webviewIds[0], currWebView.webViewId);
			if (e.data.args.webviewIds[0] == currWebView.webViewId) {
				if (e.data.args.data.name == "postMessage") {
					const postMsg = e.data.args.data.arg;
					console.log(postMsg, postMsg.eventId, postMsg.action);
					if (postMsg && postMsg.eventId && postMsg.action) {
						webViewActions(postMsg);
					}
				}
			}
		}
	}
};

plus.globalEvent.addEventListener("plusMessage", handlePlusMessage);

// 返回 H5 结果
const handleAPIResult = function(result) {
	console.log({
		result,
	});
	currWebView.evalJS(`
		try{
			UniBridge.receiveResult(${JSON.stringify(result)})
		}catch(err){
			console.error('UniBridge or UniBridge.receiveResult is Not init!')
			console.error(err)	
		}
	`);
};

// 可直接处理的 uniapp API
const handleUniAPI = async function(
	action,
	eventId, {
		success,
		fail,
		complete,
		...config
	} = {}
) {
	console.log(eventId + " start!");
	const result = {
		eventId,
		code: 1,
	};

	try {
		const {
			errMsg,
			...res
		} = await uni[action]({
			...config,
		});

		result.message = errMsg;
		result.payload = res;

		console.log(eventId + " end!");
		handleAPIResult(result);
	} catch (e) {
		//TODO handle the exception
		result.code = 0;
		result.message = e.errMsg;
		result.payload = {};
		handleAPIResult(result);
	}
};

// 处理 H5 需要的 action
const webViewActions = function({
	action,
	eventId,
	payload = {}
}) {
	const {
		platform
	} = uni.getSystemInfoSync();
	const instanceAPIs = {
		initUniBridgeFinished() {
			currWebView.ready = true;
			currWebView.evalJS(`
				try{
					UniBridge.APIReady()
				}catch(err){
					console.error('UniBridge is Not init!')
					console.error(err)
				}
			`);
		},
	};

	const basicAPIs = {
		async getAppInfo() {
			try {
				const {
					errMsg,
					appVersion,
					deviceBrand,
					deviceId,
					deviceModel,
					deviceOrientation,
					devicePixelRatio,
					deviceType,
					osLanguage,
					osName,
					osTheme,
					osVersion,
					screenHeight,
					screenWidth,
					statusBarHeight,
					windowBottom,
					windowHeight,
					windowTop,
					windowWidth,
				} = await uni.getSystemInfo();
				const data = {
					eventId,
					code: 1,
					payload: {
						appVersion,
						deviceBrand,
						deviceId,
						deviceModel,
						deviceOrientation,
						devicePixelRatio,
						deviceType,
						osLanguage,
						osName,
						osTheme,
						osVersion,
						screenHeight,
						screenWidth,
						statusBarHeight,
						windowBottom,
						windowHeight,
						windowTop,
						windowWidth,
					},
					message: errMsg,
				};
				handleAPIResult(data);
			} catch (e) {
				//TODO handle the exception
				handleAPIResult({
					eventId,
					code: 0,
					message: e.errMsg,
				});
			}
		},

		openLabelPrinter() {
			setPrintImage(payload.type, payload.data);
			uni.navigateTo({
				url: "/pages/printer/printer",
				success() {
					handleAPIResult({
						eventId,
						code: 1,
						message: "success",
					});
				},
			});
		},
		setBadgeNumber(num = 0, options) {
			plus.runtime.setBadgeNumber(num, options);
		},
		// getUserAuthInfo() {
		// 	const userAuthInfo = {}
		// 	const token = uni.getStorageSync('access_token')
		// 	if (token) {
		// 		userAuthInfo.isAuth = true
		// 		userAuthInfo.accessToken = token
		// 		const data = {
		// 			eventId,
		// 			code: 1,
		// 			message: "success",
		// 			payload: userAuthInfo
		// 		}
		// 		handleAPIResult(data);
		// 	} else {
		// 		const data = {
		// 			eventId,
		// 			code: 0,
		// 			message: "用户未认证",
		// 			payload: null
		// 		}
		// 		handleAPIResult(data);
		// 	}
		// },
		navigateBack() {
			currWebView.canBack((e) => {
				if (e.canBack) {
					currWebView.back();
				} else {
					uni.navigateBack();
				}
			});
		},
		href() {
			parentWebView.setStyle({
				titleNView: titleNViewDefaultStyles,
			});
			currWebView.loadURL(payload.url, payload.additionalHttpHeaders);
		},
	};
	const customNavBarBtns = {
		setNavBarStyles() {
			if (payload) {
				const currStyles = parentWebView.getStyle().titleNView;

				parentWebView.setStyle({
					titleNView: {
						...currStyles,
						...payload,
					},
				});
			}
		},
		getNavBarStyle() {
			if (payload == "parent") {
				const wvStyle = parentWebView.getStyle().titleNView;
				const data = {
					eventId,
					code: 1,
					message: "success",
					payload: wvStyle,
				};
				handleAPIResult(data);
			} else {
				const wvStyle = currWebView.getStyle().titleNView;
				const data = {
					eventId,
					code: 1,
					message: "success",
					payload: wvStyle,
				};
				handleAPIResult(data);
			}
		},
		resetNavBarStyles() {
			if (titleNViewDefaultStyles) {
				parentWebView.setStyle({
					titleNView: titleNViewDefaultStyles,
				});
			}
		},
		resetNavBarButtons() {
			// const currStyles = parentWebView.getStyle().titleNView;
			const currStyles = currWebView.getStyle().titleNView;
			parentWebView.setStyle({
				titleNView: {
					top: 0,
					bottom: 0,
					...currStyles,
					buttons: (titleNViewDefaultStyles && titleNViewDefaultStyles.buttons) || [],
				},
			});
			currWebView.evalJS(`
				try{
					UniBridge.onNavBarButtonTap = () => {}
				}catch(err){
					console.error('[onNavBarButtonTap Err]',err)
				}	
			`);
		},
		setNavBarButtons() {
			if (Array.isArray(payload)) {
				// const currStyles = parentWebView.getStyle().titleNView

				const currStyles = currWebView.getStyle().titleNView;

				parentWebView.setStyle({
					titleNView: {
						...currStyles,
						top: 0,
						bottom: 0,
						buttons: payload.map((item, index) => ({
							...item,
							onclick() {
								currWebView.evalJS(`
									try{
										UniBridge.onNavBarButtonTap(${JSON.stringify({ ...item, index })})
									}catch(err){
										console.error('[onNavBarButtonTap Err]',err)
									}	
								`);
							},
						})),
					},
				});
				// payload.forEach((item, index) => {
				// 	parentWebView.setTitleNViewButtonStyle(index + 1, item)
				// })
			}
		},
		onNavBarButtonTap() {
			currWebView.evalJS(`
				try{
					UniBridge.onNavBarButtonTap(${JSON.stringify(item)})
				}catch(err){
					console.error('[onNavBarButtonTap Err]',err)
				}	
			`);
		},
		tapMenu() {
			currWebView.evalJS(`
				try{
					UniBridge.tapMenu()
				}catch(err){
					console.error('[tapMenu Err]',err)
				}	
			`);
		},
	};
	const allowUniAPIs = {
		async previewImage() {
			if (uni[action]) {
				await handleUniAPI(action, eventId, payload);
			}
		},
		async scanCode() {
			if (platform === "android") {
				const allowCamera = await permission.requestAndroidPermission(
					"android.permission.CAMERA"
				);
				console.log({
					allowCamera,
				});
				if (allowCamera === -1) {
					const {
						confirm
					} = await uni.showModal({
						title: "提示",
						content: "您已禁用相机权限，请到系统设置中进行允许后重试！",
						confirmText: "去允许",
					});
					if (confirm) {
						await uni.openAppAuthorizeSetting();
					}
					const data = {
						eventId,
						code: 0,
						message: "获取相机权限被系统拒绝！",
						payload: {},
					};
					handleAPIResult(data);
				} else if (uni[action]) {
					await handleUniAPI(action, eventId, payload);
				}
			}
			if (platform === "ios") {
				if (permission.judgeIosPermission("camera")) {
					if (uni[action]) {
						await handleUniAPI(action, eventId, payload);
					}
				} else {
					const {
						cameraAuthorized
					} = await uni.getAppAuthorizeSetting();
					if (cameraAuthorized === "denied") {
						const {
							confirm
						} = await uni.showModal({
							title: "提示",
							content: "您已禁用相机权限，请到系统设置中进行允许后重试！",
							confirmText: "去允许",
						});

						if (confirm) {
							await uni.openAppAuthorizeSetting();
						}
						const data = {
							eventId,
							code: 0,
							message: "获取相机权限被系统拒绝！",
							payload: {},
						};
						handleAPIResult(data);
					} else {
						if (uni[action]) {
							await handleUniAPI(action, eventId, payload);
						}
					}
				}
			}
		},
		async getLocation() {
			if (!permission.checkSystemEnableLocation()) {
				await uni.showModal({
					title: "提示",
					content: "系统位置服务处于关闭状态，请到系统设置中开启后重试！",
				});
				const data = {
					eventId,
					code: 0,
					message: "系统位置服务处于关闭状态，无法获取位置信息！",
					payload: {},
				};
				handleAPIResult(data);
				return;
			}

			if (platform === "android") {
				const allowLocation = await permission.requestAndroidPermission(
					"android.permission.ACCESS_FINE_LOCATION"
				);
				if (allowLocation === -1) {
					const {
						confirm
					} = await uni.showModal({
						title: "提示",
						content: "您已禁用获取位置权限，请到系统设置中进行允许后重试！",
						confirmText: "去允许",
					});
					if (confirm) {
						await uni.openAppAuthorizeSetting();
					}
					const data = {
						eventId,
						code: 0,
						message: "获取位置权限被系统拒绝！",
						payload: {},
					};
					handleAPIResult(data);
				} else if (uni[action]) {
					await handleUniAPI(action, eventId, payload);
				}
			}
			if (platform === "ios") {
				if (permission.judgeIosPermission("location")) {
					if (uni[action]) {
						await handleUniAPI(action, eventId, payload);
					}
				} else {
					const {
						confirm
					} = await uni.showModal({
						title: "提示",
						content: "您已禁用获取位置权限，请到系统设置中进行允许后重试！",
						confirmText: "去允许",
					});

					if (confirm) {
						await uni.openAppAuthorizeSetting();
					}
					const data = {
						eventId,
						code: 0,
						message: "获取位置权限被系统拒绝！",
						payload: {},
					};
					handleAPIResult(data);
				}
			}
		},
		async chooseLocation() {
			if (!permission.checkSystemEnableLocation()) {
				await uni.showModal({
					title: "提示",
					content: "系统位置服务处于关闭状态，请到系统设置中开启后重试！",
				});
				const data = {
					eventId,
					code: 0,
					message: "系统位置服务处于关闭状态，无法获取位置信息！",
					payload: {},
				};
				handleAPIResult(data);
				return;
			}

			if (platform === "android") {
				const allowLocation = await permission.requestAndroidPermission(
					"android.permission.ACCESS_FINE_LOCATION"
				);
				if (allowLocation === -1) {
					const {
						confirm
					} = await uni.showModal({
						title: "提示",
						content: "您已禁用获取位置权限，请到系统设置中进行允许后重试！",
						confirmText: "去允许",
					});
					if (confirm) {
						await uni.openAppAuthorizeSetting();
					}
					const data = {
						eventId,
						code: 0,
						message: "获取位置权限被系统拒绝！",
						payload: {},
					};
					handleAPIResult(data);
				} else if (uni[action]) {
					await handleUniAPI(action, eventId, payload);
				}
			}
			if (platform === "ios") {
				if (permission.judgeIosPermission("location")) {
					if (uni[action]) {
						await handleUniAPI(action, eventId, payload);
					}
				} else {
					const {
						confirm
					} = await uni.showModal({
						title: "提示",
						content: "您已禁用获取位置权限，请到系统设置中进行允许后重试！",
						confirmText: "去允许",
					});

					if (confirm) {
						await uni.openAppAuthorizeSetting();
					}
					const data = {
						eventId,
						code: 0,
						message: "获取位置权限被系统拒绝！",
						payload: {},
					};
					handleAPIResult(data);
				}
			}
		},
		// 下载文件
		async downloadFile() {
			if (payload.url) {
				setFileInfo({
					url: payload.url,
					name: payload.name,
					method: payload.method || "GET",
				});
				uni.navigateTo({
					url: `/pages/system/downloader`,
				});
			} else {
				const data = {
					eventId,
					code: 0,
					message: "url不存在",
					payload: {},
				};
				handleAPIResult(data);
			}
		},
		async openDocument() {
			if (!payload.url) {
				const data = {
					eventId,
					code: 0,
					message: "url不存在",
					payload: {},
				};
				return handleAPIResult(data);
			}
			const res = await uni.downloadFile({
				url: payload.url,
			});
			const filePath = res.tempFilePath;

			if (filePath) {
				try {
					await uni.openDocument({
						filePath: filePath,
						showMenu: payload.showMenu,
					});
					const data = {
						eventId,
						code: 1,
						message: "调用成功",
						payload: {},
					};
					handleAPIResult(data);
				} catch (e) {
					//TODO handle the exception
					const {
						tapIndex
					} = await uni.showActionSheet({
						title: "该文件不支持预览",
						itemList: ["下载"],
					});
					switch (tapIndex) {
						case 0: {
							await this.downloadFile();
							break;
						}
						default:
							return;
					}
					const data = {
						eventId,
						code: 0,
						message: "预览失败",
						payload: {},
					};
					handleAPIResult(data);
				}
			} else {
				const data = {
					eventId,
					code: 0,
					message: "预览失败",
					payload: {},
				};
				handleAPIResult(data);
			}
		},
	};
	const lifeCycleHooks = {
		// ready() {
		// 	const result = {
		// 		eventId,
		// 		code: 1,
		// 		payload: [...Object.keys(basicAPIs), ...Object.keys(allowUniAPIs)],
		// 	};
		// 	const data = JSON.stringify(result);
		// 	currWebView.UniBridgeJSBridgeReady = true;
		// 	currWebView.evalJS(`
		// 		try{
		// 			UniBridge.initUniBridgeAPIs(${data})
		// 		}catch(err){
		// 			console.error('[ready Err]',err)
		// 		}
		// 	`);
		// },
		onShow() {
			currWebView.evalJS(`
				try{
					UniBridge.onShow()
				}catch(err){
					console.error('[onShow Err]',err)
				}		
			`);
		},
		onHide() {
			currWebView.evalJS(`
				try{
					UniBridge.onHide()
				}catch(err){
					console.error('[onHide Err]',err)
				}	
			`);
		},
	};

	switch (true) {
		case basicAPIs.hasOwnProperty(action):
			basicAPIs[action]();
			break;
		case lifeCycleHooks.hasOwnProperty(action):
			lifeCycleHooks[action]();
			break;
		case customNavBarBtns.hasOwnProperty(action):
			customNavBarBtns[action]();
			break;
		case allowUniAPIs.hasOwnProperty(action):
			allowUniAPIs[action]();
			break;
		case instanceAPIs.hasOwnProperty(action):
			instanceAPIs[action]();
			break;
		default:
			currWebView.evalJS(`
				console.error('UniBridge.${action} is Not init!')
			`);
			break;
	}
};

// 注册 web-view
const registerWebView = function(webViewId, parentWv) {
	console.log("-------appInfo------", appInfo);
	if (!appInfo.url) {
		throw new Error("未初始化应用信息！");
	}
	const {
		statusBarHeight,
		windowHeight,
		safeAreaInsets
	} =
	uni.getSystemInfoSync();

	// const webviewUrl = `${appInfo.url}&_token=${uni.getStorageSync('access_token')}&_tenant=cytzjt&t=${new Date().getTime()}`
	const webviewUrl = appInfo.url;
	console.log("webviewUrl", webviewUrl);
	const wv = plus.webview.create(
		webviewUrl,
		"xms-h5", {
			// plusrequire: "none", //禁止远程网页使用plus的API，有些使用mui制作的网页可能会监听plus.key，造成关闭页面混乱，可以通过这种方式禁止
			"uni-app": "none", //不加载uni-app渲染层框架，避免样式冲突
			scalable: false,
			scrollIndicator: "none",
			popGesture: "none",
			// softinputMode: 'adjustResize',
			progress: {
				color: "#1989fa",
				height: "2px",
			},
			titleNView: {
				splitLine: {
					// 分割线
					color: "#ededed",
					height: "1px",
				},
				autoBackButton: true,
				// "type": "float",
				backgroundColor: "#FFFFFF",
				blurEffect: "light",
				titleText: appInfo.name || null,
				titleColor: "#000000",
			},
		}, {
			ready: false,
			webViewId,
			mode: "plus",
		}
	);
	console.log("---------wv------", wv.auth);
	// wv.appendJsFile("_www/hybrid/html/js/dist/main.js");
	wv.addEventListener("titleUpdate", ({
		title
	}) => {
		uni.setNavigationBarTitle({
			title,
		});
	});
	wv.addEventListener("close", () => {
		destroyWebView();
	});
	titleNViewDefaultStyles = parentWv.getStyle().titleNView;
	parentWebView = parentWv;
	parentWv.append(wv);
	currWebView = wv;
	return currWebView;
};

const getAppInfo = () => {
	return appInfo;
};

const getWebView = () => {
	return currWebView;
};

// 销毁 web-view 时，重置 helper
const destroyWebView = () => {
	currWebView = null;
	parentWebView = null;
	titleNViewDefaultStyles = null;
	additionalHttpHeaders = {};
};

// 注册 web-view loadURL 地址
const setAppInfo = function({
	url,
	name
}) {
	if (currWebView) {
		parentWebView.setStyle({
			titleNView: {
				buttons: (titleNViewDefaultStyles && titleNViewDefaultStyles.buttons) || [],
			},
		});
		currWebView.loadURL(url);
	}
	appInfo.url = url;

	// if (url && url.indexOf(oaH5Url) != -1) {
	// 	const token = uni.getStorageSync('access_token')
	// 	const query = utils.getUrlParam(url)
	// 	if (Object.keys(query).length > 0) {
	// 		appInfo.url = url + "&_token=" + token;
	// 	} else {
	// 		appInfo.url = url + '?_token=' + token;
	// 	}
	// }

	appInfo.name = name;
};

export {
	setAppInfo,
	getWebView,
	registerWebView,
	destroyWebView,
	getAppInfo,
	webViewActions,
};