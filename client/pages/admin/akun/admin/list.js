import react, {useEffect, useState} from 'react'
import Sidebar from '@/components/admin/sidebar'
import {Dialog} from '@/components/catalyst/dialog'
import {DialogBackdrop, DialogPanel} from '@headlessui/react'
import {ChevronRightIcon, PlusIcon} from '@heroicons/react/20/solid'
import {useRouter} from 'next/router'
import {getAllAdmins, getSubdistrict} from '@/lib/fetchApi'

export default function IndexAdmin() {
	const [isOpen, setIsOpen] = useState(false)
	const [detailAdmin, setDetailAdmin] = useState({})
	const [regionDetailAdmin, setRegionDetailAdmin] = useState(null)
	const [admins, setAdmins] = useState([])
	const router = useRouter()

	useEffect(() => {
		getAllAdmins((res) => setAdmins(res.data))
	}, [])
	useEffect(() => {
		getSubdistrict('', detailAdmin.subdistrict_id, (res) => {
			setRegionDetailAdmin(res.data)
		}, (err) => {})
	}, [detailAdmin])

	return (
		<Sidebar headingPage="List Admin">
			<div>
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-xl font-bold text-gray-900">Data Admin</h1>
					{/* Tambah Admin Button */}
					<button
						onClick={() => router.push('/admin/akun/admin/tambah')}
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
						<PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
						Tambah Admin
					</button>
				</div>
				<ul className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
					{admins?.length > 0 && admins?.map((admin) => (
						<li
							key={admin.email}
							className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 cursor-pointer"
							onClick={() => {
								setRegionDetailAdmin(null)
								setDetailAdmin(admin)
								setIsOpen(true)
							}}
						>
							<div className="flex min-w-0 gap-x-4">
								<img
									alt="admin"
									src={admin.image ?? '/faycook/images/avatar-polos.webp'}
									className="h-12 w-12 flex-none rounded-full bg-gray-50"
								/>
								<div className="min-w-0 flex-auto">
									<p className="text-sm font-semibold leading-6 text-gray-900">
										<p>
											<span className="absolute inset-x-0 -top-px bottom-0" />
											{admin.name}
										</p>
									</p>
									<p className="mt-1 flex text-xs leading-5 text-gray-500">
										<a href={`mailto:${admin.email}`} className="relative truncate hover:underline">
											{admin.email}
										</a>
									</p>
								</div>
							</div>
							<div className="flex shrink-0 items-center gap-x-4">
								<div className="hidden sm:flex sm:flex-col sm:items-end">
									<p className="text-sm leading-6 text-gray-900">{admin.is_admin == 1 ? admin.username : ''}</p>
								</div>
								<ChevronRightIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
							</div>
						</li>
					))}
				</ul>
			</div>
			<Dialog open={isOpen} onClose={() => setIsOpen(false)} className={"relative top-5 transform overflow-auto rounded-lg bg-white p-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg max-h-[80vh] mt-20"}>
				{/* Backdrop */}
				<div>
					<div className="flex items-center">
						<img
							alt={detailAdmin.name}
							src={detailAdmin.image ?? '/faycook/images/avatar-polos.webp'}
							className="h-24 w-24 rounded-full border-2 border-blue-500"
						/>
						<div className="ml-4">
							<h2 className="text-2xl font-bold text-gray-900">{detailAdmin.name}</h2>
							<p className="text-sm text-gray-500">{detailAdmin.username}</p>
							<p className="text-sm text-gray-500">{detailAdmin.email}</p>
						</div>
					</div>
					<div className="mt-6">
						<h3 className="text-lg font-semibold text-gray-900">Informasi Personal</h3>
						<p className="mt-2 text-gray-600">Jenis Kelamin: {detailAdmin.gender == 1 ? 'Pria' : 'Wanita'}</p>
						<p className="mt-2 text-gray-600">Telephone: {detailAdmin.telephone ?? '-'}</p>
						<p className="mt-2 text-gray-600">Whatsaap: {detailAdmin.whatsaap ?? '-'}</p>
						<p className="mt-2 text-gray-600">Alamat: {`${detailAdmin.address}.  ${regionDetailAdmin?.subdistrict_name || ''}, ${regionDetailAdmin?.city || ''}-${regionDetailAdmin?.province || ''}`}</p>

					</div>
					{/* Tombol Tutup */}
					<div className="mt-6">
						<button
							type="button"
							className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
							onClick={() => setIsOpen(false)}
						>
							Tutup
						</button>
					</div>
				</div>
			</Dialog>
		</Sidebar>

	)
}
