import React, {useEffect, useState} from 'react'
import {BanknotesIcon, CheckCircleIcon, ChevronDoubleDownIcon, ChevronDoubleUpIcon, ChevronDownIcon, ChevronUpIcon, GiftIcon, TruckIcon, XMarkIcon} from '@heroicons/react/20/solid'
import HeaderUser from '@/components/user/header'
import FooterUser from '@/components/user/footer'
import AuthMiddleware from '@/components/authMiddleware'
import {addCartFromBuyAgain, completeOrder, getAllCarts, myOrder} from '@/lib/fetchApi'
import {formatRupiah, formattedDate} from '@/helper/formater'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {SweetAlertConfirm, SweetAlertSuccess} from '@/components/sweetAlert'
import {useDispatch, useSelector} from 'react-redux'
import {setCart} from '@/redux/cartSlice'

const tabs = [
	{name: 'Semua', status: 'all'},
	{name: 'Belum Bayar', status: 'pending'},
	{name: 'Diproses', status: 'processing'},
	{name: 'Dikirim', status: 'shipped'},
	{name: 'Diterima', status: 'completed'},
	{name: 'Dibatalkan', status: 'cancelled'},
]
const statusSteps = {
	all: {
		borderColor: 'border-gray-300',
		textColor: 'text-gray-500',
		bg: 'bg-gray-500',
		hoverBg: 'hover:bg-gray-700',
		hoverTextColor: 'hover:text-gray-700',
	},
	pending: {
		borderColor: 'border-yellow-300',
		textColor: 'text-yellow-500',
		bg: 'bg-yellow-500',
		hoverBg: 'hover:bg-yellow-700',
		hoverTextColor: 'hover:text-yellow-700',
	},
	processing: {
		borderColor: 'border-orange-300',
		textColor: 'text-orange-500',
		bg: 'bg-orange-500',
		hoverBg: 'hover:bg-orange-700',
		hoverTextColor: 'hover:text-orange-700',
	},
	shipped: {
		borderColor: 'border-blue-300',
		textColor: 'text-blue-500',
		bg: 'bg-blue-500',
		hoverBg: 'hover:bg-blue-700',
		hoverTextColor: 'hover:text-blue-700',
	},
	completed: {
		borderColor: 'border-green-300',
		textColor: 'text-green-500',
		bg: 'bg-green-500',
		hoverBg: 'hover:bg-green-700',
		hoverTextColor: 'hover:text-green-700',
	},
	cancelled: {
		borderColor: 'border-red-300',
		textColor: 'text-red-500',
		bg: 'bg-red-500',
		hoverBg: 'hover:bg-red-700',
		hoverTextColor: 'hover:text-red-700',
	},
}

