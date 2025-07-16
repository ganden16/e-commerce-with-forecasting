import Swal from "sweetalert2"
import axios, {endpoint} from "./axios"

export const getBestModel = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.forecast}/modelling`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		cbError(error)
		console.log(error)
	}
}
export const getAllMethodsForecast = async (callback) => {
	try {
		const res = await axios.get(endpoint.forecast)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
	}
}
export const forecastCustomMethod = async (method, dataForm, callback) => {
	try {
		const res = await axios.post(`${endpoint.forecast}/${method}`, dataForm)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
		Swal.fire({
			icon: "error",
			title: "Oops...",
			text: error?.response?.data?.error ?? 'Terjadi Kesalahan Server',
		})
	}
}
export const forecastbestMethod = async (dataForm, callback, cbFinally = () => {}) => {
	try {
		const res = await axios.post(`${endpoint.forecast}/best-method`, dataForm)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
		Swal.fire({
			icon: "error",
			title: "Oops...",
			text: error?.response?.data?.error ?? 'Terjadi Kesalahan Server',
		})
	} finally {
		cbFinally()
	}
}
export const forecastAllMethod = async (dataForm, callback, cbFinally = () => {}) => {
	try {
		const res = await axios.post(`${endpoint.forecast}/all-method`, dataForm)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
	} finally {
		cbFinally()
	}
}

export const updateProductForecastingMethod = async (product_id, data, callback, cbError = () => {}) => {
	try {
		const res = await axios.put(`${endpoint.forecast}/product-forecasting-method/${product_id}`, data)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const getAllTrainTestData = async (callback, cbError = () => {}) => {
	try {
		const res = await axios.get(`${endpoint.forecast}/all-train-test-data`)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const getTrainTestData = async (product_id, callback, cbError = () => {}) => {
	try {
		const res = await axios.get(`${endpoint.forecast}/train-test-data/${product_id}`)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const updateOrCreateTrainTestData = async (dataForm, callback, cbError = () => {}) => {
	try {
		const res = await axios.post(`${endpoint.forecast}/train-test-data`, dataForm)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const getAllProducts = async (search = '', cbSuccess, cbFinally = () => {}) => {
	try {
		const res = await axios.get(`${endpoint.product}?search=${search}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
	} finally {
		cbFinally()
	}
}
export const getOneProduct = async (id, callback) => {
	try {
		const res = await axios(`${endpoint.product}/${id}`)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
	}
}
export const addProduct = async (formData, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.product}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			}
		})
		if(res.status == 201) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const updateProduct = async (id, formData, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.product}/${id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			}
		})
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const deleteProduct = async (id, callback) => {
	try {
		const res = await axios.delete(`${endpoint.product}/${id}`)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
	}
}

export const getAllCategories = async (callback) => {
	try {
		const res = await axios.get(endpoint.category)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
	}
}
export const getOneCategory = async (id, callback) => {
	try {
		const res = await axios(`${endpoint.category}/${id}`)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
	}
}
export const addCategory = async (formData, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.category}`, formData)
		if(res.status == 201) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const updateCategory = async (id, formData, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.category}/${id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			}
		})
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const deleteCategory = async (id, callback) => {
	try {
		const res = await axios.delete(`${endpoint.category}/${id}`)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
	}
}

export const getAllAdmins = async (callback) => {
	try {
		const res = await axios.get(`${endpoint.users}/admin`)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
	}
}
export const getAllUsers = async (callback) => {
	try {
		const res = await axios.get(`${endpoint.users}/user`)
		if(res.status == 200) {
			callback(res)
		}
	} catch(error) {
		console.log(error)
	}
}

export const me = async (cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.auth}/me`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		cbError(error)
		console.log(error)
	}
}
export const login = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.auth}/login`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const register = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.auth}/register`, data)
		if(res.status == 201) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const addAdmin = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.auth}/add-admin`, data)
		if(res.status == 201) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const updateProfile = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.auth}/update-profile`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const changePassword = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.put(`${endpoint.auth}/change-password`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const logout = async (cbSuccess) => {
	try {
		const res = await axios.delete(`${endpoint.auth}/logout`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
	}
}
export const sendOtpForgotPassword = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.auth}/send-otp-forgot-password`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const otpExpiry = async (identifier, cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.auth}/otp-expiry?identifier=${identifier}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const confirmForgotPassword = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.put(`${endpoint.auth}/confirm-forgot-password`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const completeProfile = async (data, config, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.auth}/complete-profile`, data, config)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}


