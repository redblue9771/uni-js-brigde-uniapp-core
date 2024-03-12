<template>
	<view class="container">
		<view class="file-info">
			<image :src="fileIcon" mode="widthFix" class="icon"></image>
			<tui-text :text="fileName" style="margin-top: 48rpx" align="center"></tui-text>
		</view>
		<tui-circular-progress :class="downloader && status == 1 ? '' : 'hidden'" :percentage="progress"
			activeMode="forwards">
		</tui-circular-progress>
		<view class="actions">
			<tui-button v-if="fileInfo.url && status == 0" @click="handleDownload" type="primary">下载</tui-button>
			<tui-button v-if="downloader && status == 1" @click="handleCancel" type="danger">取消</tui-button>
			<tui-button v-if="status == 3 && tempFilePath" @click="handleOpen" type="primary">打开</tui-button>
		</view>
	</view>
</template>

<script>
	import {
		DOC_FILE_TYPES,
		getFileInfo,
		IMG_FILE_TYPES
	} from "./downloader.helper";
	export default {
		data() {
			return {
				fileInfo: {},
				downloader: null,
				progress: 0,
				status: 0,
				tempFilePath: "",
				initPreview: false,
			};
		},
		computed: {
			fileIcon() {
				if (this.fileName) {
					const fileNameArr = this.fileName.split(".");
					let fileType = "";
					if (fileNameArr.length > 0) {
						fileType = fileNameArr[fileNameArr.length - 1].toLowerCase();
					}
					if (DOC_FILE_TYPES.includes(fileType)) {
						return "/static/images/doc.svg";
					}
					if (IMG_FILE_TYPES.includes(fileType)) {
						return "/static/images/img.svg";
					}
				}
				return "/static/images/file.svg";
			},
			fileName() {
				if (this.status === 3) {
					const tempFileNameArr = this.tempFilePath.split("/");
					return tempFileNameArr.length > 0 ?
						tempFileNameArr[tempFileNameArr.length - 1] :
						this.fileInfo.name;
				}

				return this.fileInfo.name || "未知文件";
			},
		},
		onLoad() {
			const fileInfo = getFileInfo();
			this.fileInfo = fileInfo;
			this.handleDownload();
		},
		methods: {
			handleDownload() {
				this.status = 1;
				console.log(this.fileInfo);
				this.downloader = plus.downloader.createDownload(
					this.fileInfo.url, {
						method: this.fileInfo.method,
						timeout: 0,
					},
					(d, status) => {
						console.log(d);
						if (d.totalSize === d.downloadedSize) {
							this.tempFilePath = d.filename;
							if (!this.initPreview) {
								this.handleOpen();
							}
							this.status = 3;
						} else {
							console.log("Download failed: " + status, d);
							// this.downloader.clear() //清除下载器
							plus.downloader.clear();
							this.status = 0;
							this.progress = 0;
							console.log(this);
							uni.showToast({
								title: "下载失败",
								icon: "none",
							});
						}
					}
				);
				this.downloader.addEventListener("statechanged", (dtask) => {
					if (!dtask) {
						return;
					}
					// no default

					switch (dtask.state) {
						case 0:
							// console.log('开始下载');
							// this.downloadStatus = 0
							break;
						case 2:
							// console.log('链接到服务器...');
							// this.downloadStatus = 2
							break;

						case 3:
							this.progress = parseInt(
								(dtask.downloadedSize / dtask.totalSize) * 100
							);
							// this.downloadStatus = 3
							break;

						case 4:
							// console.log('监听下载完成');
							// this.status = 3
							break;
						case 5:
							// console.log('下载任务已暂停');
							this.status = 0;
							break;
					}
				});
				this.downloader.start();
			},
			handleCancel() {
				this.downloader.abort();
				plus.downloader.clear();
				this.status = 0;
				this.progress = 0;
			},
			handleOpen() {
				const fileNameArr = this.tempFilePath.split(".");
				let fileType = "";
				if (fileNameArr.length > 0) {
					fileType = fileNameArr[fileNameArr.length - 1].toLowerCase();
				}
				this.initPreview = true;
				if (IMG_FILE_TYPES.includes(fileType)) {
					uni.previewImage({
						current: 0,
						urls: [this.tempFilePath],
						loop: true,
						fail: () => {
							this.handleNativeOpen();
						},
					});
					return;
				}
				if (DOC_FILE_TYPES.includes(fileType)) {
					if (plus.os.name === "Android") {
						uni.openDocument({
							filePath: this.tempFilePath,
							fileType,
							showMenu: true,
							success: function(res) {
								console.log("打开文档成功");
							},
							fail: () => {
								console.log("fail");
								this.handleNativeOpen();
							},
						});
						return;
					}
				}

				this.handleNativeOpen();
			},
			handleNativeOpen() {
				plus.io.resolveLocalFileSystemURL(
					this.tempFilePath,
					(e) => {
						switch (plus.os.name) {
							case "Android":
								var Intent = plus.android.importClass("android.content.Intent");
								var sendIntent = new Intent(Intent.ACTION_SEND);
								var File = plus.android.importClass("java.io.File");
								var FileProvider = plus.android.importClass(
									"io.dcloud.common.util.DCloud_FileProvider"
								);
								var mainActivity = plus.android.runtimeMainActivity();
								var fileUri = FileProvider.getUriForFile(
									mainActivity,
									//前面部分需要与应用的包名一致
									mainActivity.getPackageName() + ".dc.fileprovider",
									new File(e.fullPath)
								);
								sendIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
								var type = plus.android.invoke(
									mainActivity.getContentResolver(),
									"getType",
									fileUri
								);
								//微信必须要设置类型
								sendIntent.setType(type);
								sendIntent.putExtra(Intent.EXTRA_STREAM, fileUri);
								var chooser = Intent.createChooser(sendIntent, "发送");
								mainActivity.startActivity(chooser);
								break;
							case "iOS":
								console.log("open");
								plus.runtime.openFile(this.tempFilePath, null, console.log);
								break;
							default:
								// 其它平台
								break;
						}
					},
					() => {
						uni.showToast({
							title: "未找到文件",
							icon: "none",
						});
					}
				);
			},
		},
		onUnload() {
			uni.removeSavedFile({
				filePath: this.tempFilePath,
			});
		},
	};
</script>

<style scoped>
	.container {
		align-items: center;
		justify-content: space-around;
	}

	.icon {
		width: 150rpx;
	}

	.actions,
	.file-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding: 32rpx 120rpx;
		box-sizing: border-box;
	}

	.hidden {
		visibility: hidden;
	}
</style>