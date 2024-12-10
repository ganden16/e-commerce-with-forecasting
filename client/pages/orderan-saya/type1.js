import AuthMiddleware from "@/components/authMiddleware"
import {SweetAlertConfirm, SweetAlertError, SweetAlertSuccess} from "@/components/sweetAlert"
import FooterUser from "@/components/user/footer"
import HeaderUser from "@/components/user/header"
import MidtransPayment from "@/components/user/snapPay"
import {formatRupiah, formattedDate} from "@/helper/formater"
import {addCartFromBuyAgain, checkTransactionToken, continuePayment, detailOrder, getAllCarts} from "@/lib/fetchApi"
import {setCart} from "@/redux/cartSlice"
import Link from "next/link"
import {useRouter} from "next/router"
import react, {useEffect, useState} from "react"
import {useDispatch} from "react-redux"

export default function Type1() {
	const [loadingPage, setLoadingPage] = useState(true)
	const router = useRouter()
	const [order, setOrder] = useState(null)
	const {orderCode, status} = router.query
	const borderColor = order ? order.status == 'pending' ? 'border-yellow-500' : 'border-red-500' : ''
	const [enableSnap, setEnableSnap] = useState(false)
	const dispatch = useDispatch()

	useEffect(() => {
		if(orderCode) {
			detailOrder(orderCode, status, (res) => {
				setOrder(res.data)
			}, (err) => {
				if(err.response.status == 401) {
					router.push('/orderan-saya')
				}
				if(err.response.status == 404) {
					setOrder(null)
				}
			}, () => {
				setLoadingPage(false)
			})
		}
	}, [orderCode, status])

	useEffect(() => {
		if(order) {
			setTimeout(() => {
				if(window.location.hash == '#buttonPay') {
					const element = document.getElementById('buttonPay')
					if(element) {
						const yOffset = -443
						const yPosition = element.getBoundingClientRect().top + window.scrollY + yOffset
						window.scrollTo({top: yPosition, behavior: 'smooth'})
					}
				}
			}, 500)
		}
	}, [order])

	console.log('window.location.hash', window.location.hash)
	console.log('window.location.hash.condition', window.location.hash == '#buttonPay')
	console.log('element', document.getElementById('buttonPay'))

	// useEffect(() => {
	// 	const scriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'
	// 	// const scriptUrl = 'https://app.midtrans.com/snap/snap.js'
	// 	const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY // Ganti dengan client key Midtrans Anda

	// 	const scriptTag = document.createElement('script')
	// 	scriptTag.src = scriptUrl
	// 	scriptTag.setAttribute('data-client-key', clientKey)
	// 	scriptTag.async = true
	// 	document.body.appendChild(scriptTag)

	// 	return () => {
	// 		document.body.removeChild(scriptTag)
	// 	}
	// }, [])

	const handleClickPay = () => {
		continuePayment(orderCode, (res) => {
			setEnableSnap(true)
		}, (err) => {
			if(err.response.status == 400) {
				SweetAlertError(err.response.data.message)
				router.push(`/orderan-saya/type1?orderCode=${orderCode}&status=cancelled`)
			} else {
				router.push(`/orderan-saya`).then(() => {
					router.reload()
				})
			}
		})
	}
	const handleClickBuyAgain = (cart) => {
		SweetAlertConfirm('Anda akan menambahkan order ini ke keranjang belanja', '', () => {
			addCartFromBuyAgain({
				cartItems: cart
			}, (res) => {
				getAllCarts((res) => {
					dispatch(setCart(res.data))
				}, (err) => {})
				SweetAlertSuccess(res.data.message)
				router.push('/keranjang')
			}, (err) => {})
		})
	}

	if(loadingPage) {
		return '...Loading'
	}

	return (
		<AuthMiddleware>
			<HeaderUser />
			<main className="bg-white px-4 pb-24 pt-16 sm:pt-24 lg:px-8 lg:py-32">
				{/* Tombol Kembali ke Order History */}
				<div className="mb-10 mt-10 lg:mt-0 w-max">
					<Link
						href={`/orderan-saya?status=${status}#${orderCode}`}
						className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							className="mr-2 h-5 w-5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Kembali ke Orderan Saya
					</Link>
				</div>
				{order &&
					<div className="mx-auto max-w-3xl">
						<div className="max-w-xl">
							{order.status == 'cancelled' &&
								<>
									<p className="mt-2 text-4xl text-red-500 font-bold tracking-tight">Orderan Dibatalkan!</p>
									<p className="mt-5 text-base text-gray-500">orderan kamu dengan nomor pesanan {order.order_code} telah dibatalkan sistem</p>
									<p className="mt-2 text-sm text-gray-400 font-semibold tracking-tight">dibatalkan pada {formattedDate(order.updated_at)}</p>
								</>
							}
							{order.status == 'pending' &&
								<>
									<p className="mt-2 text-4xl text-yellow-500 font-bold tracking-tight">Menunggu Pembayaran!</p>
									<p className="mt-5 text-sm text-gray-500">segera lakukan pembayaran agar orderan kamu bisa diproses</p>
									{/* Button for Continuing Payment */}

								</>
							}
						</div>

						<section aria-labelledby="order-heading" className={`mt-10 border-t ${borderColor}`}>
							{order.order_details.map((orderDetail) => (
								<div key={orderDetail.id + 'orderDetail'} className={`flex space-x-6 border-b ${borderColor} py-10`}>
									<img
										alt={orderDetail.product.name}
										src={orderDetail.product.image}
										className="h-20 w-20 flex-none rounded-lg bg-gray-100 object-cover object-center sm:h-40 sm:w-40"
									/>
									<div className="flex flex-auto flex-col">
										<div>
											<h4 className="font-medium text-gray-900 underline-offset-2 underline">
												<Link href={`/produk/detail/${orderDetail.product.id}`}>{orderDetail.product.name}</Link>
											</h4>
											<p className="mt-2 text-sm text-gray-600">{orderDetail.product.description}</p>
										</div>
										<div className="mt-6 flex flex-1 items-end">
											<dl className="flex space-x-4 divide-x divide-gray-200 text-sm sm:space-x-6">
												<div className="flex">
													<dt className="font-medium text-gray-900">jumlah :</dt>
													<dd className="ml-2 text-gray-700">{orderDetail.quantity}</dd>
												</div>
												<div className="flex pl-4 sm:pl-6">
													<dt className="font-medium text-gray-900">harga :</dt>
													<dd className="ml-2 text-gray-700">{formatRupiah(orderDetail.price)}</dd>
												</div>
											</dl>
										</div>
									</div>
								</div>
							))}

							<div className="sm:ml-40 sm:pl-6">
								<dl className="grid grid-cols-2 gap-x-6 py-10 text-sm">
									<div>
										<dt className="font-bold text-gray-900">Informasi Pembeli</dt>
										<dd className="mt-2 text-gray-700">
											<address className="not-italic">
												<span className="block mb-1">{order.buyer.name}</span>
												<span className="block mb-1">{order.buyer.whatsaap} (wa)</span>
												<span className="block mb-1">{order.buyer.telephone} (telp)</span>
												<span className="block mb-1">{order.buyer.email}</span>
											</address>
										</dd>
									</div>
									<div>
										<dt className="font-bold text-gray-900">Alamat Pengiriman</dt>
										<dd className="mt-2 text-gray-700">
											<address className="not-italic">
												<span className="block">{order.delivery_detail.address}</span>
												<span className="block">{order.delivery_detail.address_detail}</span>
												<span className="block">{order.delivery_detail.subdistrict}, {order.delivery_detail.city} - {order.delivery_detail.province}</span>
												<span className="block">{order.delivery_detail.postal_code}</span>
											</address>
										</dd>
									</div>
								</dl>

								<dl className={`grid grid-cols-2 gap-x-6 border-t ${borderColor} py-10 text-sm`}>
									<div>
										<dt className="font-bold text-gray-900">Metode Pembayaran</dt>
										<dd className="mt-2 text-gray-700">
											<p>{order.payment.payment_method}</p>
										</dd>
									</div>
									<div>
										<dt className="font-bold text-gray-900">Kurir Pengiriman</dt>
										<dd className="mt-2 text-gray-700">
											<p>{order.delivery_detail.courier}</p>
										</dd>
									</div>
								</dl>

								<dl className={`space-y-6 border-t ${borderColor} pt-10 text-sm`}>
									<div className="flex justify-between">
										<dt className="font-medium text-gray-900">Subtotal</dt>
										<dd className="text-gray-700">{formatRupiah(order.gross_amount - order.delivery_detail.shipping_cost - 1000)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="flex font-medium text-gray-900">
											Biaya Aplikasi
										</dt>
										<dd className="text-gray-700">{formatRupiah(1000)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="font-medium text-gray-900">Ongkir</dt>
										<dd className="text-gray-700">{formatRupiah(order.delivery_detail.shipping_cost)}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="font-bold text-gray-900">Total</dt>
										<dd className="text-gray-900 font-semibold">{formatRupiah(order.gross_amount)}</dd>
									</div>
								</dl>
							</div>
						</section>
						{status == 'pending' &&
							<div className="mt-10 flex justify-end">
								<button
									id="buttonPay"
									className="w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
									onClick={() => handleClickPay()}
								>
									Lanjutkan Pembayaran
								</button>
							</div>
						}
						{status == 'cancelled' &&
							<div className="mt-10 flex justify-end">
								<button
									className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
									onClick={() => handleClickBuyAgain(order.order_details)}
								>
									Beli lagi
								</button>
							</div>
						}
					</div>
				}

				{!order &&
					<h1 className="text-center">Orderan Tidak Ditemukan</h1>
				}
			</main>
			{enableSnap &&
				// window.snap.pay(order.payment.snap_token, {
				// 	onSuccess: (result) => {
				// 		console.log('Payment Success:', result)
				// 		window.location.href = `/notifikasi-order?status=processing&order_code=${result.order_id}`
				// 		// router.push(`/notifikasi-order?status=processing&order_code=${result.order_id}`).then(() => {
				// 		// 	router.reload()
				// 		// })
				// 	},
				// 	onPending: (result) => {
				// 		console.log('Payment Pending:', result)
				// 		window.location.href = `/orderan-saya/type1?orderCode=${result.order_id}&status=pending`
				// 		// router.push(`/orderan-saya/type1?orderCode=${result.order_id}&status=pending`).then(() => {
				// 		// 	router.reload()
				// 		// })
				// 	},
				// 	onError: (result) => {
				// 		console.log('Payment Error:', result)
				// 		window.location.href = `/notifikasi-order?status=cancelled&order_code=${result.order_id}`
				// 		// router.push(`/notifikasi-order?status=cancelled&order_code=${result.order_id}`).then(() => {
				// 		// 	router.reload()
				// 		// })
				// 	},
				// 	onClose: () => {
				// 		console.log('Payment popup closed without completing the payment')
				// 		window.location.href = `/orderan-saya/type1?orderCode=${orderCode}&status=pending`
				// 		// router.push(`/orderan-saya/type1?orderCode=${orderCode}&status=pending`).then(() => {
				// 		// 	router.reload()
				// 		// })
				// 	}
				// })
				<MidtransPayment transactionToken={order.payment.snap_token} orderCode={orderCode} />
			}
			<FooterUser />
		</AuthMiddleware >
	)
}
