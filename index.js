const axios = require('axios').default

class PayPal {
	constructor(clientId, secret, sandbox) {
		this.clientId = clientId
		this.secret = secret
		if (sandbox) {
			this.api = 'https://api-m.sandbox.paypal.com'
		} else {
			this.api = 'https://api-m.paypal.com'
		}
	}
	async getAccessToken() {
		const result = await axios.post(
			`${this.api}/v1/oauth2/token`,
			'grant_type=client_credentials',
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				auth: {
					username: this.clientId,
					password: this.secret,
				},
			}
		)
		return result.data.access_token
	}
	async createOrder(order) {
		const accessToken = await this.getAccessToken()
		const result = await axios.post(
			`${this.api}/v2/checkout/orders`,
			order,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		)
		return result.data
	}
	async verifyWebhookSignature({ body, headers }, webhookId) {
		const accessToken = await this.getAccessToken()
		const result = await axios.post(
			`${this.api}/v1/notifications/verify-webhook-signature`,
			{
				auth_algo: headers['paypal-auth-algo'],
				cert_url: headers['paypal-cert-url'],
				transmission_id: headers['paypal-transmission-id'],
				transmission_sig: headers['paypal-transmission-sig'],
				transmission_time: headers['paypal-transmission-time'],
				webhook_id: webhookId,
				webhook_event: body,
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		)
		return result.data.verification_status === 'SUCCESS'
	}
}

module.exports = {
	PayPal,
}
