import Sidebar from '@/components/admin/sidebar'
import {sweetAlertDelete, SweetAlertSuccess} from '@/components/sweetAlert'
import {formatRupiah} from '@/helper/formater'
import {deleteProduct, getAllProducts} from '@/lib/fetchApi'
import {Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItems} from '@headlessui/react'
import {ArrowPathIcon} from '@heroicons/react/20/solid'
import {EllipsisHorizontalIcon, MagnifyingGlassIcon} from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import React, {useEffect, useRef, useState} from 'react'

export default function list() {
	const searchRef = useRef({})
	const [products, setProducts] = useState([])
	const [oneProduct, setOneProduct] = useState({})
	const [isOpen, setIsOpen] = useState(false)

	const fetchProducts = (query) => {
		getAllProducts(query, (res) => setProducts(res.data))
	}

	const handleClickHapus = (product) => {
		sweetAlertDelete(`Hapus ${product.name} ?`, () => {
			deleteProduct(product.id, (res) => {
				SweetAlertSuccess(res.data.message)
				setTimeout(() => {
					window.location.reload()
				}, 1000)
			})
		})
	}

	const searchProduct = (e) => {
		e.preventDefault()
		fetchProducts(searchRef.current.value)
	}

	useEffect(() => {
		fetchProducts(searchRef.current.value)
	}, [])
	console.log('products', products)
	return (
		<>
			<Sidebar headingPage="List Produk">
				<div className="px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex-auto">
							<h1 className="text-2xl font-semibold leading-6 text-gray-900">Produk</h1>
						</div>
						<div className="flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:items-center">
							<ArrowPathIcon
								onClick={() => {
									searchRef.current.value = ''
									fetchProducts('')
								}}
								className='h-6 w-6 cursor-pointer transition-transform duration-200 active:scale-110' />
							<form onSubmit={searchProduct} className="relative flex items-center w-full sm:w-auto">
								<MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-gray-400" aria-hidden="true" />
								<input
									type="search"
									className="h-10 w-full sm:w-64 pl-10 pr-4 border text-sm rounded-md focus:ring-0 focus:border-1 focus:border-gray-400 focus:outline-none"
									ref={searchRef}
									placeholder='cari produk...'
								/>
							</form>
							<Link
								href={'/admin/produk/tambah'}
								type="button"
								className="block max-w-xs sm:max-w-auto rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
							>
								Tambah Produk
							</Link>
						</div>
					</div>
					<div className="mt-8 flow-root">
						<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
							<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
								<table className="min-w-full divide-y divide-gray-300">
									<thead>
										<tr>
											<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">
												Nama
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												Harga
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												Ketersediaan Stok
											</th>
											<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
												Action
											</th>
										</tr>
									</thead>
									<tbody className="bg-white">
										{products.map((item) => (
											<tr key={item.name} className="even:bg-gray-100">
												<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
													{item.name}
												</td>
												<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatRupiah(item.price)}</td>
												<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.isReadyStock ? 'Tersedia' : 'Tidak Tersedia'}</td>
												<td className="relative whitespace-nowrap py-4 pl-3 pr-2 text-sm font-medium sm:pr-3">
													<div className="flex justify-between flex-1 gap-x-4 self-stretch lg:gap-x-6">
														<div className="flex items-center  lg:gap-x-6">
															<div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
															<Menu as="div" className="relative">
																<MenuButton className="-m-1.5 flex items-center p-1.5">
																	<span className="sr-only">Open action menu</span>
																	<EllipsisHorizontalIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
																</MenuButton>
																<MenuItems
																	transition
																	className="absolute right-0 z-10 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
																// style={{top: 'auto', bottom: 'auto'}}
																>
																	<div
																		className="block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer data-[focus]:bg-gray-50"
																		onClick={() => {
																			setIsOpen(true)
																			setOneProduct(item)
																		}}
																	>
																		Detail
																	</div>
																	<Link
																		href={'/admin/produk/edit/' + item.id}
																		className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
																	>
																		Edit
																	</Link>
																	<div
																		onClick={() => handleClickHapus(item)}
																		className="block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer data-[focus]:bg-gray-50"
																	>
																		Hapus
																	</div>
																</MenuItems>
															</Menu>
														</div>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</Sidebar>
			<Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
				{/* Dialog backdrop untuk latar belakang abu-abu */}
				<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

				{/* Wrapper untuk memusatkan dialog */}
				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 sm:p-0">
						<DialogPanel
							className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:w-full sm:max-w-lg sm:p-6 flex flex-col max-h-[90vh] mt-16" // Menambahkan margin top agar dialog tidak menempel ke atas
						>
							{/* Bagian isi dialog */}
							<div className="overflow-y-auto flex-1">
								<div className="px-4 sm:px-0">
									<h3 className="text-base font-semibold leading-7 text-gray-900">Detail Produk</h3>
									<p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Id produk: {oneProduct.id}</p>
								</div>
								<div className="mt-6 border-t border-gray-100">
									<dl className="divide-y divide-gray-100">
										<div className="bg-white-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
											<dt className="text-sm font-medium leading-6 text-gray-900">Kategori Produk</dt>
											<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 break-words">
												{oneProduct?.category?.name}
											</dd>
										</div>
										<div className="bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
											<dt className="text-sm font-medium leading-6 text-gray-900">Nama Produk</dt>
											<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 break-words">
												{oneProduct.name}
											</dd>
										</div>
										<div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
											<dt className="text-sm font-medium leading-6 text-gray-900">Harga</dt>
											<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
												{formatRupiah(oneProduct.price)}
											</dd>
										</div>
										<div className="bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
											<dt className="text-sm font-medium leading-6 text-gray-900">Berat</dt>
											<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
												{oneProduct.weight} Gram
											</dd>
										</div>
										<div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
											<dt className="text-sm font-medium leading-6 text-gray-900">Stok Tersedia</dt>
											<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
												{oneProduct.isReadyStock === true ? 'Ya' : 'Tidak'}
											</dd>
										</div>

										{oneProduct?.best_forecasting_method?.length > 0 && (
											<div className="bg-gray-50 px-4 py-6 sm:px-6 sm:rounded-lg">
												<div className="sm:grid sm:grid-cols-3 sm:gap-4">
													<p className="text-sm font-medium leading-6 text-gray-900 sm:col-span-1">
														Metode Peramalan Terbaik
													</p>
													<div className="text-sm leading-6 text-gray-700 sm:col-span-2">
														<ol className="list-decimal list-inside">
															{oneProduct?.best_forecasting_method?.map((item, index) => (
																<li key={index} className="mt-1">
																	{item.name}
																</li>
															))}
														</ol>
													</div>
												</div>
											</div>
										)}

										<div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
											<dt className="text-sm font-medium leading-6 text-gray-900">Deskripsi Produk</dt>
											<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 break-words">
												{oneProduct.description}
											</dd>
										</div>
										<div className="bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
											<dt className="text-sm font-medium leading-6 text-gray-900">Detail Lainnya</dt>
											<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
												{oneProduct.other_detail && (
													<ul className="list-disc list-inside">
														{JSON.parse(oneProduct.other_detail).map((detail, index) => (
															<li key={index}>{detail}</li>
														))}
													</ul>
												)}
											</dd>
										</div>
										<div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
											<dt className="text-sm font-medium leading-6 text-gray-900">Gambar Produk</dt>
											<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
												{oneProduct?.image ? (
													<img
														src={oneProduct.image}
														alt="Example"
														className="mt-4 max-w-full h-auto rounded-md"
													/>
												) : (
													<p>---</p>
												)}
											</dd>
										</div>
									</dl>
								</div>
							</div>

							{/* Tombol untuk menutup dialog */}
							<div className="mt-5 sm:mt-6 flex justify-end sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="mt-3 inline-flex w-1/2 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
								>
									Tutup
								</button>
							</div>
						</DialogPanel>
					</div>
				</div>
			</Dialog>

		</>
	)
}
