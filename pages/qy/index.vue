<template>
	<view class="content">
		<view class="head">
			<div v-show="scrollTop > 0" class="shadow"></div>
			<!-- <img v-show="scrollTop > 0" src="https://wz950116.bj.bcebos.com/jx3-pve%2Fassets%2Fshadow.png" alt=""> -->
		</view>
		<scroll-view scroll-y show-scrollbar="true" :style="getHeight" :scroll-top="scrollTop" @scrolltolower="loadMore"
		 @scroll="scroll">
			<view class="list">
				<view class="item" v-for="(item, index) in currentList" :key="item.date">
					<view class="avatar">
						<img :src="`static/img/qy/${item.icon}.png`" alt="">
					</view>
					<view class="info">
						<view class="name">
							<uni-text class="prefix">[{{ item.label }}]</uni-text>
							<uni-text class="suffix" v-show="item.type">{{ item.type }}</uni-text>
						</view>
						<view class="origin">{{ item.origin }}</view>
						<view class="date">{{ item.date || '具体不详' }}</view>
					</view>
					<icon type="search" size="18" @click="doView(item.src)" />
				</view>
			</view>
		</scroll-view>

		<tabs name='奇遇'></tabs>
	</view>
</template>

<script>
	import fetch from '@/utils/request'
	import tabs from '@/components/tabs'

	export default {
		data() {
			return {
				list: [],
				currentList: [],
				pageSize: 10,
				currPage: 1,
				scrollTop: 0
			}
		},
		components: {
			tabs
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
				const list = await fetch.get('http://47.94.91.181/assets/data/pvx_qiyu.json')
				this.list = list.data
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
					title: '加载中...'
				})
				this.currPage++
				this.currentList = this.list.slice(0, this.currPage * this.pageSize)
				uni.hideLoading()
			},
			scroll(e) {
				this.scrollTop = e.detail.scrollTop
			},
			doView(src) {
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
			background: url('../../static/img/qiyu.png') no-repeat center;
			background-size: cover;
			margin: 80rpx auto 40rpx;
			border-radius: 10rpx;

			div {
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				height: 478rpx;
				opacity: 0.4;
				background-color: #ffffff;
			}

			img {
				position: absolute;
				left: 0;
				right: 0;
				top: 478rpx;
				width: 100%;
				transform: rotate(180deg);
				z-index: 9999;
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
						color: #adadad;
						font-size: 28rpx;
						line-height: 40rpx;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					.name {
						color: #666666;
						width: 100%;

						.prefix {
							display: inline-block;
							max-width: calc(100% - 80rpx);
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
