import Link from "next/link"
import {useSelector} from "react-redux"

const footerNavigation = [
	{
		name: 'Landing Page',
		menus: [
			{item: 'Landing Page', href: '/'},
		],
	},
	{
		name: 'Utama',
		menus: [
			{item: 'Produk', href: '/produk'},
			{item: 'Kategori', href: '/kategori'},
			// {item: 'Tentang Kami', href: '/tentang-kami'},
			{item: 'Faq', href: '/faq'},
		],
	},
]

const footerNavigationGuest = [
	...footerNavigation,
	{
		name: 'Otentikasi',
		menus: [
			{item: 'Login', href: '/login'},
			{item: 'Daftar Akun', href: '/register'},
		],
	},
]

const footerNavigationUser = [
	...footerNavigation,
	{
		name: 'Saya',
		menus: [
			{item: 'Profil', href: '/profil'},
			{item: 'Keranjang', href: '/keranjang'},
			{item: 'Orderan Saya', href: '/orderan-saya'},
		],
	},
]

export default function FooterUser() {
	const brandApp = process.env.NEXT_PUBLIC_APP_BRAND
	const user = useSelector((state) => state.user.user)
	const navigation = user?.id ? footerNavigationUser : footerNavigationGuest

	return (
		<footer aria-labelledby="footer-heading" className="bg-gray-900">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Menu Section in One Full Row */}
				<div className="py-10 border-b border-gray-800">
					<div className="flex justify-between space-x-8">
						{navigation.map((footer) => (
							<div key={footer.name}>
								<h3 className="text-sm font-semibold text-white">{footer.name}</h3>
								<ul className="mt-4 space-y-2">
									{footer.menus.map((menu) => (
										<li key={menu.href}>
											<Link href={menu.href}>
												<span className="text-sm text-gray-300 hover:text-white">
													{menu.item}
												</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				<div className="border-t border-gray-800 py-6 text-center">
					<p className="text-sm text-gray-400">&copy; 2024 {brandApp}.</p>
				</div>
			</div>
		</footer>
	)
}
