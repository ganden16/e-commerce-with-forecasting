import {useEffect, useState} from 'react'

import HeaderUser from '@/components/user/header'
import FooterUser from '@/components/user/footer'
import Link from 'next/link'
import AuthMiddleware from '@/components/authMiddleware'
import {useRouter} from 'next/router'
import {detailOrder, shipmentTracking} from '@/lib/fetchApi'
import {formatRupiah, formattedDate} from '@/helper/formater'
import {BanknotesIcon, CheckIcon, HandThumbUpIcon, TruckIcon, UserIcon} from '@heroicons/react/20/solid'

const tracking = [
	{
		"manifest_code": "1",
		"manifest_description": "Manifested",
		"manifest_date": "2015-03-04",
		"manifest_time": "03:41",
		"city_name": "SOLO"
	},
	{
		"manifest_code": "2",
		"manifest_description": "On Transit",
		"manifest_date": "2015-03-04",
		"manifest_time": "15:44",
		"city_name": "JAKARTA"
	},
	{
		"manifest_code": "3",
		"manifest_description": "Received On Destination",
		"manifest_date": "2015-03-05",
		"manifest_time": "08:57",
		"city_name": "PALEMBANG"
	}
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export default function Type2() {
	const [loadingPage, setLoadingPage] = useState(true)
	const router = useRouter()
	const [order, setOrder] = useState(null)
	const [trackingOrder, setTrackingOrder] = useState(null)
	const {orderCode, status} = router.query
	const statusSteps = {
		processing: {
			step: 1,
			date: order?.created_at,
			shipmentDetail: false,
			borderColor: 'border-orange-500',
			textColor: 'text-orange-500',
			bg: 'bg-orange-500',
		},
		shipped: {
			step: 2,
			date: order?.delivery_detail.delivery_date,
			shipmentDetail: true,
			borderColor: 'border-blue-500',
			textColor: 'text-blue-500',
			bg: 'bg-blue-500',
		},
		completed: {
			step: 4,
			date: order?.delivery_detail.received_date,
			shipmentDetail: true,
			borderColor: 'border-green-500',
			textColor: 'text-green-500',
			bg: 'bg-green-500',
		},
	}
	const step = order ? statusSteps[order.status].step : ''
	const stepDate = order ? statusSteps[order.status].date : ''
	const viewShipmentDetail = trackingOrder ? statusSteps[order.status].shipmentDetail : ''
	const borderColor = order ? statusSteps[order.status].borderColor : ''
	const textColor = order ? statusSteps[order.status].textColor : ''
	const bg = order ? statusSteps[order.status].bg : ''

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
			shipmentTracking({
				resi: order.delivery_detail.resi,
				courier: order.delivery_detail.courier,
			}, (res) => {
				setTrackingOrder(res.data)
			}, (err) => {
				setTrackingOrder(tracking)
			})
		}
	}, [order])

	if(loadingPage) {
		return '...Loading'
	}

	return (
		<AuthMiddleware>
			<HeaderUser />
			<div className="bg-gray-50">
				<main className="mx-auto max-w-2xl pb-24 pt-8 sm:px-6 sm:pt-16 lg:max-w-7xl lg:px-8">
					<div className="mb-10 mt-14 md:mt-5 lg:mt-10 w-max">
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
					<div className="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0 mt-16 lg:mt-10">
						<div className="flex sm:items-baseline sm:space-x-4">
							<h1 className={`text-2xl font-bold tracking-tight ${textColor} sm:text-3xl`}>#{order.order_code}</h1>
							<Link href={`/orderan-saya/faktur/${orderCode}`} className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 sm:block">
								lihat faktur
								<span aria-hidden="true"> &rarr;</span>
							</Link>
						</div>
						<p className="text-sm text-gray-600">
							Diorder pada {' '}
							<p className="font-medium text-gray-900">
								{formattedDate(order.created_at)}
							</p>
						</p>
						<a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 sm:hidden">
							lihat faktur
							<span aria-hidden="true"> &rarr;</span>
						</a>
					</div>

					<div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:mt-10">
						{/* Left side - Products */}
						<div className="lg:col-span-7">
							<section aria-labelledby="products-heading" className="mt-5">
								<div className="space-y-4">
									{order.order_details.map((orderDetail) => (
										<div key={orderDetail.id + 'order detail'} className={`border-b ${borderColor} bg-white shadow-sm sm:rounded-lg sm:border`}>
											<div className="px-4 py-6 sm:px-6 lg:p-8">
												<div className="sm:flex">
													<div className="mb-3 aspect-h-1 aspect-w-1 w-full flex-shrink-0 overflow-hidden rounded-lg sm:aspect-none sm:h-40 sm:w-40">
														<img
															alt={orderDetail.product.name}
															src={orderDetail.product.image}
															className="h-full w-full object-cover object-center sm:h-full sm:w-full cursor-pointer"
															onClick={() => router.push('/produk/detail' + orderDetail.product_id)}
														/>
													</div>
													<div className=" sm:ml-6 sm:mt-0">
														<h3 className="text-base font-medium text-gray-900 underline underline-offset-2">
															<Link href={`/produk/${orderDetail.product_id}`}>{orderDetail.product.name}</Link>
														</h3>
														<p className="mt-2 text-sm font-medium text-gray-900">{orderDetail.quantity}x</p>
														<p className="mt-2 text-sm font-medium text-gray-900">{formatRupiah(orderDetail.price)}</p>
														<p className="mt-3 text-sm text-gray-500">{orderDetail.product.description}</p>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</section>
						</div>

						{/* Right side - Delivery Address */}
						<div className="lg:col-span-5 mt-5">
							<div className={`bg-white border ${borderColor} shadow-sm sm:rounded-lg sm:border mb-6`}>
								<div className="px-4 py-6 sm:px-6 lg:p-8">
									<dl className="text-sm mb-5">
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
										<div className='mt-5'>
											<dt className="font-bold text-gray-900">Alamat Pengiriman</dt>
											<dd className="mt-3 text-gray-500">
												<span className="block mb-1">{order.delivery_detail.address}</span>
												<span className="block mb-1">{order.delivery_detail.address_detail}</span>
												<span className="block mb-1">{order.delivery_detail.subdistrict}, {order.delivery_detail.city} - {order.delivery_detail.province}</span>
												<span className="block mb-1">{order.delivery_detail.postal_code}</span>
											</dd>
										</div>

									</dl>
								</div>
							</div>
						</div>
					</div>

					{/* Order Status and Progress */}
					<div className="mt-6">
						<div className={`border-t ${'border-gray-200'} px-4 py-6 sm:px-6 lg:p-8`}>
							<p className={`text-sm font-medium text-gray-900`}>
								{order.status == 'processing' && 'diorded '}
								{order.status == 'shipped' && 'diserahkan kurir '}
								{order.status == 'completed' && 'telah diterima '}
								pada <span>{formattedDate(stepDate)}</span>
							</p>
							<div aria-hidden="true" className="mt-6">
								<div className="overflow-hidden rounded-full bg-gray-200">
									<div
										style={{width: `calc((${step} * 2 + 1) / 8 * 100%)`}}
										className={`h-2 rounded-full ${bg}`}
									/>
								</div>
								<div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
									<div className={`${textColor}`}>Diorder</div>
									<div className={classNames(step > 0 ? textColor : '', 'text-center')}>
										Diproses
									</div>
									<div className={classNames(step > 1 ? textColor : '', 'text-center')}>
										Dikirim
									</div>
									<div className={classNames(step > 3 ? textColor : '', 'text-right')}>
										Diterima
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Billing and Payment Summary */}
					<section aria-labelledby="summary-heading" className="mt-16">
						<div className="bg-gray-100 px-4 py-6 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-5 lg:px-8 lg:py-8">
							<dl className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7">
								{viewShipmentDetail &&
									<div>
										<div className="font-bold text-gray-900 mb-2">Detail Pengiriman</div>
										<div className="font-semibold text-gray-500 text-sm">{order.delivery_detail.resi}</div>
										<div className="font-semibold text-gray-500 text-sm">{order.delivery_detail.courier_name}</div>
										<div className="font-semibold text-gray-500 text-sm mb-5">{order.delivery_detail.courier_description}</div>
										<div className="flow-root">
											<ul role="list" className="-mb-8">
												{tracking.map((event, index) => (
													<li key={event.id + 'tracking'}>
														<div className="relative pb-8">
															{index !== tracking.length - 1 ? (
																<span aria-hidden="true" className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" />
															) : null}
															<div className="relative flex space-x-3">
																<div>
																	<span
																		className={classNames(
																			bg,
																			'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white',
																		)}
																	>
																		<TruckIcon aria-hidden="true" className="h-5 w-5 text-white" />
																	</span>
																</div>
																<div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
																	<div>
																		<p className="text-sm text-gray-500">
																			{event.manifest_description}{' '}
																			<a href={'#'} className="font-semibold text-gray-800">
																				{event.city_name}
																			</a>
																		</p>
																		<p className='text-xs text-gray-500'>
																			{formattedDate(new Date(`${event.manifest_date}T${event.manifest_time}:00`))}
																		</p>
																	</div>

																</div>
															</div>
														</div>
													</li>
												))}
											</ul>
										</div>
									</div>
								}
								<div>
									<dt className="font-semibold text-gray-900">Informasi Pembayaran</dt>
									<dd className="-ml-4 -mt-1 flex flex-wrap">
										<div className="ml-4 mt-4 flex-shrink-0 w-6 h-6">
											<BanknotesIcon />
										</div>
										<div className="ml-4 mt-4">
											<p className="text-gray-900">{order.payment.payment_method}</p>
											<p className="text-gray-600">dibayar pada {formattedDate(order.payment.payment_date)}</p>
										</div>
									</dd>
								</div>
							</dl>

							<dl className="mt-8 divide-y divide-gray-200 text-sm lg:col-span-5 lg:mt-0">
								<div className="flex items-center justify-between pb-4">
									<dt className="text-gray-600">Subtotal</dt>
									<dd className="font-medium text-gray-900">{formatRupiah(order.gross_amount - order.delivery_detail.shipping_cost - 1000)}</dd>
								</div>
								<div className="flex items-center justify-between py-4">
									<dt className="text-gray-600">Ongkir</dt>
									<dd className="font-medium text-gray-900">{formatRupiah(order.delivery_detail.shipping_cost)}</dd>
								</div>
								<div className="flex items-center justify-between py-4">
									<dt className="text-gray-600">Biaya Aplikasi</dt>
									<dd className="font-medium text-gray-900">{formatRupiah(1000)}</dd>
								</div>
								<div className="flex items-center justify-between pt-4">
									<dt className="font-bold text-gray-900">Total</dt>
									<dd className="font-semibold text-gray-900">{formatRupiah(order.gross_amount)}</dd>
								</div>
							</dl>
						</div>
					</section>
				</main>
			</div>
			<FooterUser />
		</AuthMiddleware>
	)
}

