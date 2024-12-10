import FooterUser from "@/components/user/footer"
import HeaderUser from "@/components/user/header"
import {formatRupiah} from "@/helper/formater"
import axios, {endpoint} from "@/lib/axios"
import {getAllProducts} from "@/lib/fetchApi"
import {ArrowPathIcon} from "@heroicons/react/20/solid"
import Link from "next/link"
import {useRouter} from "next/router"
import react, {useEffect, useRef, useState} from "react"

export default function IndexProduk() {
	const router = useRouter()
	const searchRef = useRef({})
	const [products, setProducts] = useState([])
	const [loadingProducts, setLoadingProducts] = useState(true)

	const fetchProducts = (query, cbFinally = () => {}) => {
		getAllProducts(query, (res) => setProducts(res.data), cbFinally())
	}

	const searchProduct = (e) => {
		setLoadingProducts(true)
		router.replace(router.pathname, undefined, { shallow: true })
		e.preventDefault()
		fetchProducts(searchRef.current.value, () => setLoadingProducts(false))
	}

	useEffect(() => {
		fetchProducts('', () => setLoadingProducts(false))
	}, [])

	useEffect(() => {
		if(router.query.kategori) {
			setLoadingProducts(true)
			axios.get(`${endpoint.product}?kategori=${router.query.kategori}`).then((res) => {
				setProducts(res.data)
				setLoadingProducts(false)
			})
		}
	}, [router.query.kategori])

	if(loadingProducts) {
		return '...Loading'
	}

	console.log(products)
	console.log('router.query.kategori', router.query.kategori)

	return (
		<>
			<HeaderUser />
			<div className="bg-white">
				<div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
					{/* Search bar section */}
					<div className="flex justify-between items-center my-10 lg:my-5">
						<h2 className="text-2xl font-bold text-gray-900">Semua Produk Kami</h2>
						<div className="flex space-x-4 items-center">
							<ArrowPathIcon
								onClick={() => {
									searchRef.current.value = ''
									router.replace(router.pathname, undefined, { shallow: true })
									fetchProducts('')
								}}
								className='h-6 w-6 cursor-pointer transition-transform duration-200 active:scale-110' />
							<form onSubmit={searchProduct} className="w-full max-w-xs">
								<input
									type="text"
									placeholder="cari produk..."
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 focus:outline-0 sm:text-sm"
									ref={searchRef}
								/>
							</form>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
						{products.length > 0 ? (
							products.map((product) => (
								<div
									key={product.id}
									className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
								>
									<div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-96">
										<img
											alt={product.name}
											src={product.image ? product.image : '/faycook/images/random-product.webp'}
											className="h-full w-full object-cover object-center sm:h-full sm:w-full"
										/>
									</div>
									<div className="flex flex-1 flex-col space-y-2 p-4">
										<h3 className=" text-gray-900 mb-5">
											<div className="flex justify-between">
												<Link className="text-base font-semibold" href={`/produk/detail/${product.id}`}>
													<span aria-hidden="true" className="absolute inset-0" />
													{product.name}
												</Link>
												<p className="text-xs text-gray-400">{product.total_sales}+ terjual</p>
											</div>
										</h3>
										<p className="text-sm text-gray-500">{product.description.split('.').slice(0, 2).join('. ') + '.'}...</p>
										<div className="flex flex-1 flex-col justify-end pb-5 pt-2">
											<p className="text-base font-bold text-gray-900">{formatRupiah(product.price)}</p>
										</div>
									</div>
								</div>
							))
						) : (
							<p className="text-gray-500">No products found.</p>
						)}
					</div>
				</div>
			</div>
			<FooterUser />
		</>
	)
}
