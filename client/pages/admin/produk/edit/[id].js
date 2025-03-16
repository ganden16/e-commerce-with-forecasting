import React, {useEffect, useRef, useState} from 'react'
import {PhotoIcon} from '@heroicons/react/24/solid'
import Sidebar from '@/components/admin/sidebar'
import {useRouter} from 'next/router'
import {deleteProduct, getAllCategories, getAllMethodsForecast, getOneProduct, updateProduct} from '@/lib/fetchApi'
import {sweetAlertDelete, SweetAlertError, sweetAlertSubmitData, SweetAlertSuccess} from '@/components/sweetAlert'


export default function EditProduk() {
	const [loadingSubmit, setLoadingSubmit] = useState(false)
	const router = useRouter()
	const {id} = router.query
	const [categories, setCategories] = useState([])
	const [methods, setMethods] = useState([])
	const [preview, setPreview] = useState(null)
	const [fileName, setFileName] = useState('')
	const [formInput, setFormInput] = useState(null)
	const [errors, setErrors] = useState([])
	const [countInputMethod, setCountInputMethod] = useState([
		{id: 1},
	])
	const inputMethodRef = useRef([])

	const tambahInputMethod = () => {
		if(countInputMethod.length <= 2) {
			const newInputMethod = {
				id: countInputMethod.length + 1,
			}
			setCountInputMethod([...countInputMethod, newInputMethod])
		} else {
			SweetAlertError('Maksimal metode peramalan 3')
		}
	}
	const kurangInputMethod = () => {
		if(countInputMethod.length > 1) {
			setCountInputMethod(countInputMethod.slice(0, countInputMethod.length - 1))
		}
	}

	const handleOtherDetailChange = (index, e) => {
		const newOtherDetail = [...formInput.other_detail]
		newOtherDetail[index] = e.target.value
		setFormInput((prev) => ({
			...prev,
			other_detail: newOtherDetail,
		}))
	}

	const handleAddOtherDetail = () => {
		setFormInput((prev) => ({
			...prev,
			other_detail: [...prev.other_detail, '']
		}))
	}

	const handleRemoveOtherDetail = (index) => {
		const newOtherDetail = formInput.other_detail.filter((_, i) => i !== index)
		setFormInput((prev) => ({
			...prev,
			other_detail: newOtherDetail,
		}))
	}

	const handleImageUpload = (file) => {
		if(file) {
			const objectUrl = URL.createObjectURL(file)
			setPreview(objectUrl)
			setFileName(file.name)
			setFormInput((prev) => ({
				...prev,
				fileImage: file
			}))
		}
	}

	const handleFileInputChange = (event) => {
		const file = event.target.files[0]
		handleImageUpload(file)
	}

	const handleDragOver = (event) => {
		event.preventDefault()
	}

	const handleDrop = (event) => {
		event.preventDefault()
		const file = event.dataTransfer.files[0]
		handleImageUpload(file)
	}

	const handleCancelUpload = () => {
		setPreview(null)
		setFileName('')
		URL.revokeObjectURL(preview)
		setFormInput((prev) => ({
			...prev,
			fileImage: null
		}))
	}

	const handleChangeFormInput = (e) => {
		setFormInput((prev) => ({
			...prev,
			[e.target.id]: e.target.value
		}))
	}

	const handleClickSubmit = () => {
		let readyStock = formInput.isReadyStock
		const formData = new FormData()

		if(loadingSubmit) return
		setLoadingSubmit(true)
		let valuesInputMethod = inputMethodRef.current.map((input) => input.value)
		const hasEmptyValue = valuesInputMethod.some((value) => value == "")
		const valuesInputMethodResult = hasEmptyValue ? "" : valuesInputMethod.map((value) => parseInt(value))

		if(valuesInputMethod.length > 1 && hasEmptyValue) {
			return SweetAlertError('metode peramalan anda kosong, kurangi data jika tidak ingin menambahkan')
		}

		formData.append('name', formInput.name)
		// formData.append('best_forecasting_method_id', formInput.best_forecasting_method_id)
		formData.append('category_id', formInput.category_id)
		formData.append('description', formInput.description)
		formData.append('price', formInput.price)
		formData.append('weight', formInput.weight)
		formData.append('readyStock', readyStock)
		formData.append('_method', 'PUT')

		if(formInput.fileImage) {
			formData.append('fileImage', formInput.fileImage)
		}

		if(Array.isArray(formInput.other_detail) && formInput.other_detail.length > 0) {
			formData.append('other_detail', JSON.stringify(formInput.other_detail))
		}

		if(Array.isArray(valuesInputMethod) && valuesInputMethodResult.length > 0) {
			formData.set('best_forecasting_method_id', JSON.stringify(valuesInputMethodResult))
		}

		// console.log('best_forecasting_method_formData', formData.get('best_forecasting_method_id'))

		sweetAlertSubmitData(() => {
			updateProduct(formInput.id,
				formData,
				(res) => {
					SweetAlertSuccess('Diupdate', res.data.message)
					setErrors({})
					setLoadingSubmit(false)
				},
				(err) => {
					SweetAlertError('Periksa data')
					setErrors(err.response.data.errors)
					setLoadingSubmit(false)
				}
			)
		})

	}

	const handleDeleteProduct = () => {
		sweetAlertDelete(`Hapus ${formInput.name}?`, () => {
			deleteProduct(formInput.id, ((res) => {
				SweetAlertSuccess('Dihapus', res.data.message)
				setTimeout(() => {
					router.push('/admin/produk/list')
				}, 1000)
			}))
		})
	}

	useEffect(() => {
		if(id) {
			getOneProduct(id, (res) => {
				const otherDetailArray = Array.isArray(res.data.other_detail)
					? res.data.other_detail
					: Array.isArray(JSON.parse(res.data.other_detail))
						? JSON.parse(res.data.other_detail)
						: []

				setFormInput({
					...res.data,
					other_detail: otherDetailArray,
				})
				setPreview(res.data.image)

				setCountInputMethod(
					res.data.best_forecasting_method.length > 0
						? res.data.best_forecasting_method.map((_, index) => ({id: index + 1}))
						: [{id: 1}]
				)
			})
			getAllCategories((res) => setCategories(res.data))
			getAllMethodsForecast((res) => setMethods(res.data))

		}
	}, [id])

	useEffect(() => {
		inputMethodRef.current = countInputMethod.map((_, index) => inputMethodRef.current[index] || null)
	}, [countInputMethod])

	if(!formInput) {
		return <div>Loading...</div>
	}
	console.log('formInput', formInput)
	console.log('countInputMethod', countInputMethod)
	return (
		<>
			<Sidebar headingPage="Edit Produk">
				<div className="space-y-10 divide-y divide-gray-900/10">
					<div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
						<div className="px-4 sm:px-0">
							<h2 className="text-base font-semibold leading-7 text-gray-900">Edit Produk</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								Id Produk : {formInput.id}
							</p>
						</div>

						<form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
							<div className="px-4 py-6 sm:p-8">
								<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
									<div className="sm:col-span-4">
										<label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
											Nama Produk
										</label>
										<div className="mt-2">
											<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300  sm:max-w-md">
												<input
													id="name"
													name="name"
													type="text"
													placeholder="(wajib diisi)"
													value={formInput.name}
													onChange={(e) => handleChangeFormInput(e)}
													className="block rounded-md flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:outline-none focus:ring-1 focus:ring-indigo-600"
												/>
											</div>
											{
												errors?.name?.length > 0 &&
												errors.name.map((err) => <p className='text-red-500 text-sm pl-3'>{err}</p>)
											}
										</div>
									</div>
									<div className="sm:col-span-4">
										<label htmlFor="category_id" className="block text-sm font-medium leading-6 text-gray-900">
											Kategori
										</label>
										<div className="mt-2">
											<select
												id="category_id"
												name="category_id"
												className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
												defaultValue={''}
												onChange={(e) => handleChangeFormInput(e)}
											>
												{categories.map((item, index) =>
													item.id == formInput.category_id ? <option key={item.name} selected value={item.id}>{item.name}</option> :
														<option key={item.name} value={item.id}>{item.name}</option>
												)}
											</select>
											{
												errors?.category_id?.length > 0 &&
												errors.category_id.map((err) => <p className='text-red-500 text-sm pl-3'>{err}</p>)
											}
										</div>
									</div>
									<div className="sm:col-span-4">
										<label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
											Harga
										</label>
										<div className="mt-2">
											<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 sm:max-w-md">
												<input
													id="price"
													name="price"
													type="number"
													placeholder="(wajib diisi)"
													value={formInput.price}
													onChange={(e) => handleChangeFormInput(e)}
													className="block rounded-md flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:outline-none focus:ring-1 focus:ring-indigo-600"
												/>
											</div>
											{
												errors?.price?.length > 0 &&
												errors.price.map((err) => <p className='text-red-500 text-sm pl-3'>{err}</p>)
											}
										</div>
									</div>
									<div className="sm:col-span-4">
										<label htmlFor="weight" className="block text-sm font-medium leading-6 text-gray-900">
											Berat (Gram)
										</label>
										<div className="mt-2">
											<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 sm:max-w-md">
												<input
													id="weight"
													name="weight"
													type="number"
													placeholder="(wajib diisi)"
													value={formInput.weight}
													onChange={(e) => handleChangeFormInput(e)}
													className="block rounded-md flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:outline-none focus:ring-1 focus:ring-indigo-600"
												/>
											</div>
											{
												errors?.weight?.length > 0 &&
												errors.weight.map((err) => <p className='text-red-500 text-sm pl-3'>{err}</p>)
											}
										</div>
									</div>
									<div className="sm:col-span-4">
										<label className="block text-sm font-medium leading-6 text-gray-900">
											Detail Lainnya
										</label>
										{formInput?.other_detail.map((detail, index) => (
											<div key={index} className="flex items-center gap-2 my-2">
												<input
													type="text"
													placeholder={`Detail ${index + 1}`}
													value={detail}
													onChange={(e) => handleOtherDetailChange(index, e)}
													className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
												/>
												{formInput?.other_detail.length > 1 &&
													<button
														type="button"
														onClick={() => handleRemoveOtherDetail(index)}
														className="rounded-md bg-red-600 px-3 py-1 text-sm text-white"
													>
														-
													</button>
												}
											</div>
										))}

										{
											errors?.other_detail?.length > 0 &&
											errors.other_detail.map((err) => <p className='text-red-500 text-sm pl-3'>{err}</p>)
										}

										<button
											type="button"
											onClick={handleAddOtherDetail}
											className="mt-2 rounded-md bg-green-600 px-3 py-2 text-sm text-white"
										>
											+ Detail Lain
										</button>

									</div>
									<div className="col-span-full">
										<label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
											Deskripsi Produk
										</label>
										<div className="mt-2">
											<textarea
												id="description"
												name="description"
												rows={5}
												className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 pl-3 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm sm:leading-6"
												value={formInput.description}
												onChange={(e) => handleChangeFormInput(e)}
												placeholder='(wajib diisi minimal 10 karakter)'
												defaultValue={''}
											/>
										</div>
										{
											errors?.description?.length > 0 &&
											errors.description.map((err) => <p className='text-red-500 text-sm pl-3'>{err}</p>)
										}
									</div>

									<div className="sm:col-span-4">
										<label htmlFor="best_forecasting_method_id" className="block text-sm font-medium leading-6 text-gray-900">
											Metode Forecasting
										</label>
										<div className="mt-2">
											{countInputMethod.map((item, i) => (
												<select
													id="best_forecasting_method_id"
													name="best_forecasting_method_id"
													className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
													ref={(el) => (inputMethodRef.current[i]) = el}
													defaultValue={''}
												>
													<option selected value={''}>---Tidak Ada---</option>
													{methods.map((method) => {
														const isSelected = formInput.best_forecasting_method.some((m) => m?.id === method.id)
														return (
															<option
																key={method.id}
																value={method.id}
																selected={formInput.best_forecasting_method.some((m, index) => m?.id === method.id && index === i)}
																disabled={isSelected && formInput.best_forecasting_method.some((m, index) => m?.id === method.id && index === i)}
															>
																{method.name}
															</option>
														)
													})}
												</select>
											))}
											<div className='flex gap-2 mt-2'>
												<button
													type="button"
													className="rounded-md bg-green-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
													onClick={tambahInputMethod}
												>
													+Tambah Metode+
												</button>
												{countInputMethod.length > 1 &&
													<button
														type="button"
														className="rounded-md bg-red-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
														onClick={kurangInputMethod}
													>
														-Kurangi Metode-
													</button>
												}
											</div>
										</div>
									</div>

									<fieldset className='sm:col-span-4'>
										<legend className="text-sm font-semibold leading-6 text-gray-900">Ketersediaan Stok</legend>
										<div className="mt-6 space-y-6">
											<div className="flex items-center gap-x-3">
												<input
													id="readyStock"
													name="stock"
													type="radio"
													checked={formInput.isReadyStock}
													onChange={() => setFormInput(prev => ({...prev, isReadyStock: true}))}
													className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
												/>
												<label htmlFor="readyStock" className="block text-sm font-medium leading-6 text-gray-900 cursor-pointer">
													Tersedia
												</label>
											</div>
											<div className="flex items-center gap-x-3">
												<input
													id="notReadyStock"
													name="stock"
													type="radio"
													checked={!formInput.isReadyStock}
													className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
													onChange={() => setFormInput(prev => ({...prev, isReadyStock: false}))}
												/>
												<label htmlFor="notReadyStock" className="block text-sm font-medium leading-6 text-gray-900 cursor-pointer">
													Tidak Tersedia
												</label>
											</div>
										</div>
									</fieldset>
									<div className="col-span-full">
										<label
											htmlFor="cover-photo"
											className="block text-sm font-medium leading-6 text-gray-900"
										>
											Gambar Produk
										</label>

										<div
											className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
											onDragOver={handleDragOver} // Menangani dragover
											onDrop={handleDrop} // Menangani drop
										>
											<div className="text-center">
												{!preview ? (
													<>
														{/* Icon photo */}
														<PhotoIcon
															aria-hidden="true"
															className="mx-auto h-12 w-12 text-gray-300"
														/>

														{/* Label dan Input untuk upload file */}
														<div className="mt-4 flex text-sm leading-6 text-gray-600">
															<label
																htmlFor="file-upload"
																className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
															>
																<span>Upload file</span>
																<input
																	id="file-upload"
																	name="file-upload"
																	type="file"
																	className="sr-only"
																	accept="image/*"
																	onChange={handleFileInputChange} // Event handler untuk mengunggah file via input
																/>
															</label>
															<p className="pl-1">atau drag drop</p>
														</div>

														{/* Instruksi ukuran file */}
														<p className="text-xs leading-5 text-gray-600">
															PNG, JPG, GIF Max 5MB
														</p>
													</>
												) : (
													<>
														{/* Menampilkan preview gambar */}
														<div className="mt-4">
															<p className="text-sm text-gray-600">{fileName}</p>
															<img
																src={preview}
																alt="Preview"
																className="max-w-xs mx-auto mt-2 rounded-md"
															/>
														</div>

														{/* Tombol untuk Cancel dan Change */}
														<div className="mt-4 flex justify-center gap-2">
															{!formInput?.image &&
																<button
																	type="button"
																	onClick={handleCancelUpload}
																	className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none"
																>
																	Batalkan
																</button>
															}
															<label
																htmlFor="file-upload"
																className="relative cursor-pointer rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none"
															>
																<span>Ubah Gambar</span>
																<input
																	id="file-upload"
																	name="file-upload"
																	type="file"
																	className="sr-only"
																	accept="image/*"
																	onChange={handleFileInputChange} // Mengubah gambar yang diupload
																/>
															</label>
														</div>
													</>
												)}
											</div>
										</div>
										{
											errors?.fileImage?.length > 0 &&
											errors.fileImage.map((err) => <p className='text-red-500 text-sm pl-3'>{err}</p>)
										}
									</div>
								</div>
							</div>
							<div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
								<button
									type="button"
									className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
									onClick={handleDeleteProduct}
								>
									Hapus Produk
								</button>
								<button
									type="button"
									className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
									onClick={() => handleClickSubmit()}
								>
									Submit dan Simpan
								</button>
							</div>
						</form>
					</div>
				</div>
			</Sidebar>
		</>
	)
}
