import Sidebar from '@/components/admin/sidebar'
import {Avatar} from '@/components/catalyst/avatar'
import {Button} from '@/components/catalyst/button'
import {Heading} from '@/components/catalyst/heading'
import {Input, InputGroup} from '@/components/catalyst/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/catalyst/table'
import {SweetAlertError} from '@/components/sweetAlert'
import {formatRupiah, formattedDate} from '@/helper/formater'
import {getOrders} from '@/lib/fetchApi'
import {ArrowPathIcon, MagnifyingGlassIcon} from '@heroicons/react/20/solid'
// import {getOrders} from '@/data'
import {useRouter} from 'next/router'
import {useEffect, useRef, useState} from 'react'

export const metadata = {
	title: 'Orders',
}

export default function IndexLaporan() {
	const router = useRouter()
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(false)
	const searchRef = useRef({})

	const fetchOrders = () => {
		getOrders(
			searchRef.current.value,
			'completed',
			(res) => {
				setData(res.data)
			},
			(err) => {
				SweetAlertError(err.response.data.message)
				searchRef.current.value = ''
				fetchOrders()
			}
		)
	}

	const searchOrder = (e) => {
		e.preventDefault()
		fetchOrders()
	}

	useEffect(() => {
		fetchOrders()
	}, [])

	if(loading) {
		return <div>Loading...</div>
	}

	return (
		<Sidebar headingPage="List Laporan Penjualan">
			<div className="flex items-end justify-between gap-4">
				<Heading>Orderan Selesai</Heading>
				<div className='flex space-x-3 items-center'>
					<ArrowPathIcon
						onClick={() => {
							searchRef.current.value = ''
							fetchOrders()
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
			<Table className="mt-8 max-w-full">
				<TableHead>
					<TableRow>
						<TableHeader>Tanggal Order</TableHeader>
						<TableHeader>Atas Nama</TableHeader>
						<TableHeader >Total Pembayaran</TableHeader>
						<TableHeader>Nomor Order</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{data?.map((order) => (
						<TableRow key={order.id + 'orderCompleted'} href={`/admin/laporan/${order.order_code}`} title={`Order #${order.order_code}`}>
							<TableCell className="text-zinc-500">{formattedDate(order.created_at)}</TableCell>
							<TableCell>{order.name}</TableCell>
							<TableCell>{formatRupiah(order.gross_amount)}</TableCell>
							<TableCell>{order.order_code}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Sidebar>
	)
}