export default function OrderHistory() {
	const router = useRouter()
	const [orders, setOrders] = useState(null)
	const [expandedOrderId, setExpandedOrderId] = useState(null)
	const [toggleAllPrice, setToggleAllPrice] = useState(null)
	let {status} = router.query
	const dispatch = useDispatch()

	const fetchOrder = () => {
		let statusQuery = status == 'all' || !status ? '' : status
		myOrder(statusQuery,
			(res) => {
				setOrders(res.data)
			},
			(err) => {}
		)
	}

	const handleClickBeliLagi = (cart) => {
		SweetAlertConfirm('Anda akan menambahkan order ini ke keranjang belanja', '', () => {
			addCartFromBuyAgain({
				cartItems: cart
			}, (res) => {
				getAllCarts((res) => {
					dispatch(setCart(res.data))
				}, (err) => {})
				SweetAlertSuccess(res.data.message)
				fetchOrder()
				router.push('/keranjang')
			}, (err) => {})
		})
	}

	const handleClickCompleteOrder = (orderCode) => {
		SweetAlertConfirm('Apakah pesanan sudah sampai?', '', () => {
			completeOrder(orderCode, (res) => {
				SweetAlertSuccess(res.data.message)
				router.push('/orderan-saya?status=completed')
			}, (err) => {})
		})
	}

	const handleTabClick = (status) => {
		router.push({
			pathname: '/orderan-saya',
			query: {status},
		})
	}


	useEffect(() => {
		fetchOrder()
	}, [status])

	useEffect(() => {
		if(orders) {
			setTimeout(() => {
				if(window.location.hash) {
					const orderCode = window.location.hash.substring(1)
					const element = document.getElementById(orderCode)
					if(element) {
						const yOffset = -150
						const yPosition = element.getBoundingClientRect().top + window.scrollY + yOffset
						window.scrollTo({top: yPosition, behavior: 'smooth'})
					}
				}
			}, 500)
		}
	}, [orders])

	if(status == undefined) status = 'all'

	return (
		<AuthMiddleware>
			<HeaderUser />
			<div className="bg-gray-50 min-h-screen">
				<main className="py-12">
					<div className="mx-auto max-w-7xl sm:px-4 lg:px-8">
						<div className="mx-auto max-w-2xl px-4 lg:max-w-4xl lg:px-0 mt-20">
							<h1 className="text-3xl font-semibold text-gray-800">Orderan Saya</h1>
							<p className="mt-2 text-gray-500">Kelola dan cek status orderanmu</p>
							<div className="mt-6 border-b border-gray-200">
								<nav className="flex space-x-8" aria-label="Tabs">
									{tabs.map((tab) => (
										<button
											key={tab.name}
											onClick={() => handleTabClick(tab.status)}
											className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${status === tab.status
												? `${statusSteps[status].borderColor} ${statusSteps[status].textColor}`
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
												}`}
										>
											{tab.name}
										</button>
									))}
								</nav>
							</div>
						</div>
					</div>

					<section className="mt-12">
						<div className="mx-auto max-w-7xl sm:px-4 lg:px-8">
							<div className="mx-auto max-w-2xl space-y-6 lg:max-w-4xl">
								{orders?.map((order, index) => (
									<div
										key={index}
										className={`rounded-lg border ${statusSteps[order.status].borderColor} bg-white shadow-sm overflow-hidden`}
									>
										<div className="px-6 py-4 flex justify-between">
											<div>
												<h3 id={order.order_code} className="text-lg font-semibold text-gray-800">#{order.order_code}</h3>
												<p className="text-sm text-gray-500 mt-2">Diorder pada: {formattedDate(order.created_at)}</p>
												<button onClick={() => setToggleAllPrice(toggleAllPrice == order.id ? null : order.id)} className="text-sm text-black font-semibold mt-5 flex">
													<span>Total: {formatRupiah(order.gross_amount)}</span>
													{toggleAllPrice == order.id ?
														<ChevronUpIcon className='w-6 h-6 text-center' /> :
														<ChevronDownIcon className='w-6 h-6 text-center' />
													}
												</button>
											</div>
											<div className="">
												<Link href={
													['processing', 'shipped', 'completed'].includes(order.status) ? `/orderan-saya/type2?orderCode=${order.order_code}&status=${order.status}` :
														order.status == 'pending' ? `/orderan-saya/type1?orderCode=${order.order_code}&status=${order.status}` :
															order.status == 'cancelled' ? `/orderan-saya/type1?orderCode=${order.order_code}&status=${order.status}` : '#'

												}
													className={`${statusSteps[order.status].textColor} underline underline-offset-1 rounded-md text-sm font-medium ${statusSteps[order.status].hoverTextColor} `}>Detail Order</Link>
												{/* {['processing', 'shipped', 'completed'].includes(order.status) && (
													<a href="#" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium border">
														Faktur
													</a>
												)} */}

											</div>
										</div>
										{
											toggleAllPrice == order.id &&
											<div className="px-6 py-4 border-t border-gray-200">
												<p className="text-sm text-gray-500">Sub Total: {formatRupiah(order.gross_amount - order.delivery_detail.shipping_cost - 1000)}</p>
												<p className="text-sm text-gray-500">Ongkir: {formatRupiah(order.delivery_detail.shipping_cost)}</p>
												<p className="text-sm text-gray-500">Biaya Aplikasi: {formatRupiah(1000)}</p>
											</div>
										}
										<div className="px-6 py-4 border-t border-gray-200">
											<div className="flex items-center justify-between text-sm">
												{order.status === 'cancelled' && (
													<div className="flex items-center text-red-500">
														<XMarkIcon className="h-5 w-5 mr-1" />
														<span className='text-sm'>Orderan Dibatalkan</span>
													</div>
												)}
												{order.status === 'completed' && (
													<div className="flex items-center text-green-500">
														<CheckCircleIcon className="h-5 w-5 mr-1" />
														<span>Diterima</span>
													</div>
												)}
												{order.status === 'processing' && (
													<div className="flex items-center text-orange-500">
														<GiftIcon className="h-5 w-5 mr-1" />
														<span>Sedang Diproses</span>
													</div>
												)}
												{order.status === 'pending' && (
													<div className="flex items-center text-yellow-500">
														<BanknotesIcon className="h-5 w-5 mr-1" />
														<span>Belum Dibayar</span>
													</div>
												)}
												{order.status === 'shipped' && (
													<div className="flex items-center text-blue-500">
														<TruckIcon className="h-5 w-5 mr-1" />
														<span>Dikirim</span>
													</div>
												)}
												<div className='flex justify-end gap-x-4'>
													{order.status == 'pending' &&
														<Link href={`/orderan-saya/type1?orderCode=${order.order_code}&status=pending#buttonPay`} className="text-yellow-500 px-4 py-2 rounded-md text-sm font-medium border hover:text-yellow-700 ">Lanjut Bayar</Link>
													}
													{order.status == 'shipped' &&
														<a onClick={() => handleClickCompleteOrder(order.order_code)} href="#" className="text-blue-500 px-4 py-2 rounded-md text-sm font-medium border hover:text-blue-700 ">Selesaikan Pesanan</a>
													}
													{order.status == 'completed' &&
														<>
															<a onClick={() => handleClickBeliLagi(order.order_details)} href="#" className="text-green-500 px-4 py-2 rounded-md text-xs font-medium hover:text-green-700 ">Beli Lagi</a>

															{order.review_status == null &&
																<Link href={`/ulasanmu?order_code=${order.order_code}`} className="text-green-500 px-4 py-2 rounded-md text-xs font-medium border hover:text-green-700 ">Beri Ulasan</Link>
															}
															{order.review_status == 'reviewed' &&
																<Link href={`/ulasanmu?order_code=${order.order_code}`} className="text-green-500 px-4 py-2 rounded-md text-xs font-medium hover:text-green-700 ">Edit Ulasan</Link>
															}
															{order.review_status == 'edited' &&
																<Link href={`/ulasanmu?order_code=${order.order_code}`} className="text-green-500 px-4 py-2 rounded-md text-xs font-medium hover:text-green-700 ">Lihat Ulasan</Link>
															}
														</>
													}
													{order.status == 'cancelled' &&
														<a onClick={() => handleClickBeliLagi(order.order_details)} href="#" className="text-red-500 px-4 py-2 rounded-md text-xs font-medium border hover:text-red-700 ">Beli Lagi</a>
													}
													<button onClick={() => setExpandedOrderId(expandedOrderId == order.id ? null : order.id)} className={`${statusSteps[order.status].textColor} ${statusSteps[order.status].hoverTextColor} text-xs flex items-center`}>
														{expandedOrderId === order.id ? (
															<>
																<ChevronDoubleUpIcon className="h-5 w-5 mr-1" />
																Tutup
															</>
														) : (
															<>
																<ChevronDoubleDownIcon className="h-5 w-5 mr-1" />
																Rincian
															</>
														)}
													</button>
												</div>
											</div>
										</div>

										{expandedOrderId === order.id && (
											<div className="px-6 py-4 border-t border-gray-200 bg-white">
												<ul className="divide-y divide-gray-200">
													{order?.order_details?.map((detail, index) => (
														<li key={index} className="py-4 flex items-start">
															<div className="h-20 w-20 bg-gray-200 rounded-md overflow-hidden">
																<img
																	src={detail.product.image}
																	alt={detail.product_name}
																	className="h-full w-full object-cover"
																/>
															</div>
															<div className="ml-4 flex-1">
																<h5 className="text-sm font-semibold text-gray-800">{detail.product_name}</h5>
																<p className="text-sm text-gray-600">{detail.quantity}x</p>
																<p className="text-sm text-gray-700">{formatRupiah(detail.price)}</p>
																<Link href={`/produk/detail/${detail.product_id}`} className="text-indigo-600 hover:text-indigo-500 text-sm mt-1 inline-block">Lihat produk</Link>
															</div>
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</section>
				</main>
			</div>
			<FooterUser />
		</AuthMiddleware >
	)
}
