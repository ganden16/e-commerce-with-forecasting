import React, {useEffect, useRef, useState} from 'react'
import Sidebar from '@/components/admin/sidebar'
import {Badge} from '@/components/catalyst/badge'
import {Button} from '@/components/catalyst/button'
import {Divider} from '@/components/catalyst/divider'
import {Dropdown, DropdownButton, DropdownItem, DropdownMenu} from '@/components/catalyst/dropdown'
import {Heading} from '@/components/catalyst/heading'
import {Input, InputGroup} from '@/components/catalyst/input'
import {Link} from '@/components/catalyst/link'
import {Select} from '@/components/catalyst/select'
import {getEvents} from '@/data'
import {EllipsisVerticalIcon, MagnifyingGlassIcon} from '@heroicons/react/16/solid'
import {getAllProducts} from '@/lib/fetchApi'
import {ArrowPathIcon} from '@heroicons/react/20/solid'

export const metadata = {
	title: 'Events',
}

export default function IndexPenjualanProduk() {
	const searchRef = useRef({})
	const [loading, setLoading] = useState(true)
	const [products, setProducts] = useState(null)

	const fetchProducts = (query = '', cbFinally = () => {}) => {
		getAllProducts(query, (res) => setProducts(res.data), cbFinally())
	}

	const searchProduct = (e) => {
		e.preventDefault()
		fetchProducts(searchRef.current.value)
	}

	useEffect(() => {
		fetchProducts('', () => setLoading(false))
	}, [])

	console.log('products', products)

	if(loading) {
		return '...Loading'
	}

	return (
		<Sidebar headingPage="List Penjualan">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="max-sm:w-full sm:flex-1">
					<Heading>Penjualan Produk</Heading>
					<div className="mt-4 flex max-w-xl gap-4 items-center">
						<ArrowPathIcon
							onClick={() => {
								searchRef.current.value = ''
								fetchProducts('')
							}}
							className='h-6 w-6 cursor-pointer transition-transform duration-200 active:scale-110' />
						<form onSubmit={searchProduct} className="flex-1 items-center">
							<InputGroup>
								<MagnifyingGlassIcon />
								<Input name="search" ref={searchRef} placeholder='cari produk...' />
							</InputGroup>
						</form>
						{/* <div>
							<Select name="sort_by">
								<option value="name">Sort by name</option>
								<option value="date">Sort by date</option>
								<option value="status">Sort by status</option>
							</Select>
						</div> */}
					</div>
				</div>
			</div>
			<ul className="mt-10">
				{products?.map((product, index) => (
					<li key={product.id + 'product'}>
						<Divider soft={index > 0} />
						<div className="flex items-center justify-between">
							<div className="flex gap-6 py-6">
								<div className="w-32 shrink-0">
									<Link href={`/admin/penjualan/${product.id}`} aria-hidden="true">
										<img className="aspect-[3/2] rounded-lg shadow" src={product.image} alt={product.name} />
									</Link>
								</div>
								<div className="space-y-1.5">
									<div className="text-base/6 font-semibold">
										<Link href={`/admin/penjualan/${product.id}`}>{product.name}</Link>
									</div>
									<div className="text-xs/6 text-zinc-600">
										{product.total_sales} terjual
									</div>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<Badge className="max-sm:hidden" color={product.isReadyStock ? 'lime' : 'zinc'}>
									{product.isReadyStock ? 'Tersedia' : 'Tidak Tersedia'}
								</Badge>
								<Dropdown>
									<DropdownButton plain aria-label="More options">
										<EllipsisVerticalIcon />
									</DropdownButton>
									<DropdownMenu anchor="bottom end">
										<DropdownItem className={'cursor-pointer'} href={`/admin/penjualan/${product.id}`}>Lihat Detail</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							</div>
						</div>
					</li>
				))}
			</ul>
		</Sidebar>
	)
}
