import {Avatar} from '@/components/catalyst/avatar'
import {Badge} from '@/components/catalyst/badge'
import {Button} from '@/components/catalyst/button'
import {DescriptionDetails, DescriptionList, DescriptionTerm} from '@/components/catalyst/description-list'
import {Divider} from '@/components/catalyst/divider'
import {Heading, Subheading} from '@/components/catalyst/heading'
import {Link} from '@/components/catalyst/link'
import {getOrder} from '@/data'
import {BanknotesIcon, CalendarIcon, ChevronLeftIcon, CreditCardIcon} from '@heroicons/react/16/solid'
import {RefundOrder} from './refund.js'
import {useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import Sidebar from '@/components/admin/sidebar'
import {detailOrder} from '@/lib/fetchApi.js'
import {SweetAlertError} from '@/components/sweetAlert.js'
import {formatRupiah, formattedDate} from '@/helper/formater.js'

export default function DetailLaporan() {
	const router = useRouter()
	const {order_code} = router.query
	const [order, setOrder] = useState({})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if(order_code) {
			detailOrder(order_code, 'completed', (res) => {
				setOrder(res.data)
			}, (err) => {
				SweetAlertError(err.response.data.message)
			}, () => {
				setLoading(false)
			})
		}
	}, [order_code])

	if(loading) {
		return <p>Loading...</p>
	}
	console.log('order', order)

	return (
		<Sidebar headingPage="Detail Laporan Penjualan">
			<div className="max-lg:hidden">
				<div onClick={() => router.back()} className="cursor-pointer inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
					<ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
					Kembali
				</div>
			</div>
			<div className="mt-4 lg:mt-8">
				<div className="flex items-center gap-4">
					<Heading>Order #{order.order_code}</Heading>
					<Badge color="lime">Diterima</Badge>
				</div>
				<div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
					<div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
						<span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 ">
							<BanknotesIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
							<span>{formatRupiah(order.gross_amount)}</span>
						</span>
						<span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 ">
							<CreditCardIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
							<span className="inline-flex gap-3">
								{order.payment.payment_method}
							</span>
						</span>
						<span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 ">
							<CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
							<span>{formattedDate(order.created_at)}</span>
						</span>
					</div>
					{/* <div className="flex gap-4">
						<RefundOrder outline amount={order.amount.usd}>
							Refund
						</RefundOrder>
						<Button>Resend Invoice</Button>
					</div> */}
				</div>
			</div>
			<div className="mt-12">
				<Subheading>Data Pembeli</Subheading>
				<Divider className="mt-4" />
				<DescriptionList>
					<DescriptionTerm>Diterima Pada</DescriptionTerm>
					<DescriptionDetails>{formattedDate(order.delivery_detail.received_date)}</DescriptionDetails>
					<DescriptionTerm>Atas Nama</DescriptionTerm>
					<DescriptionDetails>{order.name}</DescriptionDetails>
					<DescriptionTerm>Whatsapp</DescriptionTerm>
					<DescriptionDetails>{order.whatsaap}</DescriptionDetails>
					<DescriptionTerm>Telephone</DescriptionTerm>
					<DescriptionDetails>{order.telephone}</DescriptionDetails>
					<DescriptionTerm>Email</DescriptionTerm>
					<DescriptionDetails>{order.email}</DescriptionDetails>
					<DescriptionTerm>Alamat Pengiriman</DescriptionTerm>
					<DescriptionDetails>{order.delivery_detail.address} - {order.delivery_detail.address_detail}, {order.delivery_detail.subdistrict}, {order.delivery_detail.city} - {order.delivery_detail.province}</DescriptionDetails>
				</DescriptionList>
			</div>
			<div className="mt-8">
				<Subheading>Produk</Subheading>
				<Divider className="mt-4" />
				<DescriptionList>
					{order.order_details.map((detail, i) => (
						<>
							<DescriptionTerm>{detail.product_name}</DescriptionTerm>
							<DescriptionDetails>
								<p>{detail.quantity}x</p>
							</DescriptionDetails>
						</>
					))}
				</DescriptionList>
			</div>
			<div className="mt-12">
				<Subheading>Pembayaran</Subheading>
				<Divider className="mt-4" />
				<DescriptionList>
					<DescriptionTerm>Metode Pembayaran</DescriptionTerm>
					<DescriptionDetails>{order.payment.payment_method}</DescriptionDetails>
					<DescriptionTerm>Tanggal Pembayaran</DescriptionTerm>
					<DescriptionDetails>{formattedDate(order.payment.payment_date)}</DescriptionDetails>
					<DescriptionTerm>Sub Total</DescriptionTerm>
					<DescriptionDetails>{formatRupiah(order.gross_amount - 1000 - order.delivery_detail.shipping_cost)}</DescriptionDetails>
					<DescriptionTerm>Ongkos Kirim</DescriptionTerm>
					<DescriptionDetails>{formatRupiah(order.delivery_detail.shipping_cost)}</DescriptionDetails>
					<DescriptionTerm>Biaya Aplikasi</DescriptionTerm>
					<DescriptionDetails>{formatRupiah(1000)}</DescriptionDetails>
					<DescriptionTerm className={'font-bold'}>Total Pembayaran</DescriptionTerm>
					<DescriptionDetails>{formatRupiah(order.gross_amount)}</DescriptionDetails>
				</DescriptionList>
			</div>
		</Sidebar>
	)
}