export const getAllCarts = async (cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.cart}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const addCart = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.cart}`, data)
		if(res.status == 201) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const addCartFromBuyAgain = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.cart}/buy-again`, data)
		if(res.status == 201) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const updateCart = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.put(`${endpoint.cart}`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const deleteCart = async (cartId, cbSuccess, cbError) => {
	try {
		const res = await axios.delete(`${endpoint.cart}/${cartId}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const getAllReviews = async (cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.review}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const getProductReviews = async (productId = '', notReplied = 'false', cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.review}?productId=${productId}&notReplied=${notReplied}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const getReviewsByOrder = async (orderCode, cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.review}/by-order/${orderCode}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const addReviews = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.review}`, data)
		if(res.status == 201) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const updateOrCreateReplyReview = async (productReviewId, data, cbSuccess, cbError) => {
	try {
		const res = await axios.put(`${endpoint.review}/${productReviewId}`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const getAllQna = async (cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.qna}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const getProductQna = async (productId = '', notAnswered = false, cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.qna}?productId=${productId}&notAnswered=${notAnswered}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const addQuestion = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.qna}`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const updateOrCreateAnswer = async (productQnaId, data, cbSuccess, cbError) => {
	try {
		const res = await axios.put(`${endpoint.qna}/${productQnaId}`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const getAllProvinces = async (cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.region}/province`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const getCityByProvinceId = async (provinceId, cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.region}/city?provinceId=${provinceId}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const getDistrictByCityId = async (cityId, cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.region}/district?cityId=${cityId}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const getSubdistrictByDistrictId = async (districtId, cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.region}/subdistrict?districtId=${districtId}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const shipmentCost = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.shipment}/cost`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const shipmentTracking = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.shipment}/tracking`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const getOrders = async (search, status = '', cbSuccess, cbError, cbFinally = () => {}) => {
	try {
		const res = await axios.get(`${endpoint.order}/orders?status=${status}&search=${search}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	} finally {
		cbFinally()
	}
}
export const getOrderByProduct = async (productId, cbSuccess, cbError, cbFinally = () => {}) => {
	try {
		const res = await axios.get(`${endpoint.order}/by-product/${productId}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	} finally {
		cbFinally()
	}
}
export const getOneOrder = async (orderCode = '', cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.order}/orders/${orderCode}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const myOrder = async (status = '', cbSuccess, cbError) => {
	try {
		const res = await axios.get(`${endpoint.order}/my-order?status=${status}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const detailOrder = async (orderCode, status, cbSuccess, cbError, cbFinally = () => {}) => {
	try {
		const res = await axios.get(`${endpoint.order}/detail/${orderCode}?status=${status}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	} finally {
		cbFinally()
	}
}
export const createOrder = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.order}/create-order`, data)
		if(res.status == 201) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const completeOrder = async (orderCode, cbSuccess, cbError) => {
	try {
		const res = await axios.put(`${endpoint.order}/complete-order/${orderCode}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const cancelOrderAndRefund = async (data, cbSuccess, cbError) => {
	try {
		const res = await axios.put(`${endpoint.order}/cancel-order-and-refund`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const confirmShippingOrder = async (orderCode, data, cbSuccess, cbError) => {
	try {
		const res = await axios.put(`${endpoint.order}/shipping-order/${orderCode}`, data)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const checkTransactionToken = async (orderCode, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.payment}/check-transaction-token`, {
			orderCode: orderCode
		})
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}
export const continuePayment = async (orderCode, cbSuccess, cbError) => {
	try {
		const res = await axios.post(`${endpoint.payment}/continue-payment`, {
			orderCode
		})
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	}
}

export const getDashboardSummary = async (cbSuccess, cbError, cbFinally = () => {}) => {
	try {
		const res = await axios.get(`/api/dashboard`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	} finally {
		cbFinally()
	}
}

export const getLandingPageData = async (cbSuccess, cbError, cbFinally = () => {}) => {
	try {
		const res = await axios.get(`${endpoint.landingPage}`)
		if(res.status == 200) {
			cbSuccess(res)
		}
	} catch(error) {
		console.log(error)
		cbError(error)
	} finally {
		cbFinally()
	}
}





