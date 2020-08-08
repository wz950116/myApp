const request = {
	get: function(url, params = {}, cb) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: url,
				method: 'get',
				data: params,
				success: res => {
					cb && cb(res)
					resolve(res.data)
				},
				fail: err => {
					console.log(err)
				}
			})
		})
	}
}

export default request
