import Sidebar from '@/components/admin/sidebar'
import {SweetAlertError, sweetAlertSubmitData, SweetAlertSuccess} from '@/components/sweetAlert'
import {addAdmin, getAllProvinces, getCityByProvinceId, getSubdistrict} from '@/lib/fetchApi'
import {useRouter} from 'next/router'
import {useEffect, useRef, useState} from 'react'

export default function AddAdmin() {
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


	const handleSubmitAddAdmin = () => {
		sweetAlertSubmitData(() => {
			addAdmin(
				{
					name: formRef.current.name.value,
					username: formRef.current.username.value,
					email: formRef.current.email.value,
					password: formRef.current.password.value,
					password_confirmation: formRef.current.password_confirmation.value,
					whatsaap: formRef.current.whatsaap.value,
					telephone: formRef.current.telephone.value,
					address: formRef.current.address.value,
					subdistrict_id: formRef.current.subdistrict_id.value,
					gender: formRef.current.gender.value,
				},
				(res) => {
					if(res.status == 201) {
						SweetAlertSuccess(res.data.message)
						setTimeout(() => {
							window.location.reload()
						}, 1500)
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
			}, (err) => {

			})
		}

	}, [selectedRegion.city])


	return (
		<Sidebar headingPage="Tambah Admin">
			<form>
				<div className="space-y-12 sm:space-y-16">
					<div>
						<h2 className="text-base font-semibold leading-7 text-gray-900">Informasi Pribadi</h2>

						<div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Nama Lengkap
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
										<input
											id="name"
											name="name"
											type="text"
											placeholder="(wajib diisi)"
											className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
											ref={(el) => formRef.current.name = el}
										/>

									</div>
									{errors?.name?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Email
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<input
										id="email"
										name="email"
										type="email"
										placeholder='(wajib diisi)'
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
										ref={(el) => formRef.current.email = el}
									/>
									{errors?.email?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="telephone" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Nomor Telepon
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<input
										id="telephone"
										name="telephone"
										type="number"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
										ref={(el) => formRef.current.telephone = el}
									/>
									{errors?.telephone?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="whatsaap" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Nomor Whatsapp
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<input
										id="whatsaap"
										name="whatsaap"
										type="number"
										placeholder='(wajib diisi)'
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
										ref={(el) => formRef.current.whatsaap = el}
									/>
									{errors?.whatsaap?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="gender" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Jenis Kelamin
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<select
										id="gender"
										name="gender"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
										ref={(el) => formRef.current.gender = el}
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

							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Alamat
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<textarea
										id="address"
										name="address"
										rows={3}
										className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
										ref={(el) => formRef.current.address = el}
									/>
									{errors?.address?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>

							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="province" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Provinsi
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<select
										id="province"
										name="province"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
										onChange={handleProvinceChange}
									>
										<option value="" className="text-gray-400">---Pilih Provinsi---</option>
										{provinces?.length > 0 && provinces.map((prov) => (
											<option key={prov.id + 'province'} value={prov.id}>{prov.name}</option>
										))}
									</select>
								</div>
							</div>

							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Kota/Kabupaten
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<select
										id="city"
										name="city"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
										onChange={handleCityChange}
									>
										<option value="" className="text-gray-400">---Pilih Kota/Kab---</option>
										{cities?.length > 0 && cities.map((city) => (
											<option key={city.id + 'city'} value={city.id}>{city.name}</option>
										))}
									</select>
								</div>
							</div>

							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="subdistrict" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Kecamatan
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<select
										id="subdistrict"
										name="subdistrict"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
										onChange={handleSubdistrictChange}
										ref={(el) => formRef.current.subdistrict_id = el}
									>
										<option value="" className="text-gray-400">---Pilih Kecamatan---</option>
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

						</div>
					</div>

					<div>
						<h2 className="text-base font-semibold leading-7 text-gray-900">Informasi Login</h2>

						<div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Username
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<input
										id="username"
										name="username"
										type="text"
										placeholder='(wajib diisi)'
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
										ref={(el) => formRef.current.username = el}
									/>
									{errors?.username?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>
							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Password
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<input
										id="password"
										name="password"
										type="password"
										placeholder='(wajib diisi)'
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
										ref={(el) => formRef.current.password = el}
									/>
									{errors?.password?.map((err) => (
										<p key={err} className="text-red-600 pl-3 text-sm mt-1">
											{err}
										</p>
									))}
								</div>
							</div>
							<div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
								<label htmlFor="password_confirmation" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
									Konfirmasi Password
								</label>
								<div className="mt-2 sm:col-span-2 sm:mt-0">
									<input
										id="password_confirmation"
										name="password_confirmation"
										type="password"
										placeholder='(wajib diisi)'
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
										ref={(el) => formRef.current.password_confirmation = el}
									/>
								</div>
							</div>

						</div>
					</div>

				</div>

				<div className="mt-6 flex items-center justify-end gap-x-6">
					<button
						type="button"
						className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						onClick={() => handleSubmitAddAdmin()}
					>
						Submit
					</button>
				</div>
			</form>
		</Sidebar>
	)
}
