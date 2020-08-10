<template>
	<view class="content">
		<view class="head">
			<div v-show="scrollTop > 0" class="shadow"></div>
			<img src="static/img/search.png" class="filter" @click="drawerShow">
			<!-- <img v-show="scrollTop > 0" src="https://wz950116.bj.bcebos.com/jx3-pve%2Fassets%2Fshadow.png" class="cloud"> -->
		</view>

		<uni-drawer ref="drawer" mode="right">
			<view style="padding: 70rpx 30rpx 30rpx;">
				<view class="drawer-item">
					<view class="uni-list">
						<view class="uni-list-cell">
							<view class="uni-list-cell-left">
								名称
							</view>
							<view class="uni-list-cell-db">
								<picker class="item-input" :value="mountIndex" :range="mountList" @change="nameChange">
									<view class="uni-input">{{ mountList[mountIndex] }}</view>
								</picker>
							</view>
						</view>
						<view class="uni-list-cell">
							<view class="uni-list-cell-left">
								UID
							</view>
							<view class="uni-list-cell-db">
								<input v-model="mountId" class="uni-input" type="number" placeholder="" />
							</view>
						</view>
						<view class="uni-list-checkbox">
							<checkbox-group @change="checkboxChange">
								<label class="checkbox">
									<checkbox class='yellow' value="劲足" :checked="specOpt.includes('劲足')" color="#FFCC33" />
									<uni-text>是否劲足</uni-text>
								</label>
								<label class="checkbox">
									<checkbox value="匹马" :checked="specOpt.includes('匹马')" />
									<uni-text>是否匹马</uni-text>
								</label>
							</checkbox-group>
						</view>
					</view>
					<view class="uni-btn-v">
						<button type="default" size="mini" class="reset" @click="onReset">重置</button>
						<button type="primary" size="mini" class="confirm" @click="onConfirm">确定</button>
					</view>
				</view>
			</view>
		</uni-drawer>

		<scroll-view scroll-y show-scrollbar="true" :style="getHeight" :scroll-top="scrollTop" @scrolltolower="loadMore"
		 @scroll="scroll">
			<view class="list">
				<view class="item" v-for="(item, index) in currentList" :key="item.uid">
					<view class="avatar">
						<img :src="`static/img/mounts/${item.icon}.png`" @click="doView(printscreen[item.name + '·' + item.suffix] || printscreen[item.name])" alt="">
					</view>
					<view class="info">
						<view class="name">
							<img src="static/img/mounts/name.png" alt="">
							<uni-text class="prefix" v-if="item.suffix">{{ item.name }}・{{ item.suffix }}</uni-text>
							<uni-text class="prefix" v-else>{{ item.name }}</uni-text>
							<uni-text class="suffix" v-show="(item.attrs_1 && item.attrs_1.includes('劲足')) || (item.attrs_2 && item.attrs_2.includes('劲足')) || (item.attrs_3 && item.attrs_3.includes('劲足')) || (item.attrs_4 && item.attrs_4.includes('劲足')) || (item.attrs_5 && item.attrs_5.includes('劲足'))">劲足</uni-text>
							<uni-text class="speed">{{ item.speed }}</uni-text>
						</view>
						<view class="origin"><img src="static/img/mounts/id.png" alt="">{{ item.child_uid }}</view>
						<view class="introduct"><img src="static/img/mounts/introduct.png" alt="">{{ introductList[item.name] || '具体不详' }}</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<tabs name='坐骑'></tabs>
	</view>
</template>

