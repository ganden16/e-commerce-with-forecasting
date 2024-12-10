'use client'

import {Fragment, useEffect, useState} from 'react'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react'
import {Dialog} from '@/components/catalyst/dialog'
import {
	ArrowDownCircleIcon,
	ArrowPathIcon,
	ArrowUpCircleIcon,
	EllipsisHorizontalIcon,
	GiftIcon,
	StarIcon,
	TruckIcon,
	XMarkIcon,
} from '@heroicons/react/20/solid'
import Sidebar from '@/components/admin/sidebar'
import {getDashboardSummary, getSubdistrict} from '@/lib/fetchApi'
import {SweetAlertError} from '@/components/sweetAlert'
import {formatRupiah, formattedDate} from '@/helper/formater'
import Link from 'next/link'
import {useRouter} from 'next/router'
// import ReviewMultiColumn from '@/components/review/multiColumn'


const secondaryNavigation = [
	{name: '30 Hari Terakhir', href: '#', current: true},
	{name: 'Semua', href: '#', current: false},
]
const stats = [
	{name: 'Pendapatan', value: 'Rp405.091', change: '7 hari', changeType: 'negative'},
	{name: 'Produk Terjual', value: '23', change: '7 hari', changeType: 'negative'},
	{name: 'Pendapatan', value: 'Rp245.988', change: '30 hari', changeType: 'positive'},
	{name: 'Produk Terjual', value: '147', change: '30 hari', changeType: 'positive'},
]

const statuses = {
	processing: 'text-yellow-500 bg-green-50 ring-green-500/20',
	shipped: 'text-indigo-500 bg-gray-50 ring-gray-500/10',
}

