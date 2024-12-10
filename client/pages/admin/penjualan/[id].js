import Sidebar from '@/components/admin/sidebar'
import {Stat} from './stat'
import {Badge} from '@/components/catalyst/badge'
import {Button} from '@/components/catalyst/button'
import {Heading, Subheading} from '@/components/catalyst/heading'
import {Link} from '@/components/catalyst/link'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/catalyst/table'
import {getEvent, getEventOrders} from '@/data'
import {ChevronLeftIcon} from '@heroicons/react/16/solid'
import {useRouter} from 'next/router'
import {useEffect, useState} from 'react'
import {getOrderByProduct} from '@/lib/fetchApi'
import {SweetAlertError} from '@/components/sweetAlert'
import {formatRupiah, formattedDate} from '@/helper/formater'

export default function DetailPenjualanProduk() {
	const router = useRouter()
	const {id} = router.query
	const [data, setData] = useState({})
	const [loading, setLoading] = useState(true)

	const fetchOrderByProduct = () => {
		getOrderByProduct(id, (res) => {
			setData(res.data)
		}, (err) => {
			if(err.response.status == 404) {
				SweetAlertError(err.response.data.message)
				router.push('/admin/penjualan')
			}
		}, () => {
			setLoading(false)
		})
	}

	useEffect(() => {
		fetchOrderByProduct()
	}, [id])

	if(loading) {
		return <h1>Loading...</h1>
	}
	console.log('order', data)

	return (
		<Sidebar headingPage="Detail Penjualan">
			<div className="max-lg:hidden">
				<Link href="/admin/penjualan" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
					<ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
					Kembali
				</Link>
			</div>
			<div className="mt-4 flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-wrap items-center gap-6">
					<div className="w-32 shrink-0">
						<img className="aspect-[3/2] rounded-lg shadow" src={data.product.image} alt={data.product.name} />
					</div>
					<div>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
							<Heading>{data.product.name}</Heading>
							<Badge color={data.product.isReadyStock ? 'lime' : 'zinc'}>{data.product.isReadyStock ? 'Tersedia' : 'Tidak Tersedia'}</Badge>
						</div>
						<div className="mt-2 text-sm/6 text-zinc-500">
							{data.product.category.name}
						</div>
					</div>
				</div>
				<div className="flex gap-4">
					<Link href={`/admin/produk/edit/${data.product.id}`}>
						<Button className='cursor-pointer' outline>Edit</Button>
					</Link>
				</div>
			</div>
			<div className="mt-8 grid gap-8 sm:grid-cols-3">
				<Stat title="Total Omzet" value={formatRupiah(data.total_revenue)} />
				<Stat
					title="Total Produk Terjual"
					value={data.total_quantity_sold}
				/>
				<Stat title="Total Review Produk" value={data.total_reviews} />
			</div>
			<Subheading className="mt-12">Orderan Selesai</Subheading>
			<Table className="mt-4 max-w-full">
				<TableHead>
					<TableRow>
						<TableHeader>Nomor Order</TableHeader>
						<TableHeader>Tanggal Order</TableHeader>
						<TableHeader>Pelanggan</TableHeader>
						<TableHeader className="text-right">Total Pembayaran</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{data.orders.map((order) => (
						<TableRow key={order.id + 'orderbyproduct'} href={`/admin/laporan/${order.order_code}`} title={`Nomor #${order.order_code}`}>
							<TableCell>{order.order_code}</TableCell>
							<TableCell className="text-zinc-500">{formattedDate(order.created_at)}</TableCell>
							<TableCell>{order.name}</TableCell>
							<TableCell className="text-right">{formatRupiah(order.gross_amount)}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Sidebar>
	)
}
