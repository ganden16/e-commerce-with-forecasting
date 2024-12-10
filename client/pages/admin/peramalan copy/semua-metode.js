import Sidebar from '@/components/admin/sidebar'
import SelectSimpleCustom from '@/components/admin/selectSimpleCustom'
import SimpleFeed from '@/components/admin/simpleFeed'
import axios, {endpoint} from '@/lib/axios'
import React, {useEffect, useRef, useState} from 'react'
import {CircleLoader} from 'react-spinners'
import Swal from 'sweetalert2'
import {forecastAllMethod, getAllProducts} from '@/lib/fetchApi'
import {SweetAlertError} from '@/components/sweetAlert'

const pagesForBreadcrumbs = [
	{name: 'Project Nero', href: '', current: true},
	{name: 'Project Nero', href: '#', current: true},
	{name: 'Project Nero', href: '#', current: true},
]

const people = [
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
	{name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member'},
]

export default function SemuaMetode() {

	const [loadingList, setLoadingList] = useState(true)
	const [loadingSubmit, setLoadingSubmit] = useState(false)
	const [resultForecast, setResultForecast] = useState(null)
	const [forecastDataInfo, setForecastDataInfo] = useState({})
	const [products, setProducts] = useState([])
	const [penjualan, setPenjualan] = useState([
		{id: 1, value: 234, weight: 0.1},
		{id: 2, value: 239, weight: 0.1},
		{id: 3, value: 248, weight: 0.1},
		{id: 4, value: 255, weight: 0.1},
		{id: 5, value: 262, weight: 0.15},
		{id: 6, value: 251, weight: 0.15},
		{id: 7, value: 242, weight: 0.15},
		{id: 8, value: 257, weight: 0.15},
	])
	const penjualanRefs = useRef([])
	const pembobotanRefs = useRef([])
	const n_neighborsRefs = useRef(null)

	const tambahDataPenjualan = () => {
		const newPenjualan = {
			id: penjualan.length + 1,
		}
		setPenjualan([...penjualan, newPenjualan])
	}
	const kurangDataPenjualan = () => {
		if(penjualan.length > 4) {
			setPenjualan(penjualan.slice(0, penjualan.length - 1))
		}
	}

	const handleSubmit = async () => {
		if(!forecastDataInfo.product) {
			return SweetAlertError("Pilih produk terlebih dahulu")
		}
		setLoadingSubmit(true)
		setResultForecast(null)
		const valuesPenjualan = penjualanRefs.current.map((input) => input.value)
		const valuesNumberPenjualan = valuesPenjualan.map(str => parseInt(str))
		const valuesPembobotan = []
		let valueNNeighbors = null
		pembobotanRefs.current.map((input) => valuesPembobotan.push(parseFloat(input.value)))
		valueNNeighbors = parseInt(n_neighborsRefs.current.value)

		await forecastAllMethod({
			sales_data: valuesNumberPenjualan,
			sales_data_length: valuesNumberPenjualan.length,
			productId: forecastDataInfo.product.id,
			// weights: valuesPembobotan,
			n_neighbors: valueNNeighbors,
		}, (res) => setResultForecast(res.data), (err) => console.log(err))

		setLoadingSubmit(false)
	}

	useEffect(() => {
		getAllProducts('', (res) => setProducts(res.data))
	}, [])

	useEffect(() => {
		if(products.length > 0) {
			setLoadingList(false)
		}
	}, [products])

	useEffect(() => {
		penjualanRefs.current = penjualan.map((_, index) => penjualanRefs.current[index] || null)
		pembobotanRefs.current = penjualan.map((_, index) => pembobotanRefs.current[index] || null)
	}, [penjualan])

	console.log('resultForecast', resultForecast)

	return (
		<>
			<Sidebar pagesBreadcrumbs={pagesForBreadcrumbs} headingPage="Peramalan Semua Metode">
				<div className="space-y-10 divide-y divide-gray-500/10">
					<div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
						<div className="px-4 sm:px-0">
							<h2 className="text-base font-medium leading-7 text-gray-900 mb-4">
								Peramalan penjualan <b>{forecastDataInfo?.product?.name ?? 'X'}</b> pada periode berikutnya dengan 18 metode peramalan
							</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								{forecastDataInfo?.product?.description &&
									<div dangerouslySetInnerHTML={{__html: forecastDataInfo.product.description}} />
								}
							</p>
							<h2 className="text-base font-bold leading-7 text-gray-900 my-4">
								Hasil : {" "}
							</h2>
							{loadingSubmit && <CircleLoader size={20} color="#36d7b7" />}
							{resultForecast?.result?.length > 0 &&
								<SimpleFeed data={resultForecast.result} />
							}
						</div>
						<div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
							<div className="px-4 pt-2 sm:p-8">
								<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
									<div className="sm:col-span-4">
										<label
											htmlFor="website"
											className="block text-sm font-bold leading-6 text-gray-900"
										>
											Nama Produk :
										</label>
										{loadingList && <p>LoadingList...</p>}
										{!loadingList && <SelectSimpleCustom data={products} onSelect={(selectedMethod) => setForecastDataInfo({...forecastDataInfo, product: selectedMethod})} />}
									</div>
									<div className="sm:col-span-4 mt-4">
										<label
											htmlFor="penjualan"
											className="block text-sm font-bold leading-6 text-gray-900"
										>
											N_Neighbors :
										</label>
										<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md mb-3">
											<input
												type="number"
												name='n_neighbors'
												id='n_neighbors'
												className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
												placeholder="Masukkan jumlah n_neighbors"
												ref={n_neighborsRefs}
												defaultValue={2}
											/>
										</div>
									</div>
									<div className="sm:col-span-4 mt-4">
										<label
											htmlFor="penjualan"
											className="block text-sm font-bold leading-6 text-gray-900"
										>
											Data Penjualan :
										</label>

										{penjualan.map((item, index) => (
											<div key={item.id} className="mt-2">
												<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md mb-3">
													<span className="flex select-none items-center pl-3 text-gray-900 sm:text-sm">
														Minggu Ke-{item.id} :
													</span>
													<input
														type="number"
														name={`penjualan-${item.id}`}
														id={`penjualan-${item.id}`}
														className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
														placeholder="Masukkan jumlah penjualan"
														ref={(el) => (penjualanRefs.current[index] = el)}
														defaultValue={penjualan[index].value}
													/>
												</div>
											</div>
										))}
										<div className='flex gap-2'>
											<button
												type="button"
												className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
												onClick={tambahDataPenjualan}
											>
												+Tambah Data+
											</button>
											{penjualan.length > 4 &&
												<button
													type="button"
													className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
													onClick={kurangDataPenjualan}
												>
													-Kurangi Data-
												</button>
											}
										</div>
									</div>
									<div className="sm:col-span-4 mt-4">
										<label
											className="block text-sm font-bold leading-6 text-gray-900"
										>
											Masukkan Pembobotan :
										</label>

										{penjualan.map((item, index) => (
											<div key={item.id} className="mt-2">
												<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md mb-3">
													<span className="flex select-none items-center pl-3 text-gray-900 sm:text-sm">
														Minggu Ke-{item.id} :
													</span>
													<input
														type="number"
														name={`pembobotan-${item.id}`}
														id={`pembobotan-${item.id}`}
														className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
														placeholder="Masukkan jumlah pembobotan"
														ref={(el) => (pembobotanRefs.current[index] = el)}
														defaultValue={penjualan[index].weight}
													/>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
							<div className="flex items-center justify-start gap-x-6 border-t border-gray-900/10 px-4 py-2 sm:px-8">
								<button
									type="button"
									className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
									onClick={handleSubmit}
								>
									{!loadingSubmit && 'Submit'}
									<CircleLoader loading={loadingSubmit} color='white' size={25} />
								</button>
							</div>
						</div>
					</div>
				</div>
			</Sidebar>
		</>
	)
}
