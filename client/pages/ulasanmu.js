import AuthMiddleware from '@/components/authMiddleware'
import {SweetAlertError, sweetAlertSubmitData, SweetAlertSuccess} from '@/components/sweetAlert'
import HeaderUser from '@/components/user/header'
import {formattedDate} from '@/helper/formater'
import {addReviews, detailOrder, getReviewsByOrder} from '@/lib/fetchApi'
import {useRouter} from 'next/router'
import {useEffect, useState} from 'react'

export default function StarRatingReview() {
	const router = useRouter()
	const [loadingPage, setLoadingPage] = useState(true)
	const [orderWillReview, setOrderWillReview] = useState()
	const [reviews, setReviews] = useState([])
	const [hover, setHover] = useState([])
	const [errors, setErrors] = useState({})
	const [readOnly, setReadOnly] = useState(false)

	const handleRatingChange = (index, star) => {
		const updatedReviews = [...reviews]
		updatedReviews[index].stars = star
		setReviews(updatedReviews)
	}

	const handleReviewChange = (index, value) => {
		const updatedReviews = [...reviews]
		updatedReviews[index].review = value
		setReviews(updatedReviews)
	}

	const handleMouseEnter = (index, star) => {
		const updatedHover = [...hover]
		updatedHover[index] = star
		setHover(updatedHover)
	}

	const handleMouseLeave = (index) => {
		const updatedHover = [...hover]
		updatedHover[index] = 0
		setHover(updatedHover)
	}

	const handleSubmit = () => {
		sweetAlertSubmitData(() => {
			addReviews({
				orderCode: orderWillReview.order_code,
				reviews,
			}, (res) => {
				SweetAlertSuccess(res.data.message)
				router.push('/orderan-saya')
			}, (err) => {
				setErrors(err.response.data.errors || {})
			})
		})
	}

	useEffect(() => {
		detailOrder(router.query.order_code, 'completed', (res) => {
			const uniqueOrderDetails = res.data.order_details.filter((detail, index, self) =>
				index === self.findIndex((d) => d.product_id === detail.product_id)
			)

			setOrderWillReview({
				...res.data,
				order_details: uniqueOrderDetails
			})

			if(res.data.review_status == null) {
				setReviews(uniqueOrderDetails.map((detail) => ({
					product_id: detail.product_id,
					stars: 0,
					review: ''
				})))
			} else {
				getReviewsByOrder(router.query.order_code, (res) => {
					setReviews(res.data)
				}, (err) => {})
				if(res.data.review_status == 'edited') {
					setReadOnly(true)
				}
			}

			setHover(uniqueOrderDetails.map(() => 0))
		}, (err) => {
			if(err.response.status == 404) {
				SweetAlertError('Orderan tidak ditemukan atau belum siap direview')
				return router.push('/orderan-saya')
			}
		}, () => {
			setLoadingPage(false)
		})
	}, [router])

	if(loadingPage) return '...Loading'

	if(!orderWillReview) return

	return (
		<AuthMiddleware>
			<HeaderUser />
			<div className="max-w-lg mx-auto p-4">
				<div className="bg-white shadow-md rounded-lg p-6 mt-20">
					{/* Header with avatar */}
					<div className="flex items-center mb-6">
						<img
							src={orderWillReview.buyer.image ?? '/faycook/images/avatar-polos.webp'}
							alt="avatar"
							className="h-12 w-12 rounded-full border border-gray-300"
						/>
						<div className="ml-4">
							<h3 className="text-lg font-medium text-gray-900">Berikan ulasan terbaikmu yaa.. :)</h3>
							<p className="text-sm text-gray-500">{orderWillReview.order_code}</p>

						</div>
					</div>

					{orderWillReview.order_details.map((orderDetail, index) => (
						<div key={orderDetail.product_id} className="border-b mb-6">
							{/* Order information */}
							<div className="mb-2 text-left">
								<p className="text-sm font-medium text-gray-700">{index + 1}. {orderDetail.product_name}</p>
								<p className="text-sm font-medium text-gray-700">produk id: {orderDetail.product.id}</p>
							</div>

							{/* Star rating input */}
							<div className="flex items-center mb-4">
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										type="button"
										className={`focus:outline-none ${readOnly ? 'cursor-not-allowed' : ''}`}
										onClick={() => handleRatingChange(index, star)}
										onMouseEnter={() => handleMouseEnter(index, star)}
										onMouseLeave={() => handleMouseLeave(index)}
										disabled={readOnly}
									>
										<svg
											aria-hidden="true"
											className={`h-8 w-8 transition-colors duration-200 ${(hover[index] || reviews[index]?.stars) >= star ? 'text-yellow-500' : 'text-gray-300'}`}
											fill="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M12 .587l3.668 7.425 8.2 1.192-5.934 5.788 1.4 8.167L12 18.897l-7.334 3.862 1.4-8.167L.132 9.204l8.2-1.192L12 .587z" />
										</svg>
									</button>
								))}
								{errors[`reviews.${index}.stars`] && (
									<p className="pl-2 mt-1 text-sm text-red-500">{errors[`reviews.${index}.stars`]}</p>
								)}
							</div>

							{/* Review input */}
							<div className="mb-4">
								<label htmlFor={`review-${index}`} className="block text-sm font-medium text-gray-700">
									Ulasanmu
								</label>
								<textarea
									id={`review-${index}`}
									name={`review-${index}`}
									rows="5"
									className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${readOnly ? 'cursor-not-allowed' : ''}`}
									placeholder="Berikan tanggapanmu..."
									value={reviews[index]?.review || ''}
									defaultValue={reviews[index]?.review || ''}
									onChange={(e) => handleReviewChange(index, e.target.value)}
									disabled={readOnly}
								></textarea>
								{errors[`reviews.${index}.review`] && (
									<p className="mt-1 text-sm text-red-500">{errors[`reviews.${index}.review`]}</p>
								)}
							</div>
							{reviews[index]?.reply &&
								<div className="mb-4">
									<div className="flex items-start p-3 bg-gray-50 rounded-lg mt-3">
										<img
											src={reviews[index].reply_by.image}
											alt={reviews[index].reply_by.username}
											className="h-8 w-8 rounded-full mr-3"
										/>
										<div>
											<p className="text-gray-900 font-bold">{reviews[index].reply_by.username}</p>
											<p className="text-gray-500 text-xs mt-1">{formattedDate(reviews[index].time_reply)}</p>
											<p className="prose prose-sm max-w-none text-gray-500 mt-1">{reviews[index].reply}</p>
										</div>
									</div>
								</div>
							}
						</div>
					))}
					<p className="text-sm text-gray-400 font-semibold">Diorder pada {formattedDate(orderWillReview.created_at)}</p>
					<p className="text-sm text-gray-400 font-semibold">Diterima pada {formattedDate(orderWillReview.delivery_detail.received_date)}</p>
					{/* Submit button */}
					<div className='mt-5'>
						<button
							type="button"
							className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${readOnly ? 'cursor-not-allowed' : ''}`}
							onClick={handleSubmit}
							disabled={readOnly}
						>
							{readOnly ? 'Anda Sudah Melakukan Review' : 'Submit Review'}
						</button>
					</div>
				</div>
			</div>
		</AuthMiddleware>
	)
}
