import Sidebar from '@/components/admin/sidebar'
import {Input, InputGroup} from '@/components/catalyst/input'
import {SweetAlertError} from '@/components/sweetAlert'
import {formatRupiah} from '@/helper/formater'
import {getOrders} from '@/lib/fetchApi'
import {ArrowPathIcon, GiftIcon, MagnifyingGlassIcon, TruckIcon, XMarkIcon} from '@heroicons/react/20/solid'
import {ArrowDownCircleIcon, ArrowUpCircleIcon} from '@heroicons/react/24/solid'
import Link from 'next/link'
import {useRouter} from 'next/router'
import React, {Fragment, useEffect, useRef, useState} from 'react'

const statuses = {
	processing: 'text-yellow-500 bg-green-50 ring-green-500/20',
	shipped: 'text-indigo-500 bg-gray-50 ring-gray-500/10',
	cancelled: 'text-red-500 bg-gray-50 ring-gray-500/10',
}

const tabs = [
	{name: 'Menunggu Diproses', status: 'processing'},
	{name: 'Dikirim', status: 'shipped'},
	{name: 'Dibatalkan', status: 'cancelled'},
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

const statusSteps = {
	processing: {
		borderColor: 'border-yellow-300',
		textColor: 'text-yellow-500',
		bg: 'bg-yellow-500',
		hoverBg: 'hover:bg-yellow-700',
		hoverTextColor: 'hover:text-yellow-700',
		title: 'Menunggu Diproses',
	},
	shipped: {
		borderColor: 'border-indigo-300',
		textColor: 'text-indigo-500',
		bg: 'bg-indigo-500',
		hoverBg: 'hover:bg-indigo-700',
		hoverTextColor: 'hover:text-indigo-700',
		title: 'Dikirim',
	},
	cancelled: {
		borderColor: 'border-red-300',
		textColor: 'text-red-500',
		bg: 'bg-red-500',
		hoverBg: 'hover:bg-red-700',
		hoverTextColor: 'hover:text-red-700',
		title: 'Dibatalkan',
	},
}

export default function IndexLaporan() {
	const searchRef = useRef({})
	const [orders, setOrders] = useState(null)
	const router = useRouter()
	let {status} = router.query

	const fetchOrders = (status) => {
		getOrders(
			searchRef.current.value,
			status,
			(res) => {
				setOrders(res.data)
			},
			(err) => {
				SweetAlertError(err.response.data.message + ', coba ubah status')
			}
		)
	}

	const searchOrder = (e) => {
		e.preventDefault()
		fetchOrders(status)
	}

	useEffect(() => {
		fetchOrders(status)
	}, [status])

	if(status == undefined) status = 'processing'

	if(!['processing', 'shipped', 'cancelled'].includes(status)) {
		SweetAlertError('status order invalid')
		router.push('/admin/order').then(() => router.reload())
	}

	return (
		<Sidebar headingPage="List Order">
			<div className="px-6 py-4">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-xl font-semibold text-gray-700">Daftar Orderan</h1>
					<div className='flex space-x-3 items-center'>
						<ArrowPathIcon
							onClick={() => {
								searchRef.current.value = ''
								fetchOrders(status)
							}}
							className='h-6 w-6 cursor-pointer transition-transform duration-200 active:scale-110' />
						<form onSubmit={searchOrder} className="flex-1 items-center">
							<InputGroup>
								<MagnifyingGlassIcon />
								<Input ref={searchRef} name="search" placeholder='cari order...' />
							</InputGroup>
						</form>
					</div>
				</div>

				<div className="mt-6 border-b border-gray-200">
					<nav className="flex space-x-8" aria-label="Tabs">
						{tabs.map((tab) => (
							<Link
								key={tab.name}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${status === tab.status
									? `${statusSteps[status].borderColor} ${statusSteps[status].textColor}`
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									} `}
								href={`/admin/order?status=${tab.status}`}
							>
								{tab.name}
							</Link>
						))}
					</nav>
				</div>

				<div className="bg-white shadow-md rounded-lg mt-4">
					<div className="p-3 border-b last:border-b-0">
						<h2 className="text-base font-bold mb-6 text-gray-600">
							{searchRef.current.value ?
								'Pencarian Order'
								:
								'Orderan ' + statusSteps[status].title
							}
						</h2>
						<div className="space-y-5">
							{orders?.map((order, i) => (
								<div
									onClick={() => {
										status == 'cancelled' ? '' :
											router.push(`/admin/order/${order.order_code}`)
									}}
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
											{status != 'cancelled' && (
												<Link
													href={`/admin/order/${order.order_code}`}
													className="text-xs font-medium text-indigo-600 underline"
												>
													Lihat Detail
												</Link>
											)}
										</div>
									</div>
								</div>
							))}

						</div>
					</div>
				</div>
			</div>
		</Sidebar>
	)
}
