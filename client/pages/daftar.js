import GuestMiddleware from "@/components/guestMiddleware"
import {SweetAlertError, sweetAlertSubmitData, SweetAlertSuccess} from "@/components/sweetAlert"
import {getAllProvinces, getCityByProvinceId, getSubdistrict, register} from "@/lib/fetchApi"
import Link from "next/link"
import {useRouter} from "next/router"
import {useEffect, useRef, useState} from "react"

export default function Daftar() {
	const router = useRouter()
	const [errors, setErrors] = useState()
	const formRef = useRef({})
	const [provinces, setProvinces] = useState(null)
	const [cities, setCities] = useState(null)
	const [subdistrict, setSubdistrict] = useState(null)
	const initialSelectedRegion = {
		province: null,
		city: null,
		subdistrict: null,
	}
	const [selectedRegion, setSelectedRegion] = useState(initialSelectedRegion)

	const handleProvinceChange = (event) => {
		const selectedProvince = provinces.find(prov => prov.id === parseInt(event.target.value))
		setSelectedRegion((prevState) => ({
			...prevState,
			province: selectedProvince,
			city: null,
			subdistrict: null
		}))
	}

	const handleCityChange = (event) => {
		const selectedCity = cities.find(city => city.id === parseInt(event.target.value))
		setSelectedRegion((prevState) => ({
			...prevState,
			city: selectedCity,
			subdistrict: null
		}))
	}

	const handleSubdistrictChange = (event) => {
		const selectedSubdistrict = subdistrict.find(sub => sub.id === parseInt(event.target.value))
		setSelectedRegion((prevState) => ({
			...prevState,
			subdistrict: selectedSubdistrict,
		}))
	}


	const handleSubmitCreateAccount = () => {
		sweetAlertSubmitData(() => {
			register(
				{
					name: formRef.current.name.value,
					username: formRef.current.username.value,
					email: formRef.current.email.value,
					password: formRef.current.password.value,
					password_confirmation: formRef.current.passwordConfirmation.value,
					whatsaap: formRef.current.whatsaap.value,
					telephone: formRef.current.telephone.value,
					address: formRef.current.address.value,
					subdistrict_id: formRef.current.subdistrict_id.value,
					gender: formRef.current.gender.value,
				},
				(res) => {
					if(res.status == 201) {
						SweetAlertSuccess(res.data.message)
						router.push("/login")
					}
				},
				(err) => {
					if(err.response.status == 422) {
						SweetAlertError('Periksa data')
						setErrors(err.response.data.errors)
					}
				}
			)
		})
	}

	useEffect(() => {
		getAllProvinces((res) => {
			setProvinces(res.data)
		}, (err) => {

		})
	}, [])

	useEffect(() => {
		if(selectedRegion?.province?.id) {
			getCityByProvinceId(selectedRegion.province.id, (res) => {
				setCities(res.data)
			}, (err) => {

			})
		}

	}, [selectedRegion.province])

	useEffect(() => {
		if(selectedRegion?.city?.id) {
			getSubdistrict(selectedRegion.city.id, '', (res) => {
				setSubdistrict(res.data)
				console.log('subdis', res.data)
			}, (err) => {

			})
		}

	}, [selectedRegion.city])

	return (
		<GuestMiddleware>
			<div className="relative min-h-screen flex items-center justify-center bg-gray-800 py-10">
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{
						backgroundImage: `url('https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')`,
						opacity: 0.7,
					}}
				></div>
				<div className="relative z-10 w-full max-w-3xl">
					<div className="bg-white bg-opacity-90 shadow sm:rounded-lg px-8 py-8">
						{/* Judul */}
						<div className="text-center ">
							<Link href={"/"} className="cursor-pointer">
								<img alt="Faycook" src="/faycook/logo2.webp" className="w-28 inline-block rounded-lg" />
							</Link>
							<h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Buat Akun Baru</h2>
							<p className="mt-2 text-sm text-gray-600">
								Sudah punya akun?{" "}
								<Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline">
									login disini
								</Link>
							</p>
						</div>

						{/* Form */}
						<form action="#" method="POST" className="mt-8 space-y-6">
							{/* Nama Lengkap */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="name" className="md:text-right text-sm font-medium text-gray-700">
									Nama Lengkap :
								</label>
								<div className="col-span-2">
									<input
										id="name"
										name="name"
										type="text"
										className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.name = el)}
									/>
									{errors?.name?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							{/* Username */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="username" className="md:text-right text-sm font-medium text-gray-700">
									Username :
								</label>
								<div className="col-span-2">
									<input
										id="username"
										name="username"
										type="text"
										className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.username = el)}
									/>
									{errors?.username?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							{/* Email */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="email" className="md:text-right text-sm font-medium text-gray-700">
									Email :
								</label>
								<div className="col-span-2">
									<input
										id="email"
										name="email"
										type="email"
										className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.email = el)}
									/>
									{errors?.email?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							{/* Whatsapp */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="whatsapp" className="md:text-right text-sm font-medium text-gray-700">
									Whatsapp :
								</label>
								<div className="col-span-2">
									<input
										id="whatsapp"
										name="whatsapp"
										type="text"
										className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.whatsaap = el)}
									/>
									{errors?.whatsaap?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							{/* Telepon */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="phone" className="md:text-right text-sm font-medium text-gray-700">
									Telepon :
								</label>
								<div className="col-span-2">
									<input
										id="phone"
										name="phone"
										type="text"
										className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.telephone = el)}
									/>
									{errors?.telephone?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>
							{/* Jenis Kelamin */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="gender" className="md:text-right text-sm font-medium text-gray-700">
									Jenis Kelamin :
								</label>
								<div className="col-span-2">
									<select
										id="gender"
										name="gender"
										className="text-gray-800 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.gender = el)}
									>
										<option value="" className="text-gray-400">Pilih Jenis Kelamin</option>
										<option value="true">Laki-laki</option>
										<option value="false">Perempuan</option>
									</select>
									{errors?.gender?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>
							{/* Alamat */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="address" className="md:text-right text-sm font-medium text-gray-700">
									Alamat :
								</label>
								<div className="col-span-2">
									<textarea
										id="address"
										name="address"
										className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.address = el)}
									/>
									{errors?.address?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>


							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="province" className="md:text-right text-sm font-medium text-gray-700">
									Provinsi
								</label>
								<div className="col-span-2">
									<select
										id="province"
										name="province"
										className="text-gray-800 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.province = el)}
										onChange={handleProvinceChange}
									>
										<option value="" className="text-gray-400">---pilih provinsi---</option>
										{provinces?.length > 0 && provinces.map((prov) => (
											<option key={prov.id + 'province'} value={prov.id}>{prov.name}</option>
										))}
									</select>

								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="city" className="md:text-right text-sm font-medium text-gray-700">
									Kota/Kabupaten
								</label>
								<div className="col-span-2">
									<select
										id="city"
										name="city"
										className="text-gray-800 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.city = el)}
										onChange={handleCityChange}
										disabled={!selectedRegion.province}
									>
										<option value="" className="text-gray-400">---pilih kota/kabupaten---</option>
										{cities?.length > 0 && cities.map((city) => (
											<option key={city.id + 'city'} value={city.id}>{city.name}</option>
										))}
									</select>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="subdistrict" className="md:text-right text-sm font-medium text-gray-700">
									Kecamatan
								</label>
								<div className="col-span-2">
									<select
										id="subdistrict"
										name="subdistrict"
										className="text-gray-800 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.subdistrict_id = el)}
										onChange={handleSubdistrictChange}
										disabled={!selectedRegion.city}
									>
										<option value="" className="text-gray-400">---pilih kecamatan---</option>
										{subdistrict?.length > 0 && subdistrict.map((sub) => (
											<option key={sub.subdistrict_id + 'sub'} value={sub.subdistrict_id}>{sub.subdistrict_name}</option>
										))}
									</select>
									{errors?.subdistrict_id?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							{/* Password */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="password" className="md:text-right text-sm font-medium text-gray-700">
									Password :
								</label>
								<div className="col-span-2">
									<input
										id="password"
										name="password"
										type="password"
										className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.password = el)}
									/>
									{errors?.password?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							{/* Konfirmasi Password */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="confirm-password" className="md:text-right text-sm font-medium text-gray-700">
									Konfirmasi Password :
								</label>
								<div className="col-span-2">
									<input
										id="confirm-password"
										name="confirm_password"
										type="password"
										className="text-gray-800 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.passwordConfirmation = el)}
									/>
								</div>
							</div>

							{/* Tombol Buat Akun */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
								<label htmlFor="" className="text-right"></label>
								<button
									type="button"
									className="col-span-2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
									onClick={() => handleSubmitCreateAccount()}
								>
									Buat Akun
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</GuestMiddleware>
	)
}