const clients = [
	{
		id: 1,
		name: 'Tuple',
		imageUrl: 'https://tailwindui.com/img/logos/48x48/tuple.svg',
		lastInvoice: {date: 'December 13, 2022', dateTime: '2022-12-13', amount: '$2,000.00', status: 'Overdue'},
	},
	{
		id: 2,
		name: 'SavvyCal',
		imageUrl: 'https://tailwindui.com/img/logos/48x48/savvycal.svg',
		lastInvoice: {date: 'January 22, 2023', dateTime: '2023-01-22', amount: '$14,000.00', status: 'Paid'},
	},
	{
		id: 3,
		name: 'Reform',
		imageUrl: 'https://tailwindui.com/img/logos/48x48/reform.svg',
		lastInvoice: {date: 'January 23, 2023', dateTime: '2023-01-23', amount: '$7,600.00', status: 'Paid'},
	},
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
	const [isOpenDialogDetailUser, setIsOpenDialogDetailUser] = useState(false)
	const [detailUser, setDetailUser] = useState({})
	const [regionDetailUser, setRegionDetailUser] = useState(null)
	const router = useRouter()
	const [loadingPage, setLoadingPage] = useState(true)
	const [data, setData] = useState(null)

	useEffect(() => {
		getDashboardSummary((res) => {
			setData(res.data)
		}, (err) => {
			SweetAlertError('Terjadi Kesalahan Server')
		}, () => {
			setLoadingPage(false)
		})
	}, [])

	useEffect(() => {
		getSubdistrict('', detailUser.subdistrict_id, (res) => {
			setRegionDetailUser(res.data)
		}, (err) => {})
	}, [detailUser])

	if(loadingPage) return '...Loading'

	console.log('data', data)

	return (
		<>
			<Sidebar headingPage="Dashboard">
				<main>
					<div className="relative isolate overflow-hidden">

						{/* <header className="pb-4 pt-6 sm:pb-6">
							<div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
								<h1 className="text-base font-semibold leading-7 text-gray-900">Penjualan</h1>
								<div className="order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-gray-200 sm:pl-6 sm:leading-7">
									{secondaryNavigation.map((item) => (
										<a key={item.name} href={item.href} className={item.current ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-700'}>
											{item.name}
										</a>
									))}
								</div>
							</div>
						</header> */}

						{/* Stats */}
						<div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
							<dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
								{data.statistic.map((stat, i) => (
									<div
										key={i + 'statistic'}
										className={classNames(
											i % 2 === 1 ? 'sm:border-l' : i === 2 ? 'lg:border-l' : '',
											'flex flex-col items-center justify-center border-t border-gray-300 px-4 py-6 sm:px-6 lg:border-t-0 xl:px-8'
										)}
									>
										<dt className="text-sm font-semibold text-gray-600">{stat.name}</dt>
										<dd className="text-2xl font-semibold text-gray-900 mt-2">
											{i < 2 ? formatRupiah(stat.value) : stat.value}
										</dd>
									</div>
								))}
							</dl>
						</div>

						<div
							aria-hidden="true"
							className="absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50"
						>
							<div
								style={{
									clipPath:
										'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
								}}
								className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
							/>
						</div>
					</div>

					<div className="space-y-16 py-16 xl:space-y-20">

						{/* Recent orders */}
						<div>
							<div className="flex items-center justify-between">
								<h2 className="text-base font-semibold leading-7 text-gray-900">Orderan Terbaru</h2>
								<Link href="/admin/order" className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
									lihat semua order
								</Link>
							</div>
							<div className="bg-neutral-50 shadow-md rounded-lg mt-4">
								<div className="p-3 border-x last:border-b-0">
									<div className="space-y-5">
										{data.recent_orders?.map((order, i) => (
											<div
												onClick={() => router.push(`/admin/order/${order.order_code}`)}
												key={i + 'processingOrder'}
												className="p-4 rounded-lg border-y border-gray-200 shadow-sm cursor-pointer transition duration-200 transform hover:shadow-lg hover:scale-102 hover:bg-gray-50"
											>
												<div className="flex flex-col space-y-1">
													{/* Nomor Order */}
													<div className="flex justify-between items-center">
														<span className="text-xs text-gray-500 font-medium">Order #{order.order_code}</span>
														<span
															className={classNames(
																statuses[order.status],
																'px-2 py-0.5 rounded-full text-xs font-medium'
															)}
														>
															{order.status == 'processing' && 'Diproses'}
															{order.status == 'shipped' && 'Dikirim'}
															{order.status == 'cancelled' && 'Dibatalkan'}
														</span>
													</div>
													{/* Detail Pemesan */}
													<div className="flex items-start mt-2 py-5">
														<div className="text-lg text-gray-500 mr-3">
															{order.status == 'processing' && <GiftIcon className="h-5 w-5 mr-1 text-yellow-500" />}
															{order.status == 'shipped' && <TruckIcon className="h-5 w-5 mr-1 text-indigo-500" />}
															{order.status == 'cancelled' && <XMarkIcon className="h-5 w-5 mr-1 text-red-500" />}
														</div>
														<div>
															<p className="text-sm font-semibold text-gray-800">{order.name}</p>
															<p className="text-xs text-gray-500">WA: {order.whatsaap}</p>
															<p className="text-xs text-gray-500">Email: {order.email}</p>
														</div>
													</div>
													{/* Total dan Link Detail */}
													<div className="flex justify-between items-center mt-3">
														<div>
															<p className="text-sm font-semibold text-gray-800">Total Dibayar: {formatRupiah(order.gross_amount)}</p>
															<p className="text-xs text-gray-400">
																omzet: {formatRupiah(order.gross_amount - order.delivery_detail.shipping_cost - 1000)}
															</p>
														</div>
														<Link
															href={`/admin/order/${order.order_code}`}
															className="text-xs font-medium text-indigo-600 underline"
														>
															Lihat Detail
														</Link>
													</div>
												</div>
											</div>
										))}

									</div>
								</div>
							</div>
						</div>

						{/* Recent client list*/}
						<div>
							<div className="flex items-center justify-between">
								<h2 className="text-base font-semibold leading-7 text-gray-900">Pengguna Baru</h2>
								<Link href="/admin/akun/user/list" className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
									lihat semua pengguna<span className="sr-only">, clients</span>
								</Link>
							</div>
							<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
								<div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">

									<ul role="list" className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
										{data.recent_users.map((client) => (
											<li key={client.id} className="overflow-hidden rounded-xl bg-neutral-50 border border-gray-200">
												<div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
													<img
														alt={client.username}
														src={client.image ? client.image : '/faycook/images/avatar-polos.webp'}
														className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
													/>
													<div className="text-sm font-medium leading-6 text-gray-900">{client.name}</div>
													<Menu as="div" className="relative ml-auto">
														<MenuButton className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
															<span className="sr-only">Open options</span>
															<EllipsisHorizontalIcon aria-hidden="true" className="h-5 w-5" />
														</MenuButton>
														<MenuItems
															transition
															className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
														>
															<MenuItem>
																<p
																	className="cursor-pointer block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
																	onClick={() => {
																		setDetailUser(client)
																		setRegionDetailUser(null)
																		setIsOpenDialogDetailUser(true)
																	}}
																>
																	Lihat
																</p>
															</MenuItem>
															{/* <MenuItem>
																<a
																	href="#"
																	className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
																>
																	Blokir<span className="sr-only">, {client.name}</span>
																</a>
															</MenuItem> */}
														</MenuItems>
													</Menu>
												</div>
												<dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
													<div className="flex justify-between gap-x-4 py-3">
														<dt className="text-gray-500">Bergabung Pada</dt>
														<dd className="text-gray-700">
															<p>{formattedDate(client.created_at)}</p>
														</dd>
													</div>
												</dl>
											</li>
										))}
									</ul>
								</div>
							</div>
							<Dialog open={isOpenDialogDetailUser} onClose={() => setIsOpenDialogDetailUser(false)} className={"relative top-5 transform overflow-auto rounded-lg bg-white p-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg max-h-[80vh] mt-20"}>
								{/* Backdrop */}
								<div>
									<div className="flex items-center">
										<img
											alt={detailUser.name}
											src={detailUser.image ? detailUser.image : '/faycook/images/avatar-polos.webp'}
											className="h-24 w-24 rounded-full border-2 border-blue-500"
										/>
										<div className="ml-4">
											<h2 className="text-2xl font-bold text-gray-900">{detailUser.name}</h2>
											<p className="text-sm text-gray-500">{detailUser.username}</p>
											<p className="text-sm text-gray-500">{detailUser.email}</p>
										</div>
									</div>
									<div className="mt-6">
										<h3 className="text-lg font-semibold text-gray-900">Informasi Personal</h3>
										<p className="mt-2 text-gray-600">Jenis Kelamin: {detailUser.gender == 1 ? 'Pria' : 'Wanita'}</p>
										<p className="mt-2 text-gray-600">Telephone: {detailUser.telephone ?? '-'}</p>
										<p className="mt-2 text-gray-600">Whatsaap: {detailUser.whatsaap ?? '-'}</p>
										<p className="mt-2 text-gray-600">Alamat: {`${detailUser.address}.  ${regionDetailUser?.subdistrict_name || ''}, ${regionDetailUser?.city || ''}-${regionDetailUser?.province || ''}`}</p>

									</div>
									{/* Tombol Tutup */}
									<div className="mt-6">
										<button
											type="button"
											className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
											onClick={() => setIsOpenDialogDetailUser(false)}
										>
											Tutup
										</button>
									</div>
								</div>
							</Dialog>
						</div>


						<div>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-base font-semibold leading-7 text-gray-900">Review Terbaru</h2>
								<Link href="/admin/ulasan" className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
									lihat semua review
								</Link>
							</div>
							<div className='bg-white rounded-lg'>
								<div className="lg:col-span-7 lg:col-start-6 lg:mt-0 p-6">
									<div className="flow-root">
										<div className="-my-12 divide-y divide-gray-200">
											{data?.recent_reviews?.map((review, index) => (
												<div key={index + 'review'} className="flex space-x-4 text-sm text-gray-500">
													<div className="flex-none py-10">
														<img alt={review.reviewer.username} src={review.reviewer.image} className="h-10 w-10 rounded-full bg-gray-100" />
													</div>
													<div className={classNames(index === 0 ? '' : 'border-t border-gray-200', 'py-10', 'w-full')}>
														<div className='flex justify-between'>
															<h3 className="font-semibold text-gray-900">{review.reviewer.username}</h3>
															<Link href={`/admin/laporan/${review.order.order_code}`} className="font-semibold text-xs text-gray-900 underline underline-offset-1">{review.order.order_code}</Link>
														</div>
														<p className='text-gray-500 text-xs mt-1'>
															{formattedDate(review.time_review)}
														</p>

														<Link href={`/produk/detail/${review.product_id}`} className='mt-2 underline underline-offset-1'>{review.product.name}</Link>
														<div className="mt-3 flex items-center">
															{[0, 1, 2, 3, 4].map((rating) => (
																<StarIcon
																	key={rating + 'ulasan user'}
																	aria-hidden="true"
																	className={classNames(
																		review.stars > rating ? 'text-yellow-400' : 'text-gray-300',
																		'h-5 w-5 flex-shrink-0', 'block'
																	)}
																/>
															))}
														</div>
														<div className="prose prose-sm mt-4 max-w-none text-gray-500">
															{review.review}
														</div>

														{review.reply_by &&
															<div className="flex items-start p-3 bg-gray-50 rounded-lg mt-3">
																<img
																	src={review.reply_by.image}
																	alt={review.reply_by.username}
																	className="h-8 w-8 rounded-full mr-3"
																/>
																<div>
																	<p className="text-gray-900 font-bold">{review.reply_by.username}</p>
																	<p className="text-gray-500 text-xs mt-1">{formattedDate(review.time_reply)}</p>
																	<p className="prose prose-sm max-w-none text-gray-500 mt-1">{review.reply}</p>
																</div>
															</div>
														}
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>

					</div>
				</main>
			</Sidebar>
		</>
	)
}
