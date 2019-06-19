module.exports = {
		lockCurrency: {
		"host": "cb-qa-6-api.gravitant.net",
		"path": "/core/currency/v2/defaultCurrency/",
		"data": {
				  "is_locked": false
		}
	},
	setCurrency: {
		"host": "cb-qa-6-api.gravitant.net",
		"path": "/core/currency/v2/setDefaultCurrency",
		"data": {
			"currency_code": "AUD"
		}
	}
}