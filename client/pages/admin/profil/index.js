import {useEffect, useRef, useState} from 'react'
import Sidebar from '@/components/admin/sidebar'
import {useSelector} from 'react-redux'
import {SweetAlertError, sweetAlertSubmitData, SweetAlertSuccess} from '@/components/sweetAlert'
import {changePassword, getAllProvinces, getCityByProvinceId, getDistrictByCityId, getSubdistrict, getSubdistrictByDistrictId, updateProfile} from '@/lib/fetchApi'

export default function Profil() {
	const user = useSelector((state) => state.user.user)
	const [selectedImage, setSelectedImage] = useState(null)
	const [fileName, setFileName] = useState(null)
	const [errors, setErrors] = useState()
	const formRef = useRef({})
	const formData = new FormData()
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

	const handleImageChange = (e) => {
		if(e.target.files && e.target.files[0]) {
			const image = e.target.files[0]
			setSelectedImage(URL.createObjectURL(image))
			formRef.current.fileImage = e.target.files[0]
			setFileName(e.target.files[0].name)
		}
	}

	const handleSubmitProfile = () => {
		if(formRef.current.fileImage) {
			formData.append('fileImage', formRef.current.fileImage)
		}
		formData.append('name', formRef.current.name.value)
		formData.append('username', formRef.current.username.value)
		formData.append('email', formRef.current.email.value)
		formData.append('whatsaap', formRef.current.whatsaap.value)
		formData.append('telephone', formRef.current.telephone.value)
		formData.append('gender', formRef.current.gender.value)
		formData.append('province_id', formRef.current.province_id.value)
		formData.append('city_id', formRef.current.city_id.value)
		formData.append('district_id', formRef.current.district_id.value)
		formData.append('subdistrict_id', formRef.current.subdistrict_id.value)
		formData.append('postal_code', formRef.current.postal_code.value)
		formData.append('address', formRef.current.address.value)
		formData.append('_method', 'PUT')
		sweetAlertSubmitData(() => {
			updateProfile(formData, (res) => {
				SweetAlertSuccess(res.data.message)
				setTimeout(() => {
					window.location.reload()
				}, 1500)
			}, (err) => {
				SweetAlertError('Periksa data')
				setErrors(err.response.data.errors)
			})
		})
	}
	const handleSubmitChangePassword = () => {
		sweetAlertSubmitData(() => {
			changePassword({
				currentPassword: formRef.current.currentPassword.value,
				newPassword: formRef.current.newPassword.value,
				newPassword_confirmation: formRef.current.newPasswordConfirmation.value,
			}, (res) => {
				if(res.status == 200) {
					SweetAlertSuccess(res.data.message)
					formRef.current.currentPassword.value = ''
					formRef.current.newPassword.value = ''
					formRef.current.newPasswordConfirmation.value = ''
					setErrors()
				}
			}, (err) => {
				setErrors(err.response.data.errors)
			})
		})
	}

	useEffect(() => {
		if(user?.image) {
			setSelectedImage(user.image)
		}
		getAllProvinces((res) => {
			setProvinces(res.data)
		}, (err) => {})
		setSelectedRegion({
			province_id: user.province_id ?? null,
			city_id: user.city_id ?? null,
			district_id: user.district_id ?? null,
			subdistrict_id: user.subdistrict_id ?? null,
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

	return (
		<Sidebar headingPage="Profil">
			<div className='h-full bg-gray-50'>
				<div className="xl:pl-72">
					<main>
						{/* Settings forms */}
						<div className="divide-y divide-gray-200">
							{/* Personal Information Section */}
							<div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8 ">
								<div>
									<h2 className="text-base font-semibold leading-7 text-gray-800">Informasi Pribadi</h2>
									<p className="mt-1 text-sm leading-6 text-gray-500">
										Atur informasi profil anda
									</p>
								</div>

								<form className="md:col-span-2 bg-white p-6 rounded-lg shadow">
									<div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
										{/* Avatar Section */}
										<div className="col-span-full flex items-center gap-x-8">
											<div>
												<img
													alt={user?.name}
													src={selectedImage ?? '/faycook/images/avatar-polos.webp'}
													className="h-24 w-24 flex-none rounded-full bg-gray-200 object-cover"
												/>
												<p className='text-white ps-3'>{fileName ?? ''}</p>
											</div>
											<div>
												<label
													htmlFor="profile-photo"
													className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
												>
													Ubah Foto
												</label>
												<input
													id="profile-photo"
													name="profile-photo"
													type="file"
													accept="image/*"
													onChange={handleImageChange}
													className="hidden"
												/>
												<p className="mt-2 text-xs leading-5 text-gray-400">Maksimal 5MB.</p>
												{
													errors?.fileImage?.map(err => (
														<p className='text-red-600 text-sm'>{err}</p>
													))
												}
											</div>
										</div>

										{/* First Name */}
										<div className="col-span-full">
											<label htmlFor="name" className="block text-sm font-medium text-gray-700">
												Nama Lengkap
											</label>
											<div className="mt-2">
												<input
													id="name"
													name="name"
													type="text"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="(wajib diisi)"
													defaultValue={user?.name}
													ref={(el) => formRef.current.name = el}
												/>
												{
													errors?.name?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>

										{/* WhatsApp */}
										<div className="sm:col-span-3">
											<label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
												WhatsApp
											</label>
											<div className="mt-2">
												<input
													id="whatsapp"
													name="whatsapp"
													type="text"
													autoComplete="tel"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="(wajib diisi)"
													defaultValue={user?.whatsaap}
													ref={(el) => formRef.current.whatsaap = el}
												/>
												{
													errors?.whatsaap?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>

										{/* Phone */}
										<div className="sm:col-span-3">
											<label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
												Telepon
											</label>
											<div className="mt-2">
												<input
													id="telephone"
													name="telephone"
													type="text"
													autoComplete="tel"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="(optional)"
													defaultValue={user?.telephone}
													ref={(el) => formRef.current.telephone = el}
												/>
												{
													errors?.telephone?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>

										{/* Gender */}
										<div className="col-span-full">
											<label htmlFor="gender" className="block text-sm font-medium text-gray-700">
												Jenis Kelamin
											</label>
											<div className="mt-2">
												<select
													id="gender"
													name="gender"
													className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													ref={(el) => formRef.current.gender = el}
												>
													<option value="" className="text-gray-400">---Pilih Jenis Kelamin---</option>
													<option value="true" selected={user?.gender == true} className="text-black">Laki-laki</option>
													<option value="false" selected={user?.gender == false} className="text-black">Perempuan</option>
												</select>
												{
													errors?.gender?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>

										{/* Address */}
										<div className="col-span-full">
											<label htmlFor="address" className="block text-sm font-medium text-gray-700">
												Alamat
											</label>
											<div className="mt-2">
												<textarea
													id="address"
													name="address"
													rows="3"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="(wajib diisi)"
													defaultValue={user?.address}
													ref={(el) => formRef.current.address = el}
												></textarea>
												{
													errors?.address?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>

										<div className="col-span-full">
											<label htmlFor="province" className="block text-sm font-medium text-gray-700">
												Provinsi
											</label>
											<div className="mt-2">
												<select
													id="province"
													name="province"
													className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													ref={(el) => formRef.current.province_id = el}
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
										<div className="col-span-full">
											<label htmlFor="city" className="block text-sm font-medium text-gray-700">
												Kota/Kabupaten
											</label>
											<div className="mt-2">
												<select
													id="city"
													name="city"
													className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													ref={(el) => formRef.current.city_id = el}
													onChange={handleCityChange}
												>
													<option value="" className="text-gray-400">---Pilih Kota/Kab---</option>
													{cities?.length > 0 && cities.map((city) => (
														<option selected={selectedRegion?.city_id == city.id} key={city.id + 'city'} value={city.id}>{city.name}</option>
													))}
												</select>
												{
													errors?.city_id?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>
										<div className="col-span-full">
											<label htmlFor="district" className="block text-sm font-medium text-gray-700">
												Kecamatan
											</label>
											<div className="mt-2">
												<select
													id="subdistrict"
													name="subdistrict"
													className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													ref={(el) => formRef.current.district_id = el}
													onChange={handleDistrictChange}
												>
													<option value="" className="text-gray-400">---Pilih Kecamatan---</option>
													{district?.length > 0 && district.map((dis) => (
														<option selected={selectedRegion?.district_id == dis.id} key={dis.id + 'sub'} value={dis.id}>{dis.name}</option>
													))}
												</select>
												{
													errors?.district_id?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>
										<div className="col-span-full">
											<label htmlFor="subdistrict" className="block text-sm font-medium text-gray-700">
												Desas/Kelurahan
											</label>
											<div className="mt-2">
												<select
													id="subdistrict"
													name="subdistrict"
													className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													ref={(el) => formRef.current.subdistrict_id = el}
													onChange={handleSubdistrictChange}
												>
													<option value="" className="text-gray-400">---Pilih Kecamatan---</option>
													{subdistrict?.length > 0 && subdistrict.map((sub) => (
														<option selected={selectedRegion?.subdistrict_id == sub.id} key={sub.id + 'subdistrict'} value={sub.id}>{sub.name}</option>
													))}
												</select>
											</div>
										</div>

										{/* Kode Pos */}
										<div className="sm:col-span-3">
											<label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
												Kode Pos
											</label>
											<div className="mt-2">
												<input
													id="postal_code"
													name="postal_code"
													type="text"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="kode pos"
													defaultValue={user?.postal_code}
													ref={(el) => formRef.current.postal_code = el}
												/>
											</div>
										</div>

										{/* Email Address */}
										<div className="col-span-full">
											<label htmlFor="email" className="block text-sm font-medium text-gray-700">
												Alamat Email
											</label>
											<div className="mt-2">
												<input
													id="email"
													name="email"
													type="email"
													autoComplete="email"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="(wajib diisi)"
													defaultValue={user?.email}
													ref={(el) => formRef.current.email = el}
												/>
												{
													errors?.email?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>

										{/* Username */}
										<div className="col-span-full">
											<label htmlFor="username" className="block text-sm font-medium text-gray-700">
												Username
											</label>
											<div className="mt-2 flex rounded-md shadow-sm">
												<input
													id="username"
													name="username"
													type="text"
													placeholder="(wajib diisi)"
													autoComplete="username"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													defaultValue={user?.username}
													ref={(el) => formRef.current.username = el}
												/>

											</div>
											{
												errors?.username?.map(err => (
													<p className='text-red-600 pl-3 text-sm'>{err}</p>
												))
											}
										</div>
									</div>

									<div className="mt-8 flex justify-end">
										<button
											type="button"
											className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
											onClick={() => handleSubmitProfile()}
										>
											Simpan
										</button>
									</div>
								</form>
							</div>

							{/* Change Password Section */}
							<div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
								<div>
									<h2 className="text-base font-semibold leading-7 text-gray-800">Ubah Kata Sandi</h2>
									<p className="mt-1 text-sm leading-6 text-gray-500">
										Perbarui kata sandi yang terhubung dengan akun Anda.
									</p>
								</div>

								<form className="md:col-span-2 bg-white p-6 rounded-lg shadow">
									<div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
										{/* Current Password */}
										<div className="col-span-full">
											<label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
												Kata Sandi Saat Ini
											</label>
											<div className="mt-2">
												<input
													id="current-password"
													name="current_password"
													type="password"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="Masukkan Kata Sandi Saat Ini"
													ref={(el) => formRef.current.currentPassword = el}
												/>
												{
													errors?.currentPassword?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>

										{/* New Password */}
										<div className="col-span-full">
											<label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
												Kata Sandi Baru
											</label>
											<div className="mt-2">
												<input
													id="new-password"
													name="new_password"
													type="password"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="Masukkan Kata Sandi Baru"
													ref={(el) => formRef.current.newPassword = el}
												/>
												{
													errors?.newPassword?.map(err => (
														<p className='text-red-600 pl-3 text-sm'>{err}</p>
													))
												}
											</div>
										</div>

										{/* Confirm Password */}
										<div className="col-span-full">
											<label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
												Konfirmasi Kata Sandi
											</label>
											<div className="mt-2">
												<input
													id="confirm-password"
													name="confirm_password"
													type="password"
													className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													placeholder="Konfirmasi Kata Sandi Baru"
													ref={(el) => formRef.current.newPasswordConfirmation = el}
												/>
											</div>
										</div>
									</div>

									<div className="mt-8 flex justify-end">
										<button
											type="button"
											className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
											onClick={() => handleSubmitChangePassword()}
										>
											Perbarui Kata Sandi
										</button>
									</div>
								</form>
							</div>
						</div>
					</main>
				</div>
			</div>
		</Sidebar>
	)
}