<script>
	import fetch from '@/utils/request'
	import tabs from '@/components/tabs'
	import uniDrawer from "@/components/uni-drawer"

	export default {
		data() {
			return {
				listAll: [],
				list: [],
				currentList: [],
				pageSize: 10,
				currPage: 1,
				scrollTop: 0,
				mountIndex: '',
				mountList: [],
				mountId: '',
				specOpt: [],
				printscreen: {},
				introductList: {}
			}
		},
		components: {
			tabs,
			uniDrawer
		},
		computed: {
			// 计算组件所占屏幕高度
			getHeight() {
				let height = uni.getSystemInfoSync().windowHeight - 278
				return `height: ${height}px;`
			}
		},
		onPullDownRefresh() {
			this.init()
		},
		onLoad() {
			this.init()
		},
		methods: {
			async init() {
				this.currPage = 1
				this.scrollTop = 0
				if (this.currentList.length) {
					uni.stopPullDownRefresh()
					return
				}
				
				this.listAll = await fetch.get('http://47.94.91.181/assets/data/mounts/mounts.json')
				this.printscreen = await fetch.get('http://47.94.91.181/assets/data/mounts/printscreen.json')
				this.introductList = await fetch.get('http://47.94.91.181/assets/data/mounts/description.json')
				this.listAll.forEach(item => {
					this.list.push(item)
					if (!this.mountList.includes(item.name)) {
						this.mountList.push(item.name)
					}
				})
				this.currentList = this.list.slice(0, 10)
				uni.stopPullDownRefresh()
			},
			loadMore() {
				if (this.list.length === this.currentList.length) {
					uni.showToast({
						title: '已加载全部',
						icon: 'none',
						duration: 1000
					})
					return
				}
				uni.showLoading({
					title: '加载中...',
					mask: true
				})
				setTimeout(() => {
					this.currPage++
					this.currentList = this.list.slice(0, this.currPage * this.pageSize)
					uni.hideLoading()
				}, 500)
			},
			scroll(e) {
				this.scrollTop = e.detail.scrollTop
			},
			doView(src) {
				if (!src) return
				uni.previewImage({
					urls: [src],
					longPressActions: {
						itemList: ['发送给朋友', '保存图片', '收藏'],
						success(res) {
							uni.saveImageToPhotosAlbum({
								filePath: src,
								success() {
									uni.showToast({
										title: '保存成功',
										icon: 'success',
										duration: 1000
									})
								}
							})
						},
						fail(err) {
							console.log(err.errMsg)
						}
					}
				})
			},
			drawerShow() {
				this.$refs.drawer.open()
			},
			nameChange(e) {
				this.mountIndex = e.target.value
			},
			checkboxChange(e) {
				this.specOpt = e.target.value
			},
			onReset() {
				this.mountIndex = ''
				this.mountId = ''
				this.specOpt = []
			},
			onConfirm() {
				this.currPage = 1
				this.scrollTop = 0
				let list = []
				if (this.mountList[this.mountIndex]) {
					list = this.listAll.filter(v => v.name === this.mountList[this.mountIndex])
				}
				if (this.mountId.trim()) {
					if (this.mountList[this.mountIndex]) {
						list = list.filter(v => v.child_uid === this.mountId)
					} else {
						list = this.listAll.filter(v => v.child_uid === this.mountId)
					}
				}
				if (this.specOpt.length) {
					if (this.mountList[this.mountIndex] || this.mountId) {
						list = list.filter(v => {
							if ((v.attrs_1 && this.specOpt.includes(v.attrs_1.slice(0, 2))) || (v.attrs_2 && this.specOpt.includes(v.attrs_2.slice(0, 2))) || (v.attrs_3 && this.specOpt.includes(v.attrs_3.slice(0, 2))) || (v.attrs_4 && this.specOpt.includes(v.attrs_4.slice(0, 2))) || (v.attrs_5 && this.specOpt.includes(v.attrs_5.slice(0, 2)))) {
								return true
							}
						})
					} else {
						list = this.listAll.filter(v => {
							if ((v.attrs_1 && this.specOpt.includes(v.attrs_1.slice(0, 2))) || (v.attrs_2 && this.specOpt.includes(v.attrs_2.slice(0, 2))) || (v.attrs_3 && this.specOpt.includes(v.attrs_3.slice(0, 2))) || (v.attrs_4 && this.specOpt.includes(v.attrs_4.slice(0, 2))) || (v.attrs_5 && this.specOpt.includes(v.attrs_5.slice(0, 2)))) {
								return true
							}
						})
					}
				}
				if (!this.mountList[this.mountIndex] && !this.mountId.trim() && !this.specOpt.length) {
					list = this.listAll
				}
				this.list = list
				this.currentList = list.slice(0, 10)
				this.$refs.drawer.close()
			}
		}
	}
