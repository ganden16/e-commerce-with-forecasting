import Sidebar from '@/components/admin/sidebar'
import SelectSimpleCustom from '@/components/admin/selectSimpleCustom'
import React, {useEffect, useRef, useState} from 'react'
import {CircleLoader} from 'react-spinners'
import {forecastAllMethod, forecastbestMethod, getAllMethodsForecast, getAllProducts, getAllTrainTestData} from '@/lib/fetchApi'
import {SweetAlertError} from '@/components/sweetAlert'
import SimpleFeed from '@/components/admin/simpleFeed'
import {CheckIcon} from '@heroicons/react/20/solid'
import Link from 'next/link'
import GrafikPeramalan from '@/components/admin/grafikPeramalan'

export default function Peramalan() {
	const [listProduct, setListProduct] = useState([])
	const [selectedProduct, setSelectedProduct] = useState(null)
	const initialStateFormOptional = {
		step: '',
		dataUji: ['']
	}
	const [formOptional, setFormOptional] = useState(initialStateFormOptional)
	const [loadingSubmit, setLoadingSubmit] = useState(false)
	const [resultForecast, setResultForecast] = useState(null)
	const [dataForecast, setDataForecast] = useState(null)
	const [penjualan, setPenjualan] = useState([])

	const handleSubmit = async () => {
		if(!selectedProduct) {
			return SweetAlertError('Silahkan memilih produk dulu')
		}
		if(selectedProduct.train_test_data.length < 10) {
			return SweetAlertError('Training & testing data masih kurang, minimal 10 data. Silahkan mengisi training & testing data')
		}
		if(selectedProduct.best_forecasting_method.length < 1) {
			return SweetAlertError('Produk tidak memiliki metode forecasting, silahkan lakukan pemodelan kemudian simpan metodenya')
		}

		const hasEmptyValue = formOptional.dataUji.some(value => value == '' || value == null || value == "")
		const hasNonEmptyValue = formOptional.dataUji.some(value => value != '' && value != null)

		if(hasEmptyValue && hasNonEmptyValue) {
			return SweetAlertError('Data Uji masih ada yang kosong')
		}

		if(formOptional.dataUji.every(value => value == '' || value == null || value == "")) {
			setFormOptional(prev => ({
				...prev,
				dataUji: []
			}))
		}

		setLoadingSubmit(true)
		setResultForecast(null)
		const forecasting_method_id = selectedProduct.best_forecasting_method.map((method) => method.id)
		forecastAllMethod({
			sales_data: selectedProduct.train_test_data,
			steps: formOptional.step ? parseInt(formOptional.step) : 1
		}, (res) => {
			console.log('res', res)
			setResultForecast(res.data.results)
			const responseDataForecast = res.data.results.map((item, index) => item.forecast).map((itemF) => itemF.map((i) => Math.round(i)))
			setDataForecast(responseDataForecast)
		}, () => {
			setLoadingSubmit(false)
		})
		// forecastbestMethod(
		// 	{
		// 		sales_data: selectedProduct.train_test_data,
		// 		forecasting_method_id,
		// 		steps: formOptional.step ? parseInt(formOptional.step) : 1
		// 	},
		// 	(res) => {
		// 		setResultForecast(res.data.results)
		// 		const responseDataForecast = res.data.results.map((item, index) => item.forecast).map((itemF) => itemF.map((i) => Math.round(i)))
		// 		setDataForecast(responseDataForecast)
		// 	},
		// 	() => {
		// 		setLoadingSubmit(false)
		// 	}
		// )
	}

	useEffect(() => {
		if(selectedProduct?.id) {
			setPenjualan(
				Array.isArray(selectedProduct.train_test_data)
					? selectedProduct.train_test_data
					: JSON.parse(selectedProduct.train_test_data)
			)
		} else {
			setSelectedProduct(null)
			setPenjualan([])
		}
		setResultForecast(null)
	}, [selectedProduct])

	useEffect(() => {
		getAllProducts('', (res) => {
			const parsedData = res.data.map((item) => ({
				...item,
				train_test_data: item.train_test?.train_test_data && item.best_forecasting_method ? JSON.parse(item.train_test.train_test_data) : []
			}))
			setListProduct(parsedData)
		})
	}, [])

	// Fungsi untuk menambah input dataUji
	const tambahInputDataUji = () => {
		setFormOptional((prev) => ({
			...prev,
			dataUji: [...prev.dataUji, '']
		}))
	}

	// Fungsi untuk mengurangi input dataUji
	const kurangiInputDataUji = () => {
		if(formOptional.dataUji.length > 1) {
			setFormOptional((prev) => ({
				...prev,
				dataUji: prev.dataUji.slice(0, -1)
			}))
		}
	}

	// Fungsi untuk mengupdate nilai input dataUji
	const handleInputChangeDataUji = (index, value) => {
		setFormOptional((prev) => {
			const newDataUji = [...prev.dataUji]
			newDataUji[index] = parseInt(value)
			return {...prev, dataUji: newDataUji}
		})
	}

	console.log('formOptional', formOptional)

	return (
		<>
			<Sidebar headingPage="Peramalan Metode Terbaik">
				<div className="space-y-10 divide-y divide-gray-500/10">
					<div className="grid grid-cols-3 gap-x-8 gap-y-8">
						{/* Kolom Hasil Peramalan */}
						<div className="col-span-1 px-4 sm:px-0">
							<h2 className="text-base font-medium leading-7 text-gray-900 mb-4">
								Peramalan penjualan dengan metode terbaik
							</h2>
							<h2 className="text-base font-bold leading-7 text-gray-900 my-4">Hasil : {" "}</h2>
							{loadingSubmit && <CircleLoader size={20} color="#36d7b7" />}
							{resultForecast?.length > 0 && (
								<div className="flow-root">
									<ul role="list" className="-mb-8">
										{resultForecast.map((item, index) => (
											<li key={index + 'result forecast'}>
												<div className="relative pb-8">
													{index !== resultForecast.length - 1 ? (
														<span aria-hidden="true" className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" />
													) : null}
													<div className="relative flex space-x-3">
														<div>
															<span
																className={`bg-green-500 flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white`}
															>
																<CheckIcon aria-hidden="true" className="h-5 w-5 text-white" />
															</span>
														</div>
														<div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
															<div>
																{selectedProduct.best_forecasting_method.map((method) => {
																	if(method.id == item.method_id) {
																		return (
																			<p className="text-sm text-green-600">{method.name}</p>
																		)
																	}
																})}
															</div>
															<div className="whitespace-nowrap text-right text-sm text-gray-500">
																{item.forecast?.map((f) => (
																	<p>{Math.round(f)}</p>
																))}
															</div>
														</div>
													</div>
												</div>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* Kolom Form Input */}
						<div className="col-span-2 bg-white p-6 rounded-lg">
							<div className="mb-6">
								<label htmlFor="productName" className="block text-lg font-bold mb-2">
									Nama Produk:
								</label>
								<select
									id="productName"
									className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									onChange={(e) => {
										const selectedId = e.target.value
										const selectedItem = listProduct.find(item => item.id == parseInt(selectedId))
										setSelectedProduct(selectedItem)
									}}
								>
									<option value="">---Pilih---</option>
									{listProduct && listProduct.map(item => (
										<option key={item.id} value={item.id}>{item.name}</option>
									))}
								</select>
							</div>

							<div className="mb-4">
								<label className="block text-lg font-bold mb-2">
									Data Penjualan:
								</label>
								<table className="min-w-full border-collapse border border-gray-300">
									<thead>
										<tr>
											<th className="py-2 px-4 border border-gray-300 text-center">Minggu Ke-</th>
											<th className="py-2 px-4 border border-gray-300 text-center">Data Penjualan</th>
										</tr>
									</thead>
									<tbody>
										{Array.isArray(penjualan) &&
											penjualan.map((data, index) => (
												<tr key={index}>
													<td className="py-2 px-4 border border-gray-300 text-center">{index + 1}</td>
													<td className="py-2 px-4 border border-gray-300 text-center">{data}</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>

							<div className="mb-6">
								<label htmlFor="step" className="block text-lg font-bold mb-2">
									Step (optional):
								</label>
								<input
									id="step"
									className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="berapa minggu?"
									type="number"
									onChange={(e) => {
										const newStep = e.target.value
										setFormOptional((prev) => ({
											...prev,
											step: newStep,
											dataUji: Array(newStep ? parseInt(newStep) : 1).fill('')
										}))
									}}
								/>
							</div>

							{/* Form Input Data Uji */}
							<div className="mb-6">
								<label className="block text-lg font-bold mb-2">
									Data Uji/Aktual (Optional):
								</label>
								{formOptional.dataUji.map((value, index) => {
									// Hitung indeks minggu untuk placeholder
									const weekIndex = penjualan.length + index + 1
									return (
										<div key={index} className="flex items-center space-x-2 mb-2">
											<input
												type="number"
												value={value}
												onChange={(e) => handleInputChangeDataUji(index, e.target.value)}
												className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												placeholder={`Data aktual minggu ke-${weekIndex}`}
											/>
										</div>
									)
								})}
								<div className="flex space-x-2">
									{/* Tombol Tambah Input */}
									<button
										onClick={tambahInputDataUji}
										className="w-auto py-2 px-4 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md transition duration-300 hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-300 flex items-center justify-center"
									>
										Tambah Input
									</button>
									{/* Tombol Kurangi Input */}
									<button
										onClick={kurangiInputDataUji}
										className="w-auto py-2 px-4 font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 rounded-lg shadow-md transition duration-300 hover:from-red-600 hover:to-red-800 focus:ring-2 focus:ring-red-300 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
									>
										Kurangi Input
									</button>
								</div>
							</div>

							<div className="flex justify-end mt-20">
								<div className="flex flex-col items-end space-y-4">
									{/* Tombol Ubah Data */}
									{selectedProduct?.id && (
										<Link
											href="/admin/peramalan/traintest"
											className="w-auto py-2 px-8 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md transition duration-300 hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-300 flex items-center justify-center"
										>
											Ubah Data
										</Link>
									)}

									{/* Tombol Submit */}
									<button
										type="button"
										disabled={loadingSubmit}
										onClick={handleSubmit}
										className={`w-auto py-2 px-32 font-semibold text-white rounded-lg shadow-md transition duration-300 flex items-center justify-center ${loadingSubmit
											? "bg-gray-400 cursor-not-allowed"
											: "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-2 focus:ring-green-300"
											}`}
									>
										{loadingSubmit ? "Processing..." : "Submit"}
									</button>
								</div>
							</div>
						</div>
					</div>
					{resultForecast && resultForecast.map((item, index) => (
						<div key={index}>
							<div className="mt-6 bg-white p-6 rounded-lg w-full max-w-4xl">
								<h2 className="text-xl font-bold text-center text-black">
									GRAFIK {selectedProduct.best_forecasting_method.map((method) => method.id == item.method_id ? method.name.toUpperCase().replace(/-/g, ' ') : '')}
								</h2>
								<div className="mt-6 overflow-x-auto">
									<GrafikPeramalan y1={selectedProduct.train_test_data} y2={dataForecast[index]} y3={formOptional.dataUji}
										y1Label='Training & Testing' y2Label='Forecasting' y3Label='Aktual'
										xText='MINGGU' yText='PENJUALAN'
										labelsChartData={Array.from({length: selectedProduct.train_test_data.length + dataForecast[index].length}, (_, i) => `Minggu ${i + 1}`)} />
								</div>
							</div>
						</div>
					))}
				</div>
			</Sidebar>
		</>
	)
}