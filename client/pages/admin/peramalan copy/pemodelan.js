import Sidebar from "@/components/admin/sidebar"
import {getAllProducts, getBestModel} from "@/lib/fetchApi"
import Link from "next/link"
import React, {useEffect, useRef, useState} from "react"

const App = () => {
	const [listProduct, setListProduct] = useState(null)
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [result, setResult] = useState(null)
	const [loading, setLoading] = useState(false)
	const [penjualan, setPenjualan] = useState([
		{id: 1, value: 200},
		{id: 2, value: 220},
		{id: 3, value: 210},
		{id: 4, value: ''},
		{id: 5, value: 225},
		{id: 6, value: 230},
		{id: 7, value: 240},
		{id: 8, value: ''},
		{id: 9, value: 245},
		{id: 10, value: 250},
		{id: 11, value: ''},
		{id: 12, value: 260},
	])
	const penjualanRefs = useRef([])

	const tambahDataPenjualan = () => {
		const newPenjualan = {
			id: penjualan.length + 1,
		}
		setPenjualan([...penjualan, newPenjualan])
	}
	const kurangDataPenjualan = () => {
		if(penjualan.length > 10) {
			setPenjualan(penjualan.slice(0, penjualan.length - 1))
		}
	}

	const handleSubmit = () => {
		const valuesPenjualan = penjualanRefs.current.map((input) => input.value)
		console.log('valuesPenjualan', valuesPenjualan)
		setLoading(true)
		getBestModel({
			sales_data: valuesPenjualan
		}, (res) => {
			setResult(res.data)
			setLoading(false)
		},
			(err) => {
				setLoading(false)
			}
		)
	}

	useEffect(() => {
		penjualanRefs.current = penjualan.map((_, index) => penjualanRefs.current[index] || null)
	}, [penjualan])

	useEffect(() => {
		getAllProducts('', (res) => setListProduct(res.data))
	}, [])

	console.log('result', result)
	console.log('selectedProduct', selectedProduct)

	return (
		<Sidebar>
			<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
				<h1 className="text-2xl font-bold text-gray-700 mb-6">
					Peramalan Penjualan
				</h1>
				<div
					className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg"
				>
					<div className="mb-4">
						<label htmlFor="productName" className="block text-lg font-medium mb-2">
							Nama Produk:
						</label>
						<select
							id="productName"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							onChange={(e) => {
								const selectedId = e.target.value
								const selectedItem = listProduct.find(item => item.id === parseInt(selectedId))
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
						<label className="block text-lg font-medium mb-2">
							Data Penjualan:
						</label>
						{penjualan.map((value, index) => (
							<div key={index} className="mb-2 flex items-center">
								<span className="mr-2">Minggu Ke-{index + 1}:</span>
								<input
									type="number"
									placeholder="Masukkan jumlah penjualan"
									ref={(el) => (penjualanRefs.current[index] = el)}
									className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									defaultValue={penjualan[index].value}
								/>
							</div>
						))}
						<div className="flex space-x-2 mt-2">
							<button
								type="button"
								onClick={tambahDataPenjualan}
								className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
							>
								+Tambah Data+
							</button>
							<button
								type="button"
								onClick={kurangDataPenjualan}
								className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
							>
								-Kurangi Data-
							</button>
						</div>
					</div>

					<button
						type="button"
						disabled={loading}
						onClick={handleSubmit}
						className={`w-full py-2 px-4 mt-4 font-semibold text-white rounded-lg ${loading
							? "bg-gray-400 cursor-not-allowed"
							: "bg-green-600 hover:bg-green-700"
							}`}
					>
						{loading ? "Processing..." : "Submit"}
					</button>
				</div>

				{result && (
					<div class="mt-6 bg-white p-6 rounded-lg shadow-md w-full">
						<h2 class="text-xl font-bold text-center text-black mb-10">Hasil</h2>
						<div className="flex space-x-3">
							<div className="space-y-1">
								<p>Hasil pemodelan untuk data penjualan <strong>{penjualanRefs.current.map(ref => ref?.value).join(', ')}</strong></p>
								<p>Peramalan penjualan <strong>{selectedProduct ? selectedProduct.name : ''}</strong> dengan model terbaik <strong>{result.best_models[0].model}</strong></p>
								<p>Kombinasi nilai error sebesar <strong>{result.best_models[0].combined_score_errors.toFixed(4)}</strong></p>
							</div>
							<Link className="flex underline text-indigo-500" href={selectedProduct ? `/admin/produk/edit/${selectedProduct.id}` : '/admin/produk/list'}> -terapkan model ke produk-</Link>
						</div>
						<br />
						<div>
							<p>Berikut hasil pemodelan yang diurutkan berdasarkan nilai kombinasi error terkecil dengan persentasi <strong>MAE:MSE = 9:1</strong></p>
						</div>
						<div class="mt-6">
							<table class="min-w-full table-auto border-collapse border border-gray-300">
								<thead>
									<tr>
										<th class="py-3 px-4 font-semibold text-gray-900 border border-gray-300 text-center">#</th>
										<th class="py-3 px-4 text-left font-semibold text-gray-900 border border-gray-300">Nama Model</th>
										<th class="py-3 px-4 text-left font-semibold text-gray-900 border border-gray-300">MAE</th>
										<th class="py-3 px-4 text-left font-semibold text-gray-900 border border-gray-300">MSE</th>
										<th class="py-3 px-4 text-left font-semibold text-gray-900 border border-gray-300">Combined Error</th>
									</tr>
								</thead>
								<tbody class="bg-white">
									{result.models.map((model, index) => (
										<tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
											<td class="py-4 px-4 text-sm text-center font-medium text-gray-900 border border-gray-300">{index + 1}</td>
											<td class="py-4 px-4 text-sm font-medium text-gray-900 border border-gray-300">{model.model}</td>
											<td class="py-4 px-4 text-sm text-gray-500 border border-gray-300">{model.mae.toFixed(4)}</td>
											<td class="py-4 px-4 text-sm text-gray-500 border border-gray-300">{model.mse.toFixed(4)}</td>
											<td class="py-4 px-4 text-sm text-gray-500 border border-gray-300">{model.combined_score_errors.toFixed(4)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

				)}

			</div>
		</Sidebar>
	)
}

export default App
