import {useEffect, useState} from 'react'
import {CheckIcon, ChevronRightIcon, ClockIcon} from '@heroicons/react/20/solid'
import HeaderUser from '@/components/user/header'
import FooterUser from '@/components/user/footer'
import AuthMiddleware from '@/components/authMiddleware'
import {deleteCart, getAllCarts, updateCart} from '@/lib/fetchApi'
import {SweetAlertConfirm} from '@/components/sweetAlert'
import {useDispatch, useSelector} from 'react-redux'
import {setCart} from '@/redux/cartSlice'
import Link from 'next/link'
import {formatRupiah} from '@/helper/formater'
import {Router, useRouter} from 'next/router'

const steps = [
	{name: 'Produk', href: '/produk', status: 'current'},
	{name: 'Keranjang', href: '/keranjang', status: 'current'},
	{name: 'Checkout', href: '/checkout', status: ''},
	{name: 'Pembayaran', href: '/pembayaran', status: ''},
]

export default function IndexKeranjang() {
	const carts = useSelector((state) => state.cart.cart)
	const dispatch = useDispatch()
	const [subTotal, setSubTotal] = useState(null)
	const router = useRouter()

	const handleQuantityChange = (cartId, value) => {
		value = parseInt(value, 10)

		if(Number.isInteger(value) && value >= 1) {
			updateCart({
				cartId,
				quantity: value
			}, (res) => {
				const newCarts = carts.map((cart) => cart.id == cartId ? {...cart, quantity: value} : cart)
				dispatch(setCart(newCarts))
			}, (err) => {})
		}
	}

	const removeCartItem = (cartItem) => {
		SweetAlertConfirm(`Hapus ${cartItem.product.name} dari keranjang?`, '', () => {
			deleteCart(cartItem.id, () => {
				const newCarts = carts.filter((cart) => cart.id != cartItem.id)
				dispatch(setCart(newCarts))
			}, () => {})
		})
	}

	useEffect(() => {
		if(carts) {
			const cartsReadyStock = carts.filter((cart) => cart.product.isReadyStock)
			const countSubTotal = cartsReadyStock.reduce((total, cart) => {
				return total + cart.product.price * cart.quantity
			}, 0)

			setSubTotal(countSubTotal)
		}
	}, [carts])
	return (
		<AuthMiddleware>
			<HeaderUser />
			<div className="bg-white mb-5 sm:px-6 lg:px-8 pt-20">
				<header className="relative border-b border-gray-200 bg-white text-sm font-medium text-gray-700">
					<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
						<div className="relative flex">
							<a href="#" className="absolute left-0 top-1/2 -mt-4">
								<span className="sr-only">Your Company</span>
								<img
									alt=""
									src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
									className="h-8 w-auto"
								/>
							</a>
							<nav aria-label="Progress" className="block">
								<ol role="list" className="flex space-x-4">
									{steps.map((step, stepIdx) => (
										<li key={step.name} className="flex items-center">
											{step.status === 'current' ? (
												<Link href={step.href} aria-current="page" className="text-indigo-600">
													{step.name}
												</Link>
											) : (
												<Link href={step.href}>{step.name}</Link>
											)}

											{stepIdx !== steps.length - 1 ? (
												<ChevronRightIcon aria-hidden="true" className="ml-4 h-5 w-5 text-gray-300" />
											) : null}
										</li>
									))}
								</ol>
							</nav>
						</div>
					</div>
				</header>
				<main>
					<div className="mx-auto max-w-7xl px-4 ">
						<div className="mx-auto max-w-4xl">
							<h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-5">Keranjang Belanja</h1>

							<form className="mt-12">
								<section aria-labelledby="cart-heading">
									<h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

									<ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200 rounded-lg">
										{carts?.map((cart, index) => (
											<li key={cart.id} className={`flex py-6 sm:py-10 items-center bg-gray-100 px-4 rounded-lg mt-3 ${!cart.product.isReadyStock && 'opacity-50 cursor-not-allowed bg-gray-50'}`}>
												<Link href={'/produk/detail/' + cart.product.id} className="flex-shrink-0">
													<img
														alt={cart.product.name}
														src={cart.product.image}
														className="h-24 w-24 rounded-lg object-cover object-center sm:h-32 sm:w-32"
													/>
												</Link>

												<div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
													<div className="flex justify-between items-center">
														<div>
															<h3 className="text-sm mb-1">
																<Link href={'/produk/detail/' + cart.product.id} className="font-medium text-gray-700 hover:text-gray-800">
																	{cart.product.name}
																</Link>
															</h3>
															{cart.product.isReadyStock ? (
																<>
																	<span className="text-green-500 mr-1 text-xs">✔</span>
																	<span className="text-green-500 text-xs">Tersedia</span>

																</>
															)
																:
																<>
																	<span className="text-red-500 mr-1 text-xs">✘</span>
																	<span className="text-red-500 text-xs">Tidak Tersedia</span>
																</>
															}
														</div>
														<p className="text-right text-sm font-medium text-gray-900">{formatRupiah(cart.product.price)}</p>
													</div>

													{/* Bagian Input Quantity, Tombol Minus, Plus, dan Remove */}
													<div className="flex justify-center items-center mt-4 space-x-2">
														{/* Tombol minus */}
														<button
															type="button"
															onClick={() => handleQuantityChange(cart.id, cart.quantity - 1)}
															disabled={!cart.product.isReadyStock}
															className={`px-3 py-1 rounded-md border border-gray-300 bg-red-600 text-white hover:bg-red-700 focus:outline-none ${cart.product.isReadyStock ? '' : 'cursor-not-allowed'}`}
														>
															-
														</button>

														{/* Input Quantity */}
														<input
															// type="number"
															id={`quantity-${cart.id}`}
															name={`quantity-${cart.id}`}
															value={cart.quantity}
															onChange={(e) => handleQuantityChange(cart.id, e.target.value)}
															className={`w-16 text-center rounded-md border border-gray-300 py-2 text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${cart.product.isReadyStock ? '' : 'cursor-not-allowed'}`}
															onFocus={(e) => e.target.select()}
															min="1"
															step={'1'}
															disabled={!cart.product.isReadyStock}
														/>

														{/* Tombol plus */}
														<button
															type="button"
															onClick={() => handleQuantityChange(cart.id, cart.quantity + 1)}
															className={`px-3 py-1 rounded-md border border-gray-300 bg-green-600 text-white hover:bg-green-700 focus:outline-none ${cart.product.isReadyStock ? '' : 'cursor-not-allowed'}`}
															disabled={!cart.product.isReadyStock}

														>
															+
														</button>
													</div>

													{/* Tombol Hapus */}
													<div className='w-max text-center'>
														<a
															href="#"
															onClick={() => removeCartItem(cart)}
															className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
														>
															Hapus
														</a>
													</div>
												</div>
											</li>
										))}
									</ul>
								</section>

								{/* Order summary */}
								<section className="mt-10 lg:px-28 md:px-20">
									<div>
										<dl className="space-y-4">
											<div className="flex items-center justify-between">
												<dt className="text-base font-medium text-gray-900">Subtotal</dt>
												<dd className="ml-4 text-base font-medium text-gray-900">{formatRupiah(subTotal)}</dd>
											</div>
										</dl>
										<p className="mt-4 text-xs text-gray-400">Ongkos kirim dan biaya lainnya akan dihitung saat checkout</p>
									</div>

									<div className="mt-10">
										<button
											type="button"
											className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
											onClick={() => router.push('/checkout')}
										>
											Checkout
										</button>
									</div>

									<div className="mt-6 text-center text-sm text-gray-500">
										<p>
											atau {' '}
											<Link href="/produk" className="font-medium text-indigo-600 hover:text-indigo-500">
												Lanjutkan belanja
												<span aria-hidden="true"> &rarr;</span>
											</Link>
										</p>
									</div>
								</section>
							</form>
						</div>
					</div>
				</main>
			</div>
			<FooterUser />
		</AuthMiddleware>
	)
}
