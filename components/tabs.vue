<template>
	<view class="tabs">
		<view :class="[ 'item', { active: name === item.label } ]" v-for="item in tabs" :key="item.label" @click="tabClick(item)">
			<uni-text :class="[ 'iconfont', item.className ]"></uni-text>
			<view>{{ item.label }}</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabs: [{
					className: 'icon-diaoluo',
					label: '掉落',
					path: '/pages/dl/index'
				}, {
					className: 'icon-qiyu',
					label: '奇遇',
					path: '/pages/qy/index'
				}, {
					className: 'icon-mounts',
					label: '坐骑',
					path: '/pages/mounts/index'
				}]
			}
		},
		props: {
			name: {
				type: String,
				default: '掉落'
			}
		},
		methods: {
			tabClick(query) {
				if (query.disabled) return
				uni.navigateTo({
					url: query.path
				})
			}
		}
	}
</script>

<style scoped lang='scss'>
	.tabs {
		position: fixed;
		display: flex;
		bottom: 0;
		width: 100%;
		height: 100rpx;
		border-top: 1px solid #f2f2f2;
		background: #ffffff;

		.item {
			width: 33%;
			text-align: center;
			font-size: 20rpx;
			margin-top: 10rpx;
			color: #777777;

			uni-text {
				display: inline-block;
				width: 76rpx;
				font-size: 42rpx;
			}
			
			&:nth-of-type(2) {
				
				uni-text {
					margin-top: -2rpx;
				}
			}
		}

		.active {
			color: #2484cf;

			uni-text {
				color: #2484cf;
			}
		}
	}
</style>
