<template>
	<view>
		<tui-input label="远程应用" placeholder="输入地址" clearable v-model="appUrl">
			<tui-button slot="right" width="140rpx" height="60rpx" @click="handleUrl">打开</tui-button>
		</tui-input>
		<tui-input label="下载地址" placeholder="输入地址" clearable v-model="fileUrl">
			<tui-button slot="right" width="140rpx" height="60rpx" @click="handleFile">下载</tui-button>
		</tui-input>

		<view style="padding: 16px;">
			<tui-button @click="handleScan" style="margin-bottom: 12px;">打开扫码</tui-button>
			<tui-button @click="handleToApp" style="margin-bottom: 12px;">本地案例</tui-button>
			<tui-button openType="feedback" style="margin-bottom: 12px;">错误反馈</tui-button>
			<!-- <tui-button @click="handleToPrinter" style="margin-bottom: 12px;">打印机</tui-button> -->
		</view>
	</view>
</template>

<script>
	import {
		setAppInfo
	} from '@/pages/web-view/web-view.helper.js'
	import {
		setFileInfo
	} from '@/pages/downloader/downloader.helper.js'

	export default {
		data() {
			return {
				appUrl: "http://localhost:5173/m/",
				fileUrl: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-61376cc6-14e5-4d81-94cb-263e0d64a661/72c70dcd-bdf2-44ee-8738-5b398a95a15b.pdf",
				tempPath: ""
			}
		},
		onLoad() {},
		methods: {
			handleToPrinter() {
				uni.navigateTo({
					url: '/pages/printer/printer'
				})
			},
			handleFile() {
				setFileInfo({
					url: this.fileUrl,
					name: "测试.rar"
				})
				uni.navigateTo({
					url: '/pages/downloader/downloader'
				})
			},
			handleUrl() {
				setAppInfo({
					url: this.appUrl,
					name: "测试应用"
				})
				uni.showLoading({
					title: "打开应用中"
				})
				uni.navigateTo({
					url: '/pages/web-view/web-view',
					animationType: "slide-in-bottom",
					complete() {
						uni.hideLoading()
					}
				})
			},
			handleToApp() {
				uni.showLoading({
					title: "打开应用中"
				})
				setAppInfo({
					url: '_www/hybrid/html/index.html',
					name: "测试应用"
				})
				uni.navigateTo({
					url: '/pages/web-view/web-view',
					animationType: "slide-in-bottom",
					complete() {
						uni.hideLoading()
					}
				})
			},
			handleScan() {

				uni.scanCode({
					complete(res) {
						console.log(res.result)
						if (res.result) {
							setAppInfo({
								url: res.result,
								name: "测试应用"
							})
							uni.navigateTo({
								animationType: "slide-in-bottom",
								url: '/pages/web-view/web-view',
							})
						}
					}
				})
			}
		}
	}
</script>

<style>

</style>