import {useEffect, useRef, useState} from 'react'
import HeaderUser from '@/components/user/header'
import FooterUser from '@/components/user/footer'
import AuthMiddleware from '@/components/authMiddleware'
import {useSelector} from 'react-redux'
import {SweetAlertError, sweetAlertSubmitData, SweetAlertSuccess} from '@/components/sweetAlert'
import {changePassword, getAllProvinces, getCityByProvinceId, getDistrictByCityId, getSubdistrict, getSubdistrictByDistrictId, updateProfile} from '@/lib/fetchApi'
import UserMiddleware from '@/components/userMiddleware'

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
		formData.append('address', formRef.current.address.value)
		formData.append('province_id', formRef.current.province_id.value)
		formData.append('city_id', formRef.current.city_id.value)
		formData.append('district_id', formRef.current.district_id.value)
		formData.append('subdistrict_id', formRef.current.subdistrict_id.value)
		formData.append('postal_code', formRef.current.postal_code.value)
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
		<AuthMiddleware>
			<UserMiddleware>
				<HeaderUser />
				<div className='h-full bg-gray-700'>
					<div className="xl:pl-72">
						<main>
							{/* Settings forms */}
							<div className="divide-y divide-white/5">
								{/* Ubah Personal Profil */}
								<div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8 pt-28">
									<div>
										<h2 className="text-base font-semibold leading-7 text-white">Ubah Personal Profil</h2>
										<p className="mt-1 text-sm leading-6 text-gray-400">
											Perbarui informasi personal Anda dan ubah foto profil.
										</p>
									</div>

									<form className="md:col-span-2">
										<div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
											{/* Preview dan Input Foto Profil */}
											<div className="col-span-full flex items-center gap-x-8">
												<div>
													<img
														alt="Profile Avatar"
														src={selectedImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
														className="h-24 w-24 flex-none rounded-full bg-gray-800 object-cover"
													/>
													<p className='text-white ps-3'>{fileName ?? ''}</p>
												</div>
												<div>
													<label
														htmlFor="profile-photo"
														className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20 cursor-pointer"
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
													<p className="mt-2 text-xs leading-5 text-gray-400">JPG, GIF, atau PNG. 1MB max.</p>
													{
														errors?.fileImage?.map(err => (
															<p className='text-red-600 text-sm'>{err}</p>
														))
													}
												</div>
											</div>

											{/* Nama Lengkap */}
											<div className="sm:col-span-3">
												<label htmlFor="name" className="block text-sm font-medium leading-6 text-white">
													Nama Lengkap
												</label>
												<div className="mt-2">
													<input
														id="name"
														name="name"
														type="text"
														autoComplete="given-name"
														required
														className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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

											{/* Username */}
											<div className="sm:col-span-3">
												<label htmlFor="username" className="block text-sm font-medium leading-6 text-white">
													Username
												</label>
												<div className="mt-2">
													<input
														id="username"
														name="username"
														type="text"
														autoComplete="username"
														required
														className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
														placeholder="Username"
														defaultValue={user?.username}
														ref={(el) => formRef.current.username = el}
													/>
													{
														errors?.username?.map(err => (
															<p className='text-red-600 pl-3 text-sm'>{err}</p>
														))
													}
												</div>
											</div>

											{/* Email */}
											<div className="col-span-full">
												<label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
													Email Address
												</label>
												<div className="mt-2">
													<input
														id="email"
														name="email"
														type="email"
														autoComplete="email"
														required
														className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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

											{/* WhatsApp */}
											<div className="sm:col-span-3">
												<label htmlFor="whatsapp" className="block text-sm font-medium leading-6 text-white">
													WhatsApp
												</label>
												<div className="mt-2">
													<input
														id="whatsapp"
														name="whatsapp"
														type="text"
														autoComplete="tel"
														required
														className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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

											{/* Telephone */}
											<div className="sm:col-span-3">
												<label htmlFor="telephone" className="block text-sm font-medium leading-6 text-white">
													Telepon
												</label>
												<div className="mt-2">
													<input
														id="telephone"
														name="telephone"
														type="text"
														autoComplete="tel"
														required
														className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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

											{/* Jenis Kelamin */}
											<div className="col-span-full">
												<label htmlFor="gender" className="block text-sm font-medium leading-6 text-white">
													Jenis Kelamin
												</label>
												<div className="mt-2">
													<select
														id="gender"
														name="gender"
														required
														className="block w-full rounded-md border-0 bg-gray-700 text-white py-1.5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
														ref={(el) => formRef.current.gender = el}
													>
														<option value="" className="text-gray-400">---Pilih Jenis Kelamin---</option>
														<option value="true" selected={user?.gender == true} className="text-white">Laki-laki</option>
														<option value="false" selected={user?.gender == false} className="text-white">Perempuan</option>
													</select>
													{
														errors?.gender?.map(err => (
															<p className='text-red-600 pl-3 text-sm'>{err}</p>
														))
													}
												</div>
											</div>

											{/* Alamat */}
											<div className="col-span-full">
												<label htmlFor="address" className="block text-sm font-medium leading-6 text-white">
													Alamat
												</label>
												<div className="mt-2">
													<textarea
														id="address"
														name="address"
														rows="3"
														required
														className="block w-full rounded md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
														placeholder="(wajib diisi)"
														defaultValue={user?.address}
														ref={(el) => formRef.current.address = el}
													/>
												</div>
											</div>

											{/* Provinsi */}
											<div className="col-span-full">
												<label htmlFor="province" className="block text-sm font-medium leading-6 text-white">
													Provinsi
												</label>
												<div className="mt-2">
													<select
														id="province"
														name="province"
														required
														className="block w-full rounded-md border-0 bg-gray-700 text-white py-1.5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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

											{/* Kota/Kabupaten */}
											<div className="col-span-full">
												<label htmlFor="city" className="block text-sm font-medium leading-6 text-white">
													Kota/Kabupaten
												</label>
												<div className="mt-2">
													<select
														id="city"
														name="city"
														required
														className="block w-full rounded-md border-0 bg-gray-700 text-white py-1.5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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

											{/* Kecamatan */}
											<div className="col-span-full">
												<label htmlFor="district" className="block text-sm font-medium leading-6 text-white">
													Kecamatan
												</label>
												<div className="mt-2">
													<select
														id="district"
														name="district"
														required
														className="block w-full rounded-md border-0 bg-gray-700 text-white py-1.5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
														ref={(el) => formRef.current.district_id = el}
														onChange={handleDistrictChange}
													>
														<option value="" className="text-gray-400">---Pilih Kecamatan---</option>
														{district?.length > 0 && district.map((data) => (
															<option selected={selectedRegion?.district_id == data.id} key={data.id + 'district'} value={data.id}>{data.name}</option>
														))}
													</select>
													{
														errors?.district_id?.map(err => (
															<p className='text-red-600 pl-3 text-sm'>{err}</p>
														))
													}
												</div>
											</div>

											{/* Desa */}
											<div className="col-span-full">
												<label htmlFor="subdistrict" className="block text-sm font-medium leading-6 text-white">
													Desa/Kelurahan
												</label>
												<div className="mt-2">
													<select
														id="subdistrict"
														name="subdistrict"
														required
														className="block w-full rounded-md border-0 bg-gray-700 text-white py-1.5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
														ref={(el) => formRef.current.subdistrict_id = el}
														onChange={handleSubdistrictChange}
													>
														<option value="" className="text-gray-400">---Pilih Desa/Kelurahan---</option>
														{subdistrict?.length > 0 && subdistrict.map((sub) => (
															<option selected={selectedRegion?.subdistrict_id == sub.id} key={sub.id + 'subdistrict'} value={sub.id}>{sub.name}</option>
														))}
													</select>
												</div>
											</div>

											{/* Kode Pos */}
											<div className="sm:col-span-3">
												<label htmlFor="postal_code" className="block text-sm font-medium leading-6 text-white">
													Kode Pos
												</label>
												<div className="mt-2">
													<input
														id="postal_code"
														name="postal_code"
														type="text"
														className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
														placeholder="kode pos"
														defaultValue={user?.postal_code}
														ref={(el) => formRef.current.postal_code = el}
													/>
												</div>
											</div>
										</div>

										<div className="mt-8 flex">
											<button
												type="button"
												className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
												onClick={() => handleSubmitProfile()}
											>
												Simpan
											</button>
										</div>
									</form>
								</div>

								{/* Change Password */}
								{!user?.google_id && (
									<div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
										<div>
											<h2 className="text-base font-semibold leading-7 text-white">Ubah Kata Sandi</h2>
											<p className="mt-1 text-sm leading-6 text-gray-400">
												Perbarui kata sandi yang terhubung dengan akun Anda.
											</p>
										</div>

										<form className="md:col-span-2">
											<div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
												<div className="col-span-full">
													<label htmlFor="current-password" className="block text-sm font-medium leading-6 text-white">
														Kata Sandi Saat Ini
													</label>
													<div className="mt-2">
														<input
															id="current-password"
															name="current_password"
															type="password"
															required
															className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
															placeholder="Kata Sandi Saat Ini"
															ref={(el) => formRef.current.currentPassword = el}
														/>
														{
															errors?.currentPassword?.map(err => (
																<p className='text-red-600 pl-3 text-sm'>{err}</p>
															))
														}
													</div>
												</div>

												<div className="col-span-full">
													<label htmlFor="new-password" className="block text-sm font-medium leading-6 text-white">
														Kata Sandi Baru
													</label>
													<div className="mt-2">
														<input
															id="new-password"
															name="new_password"
															type="password"
															required
															className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
															placeholder="Kata Sandi Baru"
															ref={(el) => formRef.current.newPassword = el}
														/>
														{
															errors?.newPassword?.map(err => (
																<p className='text-red-600 pl-3 text-sm'>{err}</p>
															))
														}
													</div>
												</div>

												<div className="col-span-full">
													<label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-white">
														Konfirmasi Kata Sandi Baru
													</label>
													<div className="mt-2">
														<input
															id="confirm-password"
															name="confirm_password"
															type="password"
															required
															className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
															placeholder="Konfirmasi Kata Sandi"
															ref={(el) => formRef.current.newPasswordConfirmation = el}
														/>
													</div>
												</div>
											</div>

											<div className="mt-8 flex">
												<button
													type="button"
													className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
													onClick={() => handleSubmitChangePassword()}
												>
													Simpan
												</button>
											</div>
										</form>
									</div>
								)}
							</div>
						</main>
					</div>
				</div>
				<FooterUser />
			</UserMiddleware>
		</AuthMiddleware>
	)
}
