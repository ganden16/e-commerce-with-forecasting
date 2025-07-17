import GuestMiddleware from "@/components/guestMiddleware"
import {SweetAlertError, sweetAlertSubmitData, SweetAlertSuccess} from "@/components/sweetAlert"
import axios, {endpoint} from "@/lib/axios"
import {completeProfile, getAllProvinces, getCityByProvinceId, getDistrictByCityId, getSubdistrict, getSubdistrictByDistrictId, me, register} from "@/lib/fetchApi"
import {setUser} from "@/redux/userSlice"
import Link from "next/link"
import {useRouter} from "next/router"
import {useEffect, useRef, useState} from "react"
import {useDispatch} from "react-redux"

export default function LengkapiProfil() {
	const router = useRouter()
	const [errors, setErrors] = useState()
	const formRef = useRef({})
	const dispatch = useDispatch()
	const [userData, setUserData] = useState()
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

	const handleSubmitCompleteProfile = () => {
		sweetAlertSubmitData(() => {
			completeProfile(
				{
					username: formRef.current.username.value,
					whatsaap: formRef.current.whatsaap.value,
					telephone: formRef.current.telephone.value,
					address: formRef.current.address.value,
					gender: formRef.current.gender.value,
					province_id: formRef.current.province_id.value,
					city_id: formRef.current.city_id.value,
					district_id: formRef.current.district_id.value,
					subdistrict_id: formRef.current.subdistrict_id.value,
					postal_code: formRef.current.postal_code.value,
				},
				{
					headers: {
						Authorization: `Bearer ${router.query.token}`
					}
				},
				(res) => {
					if(res.status == 200) {
						SweetAlertSuccess(res.data.message)
						localStorage.setItem('token', router.query.token)
						me((res) => {
							dispatch(setUser(res.data))
						}, (err) => {})
						router.push('/produk')
					}
				},
				(err) => {
					if(err.response?.status == 422) {
						setErrors(err.response.data.errors)
					}
					SweetAlertError('Error ' + err.response.status)
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

	useEffect(() => {
		if(router.query.token) {
			axios.get(`${endpoint.auth}/me`, {
				headers: {
					Authorization: `Bearer ${router.query.token}`,
				}
			})
				.then((res) => {
					setUserData(res.data)
				})
				.catch((err) => {
					router.push('/login')
				})
		}
	}, [router.query.token])


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
						<div className="text-center">
							<Link href={"/"} className="cursor-pointer inline-block">
								<img alt="Faycook" src="/faycook/logo2.webp" className="w-28 rounded-lg" />
							</Link>
							<h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Lengkapi Profil Anda</h2>
						</div>

						{/* Form */}
						<form action="#" method="POST" className="mt-8 space-y-6">
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
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.username = el)}
									/>
									{errors?.username?.map((err) => (
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
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
										className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
										className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.province_id = el)}
										onChange={handleProvinceChange}
									>
										<option value="" className="text-gray-400">---Pilih Provinsi---</option>
										{provinces?.map((prov) => (
											<option selected={selectedRegion?.province_id == prov.id} key={prov.id + 'province'} value={prov.id}>{prov.name}</option>
										))}
									</select>
									{
										errors?.province_id?.map(err => (
											<p className='text-red-600 pl-3 text-sm'>{err}</p>
										))
									}
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
										className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.city_id = el)}
										onChange={handleCityChange}
									>
										<option value="" className="text-gray-400">---Pilih kota/Kabupaten---</option>
										{cities?.map((city) => (
											<option selected={selectedRegion?.city_id == city.id} key={city.id + 'province'} value={city.id}>{city.name}</option>
										))}
									</select>
									{
										errors?.city_id?.map(err => (
											<p className='text-red-600 pl-3 text-sm'>{err}</p>
										))
									}
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="district" className="md:text-right text-sm font-medium text-gray-700">
									Kecamatan
								</label>
								<div className="col-span-2">
									<select
										id="district"
										name="district"
										className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.district_id = el)}
										onChange={handleDistrictChange}
									>
										<option value="" className="text-gray-400">---Pilih Kecamatan---</option>
										{district?.map((dis) => (
											<option selected={selectedRegion?.district_id == dis.id} key={dis.id + 'district'} value={dis.id}>{dis.name}</option>
										))}
									</select>
									{
										errors?.district_id?.map(err => (
											<p className='text-red-600 pl-3 text-sm'>{err}</p>
										))
									}
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="subdistrict" className="md:text-right text-sm font-medium text-gray-700">
									Desa/Kelurahan
								</label>
								<div className="col-span-2">
									<select
										id="subdistrict"
										name="subdistrict"
										className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.subdistrict_id = el)}
										onChange={handleSubdistrictChange}
									>
										<option value="" className="text-gray-400">---Pilih Desa/Kelurahan---</option>
										{subdistrict?.map((sub) => (
											<option selected={selectedRegion?.subdistrict_id == sub.id} key={sub.id + 'subdistrict'} value={sub.id}>{sub.name}</option>
										))}
									</select>
									
								</div>
							</div>

							{/* Kode Pos */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
								<label htmlFor="postal_code" className="md:text-right text-sm font-medium text-gray-700">
									Kode Pos :
								</label>
								<div className="col-span-2">
									<input
										id="postal_code"
										name="postal_code"
										type="text"
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										ref={(el) => (formRef.current.postal_code = el)}
									/>
								</div>
							</div>


							{/* Tombol Buat Akun */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
								<label htmlFor="" className="text-right"></label>
								<button
									type="button"
									className="col-span-2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
									onClick={() => handleSubmitCompleteProfile()}
								>
									Konfirmasi
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</GuestMiddleware>
	)
}
