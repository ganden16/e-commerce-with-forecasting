import {ChevronRightIcon, ChevronUpIcon} from '@heroicons/react/20/solid'
import {Description, Dialog, DialogBackdrop, DialogTitle, Popover, PopoverBackdrop, PopoverButton, PopoverOverlay, PopoverPanel} from '@headlessui/react'
import AuthMiddleware from '@/components/authMiddleware'
import {useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {formatRupiah} from '@/helper/formater'
import {createOrder, getAllCarts, getAllProvinces, getCityByProvinceId, getDistrictByCityId, getSubdistrict, getSubdistrictByDistrictId, shipmentCost} from '@/lib/fetchApi'
import Link from 'next/link'
import {SweetAlertConfirm, SweetAlertError, SweetAlertSuccess} from '@/components/sweetAlert'
import {ClipLoader} from 'react-spinners'
import {Router, useRouter} from 'next/router'
import {setCart} from '@/redux/cartSlice'
import MidtransPayment from '@/components/user/snapPay'
import Swal from 'sweetalert2'

const steps = [
	{name: 'Produk', href: '/produk', status: 'current'},
	{name: 'Keranjang', href: '/keranjang', status: 'current'},
	{name: 'Checkout', href: '/checkout', status: 'current'},
	{name: 'Pembayaran', href: '#', status: ''},
]

export default function Checkout() {
	const router = useRouter()
	const dispatch = useDispatch()
	const [loadingSelectedRegionFirst, setLoadingSelectedRegionFirst] = useState(true)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [cartProducts, setCartProducts] = useState(null)
	const cart = useSelector((state) => state.cart.cart)
	const user = useSelector((state) => state.user.user)
	const [errors, setErrors] = useState()
	const formRef = useRef({})
	const [provinces, setProvinces] = useState(null)
	const [cities, setCities] = useState(null)
	const [district, setDistrict] = useState(null)
	const [subdistrict, setSubdistrict] = useState(null)
	const initialSelectedRegion = {
		province_id: null,
		city_id: null,
		district_id: null,
		subdistrict_id: null,
	}
	const [selectedRegion, setSelectedRegion] = useState(initialSelectedRegion)
	const [courierList, setCourierList] = useState(null)
	const [selectedCourier, setSelectedCourier] = useState(null)
	const [loadingChooseCourier, setLoadingChooseCourier] = useState(false)
	const [snapToken, setSnapToken] = useState(null)
	const [orderCode, setOrderCode] = useState(null)

	const handleProvinceChange = (event) => {
		setSelectedRegion((prevState) => ({
			province_id: event.target.value,
			city_id: null,
			district_id: null,
			subdistrict_id: null
		}))
	}

	const handleCityChange = (event) => {
		setSelectedRegion((prevState) => ({
			...prevState,
			city_id: event.target.value,
			district_id: null,
			subdistrict_id: null
		}))
	}

	const handleDistrictChange = (event) => {
		setSelectedRegion((prevState) => ({
			...prevState,
			district_id: event.target.value,
			subdistrict_id: null,
		}))
	}

	const handleSubdistrictChange = (event) => {
		setSelectedRegion((prevState) => ({
			...prevState,
			subdistrict_id: event.target.value,
		}))
	}

	useEffect(() => {
		if(cart) {
			const inStockProducts = cart.filter(cartItem => cartItem.product.isReadyStock)
			setCartProducts(inStockProducts)
		}
	}, [cart])

	useEffect(() => {
		getAllProvinces((res) => {
			setProvinces(res.data)
		}, (err) => {})
		setSelectedRegion({
			province_id: user.province_id ?? null,
			city_id: user.city_id ?? null,
			district_id: user.district_id ?? null,
			subdistrict_id: user.subdistrict_id ?? null,
		})
		setLoadingSelectedRegionFirst(false)

		// const scriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'
		// // const scriptUrl = 'https://app.midtrans.com/snap/snap.js'
		// const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY // Ganti dengan client key Midtrans Anda

		// const scriptTag = document.createElement('script')
		// scriptTag.src = scriptUrl
		// scriptTag.setAttribute('data-client-key', clientKey)
		// scriptTag.async = true
		// document.body.appendChild(scriptTag)

		// return () => {
		// 	document.body.removeChild(scriptTag)
		// }
	}, [])

	useEffect(() => {
			if(selectedRegion?.province_id) {
				getCityByProvinceId(selectedRegion.province_id, (res) => {
					setCities(res.data)
				}, (err) => {
	
				})
			}
		}, [selectedRegion.province_id])
	
		useEffect(() => {
			if(selectedRegion?.city_id) {
				getDistrictByCityId(selectedRegion.city_id, (res) => {
					setDistrict(res.data)
				}, (err) => {
	
				})
			}
	
		}, [selectedRegion.city_id])
	
		useEffect(() => {
			if(selectedRegion?.district_id) {
				getSubdistrictByDistrictId(selectedRegion.district_id, (res) => {
					setSubdistrict(res.data)
				}, (err) => {
	
				})
			}
	
		}, [selectedRegion.district_id])
	
		useEffect(() => {
			if (selectedRegion?.subdistrict_id && subdistrict) {
			  const selectedSubdistrict = subdistrict.find(sub => 
					Number(sub.id) === Number(selectedRegion.subdistrict_id)
			  )
			  if (selectedSubdistrict) {
					formRef.current.postal_code.value = selectedSubdistrict.zip_code
			  }
		 }
	
		}, [selectedRegion.subdistrict_id])

	const handleClickChooseCourier = () => {
		setLoadingChooseCourier(true)

		const totalWeight = cartProducts.reduce((accumulator, cartItem) => {
			return accumulator + (cartItem.product.weight * cartItem.quantity)
		}, 0)
		shipmentCost({
			destination: selectedRegion.district_id,
			weight: totalWeight
		}, (res) => {
			const filteredCourierList = res.data.filter((courier) => {
				if(courier.service == 'GOKIL' && totalWeight < 10000) return false
				return true
			})
			console.log('filteredCourierList',filteredCourierList)
			console.log('res.data',res.data)
			setCourierList(filteredCourierList)
			setLoadingChooseCourier(false)
			setIsModalOpen(true)
		}, (err) => {
			SweetAlertError('Error')
			setLoadingChooseCourier(false)
		})
	}

	const subtotal = cartProducts?.reduce((accumulator, cartItem) => {
		return accumulator + (cartItem.product.price * cartItem.quantity)
	}, 0)
	const ongkir = selectedCourier?.cost
	const appFee = 1000
	const total = subtotal + ongkir + appFee

	let cheapestCourier = null

	if(courierList) {
		courierList.forEach(courier => {
			if(!cheapestCourier || courier.cost < cheapestCourier.cost) {
				cheapestCourier = {
					name: courier.name,
					service: courier.service,
					cost: courier.cost,
				}
			}
		})
	}

	const handleCheckout = () => {
		if(cartProducts.length <= 0 || !cartProducts) {
			SweetAlertError('Silahkan pilih produk yang tersedia')
			router.push('/keranjang')
			return
		}
		if(!selectedCourier?.name) {
			SweetAlertError('Silahkan pilih kurir dulu')
		} else {
			SweetAlertConfirm('Apakah semua data sudah benar', 'setelah ini anda akan diarahkan ke pembayaran', () => {
				createOrder({
					name: formRef.current.name.value,
					whatsaap: formRef.current.whatsaap.value,
					telephone: formRef.current.telephone.value,
					email: formRef.current.email.value,
					gross_amount: total,
					details: cartProducts.map((item) => ({
						product_id: item.product.id,
						product_name: item.product.name,
						quantity: item.quantity,
						price: item.product.price,
					})),
					shipping_cost: ongkir,
					courier_name: selectedCourier.name,
					courier_service: selectedCourier.service,
					courier_description: selectedCourier.description,
					province: provinces.find(prov => prov.id === parseInt(selectedRegion.province_id))?.name,
					city: cities.find(city => city.id === parseInt(selectedRegion.city_id))?.name,
					district: district.find(dis => dis.id === parseInt(selectedRegion.district_id))?.name,
					subdistrict: subdistrict.find(sub => sub.id === parseInt(selectedRegion.subdistrict_id))?.name,
					postal_code: formRef.current.postal_code.value,
					address: formRef.current.address.value,
					address_detail: formRef.current.address_detail.value,

				}, (res) => {
					setSnapToken(res.data.snap_token)
					setOrderCode(res.data.order_code)
					getAllCarts((res) => {
						dispatch(setCart(res.data))
					}, (err) => {})
				}, (err) => {
					if(err.response.status == 422) {
						SweetAlertError('Periksa form input, jangan ada yang kosong')
						setErrors(err.response.data.errors)
					}
					if(err.response.status == 500) {
						SweetAlertError('500')
					}
				})
			})
		}
	}

	return (
		<AuthMiddleware>
			<div className="bg-white">
				{/* Background color split screen for large screens */}
				<div aria-hidden="true" className="fixed left-0 top-0 hidden h-full w-1/2 bg-white lg:block" />
				<div aria-hidden="true" className="fixed right-0 top-0 hidden h-full w-1/2 bg-gray-50 lg:block" />

				<header className="relative border-b border-gray-200 bg-white text-sm font-medium text-gray-700">
					<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
						<div className="relative flex justify-center">
							<a href="#" className="absolute left-0 top-1/2 -mt-4">
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

				<main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 xl:gap-x-48">
					<h1 className="sr-only">Order information</h1>

					<section
						aria-labelledby="summary-heading"
						className="bg-gray-50 px-4 pb-10 pt-16 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
					>
						<div className="mx-auto max-w-lg lg:max-w-none">
							<h2 id="summary-heading" className="text-lg mb-5 font-bold text-gray-900">
								Ringkasan Orderan
							</h2>

							<ul role="list" className="divide-y divide-gray-200 text-sm font-medium text-gray-900">
								{cartProducts?.map((cart) => (
									<li key={cart.id + 'cart'} className="flex items-start space-x-4 py-6">
										<img
											alt={cart.product.name}
											src={cart.product.image}
											className="h-20 w-20 flex-none rounded-md object-cover object-center"
										/>
										<div className="flex-auto space-y-1">
											<h3>{cart.product.name}</h3>
											<p className="text-gray-500">{cart.product.weight} gram</p>
											<div>
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
										</div>
										<p className="text-base font-medium">{formatRupiah(cart.product.price)}</p>
										<p className="text-xs text-gray-600 font-semibold">{cart.quantity}x</p>
									</li>
								))}
							</ul>

							<dl className="hidden space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-900 lg:block">
								<div className="flex items-center justify-between">
									<dt className="text-gray-600">Subtotal</dt>
									<dd>{formatRupiah(subtotal)}</dd>
								</div>

								<div className="flex items-center justify-between">
									<dt className="text-gray-600">Ongkos Kirim</dt>
									{selectedCourier ? (
										<dd>{formatRupiah(ongkir)}</dd>
									) : (
										<dd
											className='cursor-pointer text-blue-700 hover:underline'
											onClick={() => {
												selectedRegion.subdistrict
													? handleClickChooseCourier()
													: SweetAlertError('Silahkan pilih kecamatan pengiriman dahulu')
											}}
										>
											{loadingChooseCourier ? (
												<ClipLoader />
											) : (
												'Pilih Kurir'
											)}
										</dd>
									)}
								</div>


								<div className="flex items-center justify-between">
									<dt className="text-gray-600">Biaya Aplikasi</dt>
									<dd>{formatRupiah(appFee)}</dd>
								</div>

								<div className="flex items-center justify-between border-t border-gray-200 pt-6">
									<dt className="text-base">Total</dt>
									<dd className="text-base">{selectedCourier ? formatRupiah(total) : ''}</dd>
								</div>
							</dl>

							<Popover className="fixed inset-x-0 bottom-0 flex flex-col-reverse text-sm font-medium text-gray-900 lg:hidden">
								<div className="relative z-10 border-t border-gray-200 bg-white px-4 sm:px-6">
									<div className="mx-auto max-w-lg">
										<PopoverButton className="flex w-full items-center py-6 font-medium">
											<span className="mr-auto text-base">Total</span>
											<span className="mr-2 text-base">{selectedCourier ? formatRupiah(total) : ''}</span>
											<ChevronUpIcon aria-hidden="true" className="h-5 w-5 text-gray-500" />
										</PopoverButton>
									</div>
								</div>

								<PopoverBackdrop
									transition
									className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
								/>

								<PopoverPanel
									transition
									className="relative transform bg-white px-4 py-6 transition duration-300 ease-in-out data-[closed]:translate-y-full sm:px-6"
								>
									<dl className="mx-auto max-w-lg space-y-6">
										<div className="flex items-center justify-between">
											<dt className="text-gray-600">Subtotal</dt>
											<dd>{formatRupiah(subtotal)}</dd>
										</div>

										<div className="flex items-center justify-between">
											<dt className="text-gray-600">Ongkir</dt>
											{selectedCourier ? (
												<dd>{formatRupiah(ongkir)}</dd>
											) : (
												<dd
													className='cursor-pointer text-blue-700 hover:underline'
													onClick={() => {
														selectedRegion.subdistrict
															? handleClickChooseCourier()
															: SweetAlertError('Silahkan pilih kecamatan pengiriman dahulu')
													}}
												>
													{loadingChooseCourier ? (
														<ClipLoader />
													) : (
														'Pilih Kurir'
													)}
												</dd>
											)}
										</div>

										<div className="flex items-center justify-between">
											<dt className="text-gray-600">Biaya Aplikasi</dt>
											<dd>{formatRupiah(appFee)}</dd>
										</div>
									</dl>
								</PopoverPanel>
							</Popover>
						</div>
					</section>

					<form className="px-4 pb-36 pt-16 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16">
						<div className="mx-auto max-w-lg lg:max-w-none">
							<section aria-labelledby="contact-info-heading">
								<h2 id="contact-info-heading" className="text-lg font-bold text-gray-900">
									Kontak
								</h2>

								<div className="mt-6">
									<label htmlFor="name" className="block text-sm font-medium text-gray-700">
										Nama Lengkap
									</label>
									<div className="mt-1">
										<input
											id="name"
											name="name"
											type="text"
											className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											defaultValue={user?.name}
											ref={(el) => formRef.current.name = el}
										/>
										{errors?.name?.map((err) => (
											<p key={err} className="text-red-600 pl-3 text-sm mt-1">
												{err}
											</p>
										))}
									</div>
								</div>
								<div className="mt-6">
									<label htmlFor="whatsaap" className="block text-sm font-medium text-gray-700">
										Whatsapp
									</label>
									<div className="mt-1">
										<input
											id="whatsaap"
											name="whatsaap"
											type="number"
											className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											defaultValue={user?.whatsaap}
											ref={(el) => formRef.current.whatsaap = el}
										/>
										{errors?.whatsaap?.map((err) => (
											<p key={err} className="text-red-600 pl-3 text-sm mt-1">
												{err}
											</p>
										))}
									</div>
								</div>
								<div className="mt-6">
									<label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
										Telepon
									</label>
									<div className="mt-1">
										<input
											id="telephone"
											name="telephone"
											type="number"
											className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											defaultValue={user?.telephone}
											ref={(el) => formRef.current.telephone = el}
										/>
										{errors?.telephone?.map((err) => (
											<p key={err} className="text-red-600 pl-3 text-sm mt-1">
												{err}
											</p>
										))}
									</div>
								</div>
								<div className="mt-6">
									<label htmlFor="email" className="block text-sm font-medium text-gray-700">
										Email
									</label>
									<div className="mt-1">
										<input
											id="email"
											name="email"
											type="email"
											className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											defaultValue={user?.email}
											ref={(el) => formRef.current.email = el}
										/>
										{errors?.email?.map((err) => (
											<p key={err} className="text-red-600 pl-3 text-sm mt-1">
												{err}
											</p>
										))}
									</div>
								</div>
							</section>

							<section aria-labelledby="shipping-heading" className="mt-10">
								<h2 id="shipping-heading" className="text-lg font-bold text-gray-900">
									Alamat Pengiriman
								</h2>

								<div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
									<div className="sm:col-span-3">
										<label htmlFor="address" className="block text-sm font-medium text-gray-700">
											Alamat
										</label>
										<div className="mt-1">
											<textarea
												id="address"
												name="address"
												type="text"
												className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
												rows={4}
												defaultValue={user?.address}
												ref={(el) => formRef.current.address = el}
											/>
											{errors?.address?.map((err) => (
												<p key={err} className="text-red-600 pl-3 text-sm mt-1">
													{err}
												</p>
											))}
										</div>
									</div>

									<div className="sm:col-span-3">
										<label htmlFor="detail_address" className="block text-sm font-medium text-gray-700">
											Detail Alamat
										</label>
										<div className="mt-1">
											<input
												id="detail_address"
												name="detail_address"
												type="text"
												className="text-gray-800 placeholder:text-gray-400 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
												placeholder='masukkan detail alamat/gang/nomor rumah/warna cat/dll'
												ref={(el) => formRef.current.address_detail = el}
											/>
											{errors?.address_detail?.map((err) => (
												<p key={err} className="text-red-600 pl-3 text-sm mt-1">
													{err}
												</p>
											))}
										</div>
									</div>

									{loadingSelectedRegionFirst ? <ClipLoader /> : (
										<>
											<div>
												<label htmlFor="province" className="block text-sm font-medium text-gray-700">
													Provinsi
												</label>
												<div className="mt-1">
													<select
														id="province"
														name="province"
														type="text"
														className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
														ref={(el) => (formRef.current.province_id = el)}
														onChange={handleProvinceChange}
													>
														<option value="" className="text-gray-400">---pilih provinsi---</option>
														{provinces?.length > 0 && provinces.map((prov) => (
															<option selected={selectedRegion?.province_id == prov.id} key={prov.id + 'province'} value={prov.id}>{prov.name}</option>
														))}
													</select>
													{errors?.province?.map((err) => (
														<p key={err} className="text-red-600 pl-3 text-sm mt-1">
															{err}
														</p>
													))}
												</div>
											</div>

											<div>
												<label htmlFor="city" className="block text-sm font-medium text-gray-700">
													Kota/Kabupaten
												</label>
												<div className="mt-1">
													<select
														id="city"
														name="city"
														type="text"
														className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
														ref={(el) => (formRef.current.city_id = el)}
														onChange={handleCityChange}
														disabled={!selectedRegion.province_id}
													>
														<option value="" className="text-gray-400">---pilih kota/kabupaten---</option>
														{cities?.length > 0 && cities.map((city) => (
															<option selected={selectedRegion?.city_id == city.id} key={city.id + 'city'} value={city.id}>{city.name}</option>
														))}
													</select>
													{errors?.city?.map((err) => (
														<p key={err} className="text-red-600 pl-3 text-sm mt-1">
															{err}
														</p>
													))}
												</div>
											</div>

											<div>
												<label htmlFor="district" className="block text-sm font-medium text-gray-700">
													Kecamatan
												</label>
												<div className="mt-1">
													<select
														id="district"
														name="district"
														type="text"
														className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
														ref={(el) => formRef.current.district_id = el}
														onChange={handleDistrictChange}
														disabled={!selectedRegion.city_id}
													>
														<option value="" className="text-gray-400">---pilih kecamatan---</option>
														{district?.length > 0 && district.map((dis) => (
															<option selected={selectedRegion?.district_id == dis.id} key={dis.id + 'district'} value={dis.id}>{dis.name}</option>
														))}
													</select>
													{errors?.district?.map((err) => (
														<p key={err} className="text-red-600 pl-3 text-sm mt-1">
															{err}
														</p>
													))}
												</div>
											</div>

											<div>
												<label htmlFor="subdistrict" className="block text-sm font-medium text-gray-700">
													Desa
												</label>
												<div className="mt-1">
													<select
														id="subdistrict"
														name="subdistrict"
														type="text"
														className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
														ref={(el) => formRef.current.subdistrict_id = el}
														onChange={handleSubdistrictChange}
														disabled={!selectedRegion.subdistrict_id}
													>
														<option value="" className="text-gray-400">---pilih desa---</option>
														{subdistrict?.length > 0 && subdistrict.map((sub) => (
															<option selected={selectedRegion?.subdistrict_id == sub.id} key={sub.id + 'subdistrict'} value={sub.id}>{sub.name}</option>
														))}
													</select>
													{errors?.subdistrict?.map((err) => (
														<p key={err} className="text-red-600 pl-3 text-sm mt-1">
															{err}
														</p>
													))}
												</div>
											</div>

											<div>
												<label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
													Kode Pos
												</label>
												<div className="mt-1">
													<input
														id="postal_code"
														name="postal_code"
														type="text"
														className="text-gray-800 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
														defaultValue={user?.postal_code}
														ref={(el) => (formRef.current.postal_code = el)}
													/>
													{errors?.postal_code?.map((err) => (
														<p key={err} className="text-red-600 pl-3 text-sm mt-1">
															{err}
														</p>
													))}
												</div>
											</div>
										</>
									)}
								</div>
							</section>

							<section aria-labelledby="shipping-options-heading" className="mt-10 ">
								<h2 id="shipping-options-heading" className="text-lg font-bold text-gray-900">
									Opsi Kurir Pengiriman
								</h2>

								<div className="mt-6 border border-gray-200 rounded-lg p-4 bg-blue-50">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-gray-700 font-bold">
												Ongkos Kirim ({selectedCourier ? formatRupiah(selectedCourier?.costs) : '-'})
											</p>
											<p className="text-xs text-gray-500 mt-1">
												Kurir: <span className="font-medium">{selectedCourier?.name || '-'}</span>
											</p>
											<p className="text-xs text-gray-500 mt-1">
												Service: <span className="font-medium">{selectedCourier?.service || ''} - {selectedCourier?.description || ''}</span>
											</p>
										</div>
										<button
											type="button"
											className="text-indigo-600 hover:underline text-sm font-medium"
											onClick={() => {
												selectedRegion.subdistrict_id ? handleClickChooseCourier() : SweetAlertError('Silahkan pilih kecamatan pengiriman dahulu')
											}}
										>
											{
												loadingChooseCourier ? <ClipLoader />
													:
													selectedCourier ? 'Ubah'
														: 'Pilih Kurir'
											}
										</button>
									</div>

									<div className="mt-4 flex items-center text-xs text-gray-500">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="1.5"
											stroke="currentColor"
											className="w-5 h-5 mr-2 text-green-500"
										>
											<path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v5.5m0 0v5.5m0-5.5H8m4 0h4m1.5-9.5a9 9 0 100 18 9 9 0 000-18zm0 0a9 9 0 110 18 9 9 0 010-18z" />
										</svg>
										<span>
											Perkiraan tiba {selectedCourier?.etd || '-'}
										</span>
									</div>
								</div>
							</section>

							<Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center">
								<div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black opacity-30"></div>

								<div className="relative bg-white rounded-lg shadow-lg w-3/4 max-h-screen overflow-y-auto">
									{/* Header Section */}
									<div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
										<DialogTitle className="text-lg font-bold text-gray-900">Pilih Opsi Pengiriman</DialogTitle>
										<p className="text-sm font-medium text-gray-500 mt-2">PILIH JASA PENGIRIMAN</p>
									</div>

									{/* Shipping Options */}
									<div className="p-6">
										<div className="mt-4 space-y-4">
											{courierList?.map((courier, index) => (
												<div key={index + 'courier'} className="border p-4 rounded-lg">
													<p className="text-sm text-gray-800 font-bold mb-2">{courier.name}</p>
													<div
														key={index + 'courier service'}
														className={`text-gray-800 border p-3 rounded-lg cursor-pointer mb-2 ${selectedCourier?.name === courier.name && selectedCourier?.service === courier.service ? 'border-red-500' : 'border-gray-200'}`}
														onClick={() => {
															setSelectedCourier({...courier, name: courier.name, service: courier.service, cost: courier.cost, etd: courier.etd, description: courier.description})
															setIsModalOpen(false)
														}}
													>
														<div className="flex justify-between">
															<div>
																<p className="text-sm font-semibold">{courier.service}</p>
																<p className="text-xs text-gray-500">
																	{courier.description} - Estimasi tiba {courier.etd || '-'}
																</p>
															</div>
															<div className="text-sm font-bold">{formatRupiah(courier.cost)}</div>
														</div>
														{cheapestCourier?.name === courier.name && cheapestCourier?.service === courier.service && (
															<p className="mt-2 text-xs text-green-500">rekomendasi</p>
														)}
													</div>
												</div>
											))}
										</div>
									</div>


									{/* Footer Section */}
									<div className="sticky bottom-0 bg-white z-10 p-6 border-t border-gray-200 flex justify-end">
										<button
											type="button"
											className="hover:bg-gray-50 hover:text-gray-800 px-4 py-2 text-sm font-bold text-gray-800 border border-gray-300 rounded-md"
											onClick={() => setIsModalOpen(false)}
										>
											Tutup
										</button>
										{/* <button
											type="button"
											className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
											onClick={() => handleOptionSelect(selectedOption)}
											disabled={!selectedOption} // Disable button if no option is selected
										>
											Konfirmasi
										</button> */}
									</div>
								</div>
							</Dialog>



							<div className="mt-10 border-t border-gray-200 pt-6 sm:flex sm:items-center sm:justify-between">
								<button
									type="button"
									className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:order-last sm:ml-6 sm:w-auto"
									onClick={handleCheckout}
								>
									Konfirmasi Pesanan
								</button>
								<p className="mt-4 text-center text-sm text-gray-500 sm:mt-0 sm:text-left">
									Selanjutnya kamu akan dialihkan ke pembayaran
								</p>
							</div>
						</div>
					</form>
				</main>
			</div>
			{snapToken &&
				// window.snap.pay(snapToken, {
				// 	onSuccess: (result) => {
				// 		console.log('Payment Success:', result)
				// 		window.location.href = `/notifikasi-order?status=processing&order_code=${result.order_id}`
				// 		// router.push(`/notifikasi-order?status=processing&order_code=${result.order_id}`).then(() => {
				// 		// 	router.reload()
				// 		// })
				// 	},
				// 	onPending: (result) => {
				// 		console.log('Payment Pending:', result)
				// 		window.location.href = `/orderan-saya/type1?orderCode=${result.order_id}&status=pending`
				// 		// router.push(`/orderan-saya/type1?orderCode=${result.order_id}&status=pending`).then(() => {
				// 		// 	router.reload()
				// 		// })
				// 	},
				// 	onError: (result) => {
				// 		console.log('Payment Error:', result)
				// 		window.location.href = `/notifikasi-order?status=cancelled&order_code=${result.order_id}`
				// 		// router.push(`/notifikasi-order?status=cancelled&order_code=${result.order_id}`).then(() => {
				// 		// 	router.reload()
				// 		// })
				// 	},
				// 	onClose: () => {
				// 		console.log('Payment popup closed without completing the payment')
				// 		window.location.href = `/orderan-saya/type1?orderCode=${orderCode}&status=pending`
				// 		// router.push(`/orderan-saya/type1?orderCode=${orderCode}&status=pending`).then(() => {
				// 		// 	router.reload()
				// 		// })
				// 	}
				// })
				<MidtransPayment transactionToken={snapToken} orderCode={orderCode} />
			}
		</AuthMiddleware>
	)
}
