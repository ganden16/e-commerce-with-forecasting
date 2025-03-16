import {useEffect, useRef, useState} from 'react'
import {
	Dialog,
	DialogPanel,
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
} from '@headlessui/react'
import {
	Bars3Icon,
	CalendarDaysIcon,
	CreditCardIcon,
	EllipsisVerticalIcon,
	FaceFrownIcon,
	FaceSmileIcon,
	FireIcon,
	HandThumbUpIcon,
	HeartIcon,
	PaperClipIcon,
	UserCircleIcon,
	XMarkIcon as XMarkIconMini,
} from '@heroicons/react/20/solid'
import {BellIcon, XMarkIcon as XMarkIconOutline} from '@heroicons/react/24/outline'
import {CheckCircleIcon} from '@heroicons/react/24/solid'
import Sidebar from '@/components/admin/sidebar'
import {useRouter} from 'next/router'
import {cancelOrderAndRefund, completeOrder, confirmShippingOrder, getOneOrder} from '@/lib/fetchApi'
import {SweetAlertConfirm, SweetAlertError, SweetAlertSuccess} from '@/components/sweetAlert'
import Link from 'next/link'
import {formatRupiah, formattedDate} from '@/helper/formater'

const invoice = {
	subTotal: '$8,800.00',
	tax: '$1,760.00',
	total: '$10,560.00',
	items: [
		{
			id: 1,
			title: 'Logo redesign',
			description: 'New logo and digital asset playbook.',
			hours: '20.0',
			rate: '$100.00',
			price: '$2,000.00',
		},
		{
			id: 2,
			title: 'Website redesign',
			description: 'Design and program new company website.',
			hours: '52.0',
			rate: '$100.00',
			price: '$5,200.00',
		},
		{
			id: 3,
			title: 'Business cards',
			description: 'Design and production of 3.5" x 2.0" business cards.',
			hours: '12.0',
			rate: '$100.00',
			price: '$1,200.00',
		},
		{
			id: 4,
			title: 'T-shirt design',
			description: 'Three t-shirt design concepts.',
			hours: '4.0',
			rate: '$100.00',
			price: '$400.00',
		},
	],
}
const activity = [
	{id: 1, type: 'created', person: {name: 'Chelsea Hagon'}, date: '7d ago', dateTime: '2023-01-23T10:32'},
	{id: 2, type: 'edited', person: {name: 'Chelsea Hagon'}, date: '6d ago', dateTime: '2023-01-23T11:03'},
	{id: 3, type: 'sent', person: {name: 'Chelsea Hagon'}, date: '6d ago', dateTime: '2023-01-23T11:24'},
	{
		id: 4,
		type: 'commented',
		person: {
			name: 'Chelsea Hagon',
			imageUrl:
				'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
		},
		comment: 'Called client, they reassured me the invoice would be paid by the 25th.',
		date: '3d ago',
		dateTime: '2023-01-23T15:56',
	},
	{id: 5, type: 'viewed', person: {name: 'Alex Curren'}, date: '2d ago', dateTime: '2023-01-24T09:12'},
	{id: 6, type: 'paid', person: {name: 'Alex Curren'}, date: '1d ago', dateTime: '2023-01-24T09:20'},
]
const moods = [
	{name: 'Excited', value: 'excited', icon: FireIcon, iconColor: 'text-white', bgColor: 'bg-red-500'},
	{name: 'Loved', value: 'loved', icon: HeartIcon, iconColor: 'text-white', bgColor: 'bg-pink-400'},
	{name: 'Happy', value: 'happy', icon: FaceSmileIcon, iconColor: 'text-white', bgColor: 'bg-green-400'},
	{name: 'Sad', value: 'sad', icon: FaceFrownIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400'},
	{name: 'Thumbsy', value: 'thumbsy', icon: HandThumbUpIcon, iconColor: 'text-white', bgColor: 'bg-blue-500'},
	{name: 'I feel nothing', value: null, icon: XMarkIconMini, iconColor: 'text-gray-400', bgColor: 'bg-transparent'},
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export default function DetailOrder() {
	const [loadingPage, setLoadingPage] = useState(true)
	const router = useRouter()
	const [order, setOrder] = useState(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false) // State untuk mengontrol dialog
	const {orderCode} = router.query
	const resiRef = useRef({})

	const handleClickCancelOrder = () => {
		SweetAlertConfirm('Anda yakin akan membatalkan orderan ini?', 'dana akan dikembalikan ke pembeli', () => {
			cancelOrderAndRefund(
				{
					order_code: orderCode,
					amount: order.gross_amount
				},
				(res) => {
					SweetAlertSuccess(res.data.message)
					router.push('/admin/order')
				},
				(err) => {
					SweetAlertError(err.response.data.message)
				}
			)
		})
	}

	const handleSubmitShippingOrder = () => {
		SweetAlertConfirm('Apakah resi sudah benar?', 'status pesanan akan diubah menjadi dikirim', () => {
			confirmShippingOrder(orderCode, {
				resi: resiRef.current.value
			}, (res) => {
				SweetAlertSuccess(res.data.message)
				router.push('/admin/order?status=processing')
			}, (err) => {
				if(err.response.status == 422) {
					SweetAlertError('Resi masih kosong')
				}
			})
		})
	}

	const handleClickCompleteOrder = () => {
		SweetAlertConfirm('Apakah orderan sudah sampai di pembeli?', 'periksa paket order pembeli sebelum mengonfirmasi', () => {
			completeOrder(orderCode, (res) => {
				if(res.status == 200) {
					SweetAlertSuccess(res.data.message)
					router.push('/admin/order?status=shipped')
				}
			}, (err) => {
				if(err.response.status == 404) {
					SweetAlertError(err.response.data.message)
				}
			})
		})
	}

	useEffect(() => {
		if(orderCode) {
			getOneOrder(
				orderCode,
				(res) => {
					setOrder(res.data)
					setLoadingPage(false)
				},
				(err) => {
					SweetAlertError(err.response.data.message)
					router.push('/admin/order')
				}
			)
		}
	}, [orderCode])

	useEffect(() => {
		if(order) {
			if(order.status == 'processing' || order.status == 'shipped') {
				// Kondisi tambahan jika diperlukan
			} else {
				SweetAlertError('')
				router.push('/admin/order')
			}
		}
	}, [order])

	if(loadingPage) return '...Loading'

	return (
		<Sidebar headingPage="Detail Orderan">
			<main>
				<header className="relative isolate pt-2">
					<div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
						<div className="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
							<div
								style={{
									clipPath:
										'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
								}}
								className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
							/>
						</div>
						<div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
					</div>

					<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
						<div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
							<div className="flex items-center gap-x-6">
								<h1>
									<div className="text-sm leading-6 text-gray-500 font-bold">
										Nomor Order <span className="text-gray-600">#{order.order_code}</span>
									</div>
								</h1>
								{order.status == 'processing' &&
									<div className="mt-1 text-xs font-semibold leading-6 bg-gray-200 w-max p-2 rounded-lg text-yellow-600">Menunggu Diproses</div>
								}
								{order.status == 'shipped' &&
									<div className="mt-1 text-xs font-semibold leading-6 bg-gray-200 w-max p-2 rounded-lg text-indigo-600">Dikirim</div>
								}
							</div>

							{order.status == 'processing' &&
								<div className="flex items-center gap-x-4 sm:gap-x-3">
									<a
										href="#"
										className="rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
										onClick={() => setIsDialogOpen(true)}
									>
										Proses
									</a>
								</div>
							}
							{order.status == 'shipped' &&
								<div className="flex items-center gap-x-4 sm:gap-x-3">
									<a
										href="#"
										className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
										onClick={() => handleClickCompleteOrder()}
									>
										Selesaikan Order
									</a>
								</div>
							}
						</div>
					</div>
				</header>
				<div className="mt-5 w-max">
					<Link
						href={`/admin/order`}
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
						Kembali ke Order
					</Link>
				</div>
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
						{/* Invoice summary */}
						<div className="lg:col-start-3 lg:row-end-1">
							<div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
								<dl className="flex flex-wrap">
									<div className="flex-auto pl-6 pt-6">
										<dt className="text-sm font-semibold leading-6 text-gray-900">Pembayaran</dt>
										<dd className="mt-1 text-base font-semibold leading-6 text-gray-900">{formatRupiah(order.payment.amount)}</dd>
									</div>
									<div className="flex-none self-end px-6 pt-4">
										<dd className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
											Lunas
										</dd>
									</div>
									<div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
										<dt className="flex-none">
											<UserCircleIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
										</dt>
										<dd className="text-sm font-medium leading-6 text-gray-900">{order.name}</dd>
									</div>
									<div className="mt-4 flex w-full flex-none gap-x-4 px-6">
										<dt className="flex-none">
											<CalendarDaysIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
										</dt>
										<dd className="text-sm leading-6 text-gray-500">
											<p>{formattedDate(order.payment.payment_date)}</p>
										</dd>
									</div>
									<div className="mt-4 flex w-full flex-none gap-x-4 px-6 pb-4">
										<dt className="flex-none">
											<CreditCardIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
										</dt>
										<dd className="text-sm leading-6 text-gray-500">{order.payment.payment_method}</dd>
									</div>
								</dl>
							</div>
						</div>

						{/* Invoice */}
						<div className="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16">
							<h2 className="text-base font-semibold leading-6 text-gray-900">Detail Orderan</h2>
							<dl className="mt-6 grid grid-cols-1 text-sm leading-6 sm:grid-cols-2">
								<div>
									<p className="text-sm mt-1 font-semibold text-gray-500">#{orderCode}</p>
								</div>
								<div className="mt-2 sm:mt-0 sm:pl-4">
									<p className="text-gray-500 text-xs">Diorder pada</p>
									<p className="text-gray-500 text-xs" >{order ? formattedDate(order?.created_at) : ''}</p>
								</div>
								<div className="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4">
									<p className="font-bold text-sm text-gray-900">Dari</p>
									<p className="text-gray-500 text-xs">{process.env.NEXT_PUBLIC_APP_BRAND}</p>
								</div>
								<div className="mt-8 sm:mt-6 sm:border-t sm:border-gray-900/5 sm:pl-4 sm:pt-6">
									<p className="font-bold text-sm text-gray-900">Dikirim Ke</p>
									<p className="text-gray-500 text-xs">{order.name}</p>
									<p className="text-gray-500 text-xs">{order.delivery_detail.address} - {order.delivery_detail.address_detail}</p>
									<p className="text-gray-500 text-xs">{order.delivery_detail.subdistrict}, {order.delivery_detail.city} - {order.delivery_detail.province}</p>
								</div>
							</dl>
							<table className="w-full mt-8 text-sm">
								<thead className="border-b border-gray-300">
									<tr>
										<th className="pb-2 text-left font-semibold text-gray-700 ">Produk</th>
										<th className="pb-2 text-center font-semibold text-gray-700">Jumlah</th>
										<th className="pb-2 text-right font-semibold text-gray-700">Harga</th>
									</tr>
								</thead>
								<tbody>
									{order.order_details.map((item) => (
										<tr key={item.id + 'order_detail'} className="border-b border-gray-200">
											<td className="py-4 text-gray-900 font-medium">{item.product_name}</td>
											<td className="py-4 text-center text-gray-700">{item.quantity}x</td>
											<td className="py-4 text-right text-gray-900">{order ? formatRupiah(item.price) : ''}</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr>
										<th scope="" className="px-0 pb-0 pt-6 font-normal text-gray-700 sm:hidden">
											Subtotal
										</th>
										<th
											scope="row"
											colSpan={3}
											className="hidden px-0 pb-0 pt-6 text-right font-normal text-gray-700 sm:table-cell"
										>
											Subtotal
										</th>
										<td className="pb-0 pl-8 pr-0 pt-6 text-right tabular-nums text-gray-900">{formatRupiah(order.gross_amount - order.delivery_detail.shipping_cost - 1000)}</td>
									</tr>
									<tr>
										<th scope="row" className="pt-4 font-normal text-gray-700 sm:hidden">
											Ongkir
										</th>
										<th
											scope="row"
											colSpan={3}
											className="hidden pt-4 text-right font-normal text-gray-700 sm:table-cell"
										>
											Ongkir
										</th>
										<td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900">{formatRupiah(order.delivery_detail.shipping_cost)}</td>
									</tr>
									<tr>
										<th scope="row" className="pt-4 font-normal text-gray-700 sm:hidden">
											Biaya Aplikasi
										</th>
										<th
											scope="row"
											colSpan={3}
											className="hidden pt-4 text-right font-normal text-gray-700 sm:table-cell"
										>
											Biaya Aplikasi
										</th>
										<td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900">{formatRupiah(1000)}</td>
									</tr>
									<tr>
										<th scope="row" className="pt-4 font-bold text-gray-900 sm:hidden">
											Total
										</th>
										<th
											scope="row"
											colSpan={3}
											className="hidden pt-4 text-right font-bold text-gray-900 sm:table-cell"
										>
											Total
										</th>
										<td className="pb-0 pl-8 pr-0 pt-4 text-right font-semibold tabular-nums text-gray-900">
											{formatRupiah(order.gross_amount)}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>
				</div>

				{/* Dialog */}
				<Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="relative z-50">
					<div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" /> {/* Backdrop hitam */}

					<div className="fixed inset-0 flex items-center justify-center p-4">
						<DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
							<div className="bg-white shadow sm:rounded-lg">
								<div className="px-4 py-5 sm:p-6">
									<h3 className="text-base font-semibold leading-6 text-gray-900">Ubah Status Orderan Pembeli</h3>
									<div className="mt-2 max-w-xl text-sm text-gray-500">
										<p>Masukkan resi untuk mengubah status orderan menjadi dikirim</p>
									</div>
									<form className="mt-5 sm:flex sm:items-center">
										<div className="w-full sm:max-w-xs">
											<label htmlFor="resi" className="sr-only">
												Masukkan Resi
											</label>
											<input
												id="resi"
												name="resi"
												type="text"
												placeholder="resi"
												className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
												ref={resiRef}
											/>
										</div>
										<button
											type="button"
											className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
											onClick={handleSubmitShippingOrder}
										>
											Submit
										</button>
									</form>
								</div>
							</div>
						</DialogPanel>
					</div>
				</Dialog>
			</main>
		</Sidebar>
	)
}
