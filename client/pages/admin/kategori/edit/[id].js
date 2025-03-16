import React, {useEffect, useRef, useState} from 'react'
import Sidebar from '@/components/admin/sidebar'
import {useRouter} from 'next/router';
import {deleteCategory, getOneCategory, updateCategory} from '@/lib/fetchApi';
import {sweetAlertDelete, sweetAlertSubmitData, SweetAlertSuccess} from '@/components/sweetAlert';
import {PhotoIcon} from '@heroicons/react/20/solid';

export default function EditCategory() {
	const [preview, setPreview] = useState(null)
	const [fileName, setFileName] = useState('')
	const router = useRouter();
	const formRef = useRef({})
	const formData = new FormData()
	const [errors, setErrors] = useState()

	const {id} = router.query
	const [categoryData, setCategoryData] = useState(null);

	const handleImageUpload = (file) => {
		if(file) {
			const objectUrl = URL.createObjectURL(file)
			setPreview(objectUrl);
			setFileName(file.name);
			formRef.current.fileImage = file
		}
	};

	const handleFileInputChange = (event) => {
		const file = event.target.files[0]
		handleImageUpload(file)
	};

	const handleDragOver = (event) => {
		event.preventDefault()
	};

	const handleDrop = (event) => {
		event.preventDefault()
		const file = event.dataTransfer.files[0]
		handleImageUpload(file)
	};

	const handleCancelUpload = () => {
		setPreview(null)
		setFileName('')
		URL.revokeObjectURL(preview)
		formRef.current.fileImage = null
	};

	const handleClickSubmit = () => {
		formData.append('name', formRef.current.name.value)
		formData.append('description', formRef.current.description.value)
		formData.append('_method', 'PUT')
		if(formRef.current.fileImage) {
			formData.append('fileImage', formRef.current.fileImage)
		}
		sweetAlertSubmitData(() => {
			updateCategory(
				id,
				formData,
				(res) => {
					SweetAlertSuccess('Diupdate', res.data.message)
					setErrors({})
				},
				(err) => setErrors(err.response.data.errors)
			)
		})
	}

	const handleDeleteCategory = () => {
		sweetAlertDelete(`Hapus ${categoryData.name}?`, () => {
			deleteCategory(categoryData.id, ((res) => {
				SweetAlertSuccess('Dihapus', res.data.message)
				setTimeout(() => {
					router.push('/admin/kategori/list')
				}, 1000)
			}))
		})
	}

	useEffect(() => {
		if(id) {
			getOneCategory(id, (res) => {
				setCategoryData(res.data)
				setPreview(res.data.image)
			});
		}
	}, [id]);

	if(!categoryData) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<Sidebar headingPage="Edit Kategori">
				<div className="space-y-10 divide-y divide-gray-900/10">
					<div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
						<div className="px-4 sm:px-0">
							<h2 className="text-base font-semibold leading-7 text-gray-900">Edit Kategori</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								Id Produk : {categoryData.id}
							</p>
						</div>

						<form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
							<div className="px-4 py-6 sm:p-8">
								<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
									<div className="sm:col-span-4">
										<label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
											Nama Kategori
										</label>
										<div className="mt-2">
											<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300  sm:max-w-md">
												<input
													id="name"
													name="name"
													type="text"
													placeholder="(wajib diisi)"
													defaultValue={categoryData.name}
													ref={(el) => formRef.current.name = el}
													className="block rounded-md flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:outline-none focus:ring-1 focus:ring-indigo-600"
												/>
											</div>
											{
												errors?.name?.map(err => (
													<p className='text-red-600 pl-3 text-sm'>{err}</p>
												))
											}
										</div>
									</div>
									<div className="col-span-full">
										<label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
											Deskripsi Kategori
										</label>
										<div className="mt-2">
											<textarea
												id="description"
												name="description"
												rows={5}
												className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 pl-3 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm sm:leading-6"
												defaultValue={categoryData.description}
												ref={(el) => formRef.current.description = el}
											/>
										</div>
										{
											errors?.description?.map(err => (
												<p className='text-red-600 pl-3 text-sm'>{err}</p>
											))
										}
									</div>
									<div className="col-span-full">
										<label
											htmlFor="cover-photo"
											className="block text-sm font-medium leading-6 text-gray-900"
										>
											Gambar Kategori
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
															{!categoryData?.image &&
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
							<div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
								<button
									type="button"
									className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
									onClick={handleDeleteCategory}
								>
									Hapus Kategori
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