</script>

<style lang='scss' scoped>
	.content {
		height: 100vh;
		overflow-y: auto;
		background-color: #f5f5f5;

		.head {
			display: block;
			width: calc(100% - 80rpx);
			height: 360rpx;
			background: url('../../static/img/mounts.png') no-repeat center;
			background-size: cover;
			margin: 80rpx auto 40rpx;
			border-radius: 10rpx;

			.shadow {
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				height: 478rpx;
				opacity: 0.4;
				background: #ffffff;
			}
			
			.filter {
				position: absolute;
				width: 50rpx;
				height: 50rpx;
				right: 56rpx;
				top: 376rpx;
			}

			.cloud {
				position: absolute;
				left: 0;
				right: 0;
				top: 478rpx;
				width: 100%;
				transform: rotate(180deg);
				z-index: 998;
			}
		}

		.drawer-item {

			uni-view {
				font-size: 28rpx;
				line-height: 1.8;
			}

			.uni-list {
				position: relative;
				width: 100%;

				.uni-list-cell {
					position: relative;
					display: flex;
					background-color: #f9f9f9;
					border-radius: 10rpx;
					margin-bottom: 32rpx;

					.uni-list-cell-left {
						width: 100rpx;
						height: 86rpx;
						line-height: 86rpx;
						text-align: center;
					}

					.uni-list-cell-db {
						width: 240rpx;

						.uni-input {
							height: 86rpx;
							line-height: 86rpx;
							padding: 0 26rpx;
							font-size: 28rpx;
							color: #888888;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}
				}
				
				.uni-list-checkbox {
					margin-bottom: 34rpx;
					
					uni-checkbox-group {
						width: 100%;
						display: flex;
						justify-content: space-between;
						
						.checkbox {
							.yellow {
								/deep/.uni-checkbox-input:hover {
									border-color: #FFCC33 !important;
								}
							}
							uni-text {
								display: inline-block;
								vertical-align: top;
								margin-top: 2rpx;
							}
						}
					}
				}
			}

			.uni-btn-v {
				position: absolute;
				bottom: 32upx;
				left: 30upx;
				right: 30upx;

				uni-button {
					float: left;
					width: 50%;

					&::after {
						border-radius: 0;
					}
				}

				.reset {
					border-top-right-radius: 0;
					border-bottom-right-radius: 0;
				}

				.confirm {
					border-top-left-radius: 0;
					border-bottom-left-radius: 0;
				}
			}
		}

		.list {

			.item {
				margin-bottom: 20rpx;
				padding: 20rpx;
				background-color: #ffffff;

				.avatar {
					float: left;
					width: 120rpx;
					height: 120rpx;
					margin-right: 40rpx;

					img {
						display: block;
						width: 96rpx;
						height: 96rpx;
						margin: 12rpx;
					}
				}

				.info {
					float: left;
					width: calc(100% - 216rpx);

					uni-view {
						width: 100%;
						color: #888888;
						font-size: 28rpx;
						line-height: 40rpx;
					}

					.name {
						color: #666666;
						width: 100%;

						.prefix {
							display: inline-block;
							max-width: calc(100% - 205rpx);
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							vertical-align: top;
						}

						.suffix {
							display: inline-block;
							padding: 0 10rpx;
							background-color: #fef0ee;
							color: #ff6a00;
							font-size: 24rpx;
							border-radius: 8rpx;
							margin-left: 10rpx;
							vertical-align: top;
						}
						
						.speed {
							display: inline-block;
							padding: 0 10rpx;
							background-color: #fff1f1;
							color: #e2408d;
							font-size: 24rpx;
							border-radius: 8rpx;
							margin-left: 10rpx;
							vertical-align: top;
						}
					}
					
					.name, .origin, .introduct {
						img {
							width: 40rpx;
							height: 40rpx;
							margin-right: 10rpx;
							vertical-align: top;
						}
					}
				}

				uni-icon {
					float: right;
					line-height: 120rpx;
				}

				&::after {
					clear: both;
					display: block;
					content: '';
				}
			}
		}
	}
</style>
