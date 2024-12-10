import react, {useEffect, useState} from "react"
import FooterUser from "@/components/user/footer"
import HeaderUser from "@/components/user/header"
import {getAllCategories} from "@/lib/fetchApi"
import Link from "next/link"

export default function IndexKategori() {
	const [categories, setCategories] = useState([])

	useEffect(() => {
		getAllCategories((res) => setCategories(res.data))
	}, [])
	return (
		<>
			<HeaderUser />
			<div className="bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
					<div className="sm:flex sm:items-baseline sm:justify-between">
						<h2 className="text-2xl font-bold tracking-tight text-gray-900">Kategori Produk Tersedia</h2>
					</div>

					<div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
						{categories?.length > 0 && categories?.map((category, i) => (
							i % 3 == 0 ? (
								<div className="group aspect-h-1 aspect-w-2 overflow-hidden rounded-lg sm:aspect-h-1 sm:aspect-w-1 sm:row-span-2">
									<img
										alt={category.name}
										src={category.image ? category.image : '/faycook/images/random-product.webp'}
										className="object-cover object-center group-hover:opacity-75"
									/>
									<div aria-hidden="true" className="bg-gradient-to-b from-transparent to-black opacity-50" />
									<div className="flex items-end p-6">
										<div>
											<h3 className="font-semibold text-white">
												<Link href={`/produk?kategori=${category.name}`}>
													<span className="absolute inset-0" />
													{category.name}
												</Link>
											</h3>
											<p aria-hidden="true" className="mt-1 text-sm text-white">
												{category.description}
											</p>
										</div>
									</div>
								</div>
							) :
								(
									<div className="group aspect-h-1 aspect-w-2 overflow-hidden rounded-lg sm:aspect-none sm:relative sm:h-full">
										<img
											alt={category.name}
											src={category.image}
											className="object-cover object-center group-hover:opacity-75 sm:absolute sm:inset-0 sm:h-full sm:w-full"
										/>
										<div
											aria-hidden="true"
											className="bg-gradient-to-b from-transparent to-black opacity-50 sm:absolute sm:inset-0"
										/>
										<div className="flex items-end p-6 sm:absolute sm:inset-0">
											<div>
												<h3 className="font-semibold text-white">
													<Link href={`/produk?kategori=${category.name}`}>
														<span className="absolute inset-0" />
														{category.name}
													</Link>
												</h3>
												<p aria-hidden="true" className="mt-1 text-sm text-white">
													{category.description}
												</p>
											</div>
										</div>
									</div>
								)
						))

						}


						{/* <div className="group aspect-h-1 aspect-w-2 overflow-hidden rounded-lg sm:aspect-none sm:relative sm:h-full">
							<img
								alt="Walnut desk organizer set with white modular trays, next to porcelain mug on wooden desk."
								src="https://tailwindui.com/img/ecommerce-images/home-page-03-category-02.jpg"
								className="object-cover object-center group-hover:opacity-75 sm:absolute sm:inset-0 sm:h-full sm:w-full"
							/>
							<div
								aria-hidden="true"
								className="bg-gradient-to-b from-transparent to-black opacity-50 sm:absolute sm:inset-0"
							/>
							<div className="flex items-end p-6 sm:absolute sm:inset-0">
								<div>
									<h3 className="font-semibold text-white">
										<a href="#">
											<span className="absolute inset-0" />
											Workspace
										</a>
									</h3>
									<p aria-hidden="true" className="mt-1 text-sm text-white">
										Shop now
									</p>
								</div>
							</div>
						</div> */}
					</div>
				</div>
			</div>
			<FooterUser />
		</>
	)
}
