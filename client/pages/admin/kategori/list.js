import {sweetAlertDelete, SweetAlertSuccess} from '@/components/sweetAlert'
import Sidebar from '@/components/admin/sidebar'
import {Menu, MenuButton, MenuItems} from '@headlessui/react'
import {EllipsisHorizontalIcon} from '@heroicons/react/24/outline'
import Link from 'next/link'
import React, {useEffect, useState} from 'react'
import {deleteCategory, getAllCategories} from '@/lib/fetchApi'

export default function ListCategory() {
	const [categories, setCategories] = useState([])

	const handleClickHapus = (category) => {
		sweetAlertDelete(`Hapus ${category.name} ?`, () => {
			deleteCategory(category.id, (res) => {
				SweetAlertSuccess('Dihapus', res.data.message)
				getAllCategories((res) => setCategories(res.data))
			})
		})
	}

	useEffect(() => {
		getAllCategories((res) => setCategories(res.data))
	}, [])

	return (
		<>
			<Sidebar headingPage="List Kategori">
				<div className="px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex-auto">
							<h1 className="text-2xl font-semibold leading-6 text-gray-900">Kategori</h1>
						</div>
						<div className="flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:items-center">
							<Link
								href={'/admin/kategori/tambah'}
								type="button"
								className="block max-w-xs sm:max-w-auto rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
							>
								Tambah Kategori
							</Link>
						</div>
					</div>
					<div className="mt-8 flow-root">
						<div className="-mx-4 -my-2 overflow-hidden sm:-mx-6 lg:-mx-8">
							<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
								<table className="min-w-full divide-y divide-gray-300 table-fixed">
									<thead>
										<tr>
											<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">
												No.
											</th>
											<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">
												Nama
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												Deskripsi
											</th>
											<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
												Action
											</th>
										</tr>
									</thead>
									<tbody className="bg-white">
										{categories.map((item, index) => (
											<tr key={item.name} className="even:bg-gray-100">
												<td className="whitespace-normal break-words max-w-xs py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
													{index + 1}
												</td>
												<td className="whitespace-normal break-words max-w-xs py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
													{item.name}
												</td>
												<td className="whitespace-normal break-words max-w-xs px-3 py-4 text-sm text-gray-500">
													{item.description ?? '---'}
												</td>
												<td className="relative whitespace-nowrap py-4 pl-3 pr-2 text-sm font-medium sm:pr-3">
													<div className="flex justify-between gap-x-4 self-stretch lg:gap-x-6">
														<div className="flex items-center lg:gap-x-6">
															<div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
															<Menu as="div" className="relative">
																<MenuButton className="-m-1.5 flex items-center p-1.5">
																	<span className="sr-only">Open action menu</span>
																	<EllipsisHorizontalIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
																</MenuButton>
																<MenuItems
																	as="div"
																	className="absolute right-0 z-10 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
																	style={{top: 'auto', bottom: '100%'}} // Mengatur dropdown muncul ke atas jika berada di bawah layar
																>
																	<Link href={'/admin/kategori/edit/' + item.id} className="block px-3 py-1 text-sm leading-6 text-gray-900">
																		Edit
																	</Link>
																	<div
																		onClick={() => handleClickHapus(item)}
																		className="block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer"
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
		</>
	)
}
