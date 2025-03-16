import {useEffect, useState} from 'react'
import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	TransitionChild,
} from '@headlessui/react'
import {
	Bars3Icon,
	BellIcon,
	ChatBubbleBottomCenterTextIcon,
	ChevronRightIcon,
	CircleStackIcon,
	ClockIcon,
	CreditCardIcon,
	DocumentDuplicateIcon,
	HomeIcon,
	ShoppingBagIcon,
	ShoppingCartIcon,
	TagIcon,
	UsersIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'
import {ChevronDownIcon} from '@heroicons/react/20/solid'
import Link from 'next/link'
import BreadCrumbsContained from '../navigation/breadcrumbsContained'
import {useRouter} from 'next/router'
import AdminMiddleware from '../adminMiddleware'
import {useDispatch, useSelector} from 'react-redux'
import {clearUser} from '@/redux/userSlice'
import {SweetAlertConfirm, SweetAlertSuccess} from '../sweetAlert'
import {logout} from '@/lib/fetchApi'
import {QuestionMarkCircleIcon} from '@heroicons/react/24/outline'

const navigation = [
	{name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon, current: false, slug: 'dashboard'},
	{
		name: 'Produk', icon: ShoppingBagIcon, current: false, slug: 'produk', children: [
			{name: 'List Produk', href: '/admin/produk/list', current: false},
			{name: 'Tambah Produk', href: '/admin/produk/tambah', current: false},]
	},
	{
		name: 'Kategori Produk', icon: TagIcon, href: '/admin/kategori/list', slug: 'kategori', current: false
	},
	{
		name: 'Order', icon: ShoppingCartIcon, current: false, slug: 'order', href: '/admin/order',
	},
	{name: 'Penjualan Produk', href: '/admin/penjualan', icon: CircleStackIcon, current: false, slug: 'penjualan'},
	{name: 'Laporan Penjualan', href: '/admin/laporan', icon: DocumentDuplicateIcon, current: false, slug: 'laporan'},
	{name: 'Ulasan', href: '/admin/ulasan', icon: ChatBubbleBottomCenterTextIcon, current: false, slug: 'ulasan'},
	{name: 'Faq', href: '/admin/faq', icon: QuestionMarkCircleIcon, current: false, slug: 'faq'},
	{
		name: 'Peramalan Penjualan', icon: ClockIcon, current: false, slug: 'peramalan', children: [
			{name: 'Pemodelan', href: '/admin/peramalan/pemodelan', current: false},
			{name: 'Peramalan', href: '/admin/peramalan/peramalan', current: false},
			{name: 'Data Training & Testing', href: '/admin/peramalan/traintest', current: false},
			// {name: 'Semua Metode', href: '/admin/peramalan/semua-metode', current: false},
		]
	},
	{
		name: 'Akun', icon: UsersIcon, current: false, slug: 'akun', children: [
			{name: 'Admin', href: '/admin/akun/admin/list'},
			{name: 'User', href: '/admin/akun/user/list'},
		]
	},
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export default function Sidebar({children, headingPage, pagesBreadcrumbs}) {
	const user = useSelector((state) => state.user.user)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const router = useRouter()
	const [updatedNavigation, setUpdatedNavigation] = useState(navigation)
	const dispatch = useDispatch()

	const handleLogout = () => {
		SweetAlertConfirm('Logout', 'anda akan logout', () => {
			logout((res) => {
				if(res.status == 200) {
					localStorage.removeItem('token')
					dispatch(clearUser())
					SweetAlertSuccess(res.data.message, '')
					router.push('/login')
				}
			})
		})
	}

	useEffect(() => {
		const newNavigation = navigation.map(item => {
			if(item.children) {
				const newChildren = item.children.map(child => ({
					...child,
					current: router.pathname.includes(child.slug),
				}))
				return {
					...item,
					current: router.pathname.includes(item.slug) || newChildren.some(child => child.current),
					children: newChildren,
				}
			}

			// Untuk item tanpa children
			return {
				...item,
				current: router.pathname.includes(item.slug), // Set current menjadi true jika href sama dengan pathname
			}
		})

		setUpdatedNavigation(newNavigation)
	}, [router.pathname])

	return (
		<AdminMiddleware>
			<div>
				<Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
					<DialogBackdrop
						transition
						className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
					/>
					<div className="fixed inset-0 flex">
						<DialogPanel
							transition
							className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
						>
							<TransitionChild>
								<div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
									<button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
										<span className="sr-only">Close sidebar</span>
										<XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
									</button>
								</div>
							</TransitionChild>
							{/* Sidebar component, swap this element with another sidebar if you like */}
							<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
								<Link href={'/'} className="flex h-16 shrink-0 items-center mt-5 w-max">
									<img
										alt="Faycook"
										src="/faycook/logo2.webp"
										className="h-20 rounded-lg"
									/>
								</Link>
								<nav className="flex flex-1 flex-col">
									<ul role="list" className="flex flex-1 flex-col gap-y-7">
										<li>
											<ul role="list" className="-mx-2 space-y-1">
												{updatedNavigation.map((item, index) => (
													<div key={item.name}>
														{index == 8 &&
															<>
																<div className="mt-7"><hr /></div>
																<div className='mt-3'></div>
															</>}
														<li >
															{!item.children ? (
																<Link
																	href={item.href}
																	className={classNames(
																		item.current
																			? 'bg-gray-50 text-indigo-600'
																			: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
																		'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
																	)}
																>
																	<item.icon
																		aria-hidden="true"
																		className={classNames(
																			item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
																			'h-6 w-6 shrink-0',
																		)}
																	/>
																	{item.name}
																</Link>
															) : (
																<Disclosure as="div">
																	<DisclosureButton
																		className={classNames(
																			item.current ? 'bg-gray-50 text-indigo-600' : 'hover:bg-gray-50',
																			'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 text-gray-700 hover:text-indigo-600',
																		)}
																	>
																		<item.icon
																			aria-hidden="true"
																			className={classNames(
																				item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
																				'h-6 w-6 shrink-0',
																			)}
																		/>
																		{item.name}
																		<ChevronRightIcon
																			aria-hidden="true"
																			className="ml-auto h-5 w-5 shrink-0 text-gray-400 group-data-[open]:rotate-90 group-data-[open]:text-gray-500"
																		/>
																	</DisclosureButton>
																	<DisclosurePanel as="ul" className="mt-1 px-2">
																		{item.children.map((subItem) => (
																			<li key={subItem.name}>
																				<Link
																					href={subItem.href}
																					className={classNames(
																						subItem.current ? 'bg-gray-50' : 'hover:bg-gray-50',
																						'block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-700',
																					)}
																				>
																					{subItem.name}
																				</Link>
																			</li>
																		))}
																	</DisclosurePanel>
																</Disclosure>
															)}
														</li>
													</div>
												))}
											</ul>
										</li>
									</ul>
								</nav>
							</div>
						</DialogPanel>
					</div>
				</Dialog>

				{/* Static sidebar for desktop */}
				<div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
					{/* Sidebar component, swap this element with another sidebar if you like */}
					<div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
						<Link href={'/'} className="flex h-16 shrink-0 items-center mt-5 w-max">
							<img
								alt="Faycook"
								src="/faycook/logo2.webp"
								className="h-20 rounded-lg w-auto"
							/>
						</Link>
						<nav className="flex flex-1 flex-col">
							<ul role="list" className="flex flex-1 flex-col gap-y-7">
								<li>
									<ul role="list" className="-mx-2 space-y-1">
										{updatedNavigation.map((item, index) => (
											<div key={index + item.name}>
												{index == 8 &&
													<div>
														<div className="mt-7"><hr /></div>
														<div className='mt-3'></div>
													</div>}
												<li>
													{!item.children ? (
														<Link
															href={item.href}
															className={classNames(
																item.current
																	? 'bg-gray-50 text-indigo-600'
																	: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
																'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
															)}
														>
															<item.icon
																aria-hidden="true"
																className={classNames(
																	item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
																	'h-6 w-6 shrink-0',
																)}
															/>
															{item.name}
														</Link>
													) : (
														<Disclosure as="div">
															<DisclosureButton
																className={classNames(
																	item.current ? 'bg-gray-50 text-indigo-600' : 'hover:bg-gray-50',
																	'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 text-gray-700 hover:text-indigo-600',
																)}
															>
																<item.icon
																	aria-hidden="true"
																	className={classNames(
																		item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
																		'h-6 w-6 shrink-0',
																	)}
																/>
																{item.name}
																<ChevronRightIcon
																	aria-hidden="true"
																	className="ml-auto h-5 w-5 shrink-0 text-gray-400 group-data-[open]:rotate-90 group-data-[open]:text-gray-500"
																/>
															</DisclosureButton>
															<DisclosurePanel as="ul" className="mt-1 px-2">
																{item.children.map((subItem, index) => (
																	<li key={index + subItem.name}>
																		<Link
																			href={subItem.href}
																			className={classNames(
																				subItem.current ? 'bg-gray-50' : 'hover:bg-gray-50',
																				'block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-700',
																			)}
																		>
																			{subItem.name}
																		</Link>
																	</li>
																))}
															</DisclosurePanel>
														</Disclosure>
													)}
												</li>
											</div>
										))}
									</ul>
								</li>
							</ul>
						</nav>
					</div>
				</div>

				<div className="lg:pl-72">
					<div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
						<button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
							<span className="sr-only">Open sidebar</span>
							<Bars3Icon aria-hidden="true" className="h-6 w-6" />
						</button>
						{/* Separator */}
						<div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden" />

						<div className="flex justify-between flex-1 gap-x-4 self-stretch lg:gap-x-6">
							<h1 className='-m-1.5 flex items-center p-1.5 font-bold text-xl'>{headingPage}</h1>
							<div className="flex items-center gap-x-4 lg:gap-x-6">
								<div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
								<Menu as="div" className="relative">
									<MenuButton className="-m-1.5 flex items-center p-1.5">
										<span className="sr-only">Open user menu</span>
										<img
											alt={user?.name}
											src={user?.image ?? '/faycook/images/avatar-polos.webp'}
											className="h-8 w-8 rounded-full bg-gray-50"
										/>
										<span className="hidden lg:flex lg:items-center">
											<span aria-hidden="true" className="ml-4 text-sm font-semibold leading-6 text-gray-900">
												{user?.username}
											</span>
											<ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
										</span>
									</MenuButton>
									<MenuItems
										transition
										className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
									>
										<MenuItem >
											<Link
												href='/admin/profil'
												className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
											>
												Profil
											</Link>
										</MenuItem>
										<MenuItem >
											<a
												href='#'
												className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
												onClick={() => handleLogout()}
											>
												Logout
											</a>
										</MenuItem>
									</MenuItems>
								</Menu>
							</div>
						</div>
					</div>

					<main className="bg-neutral-50">
						{/* <div className='px-3 pt-3 sm:px-6 lg:px-4 flex justify-end'>
							<BreadCrumbsContained pages={pagesBreadcrumbs} />
						</div> */}
						<div className="pb-10 pt-7 px-4 sm:px-6 lg:px-8">{children}</div>
					</main>
				</div>
			</div>
		</AdminMiddleware>
	)
}
