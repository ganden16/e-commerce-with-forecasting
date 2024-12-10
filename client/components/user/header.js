import {useState} from 'react'
import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	PopoverGroup,
} from '@headlessui/react'
import {
	Bars3Icon,
	ShoppingBagIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'
import {ChevronDownIcon, UserCircleIcon, } from '@heroicons/react/20/solid'
import Link from 'next/link'
import {SweetAlertConfirm, SweetAlertSuccess} from '../sweetAlert'
import {logout} from '@/lib/fetchApi'
import {useRouter} from 'next/router'
import {useDispatch, useSelector} from 'react-redux'
import {clearUser} from '@/redux/userSlice'

const navigation = {
	pages: [
		{name: 'Produk', href: '/produk'},
		{name: 'Kategori', href: '/kategori'},
		// {name: 'Tentang Kami', href: '/tentang-kami'},
		{name: 'Faq', href: '/faq'},
		// {name: 'Ulasan', href: '/ulasan'},
	],
}

export default function HeaderUser() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const router = useRouter()
	const dispatch = useDispatch()

	const user = useSelector((state) => state.user.user)
	const carts = useSelector((state) => state.cart.cart)
	const totalCartQuantity = carts?.reduce((total, cart) => total + cart.quantity, 0)

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

	return (
		<>
			<Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="relative z-40 lg:hidden">
				<DialogBackdrop
					transition
					className="absolute bg-black bg-opacity-25 transition-opacity duration-200 ease-linear data-[closed]:opacity-0"
				/>

				<div className="fixed inset-0 z-40 flex">
					<DialogPanel
						transition
						className="relative border-t border-r border-b border-gray-100 flex w-full max-w-52 transform flex-col overflow-y-hidden bg-gray-800 opacity-95 pb-12 shadow-xl transition duration-200 ease-in-out data-[closed]:-translate-x-full"
					>
						{/* Logo Section */}
						<div className="flex items-start px-2 py-2">
							<Link href="/" className="lg:hidden">
								<span className="sr-only">Your Company</span>
								<img
									alt="Faycook"
									src="/faycook/logo2.webp"
									className="h-16 w-auto m-auto text-white rounded-lg"
								/>
							</Link>
						</div>

						<div className="space-y-6 border-t border-gray-200 px-4 py-6">
							{navigation.pages.map((page) => (
								<div key={page.name} className="flow-root">
									<Link href={page.href} className="-m-2 block p-2 font-medium text-white">
										{page.name}
									</Link>
								</div>
							))}
						</div>
					</DialogPanel>
					{/* Close Button */}
					<div className="relative top-0 right-10 mt-5">
						<button
							type="button"
							onClick={() => setMobileMenuOpen(false)}
							className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
						>
							<span className="sr-only">Close menu</span>
							<XMarkIcon aria-hidden="true" className="h-6 w-6" />
						</button>
					</div>
				</div>
			</Dialog>

			{/* Hero section */}
			<div className="relative bg-gray-900">
				<div aria-hidden="true" className="absolute inset-0 bg-gray-900 opacity-50" />
				{/* Navigation */}
				<header className="fixed w-screen z-10">
					<nav aria-label="Top">
						{/* Secondary navigation */}
						<div className="bg-gray-800 bg-opacity-95">
							<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:pe-8 lg:pl-2">
								<div>
									<div className="flex h-20 items-center justify-between">
										{/* Logo (lg+) */}
										<div className="hidden lg:flex lg:flex-1 lg:items-center">
											<Link href="/">
												<span className="sr-only">Your Company</span>
												<img
													alt="Faycook"
													src="/faycook/logo2.webp"
													className="h-16 w-auto text-white rounded-lg"
												/>
											</Link>
										</div>

										<div className="hidden h-full lg:flex md:flex">
											{/* Flyout menus */}
											<PopoverGroup className="inset-x-0 bottom-0 px-4">
												<div className="flex h-full justify-center space-x-8">
													{navigation.pages.map((page) => (
														<Link
															key={page.name}
															href={page.href}
															className="flex items-center text-sm font-medium text-white"
														>
															{page.name}
														</Link>
													))}
												</div>
											</PopoverGroup>
										</div>

										{/* Mobile menu and search (lg-) */}
										<div className="flex flex-1 items-center lg:hidden md:hidden">
											<button type="button" onClick={() => setMobileMenuOpen(true)} className="-ml-2 p-2 text-white">
												<span className="sr-only">Open menu</span>
												<Bars3Icon aria-hidden="true" className="h-6 w-6" />
											</button>
										</div>

										{/* Logo (lg-) */}
										<div className="flex flex-1 items-center justify-end">
											<div className="flex items-center lg:ml-8">
												{user?.id ?
													<>
														{!user.is_admin &&
															<div className="ml-4 flow-root lg:ml-8">
																<Link href="/keranjang" className="group -m-2 flex items-center p-2">
																	<ShoppingBagIcon aria-hidden="true" className="h-6 w-6 flex-shrink-0 text-white" />
																	<span className="ml-2 text-sm font-medium text-white">{totalCartQuantity}</span>
																</Link>
															</div>
														}
														<div className="ml-4 flow-root lg:ml-8 relative">
															<Menu>
																<MenuButton className="group -m-2 flex items-center p-2">
																	<img
																		src={user?.image ?? '/faycook/images/avatar-polos.webp'}
																		alt="User profile"
																		className="h-12 w-12 rounded-full object-cover"
																	/>
																	<ChevronDownIcon className="ml-1 h-5 w-5 text-white" aria-hidden="true" />
																</MenuButton>
																<MenuItems className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-gray-600 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
																	<MenuItem>
																		{({active}) => (
																			<Link
																				href={user.is_admin == 0 ? "/profil" : "/admin/profil"}
																				className={`block px-4 py-2 text-sm text-white ${active ? 'bg-gray-700' : ''}`}
																			>
																				Profil
																			</Link>
																		)}
																	</MenuItem>
																	<MenuItem>
																		{({active}) => (
																			<Link
																				href={user.is_admin == 0 ? "/orderan-saya" : "/admin"}
																				className={`block px-4 py-2 text-sm text-white ${active ? 'bg-gray-700' : ''}`}
																			>
																				{user.is_admin == 0 ? "Orderan Saya" : "Dashboard"}
																			</Link>
																		)}
																	</MenuItem>
																	<MenuItem>
																		{({active}) => (
																			<a
																				href="#"
																				className={`block px-4 py-2 text-sm text-white ${active ? 'bg-gray-700' : ''}`}
																				onClick={() => handleLogout()}
																			>
																				Logout
																			</a>
																		)}
																	</MenuItem>
																</MenuItems>
															</Menu>
														</div>
													</>
													:
													<div className="ml-4 flow-root lg:ml-8 relative">
														<Menu>
															<MenuButton className="group -m-2 flex items-center p-2">
																<UserCircleIcon aria-hidden="true" className="h-10 w-10 flex-shrink-0 text-white" />
																<ChevronDownIcon className="ml-1 h-5 w-5 text-white" aria-hidden="true" />
															</MenuButton>
															<MenuItems className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-gray-600 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
																<MenuItem>
																	{({active}) => (
																		<Link
																			href="/login"
																			className={`block px-4 py-2 text-sm text-white ${active ? 'bg-gray-700' : ''}`}
																		>
																			Login
																		</Link>
																	)}
																</MenuItem>
																<MenuItem>
																	{({active}) => (
																		<Link
																			href="/daftar"
																			className={`block px-4 py-2 text-sm text-white ${active ? 'bg-gray-700' : ''}`}
																		>
																			Daftar Akun
																		</Link>
																	)}
																</MenuItem>
															</MenuItems>
														</Menu>
													</div>
												}

											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</nav>
				</header>
			</div>
		</>
	)
}
