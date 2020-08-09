<template>
	<view class="content">
		<view class="head">
			<div v-show="scrollTop > 10" class="shadow"></div>
			<img v-show="scrollTop > 10" src="https://wz950116.bj.bcebos.com/jx3-pve%2Fassets%2Fshadow.png" alt="">
		</view>
		<scroll-view scroll-y show-scrollbar="true" :style="getHeight" :scroll-top="scrollTop" @scrolltolower="loadMore"
		 @scroll="scroll">
			<view class="list">
				<view class="item" v-for="(item, index) in currentList" :key="item.date">
					<view class="avatar">
						<img :src="`https://oss.jx3box.com/icon/${item.icon || '572'}.png`" alt="">
					</view>
					<view class="info">
						<view class="name">[{{ item.label }}]</view>
						<view class="origin">{{ item.origin }}</view>
						<view class="date">{{ item.date || '具体不详' }}</view>
					</view>
					<icon type="search" size="18" @click="doView(item.src)" />
				</view>
			</view>
		</scroll-view>

		<tabs name='掉落'></tabs>
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
				this.scrollTop = 0
				if (this.currentList.length) {
					uni.stopPullDownRefresh()
					return
				}
				const list = await fetch.get('http://47.94.91.181/assets/data/pvx_diaoluo.json')
				this.list = list.data
				this.currentList = this.list.slice(0, 10)
				const array = []
				this.currentList.forEach((item, index) => {
					array.push(this.submitIcon(item, index))
				})
				Promise.all(array).then(values => {
					uni.stopPullDownRefresh()
				})
			},
			async submitIcon(item, index) {
				return new Promise(async resolve => {
					let IconID = '572'
					if (!item.icon) {
						const keywords = item.label.includes('・') ? item.label.slice(0, item.label.indexOf('・')) : item.label
						const r = await fetch.get(`https://node.jx3box.com/item/name/${encodeURIComponent(keywords)}?strict=0`)
						if (r[0]) {
							let filters = r.filter(v => (v.Name === item.label))
							if (filters[0]) {
								IconID = filters[filters.length - 1].IconID
							}
						}
						this.$set(item, 'icon', IconID)
					}
					resolve(index)
				})

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
				this.list.slice((this.currPage - 1) * this.pageSize, this.currPage * this.pageSize).forEach(item => {
					this.submitIcon(item)
				})
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
			background: url('../../static/img/diaoluo.png') no-repeat center;
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
						color: #888888;
						font-size: 28rpx;
						line-height: 40rpx;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
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
