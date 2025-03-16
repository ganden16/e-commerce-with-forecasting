import GrafikPeramalan from "@/components/admin/grafikPeramalan"
import Grafik from "@/components/admin/grafikPeramalan"
import Sidebar from "@/components/admin/sidebar"
import {SweetAlertConfirm, SweetAlertError, SweetAlertSuccess} from "@/components/sweetAlert"
import {getAllTrainTestData, getBestModel, updateProductForecastingMethod} from "@/lib/fetchApi"
import Link from "next/link"
import React, {useEffect, useRef, useState} from "react"

const Pemodelan = () => {
	const [listProduct, setListProduct] = useState(null)
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [result, setResult] = useState(null)
	const [loading, setLoading] = useState(false)
	const [penjualan, setPenjualan] = useState([])

	const handleSubmit = () => {
		if(!selectedProduct?.id) {
			return SweetAlertError('Pilih produk dulu')
		}
		if(penjualan.length < 10) {
			return SweetAlertError('Data penjualan kurang')
		}
		setLoading(true)
		getBestModel({
			sales_data: penjualan
		}, (res) => {
			setResult(res.data)
			setLoading(false)
		},
			(err) => {
				setLoading(false)
			}
		)
	}

	const handleClickTerapkanModelSekarang = () => {
		const bestMethod = result.best_models.map(model => model.method_id)
		console.log(bestMethod)
		SweetAlertConfirm('Apakah anda yakin?', 'metode peramalan akan disimpan ke data produk', async () => {
			updateProductForecastingMethod(selectedProduct.product.id, {
				bestMethod: bestMethod
			}, (res) => {
				SweetAlertSuccess('Sukses', res.data.message)
			}, (err) => {
				SweetAlertError(err.response.data.message)
			})
		})
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
		setResult(null)
	}, [selectedProduct])

	useEffect(() => {
		getAllTrainTestData((res) => {
			const parsedData = res.data.data.map((item) => ({
				...item,
				train_test_data: JSON.parse(item.train_test_data)
			}))
			setListProduct(parsedData)
		})
	}, [])

	// console.log('penjualan', penjualan)
	// console.log('listProduct', listProduct)
	// console.log('selectedProduct', selectedProduct)
	console.log('result', result)

	return (
		<Sidebar headingPage="Pemodelan Peramalan">
			<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 rounded-lg">
				<h1 className="text-2xl font-bold text-gray-700 mb-6">
					Pemodelan
				</h1>
				<div
					className="bg-white p-6 rounded-lg w-full max-w-2xl"
				>
					<div className="mb-4">
						<label htmlFor="productName" className="block text-lg font-bold mb-2">
							Nama Produk:
						</label>
						<select
							id="productName"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							onChange={(e) => {
								const selectedId = e.target.value
								const selectedItem = listProduct.find(item => item.product_id == parseInt(selectedId))
								setSelectedProduct(selectedItem)
							}}
						>
							<option value="">---Pilih---</option>
							{listProduct && listProduct.map(item => (
								<option key={item.id} value={item.product_id}>{item.product.name}</option>
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

					<div className="flex justify-between">
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
							disabled={loading}
							onClick={handleSubmit}
							className={`w-auto py-2 px-32 font-semibold text-white rounded-lg shadow-md transition duration-300 flex items-center justify-center ${loading
								? "bg-gray-400 cursor-not-allowed"
								: "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-2 focus:ring-green-300"
								}`}
						>
							{loading ? "Processing..." : "Submit"}
						</button>
					</div>
				</div>

				{result && (
					<>
						<div className="mt-6 bg-white p-8 rounded-lg shadow-md w-full max-w-6xl mx-auto">
							{/* Judul */}
							<h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Hasil Pemodelan</h2>

							{/* Informasi Produk dan Model Terbaik */}
							<div className="mb-6">
								<p className="text-sm text-gray-700">
									Peramalan penjualan{' '}
									<strong className="text-indigo-600">{selectedProduct ? selectedProduct.product.name : ''}</strong> dengan model terbaik:{' '}
									<strong className="text-green-600">{result.best_models.map((data) => data.model).join(', ')}</strong>
								</p>
							</div>

							{/* Link Aksi */}
							<div className="flex justify-center mb-8 gap-5">
								<Link
									className="underline text-indigo-600 hover:text-indigo-800 transition duration-300"
									href={selectedProduct ? `/admin/produk/edit/${selectedProduct.product_id}` : '/admin/produk/list'}
									target="_blank"
									rel="noopener noreferrer"
								>
									Terapkan Model Manual
								</Link>
								<p
									className="cursor-pointer underline text-indigo-600 hover:text-indigo-800 transition duration-300"
									onClick={handleClickTerapkanModelSekarang}
								>
									Terapkan Model Sekarang
								</p>
							</div>

							{/* Deskripsi Hasil */}
							<div className="mb-8">
								<p className="text-sm text-gray-700">
									Berikut hasil pemodelan yang diurutkan berdasarkan nilai error MAE terkecil:
								</p>
							</div>

							{/* Tabel Hasil Pemodelan */}
							<div className="overflow-x-auto">
								<table className="min-w-full table-auto border-collapse border border-gray-300">
									<thead className="bg-gray-100">
										<tr>
											<th className="py-3 px-4 font-semibold text-gray-800 border border-gray-300 text-center">#</th>
											<th className="py-3 px-4 font-semibold text-gray-800 border border-gray-300 text-left">Nama Model</th>
											<th className="py-3 px-4 font-semibold text-gray-800 border border-gray-300 text-left">MAE</th>
											{/* <th className="py-3 px-4 font-semibold text-gray-800 border border-gray-300 text-left">MSE</th> */}
											{/* <th className="py-3 px-4 font-semibold text-gray-800 border border-gray-300 text-left">Combined Error</th> */}
										</tr>
									</thead>
									<tbody>
										{result.models.map((model, index) => (
											<tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
												<td className="py-3 px-4 text-sm text-center font-medium text-gray-900 border border-gray-300">{index + 1}</td>
												<td className="py-3 px-4 text-sm font-medium text-gray-900 border border-gray-300">{model.model}</td>
												<td className="py-3 px-4 text-sm text-gray-700 border border-gray-300">{model.mae.toFixed(4)}</td>
												{/* <td className="py-3 px-4 text-sm text-gray-700 border border-gray-300">{model.mse.toFixed(4)}</td> */}
												{/* <td className="py-3 px-4 text-sm text-gray-700 border border-gray-300">{model.combined_score_errors.toFixed(4)}</td> */}
											</tr>
										))}
									</tbody>
									<tfoot className="bg-gray-100">
										<tr>
											<td colSpan="2" className="py-3 px-4 text-sm font-semibold text-gray-800 border border-gray-300">
												Input Data Penjualan ({penjualan.length})
											</td>
											<td colSpan="3" className="py-3 px-4 text-sm text-gray-700 border border-gray-300">
												{penjualan.join(', ')}
											</td>
										</tr>
										{result.preprocess_data && (
											<tr>
												<td colSpan="2" className="py-3 px-4 text-sm font-semibold text-gray-800 border border-gray-300">
													Data Imputation ({result.preprocess_data.length})
												</td>
												<td colSpan="3" className="py-3 px-4 text-sm text-gray-700 border border-gray-300">
													{result.preprocess_data.join(', ')}
												</td>
											</tr>
										)}
										<tr>
											<td colSpan="2" className="py-3 px-4 text-sm font-semibold text-gray-800 border border-gray-300">
												Data Training ({result.data_training.length})
											</td>
											<td colSpan="3" className="py-3 px-4 text-sm text-gray-700 border border-gray-300">
												{result.data_training.join(', ')}
											</td>
										</tr>
										<tr>
											<td colSpan="2" className="py-3 px-4 text-sm font-semibold text-gray-800 border border-gray-300">
												Data Testing ({result.data_testing.length})
											</td>
											<td colSpan="3" className="py-3 px-4 text-sm text-gray-700 border border-gray-300">
												{result.data_testing.join(', ')}
											</td>
										</tr>
										<tr>
											<td colSpan="2" className="py-3 px-4 text-sm font-semibold text-gray-800 border border-gray-300">
												Model Terbaik
											</td>
											<td colSpan="3" className="py-3 px-4 text-sm text-green-600 border border-gray-300">
												{result.best_models.map((data) => data.model).join(', ')}
											</td>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>
					</>
				)}
				{/* <div className="mt-6 bg-white p-6 rounded-lg w-full max-w-4xl">
					<h2 className="text-xl font-bold text-center text-black mb-10">Grafik 1</h2>
					<br />
					<br />
					<div className="mt-6 overflow-x-auto">
						<Grafik />
					</div>
				</div> */}

				{result && (
					<div className="mt-6 bg-white p-8 rounded-lg shadow-md w-full max-w-6xl mx-auto">
						<h2 className="text-xl font-bold text-center text-black mb-2">
							GRAFIK MAE
						</h2>
						<GrafikPeramalan y1={result.models.map((item) => item.mae)}
							y1Label='mae' y2Label='mae' y3Label='mae'
							xText='MODEL' yText='MAE'
							labelsChartData={result.models.map((item) => item.slug)} />
					</div>
				)}

			</div>
		</Sidebar>
	)
}

export default Pemodelan
