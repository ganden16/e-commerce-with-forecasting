import HeaderUser from '@/components/user/header'
import FooterUser from '@/components/user/footer'
import {useEffect, useState} from 'react'
import {getLandingPageData} from '@/lib/fetchApi'
import Link from 'next/link'

export default function Index() {
	const [categories, setCategories] = useState(null)
	const [bestReview, setBestReview] = useState(null)
	const [latestProduct, setLatestProduct] = useState(null)

	useEffect(() => {
		getLandingPageData((res) => {
			setBestReview(res.data.productReviews)
			setLatestProduct(res.data.latestProduct)
			setCategories(res.data.categories)
		}, (err) => {})
	}, [])
	return (
		<div className="bg-white">
			<HeaderUser />
			<main>
				<div className="bg-gray-600 relative mx-auto flex w-full flex-col items-center px-6 py-24 text-center sm:py-64 lg:px-10">
					<h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">Fay Brownies Hadir Disini</h1>
					<p className="mt-4 text-xl text-white p-5">
						Tersedia berbagai pilihan produk yang siap dikirim, dijamin kualitas terbaik dengan harga terjangkau
					</p>
					<Link
						href="/produk"
						className="mt-8 inline-block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100"
					>
						Belanja Sekarang !
					</Link>
				</div>
				{/* Category section */}
				<section aria-labelledby="category-heading" className="pt-24 sm:pt-32 xl:mx-auto xl:max-w-7xl xl:px-8">
					<div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
						<h2 id="category-heading" className="text-2xl font-bold tracking-tight text-gray-900">
							Kategori Tersedia
						</h2>
						<Link href="/kategori" className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block">
							Lihat semua kategori
							<span aria-hidden="true"> &rarr;</span>
						</Link>
					</div>

					<div className="mt-4 flow-root">
						<div className="-my-2">
							<div className="relative box-content h-80 overflow-x-auto py-2 xl:overflow-visible">
								<div className="absolute flex space-x-8 px-4 sm:px-6 lg:px-8 xl:relative xl:grid xl:grid-cols-5 xl:gap-x-8 xl:space-x-0 xl:px-0">
									{categories?.map((category) => (
										<Link
											key={category.name + 'category'}
											href={`/produk?kategori=${category.name}`}
											className="relative flex h-80 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
										>
											<span aria-hidden="true" className="absolute inset-0">
												<img alt={category.name} src={category.image} className="h-full w-full object-cover object-center" />
											</span>
											<span
												aria-hidden="true"
												className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
											/>
											<span className="relative mt-auto text-center text-xl font-bold text-white">{category.name}</span>
										</Link>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="mt-6 px-4 sm:hidden">
						<a href="#" className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
							lihat semua kategori
							<span aria-hidden="true"> &rarr;</span>
						</a>
					</div>
				</section>

				{/* Featured section */}
				<section
					aria-labelledby="social-impact-heading"
					className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 sm:pt-32 lg:px-8"
				>
					<div className="relative overflow-hidden rounded-lg">
						<div className="absolute inset-0">
							<img
								alt=""
								src="https://tailwindui.com/img/ecommerce-images/home-page-01-feature-section-01.jpg"
								className="h-full w-full object-cover object-center"
							/>
						</div>
						<div className="relative bg-gray-900 bg-opacity-75 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
							<div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
								<h2 id="social-impact-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
									<span className="block sm:inline">Tingkatkan Persediaan Camilan Anda</span>
								</h2>
								<p className="mt-4 text-xl text-white">
									Nikmati kepraktisan makanan instan yang siap santap kapan saja. Kami menyediakan berbagai pilihan makanan instan berkualitas, mulai dari brownies, kue kering, bolen, dan kue kering. Semua produk kami tidak mudah basi dengan metode terbaik untuk menjaga kesegaran dan kualitasnya. Pesan sekarang, dan kami siap mengirimkan langsung ke pintu Anda dengan layanan pengiriman cepat dan aman.
								</p>
								<Link
									href="/produk"
									className="mt-8 block w-full rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 sm:w-auto"
								>
									Lihat Produk !
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* Collection section */}
				<section
					aria-labelledby="collection-heading"
					className="mx-auto max-w-xl px-4 pt-24 sm:px-6 sm:pt-32 lg:max-w-7xl lg:px-8"
				>
					<h2 id="collection-heading" className="text-2xl font-bold tracking-tight text-gray-900">
						Produk Terbaru
					</h2>
					<p className="mt-4 text-base text-gray-500">
						Cicipi inovasi terbaru dalam koleksi makanan kami. Praktis, lezat, dan siap menemani setiap momen Anda di rumah.
					</p>

					<div className="mt-10 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:space-y-0">
						{latestProduct?.map((product) => (
							<Link key={product.name + 'latestProduct'} href={`/produk/detail/${product.id}`} className="group block">
								<div
									aria-hidden="true"
									className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg lg:aspect-h-6 lg:aspect-w-5 group-hover:opacity-75"
								>
									<img
										alt={product.name}
										src={product.image ? product.image : '/faycook/images/random-product.webp'}
										className="h-full w-full object-cover object-center"
									/>
								</div>
								<h3 className="mt-4 text-base font-semibold text-gray-900">{product.name}</h3>
								<p className="mt-2 text-sm text-gray-500 mb-5">{product.description}</p>
							</Link>
						))}
					</div>
				</section>

				{/* testemonial */}
				<section
					aria-labelledby="testimonial-heading"
					className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-12"
				>
					<div className="mx-auto max-w-2xl lg:max-w-none">
						<h2 id="testimonial-heading" className="text-2xl font-bold tracking-tight text-gray-900">
							Apa kata mereka?
						</h2>

						<div className="mt-16 space-y-16 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:space-y-0">
							{bestReview?.map((testimonial) => (
								<blockquote key={testimonial.id + 'testimonial'} className="sm:flex lg:block space-y-4">
									<svg
										width={24}
										height={18}
										viewBox="0 0 24 18"
										aria-hidden="true"
										className="flex-shrink-0 text-gray-300"
									>
										<path
											d="M0 18h8.7v-5.555c-.024-3.906 1.113-6.841 2.892-9.68L6.452 0C3.188 2.644-.026 7.86 0 12.469V18zm12.408 0h8.7v-5.555C21.083 8.539 22.22 5.604 24 2.765L18.859 0c-3.263 2.644-6.476 7.86-6.451 12.469V18z"
											fill="currentColor"
										/>
									</svg>
									<div className="my-8 sm:ml-6 sm:mt-0 lg:ml-0 lg:my-10">
										<p className="text-lg text-gray-600">{testimonial.review}</p>
										<cite className="mt-4 mb-10 block font-semibold not-italic text-gray-900">
											{testimonial.reviewer.name}
										</cite>
									</div>
								</blockquote>
							))}
						</div>
					</div>
				</section>
			</main>
			<FooterUser />
		</div>
	)
}
