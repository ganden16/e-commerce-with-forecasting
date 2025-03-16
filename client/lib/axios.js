import Axios from "axios"

const axios = Axios.create({
	baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
	timeout: 20000,
	headers: {
		Accept: 'application/json',
		// 'X-XSRF-TOKEN': decodeURIComponent(Cookies.get('XSRF-TOKEN')),
		// 'X-Requested-With': 'XMLHttpRequest',
	},
	// withCredentials: true,
})

export const endpoint = {
	forecast: '/api/forecast',
	product: '/api/product',
	category: '/api/category',
	users: '/api/users',
	auth: '/api/auth',
	cart: '/api/cart',
	qna: '/api/qna',
	review: '/api/review',
	region: '/api/region',
	shipment: '/api/shipment',
	order: '/api/order',
	payment: '/api/payment',
	landingPage: '/api/landing-page',
}


export default axios