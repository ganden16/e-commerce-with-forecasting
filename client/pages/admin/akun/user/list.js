import react, {useEffect, useState} from 'react'
import Sidebar from '@/components/admin/sidebar'
import {Dialog} from '@/components/catalyst/dialog'
import {DialogBackdrop, DialogPanel} from '@headlessui/react'
import {ChevronRightIcon, PlusIcon} from '@heroicons/react/20/solid'
import {useRouter} from 'next/router'
import {getAllUsers, getSubdistrict} from '@/lib/fetchApi'

export default function IndexUser() {
	const [isOpen, setIsOpen] = useState(false)
	const [users, setUsers] = useState([])
	const [detailUser, setDetailUser] = useState({})
	const [regionDetailUser, setRegionDetailUser] = useState(null)

	useEffect(() => {
		getAllUsers((res) => setUsers(res.data))
	}, [])
	useEffect(() => {
		getSubdistrict('', detailUser.subdistrict_id, (res) => {
			setRegionDetailUser(res.data)
		}, (err) => {})
	}, [detailUser])

	return (
		<Sidebar headingPage="List Pelanggan">
			<div>
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-xl font-bold text-gray-900">Data Pelanggan</h1>
				</div>
				<ul className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
					{users?.length > 0 && users?.map((user) => (
						<li
							key={user.email}
							className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 cursor-pointer"
							onClick={() => {
								setDetailUser(user)
								setRegionDetailUser(null)
								setIsOpen(true)
							}}
						>
							<div className="flex min-w-0 gap-x-4">
								<img
									alt="user"
									src={user.image ?? '/faycook/images/avatar-polos.webp'}
									className="h-12 w-12 flex-none rounded-full bg-gray-50"
								/>
								<div className="min-w-0 flex-auto">
									<p className="text-sm font-semibold leading-6 text-gray-900">
										<p>
											<span className="absolute inset-x-0 -top-px bottom-0" />
											{user.name}
										</p>
									</p>
									<p className="mt-1 flex text-xs leading-5 text-gray-500">
										<a href={`mailto:${user.email}`} className="relative truncate hover:underline">
											{user.email}
										</a>
									</p>
								</div>
							</div>
							<div className="flex shrink-0 items-center gap-x-4">
								<div className="hidden sm:flex sm:flex-col sm:items-end">
									<p className="text-sm leading-6 text-gray-900">{user.is_admin == 0 ? user.username : ''}</p>
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
							alt={detailUser.name}
							src={detailUser.image ? detailUser.image : '/faycook/images/avatar-polos.webp'}
							className="h-24 w-24 rounded-full border-2 border-blue-500"
						/>
						<div className="ml-4">
							<h2 className="text-2xl font-bold text-gray-900">{detailUser.name}</h2>
							<p className="text-sm text-gray-500">{detailUser.username}</p>
							<p className="text-sm text-gray-500">{detailUser.email}</p>
						</div>
					</div>
					<div className="mt-6">
						<h3 className="text-lg font-semibold text-gray-900">Informasi Personal</h3>
						<p className="mt-2 text-gray-600">Jenis Kelamin: {detailUser.gender == 1 ? 'Pria' : 'Wanita'}</p>
						<p className="mt-2 text-gray-600">Telephone: {detailUser.telephone ?? '-'}</p>
						<p className="mt-2 text-gray-600">Whatsaap: {detailUser.whatsaap ?? '-'}</p>
						<p className="mt-2 text-gray-600">Alamat: {`${detailUser.address}.  ${regionDetailUser?.subdistrict_name || ''}, ${regionDetailUser?.city || ''}-${regionDetailUser?.province || ''}`}</p>

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
