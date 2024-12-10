import {useEffect, useRef, useState} from 'react'
import {jsPDF} from 'jspdf'
import html2canvas from 'html2canvas'
import {
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
import {CheckCircleIcon} from '@heroicons/react/24/solid'
import AuthMiddleware from '@/components/authMiddleware'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {detailOrder} from '@/lib/fetchApi'
import {formatRupiah, formattedDate} from '@/helper/formater'
import {SweetAlertError} from '@/components/sweetAlert'

export default function Faktur() {
	const [loadingPage, setLoadingPage] = useState(true)
	const [order, setOrder] = useState(null)
	const invoiceRef = useRef()
	const router = useRouter()
	const {order_code} = router.query

	const downloadPDF = async () => {
		const element = invoiceRef.current
		const canvas = await html2canvas(element, {
			scale: 2,
			useCORS: true,
		})
		const imgData = canvas.toDataURL('image/png')

		const pdf = new jsPDF('p', 'mm', 'a4')
		const pdfWidth = pdf.internal.pageSize.getWidth()
		const pdfHeight = pdf.internal.pageSize.getHeight()

		const imgWidth = pdfWidth
		const imgHeight = (canvas.height * pdfWidth) / canvas.width

		let position = 0
		let pageHeightRemaining = imgHeight

		while(pageHeightRemaining > 0) {
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)

			pageHeightRemaining -= pdfHeight
			position -= pdfHeight

			if(pageHeightRemaining > 0) {
				pdf.addPage()
			}
		}

		pdf.save('invoice.pdf')
	}

	useEffect(() => {
		if(order_code) {
			detailOrder(order_code, '', (res) => {
				setOrder(res.data)
				setLoadingPage(false)
			}, (err) => {
				if(err.response.status == 404) {
					SweetAlertError('Orderan tidak ada')
					window.location.href = '/orderan-saya'
				}
				setLoadingPage(false)
			})
		}
	}, [order_code])

	if(loadingPage) return '...Loading'

	const subtotal = order?.order_details.reduce((accumulator, detail) => {
		return accumulator + (detail.price * detail.quantity)
	}, 0)

	const shippingCost = order?.delivery_detail.shipping_cost
	const applicationFee = 1000
	const grossAmount = parseInt(subtotal) + parseInt(shippingCost) + applicationFee

	return (
		<AuthMiddleware>
			<div className='bg-white'>
				<main className="mx-auto max-w-3xl p-8 bg-white">
					<div className="w-max">
						<Link
							href={`/orderan-saya`}
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
					{/* Header Section */}
					<header className="text-center pb-8 border-b border-gray-300">
						<img src="/faycook/logo2.webp" alt="" className="mx-auto h-16 w-16 rounded-full ring-1 ring-gray-900/10" />
						<h1 className="text-xl font-bold text-gray-900 mt-4">Faktur</h1>
					</header>
				
					{/* Invoice Details */}
					<div ref={invoiceRef} className="bg-white shadow-lg rounded-lg p-8 mt-8 ring-1 ring-gray-900/5">
						{/* Invoice Info */}
						<div className="flex justify-between items-center pb-6 border-b border-gray-300">
							<div>
								<p className="text-sm mt-1 font-semibold text-gray-500">#{order_code}</p>
								<p className="text-gray-500 text-xs">Diorder pada</p>
								<p className="text-gray-500 text-xs" >{order ? formattedDate(order?.created_at) : ''}</p>
							</div>
							{order.status == 'completed' &&
							<div>
								<p className="text-gray-500 text-xs">Diterima pada</p>
								<p className="text-gray-500 text-xs">{order ? formattedDate(order?.delivery_detail.received_date) : ''}</p>
							</div>
							}
						</div>
				
						{/* Client and Company Info */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
							<div>
								<p className="font-bold text-sm text-gray-900">Dari</p>
								<p className="text-gray-500 text-xs">{process.env.NEXT_PUBLIC_APP_BRAND}</p>
							</div>
							<div>
								<p className="font-bold text-sm text-gray-900">Dikirim Ke</p>
								<p className="text-gray-500 text-xs">{order.name}</p>
								<p className="text-gray-500 text-xs">{order.delivery_detail.address} - {order.delivery_detail.address_detail}</p>
								<p className="text-gray-500 text-xs">{order.delivery_detail.subdistrict}, {order.delivery_detail.city} - {order.delivery_detail.province}</p>
							</div>
						</div>
				
						{/* Invoice Items Table */}
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
				
						</table>
						{/* Invoice Summary */}
						<div className="mt-6 bg-gray-50 rounded-lg p-4">
							<div className="flex justify-between items-center">
								<div>
									<p className="text-sm font-bold text-gray-900">Pembayaran</p>
									<p className="text-xs font-semibold text-gray-900 mt-3">Sub Total</p>
									<p className="text-xs font-semibold text-gray-900 mt-3">Ongkos Kirim</p>
									<p className="text-xs font-semibold text-gray-900 mt-3">Biaya Aplikasi</p>
									<p className="text-xs font-semibold text-gray-900 mt-6">Total</p>
								</div>
								<div>
									<div className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
										Lunas
									<p className="text-xs font-semibold text-gray-400">{order ? order.payment.payment_method : ''}</p>
									</div>
									<p className="text-xs font-semibold text-gray-900 mt-3">{order ? formatRupiah(subtotal) : ''}</p>
									<p className="text-xs font-semibold text-gray-900 mt-3">{order ? formatRupiah(order?.delivery_detail.shipping_cost) : ''}</p>
									<p className="text-xs font-semibold text-gray-900 mt-3">{order ? formatRupiah(1000) : ''}</p>
									<p className="text-xs font-semibold text-gray-900 mt-6">{order ? formatRupiah(grossAmount) : ''}</p>
								</div>
							</div>
						</div>
					</div>
				
					{/* Download Button */}
					<div className="text-center mt-8">
						<button onClick={downloadPDF} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-500">
							Download PDF
						</button>
					</div>
				</main>
			</div>
		</AuthMiddleware>
	)
}
