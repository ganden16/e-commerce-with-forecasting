import Grafik from "@/components/admin/grafikPeramalan"
import Sidebar from "@/components/admin/sidebar"
import {SweetAlertError, SweetAlertSuccess} from "@/components/sweetAlert"
import {getAllProducts, updateOrCreateTrainTestData} from "@/lib/fetchApi"
import React, {useEffect, useState} from "react"

const Pemodelan = () => {
	const [listProduct, setListProduct] = useState(null)
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [loading, setLoading] = useState(false)

	const initialStatePenjualan = Array(20).fill("")
	const [penjualan, setPenjualan] = useState(initialStatePenjualan)

	const tambahDataPenjualan = () => {
		setPenjualan((prev) => [...prev, ""])
	}

	const kurangDataPenjualan = () => {
		if(penjualan.length > 10) {
			setPenjualan((prev) => prev.slice(0, -1))
		}
	}

	const handleSubmit = () => {
		if(!selectedProduct?.id) {
			return SweetAlertError("Pilih produk terlebih dahulu")
		}

		const valuesPenjualan = penjualan.map((value) => (value != "" || value != '' ? parseInt(value) : ""))

		setLoading(true)
		updateOrCreateTrainTestData(
			{
				product_id: selectedProduct.id,
				train_test_data: JSON.stringify(valuesPenjualan),
			},
			(res) => {
				SweetAlertSuccess("Berhasil", res.data.message)
				setLoading(false)
			},
			(err) => {
				setLoading(false)
				if(err.response.status === 422) {
					SweetAlertError("Data tidak valid")
				}
			}
		)
	}

	useEffect(() => {
		if(selectedProduct?.id && selectedProduct?.train_test?.train_test_data) {
			try {
				const parsedData = JSON.parse(selectedProduct.train_test.train_test_data)

				setPenjualan((prevPenjualan) => {
					return parsedData.map((item, index) => item || "")
				})
			} catch(error) {
				console.error("Error parsing train_test_data:", error)
				SweetAlertError("Gagal memuat data penjualan produk.")
				setPenjualan(initialStatePenjualan)
			}
		} else {
			setPenjualan(initialStatePenjualan)
		}
	}, [selectedProduct])

	useEffect(() => {
		getAllProducts("", (res) => setListProduct(res.data))
	}, [])

	return (
		<Sidebar headingPage="Data Historis Penjualan">
			<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 rounded-lg">
				<h1 className="text-2xl font-bold text-gray-700 mb-6">
					Data Training dan Testing Produk
				</h1>
				<div className="bg-white p-6 rounded-lg w-full max-w-2xl">
					{/* Dropdown untuk memilih produk */}
					<div className="mb-4">
						<label htmlFor="productName" className="block text-lg font-bold mb-2">
							Nama Produk:
						</label>
						<select
							id="productName"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							onChange={(e) => {
								const selectedId = e.target.value
								const selectedItem = listProduct.find((item) => item.id === parseInt(selectedId))
								setSelectedProduct(selectedItem)
							}}
						>
							<option value="">---Pilih---</option>
							{listProduct &&
								listProduct.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
						</select>
					</div>

					{/* Input untuk data penjualan */}
					<div className="mb-4">
						<label className="block text-lg font-bold mb-2">Data Penjualan:</label>
						{penjualan.map((value, index) => (
							<div key={index} className="mb-2 flex items-center">
								<span className="w-36 mr-2 text-left">Minggu Ke-{index + 1}:</span>
								<input
									type="number"
									placeholder="Masukkan jumlah penjualan"
									value={value} // Controlled component
									onChange={(e) => {
										const newValue = e.target.value
										setPenjualan((prev) =>
											prev.map((item, i) => (i === index ? newValue : item))
										)
									}}
									className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
							{penjualan.length > 10 && (
								<button
									type="button"
									onClick={kurangDataPenjualan}
									className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
								>
									-Kurangi Data-
								</button>
							)}
						</div>
					</div>

					{/* Tombol Submit */}
					<button
						type="button"
						disabled={loading}
						onClick={handleSubmit}
						className={`w-full py-2 px-4 mt-4 font-semibold text-white rounded-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
							}`}
					>
						{loading ? "Processing..." : "Submit"}
					</button>
				</div>
			</div>
		</Sidebar>
	)
}

export default Pemodelan