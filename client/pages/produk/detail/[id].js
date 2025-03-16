import {Fragment, useEffect, useRef, useState} from 'react'
import {StarIcon} from '@heroicons/react/20/solid'
import {Tab, TabGroup, TabList, TabPanel, TabPanels} from '@headlessui/react'
import HeaderUser from '@/components/user/header'
import FooterUser from '@/components/user/footer'
import {useRouter} from 'next/router'
import {useDispatch, useSelector} from 'react-redux'
import {addCart, addQuestion, getOneProduct, getProductQna, getProductReviews} from '@/lib/fetchApi'
import {SweetAlertError, sweetAlertSubmitData, SweetAlertSuccess} from '@/components/sweetAlert'
import {setCart} from '@/redux/cartSlice'
import {formatRupiah, formattedDate} from '@/helper/formater'

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export default function DetailProduk() {
	const router = useRouter()
	const {id} = router.query
	const [product, setProduct] = useState(null)
	const [productReviews, setProductReviews] = useState(null)
	const [productQna, setProductQna] = useState(null)
	const dispatch = useDispatch()
	const currentCart = useSelector((state) => state.cart.cart)
	const user = useSelector((state) => state.user.user)
	const [copied, setCopied] = useState(false)
	const formRef = useRef({})
	const [errorsFormFaq, setErrorsFormFaq] = useState(null)

	const handleCopyLink = () => {
		const currentUrl = window.location.href
		navigator.clipboard.writeText(currentUrl)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const addToCart = (productId) => {
		if(!user) {
			return router.push('/login')
		}
		if(user?.is_admin) {
			return router.push('/admin')
		}
		const existingCartItem = currentCart.find((cartItem) => cartItem.product_id === productId)
		if(existingCartItem) {
			const updatedCartItem = {
				...existingCartItem,
				quantity: existingCartItem.quantity + 1,
			}
			const updatedCart = currentCart.map((cartItem) =>
				cartItem.product_id === productId ? updatedCartItem : cartItem
			)
			addCart({
				product_id: productId,
				quantity: 1
			}, (res) => {
				SweetAlertSuccess(res.data.message)
				dispatch(setCart(updatedCart))
			}, (err) => {
				SweetAlertError(err.response.status)
			})
		} else {
			addCart(
				{
					product_id: productId,
					quantity: 1,
				},
				(res) => {
					const newCartItem = res.data.new_cart
					const updatedCart = [newCartItem, ...currentCart]
					dispatch(setCart(updatedCart))
					SweetAlertSuccess(res.data.message)
				},
				(err) => {
					SweetAlertError(err.response.status)
				}
			)
		}
	}

	const handleClickSendQuestion = () => {
		sweetAlertSubmitData(() => {
			addQuestion({
				productId: id,
				question: formRef.current.formFaq.value
			}, (res) => {
				getProductQna(id, false, (res) => {
					setProductQna(res.data)
				}, (err) => {})
				formRef.current.formFaq.value = ''
				SweetAlertSuccess(res.data.message)
			}, (err) => {
				if(err.response.status == 422) {
					setErrorsFormFaq(err.response.data.errors)
				}
			})
		})
	}

	useEffect(() => {
		if(id) {
			getOneProduct(id, (res) => {
				setProduct(res.data)
			})
			getProductReviews(id, false, (res) => {
				setProductReviews(res.data)
			}, (err) => {})
			getProductQna(id, 'false', (res) => {
				setProductQna(res.data)
			}, (err) => {})
		}
	}, [id])

	if(!product || !productReviews || !productQna) {
		return <p>Loading...</p>
	}

	console.log('productReviews', productReviews)
	console.log('product', product)
	console.log('productQna', productQna)

	return (
		<>
			<HeaderUser />
			<div className="bg-white pt-14">
				<div className="mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
					{/* Product */}
					<div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
						{/* Product image */}
						<div className="lg:col-span-4 lg:row-end-1">
							<div className="aspect-h-3 aspect-w-4 overflow-hidden rounded-lg bg-gray-100">
								<img alt={product.name} src={product.image ? product.image : '/faycook/images/random-product.webp'} className="object-cover object-center" />
							</div>
						</div>

						{/* Product details */}
						<div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
							<div className="flex flex-col-reverse">
								<h4 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.price && formatRupiah(product.price)}</h4>
								<div className="mt-4">
									<div className='flex justify-between gap-x-2'>
										<h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-2">{product.name}</h1>
										<div className="flex items-center">
										{product.isReadyStock ? (
											<>
												<span className="text-green-500 mr-2">✔</span>
												<span className="text-green-500">Tersedia</span>

											</>
										)
											:
											<>
												<span className="text-red-500 mr-2">✘</span>
												<span className="text-red-500">Tidak Tersedia</span>
											</>
										}
									</div>
									</div>
									
									<p className="mt-1 text-sm text-gray-400 italic">
										Diperbarui pada {' '}
										{product?.updated_at &&
											formattedDate(product?.updated_at)
										}
									</p>
								</div>

								<div className='flex justify-between'>
									<div>
										<div className="flex items-center">
											{[0, 1, 2, 3, 4].map((rating) => (
												<StarIcon
													key={rating + 'rating'}
													aria-hidden="true"
													className={classNames(
														productReviews.rating > rating ? 'text-yellow-400' : 'text-gray-300',
														'h-5 w-5 flex-shrink-0',
													)}
												/>
											))}
										</div>
									</div>
									<div>
										<span className="text-sm text-gray-400">{product.total_sales}+ terjual</span>
									</div>
								</div>

							</div>

							<p className="mt-6 text-gray-500">{product.description}</p>

							{!user?.is_admin &&
								<div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
									<button
										type="button"
										className="flex min-w-max items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
										onClick={() => addToCart(product.id)}
									>
										+ Keranjang
									</button>
								</div>
							}

							<div className="mt-10 border-t border-gray-200 pt-10">
								<h3 className="text-sm font-medium text-gray-900">Detail Lainnya :</h3>
								<div className="prose prose-sm mt-4 text-gray-500">
									<ul>
										<li>berat {product.weight} gram</li>
										{product.other_detail && JSON.parse(product.other_detail).map((detail, index) => (
											<li key={index + 'other detail'}>{detail}</li>
										))}
									</ul>
								</div>
							</div>

							<div className="mt-10 border-t border-gray-200 pt-10">
								<h3 className="text-sm font-medium text-gray-900">Share</h3>
								<ul role="list" className="mt-4 flex items-center space-x-6">
									<li>
										<a href={`https://wa.me/?text=Hai! Saya ingin berbagi produk menarik ini dengan Anda: https://parrot-precise-instantly.ngrok-free.app/produk/detail/${id}. Produk ini memiliki kualitas terbaik dan harga yang terjangkau. Yuk, cek sekarang!`} target="_blank" className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
											<svg fill="currentColor" viewBox="0 0 32 32" aria-hidden="true" className="h-5 w-5">
												<path d="M16.002 0C7.163 0 0 7.163 0 16.002c0 2.814.737 5.562 2.14 7.981l-2.122 7.75 7.965-2.089c2.37 1.283 5.024 1.961 7.771 1.961 8.84 0 16.001-7.162 16.001-16.001C32.002 7.163 24.84 0 16.002 0zm9.013 22.462c-.374.895-2.157 1.748-2.967 1.771-.764.02-1.495.366-4.921-.997-4.148-1.722-6.8-5.937-7.013-6.211-.21-.274-1.672-2.22-1.672-4.233 0-2.012.937-2.99 1.276-3.41.336-.418.736-.524.983-.524.245 0 .492.002.71.014.23.012.544-.086.847.644.335.788 1.144 2.721 1.247 2.918.101.196.169.43.035.698-.133.267-.2.43-.398.656-.196.226-.418.506-.598.68-.201.195-.41.407-.176.8.236.396 1.049 1.722 2.25 2.784 1.547 1.366 2.846 1.787 3.233 1.978.395.197.625.165.858-.1.218-.254.988-1.145 1.25-1.537.262-.39.524-.33.863-.194.336.136 2.14 1.008 2.511 1.19.371.18.619.276.71.432.092.156.092.91-.283 1.805z" />
											</svg>
										</a>
									</li>
									<button
										onClick={handleCopyLink}
										className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500"
									>
										<svg data-slot="icon" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
											<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"></path>
										</svg>
										{copied && <span className="text-xs text-green-500 ml-2">Link Copied!</span>}
									</button>
								</ul>
							</div>
						</div>

						<div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
							<TabGroup>
								<div className="border-b border-gray-200">
									<TabList className="-mb-px flex space-x-8">
										<Tab className="whitespace-nowrap border-b-2  py-6 text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-800 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600 focus:outline-none">
											Ulasan Pelanggan
										</Tab>
										<Tab className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-800 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600 focus:outline-none">
											Tanya Jawab
										</Tab>
									</TabList>
								</div>
								<TabPanels as={Fragment}>

									<TabPanel className="-mb-10">
										<div className="mt-3 flex items-center">
											<div>
												<div className="flex items-center">
													{[0, 1, 2, 3, 4].map((rating) => (
														<StarIcon
															key={rating + 'rating ulasan'}
															aria-hidden="true"
															className={classNames(
																productReviews.rating > rating ? 'text-yellow-400' : 'text-gray-300',
																'h-5 w-5 flex-shrink-0',
															)}
														/>
													))}
												</div>
											</div>
											<p className="ml-2 text-sm text-gray-900">Berdasarkan {productReviews.total_reviews} ulasan</p>
										</div>

										<div className="mt-6">
											<dl className="space-y-3">
												{productReviews?.count_star?.map((star, index) => (
													<div key={index + 'star'} className="flex items-center text-sm">
														<dt className="flex flex-1 items-center">
															<p className="w-3 font-medium text-gray-900">
																{index + 1}
															</p>
															<div aria-hidden="true" className="ml-1 flex flex-1 items-center">
																<StarIcon
																	aria-hidden="true"
																	className={classNames(
																		star > 0 ? 'text-yellow-400' : 'text-gray-300',
																		'h-5 w-5 flex-shrink-0',
																	)}
																/>

																<div className="relative ml-3 flex-1">
																	<div className="h-3 rounded-full border border-gray-200 bg-gray-100" />
																	{star > 0 ? (
																		<div
																			style={{width: `calc(${star} / ${productReviews.total_reviews} * 100%)`}}
																			className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
																		/>
																	) : null}
																</div>
															</div>
														</dt>
														<dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-900">
															{Math.round((star / productReviews.total_reviews) * 100)}%
														</dd>
													</div>
												))}
											</dl>
										</div>
										{productReviews?.reviews?.map((review, index) => (
											<div key={index + 'review'} className="flex space-x-4 text-sm text-gray-500">
												<div className="flex-none py-10">
													<img alt={review.reviewer.username} src={review.reviewer.image} className="h-10 w-10 rounded-full bg-gray-100" />
												</div>
												<div className={classNames(index === 0 ? '' : 'border-t border-gray-200', 'py-10')}>
													<h3 className="font-semibold text-gray-900">{review.reviewer.username}</h3>
													<p className='mt-1 text-xs text-gray-500'>
														{review.order.review_status == 'edited' &&
															<span className='font-semibold text-sm'>diedit pada </span>
														}
														{formattedDate(review.time_review)}
													</p>

													<div className="mt-3 flex items-center">
														{[0, 1, 2, 3, 4].map((rating) => (
															<StarIcon
																key={rating + 'ulasan user'}
																aria-hidden="true"
																className={classNames(
																	review.stars > rating ? 'text-yellow-400' : 'text-gray-300',
																	'h-5 w-5 flex-shrink-0',
																)}
															/>
														))}
													</div>
													<div className="prose prose-sm mt-4 max-w-none text-gray-500">
														{review.review}
													</div>
													{review.reply &&
														<div className="flex items-start p-4 rounded-b-lg mt-1">
															<img
																src={review.reply_by.image}
																alt={review.reply_by.name}
																className="h-8 w-8 rounded-full mr-3"
															/>
															<div>
																<p className="text-gray-900 font-bold">{review.reply_by.username} (Admin)</p>
																<p className="text-gray-500 text-xs mt-1">{formattedDate(review.time_reply)}</p>
																<p className="prose prose-sm max-w-none text-gray-500 mt-2">{review.reply}</p>
															</div>
														</div>
													}
												</div>
											</div>
										))}
									</TabPanel>
									<TabPanel className="text-sm text-gray-500">
										<div className="mt-5">
											<h2 className="text-lg font-semibold mb-1 mr-2">Pertanyaan ({productQna.length})</h2>
											<h3 className="text-sm text-gray-600">{product.name}</h3>
											{!user?.is_admin &&
												<div className='flex justify-between p-5 pl-4 border border-gray-300 rounded-lg mt-5' onClick={() => formRef.current.formFaq.focus()}>
													<div className="flex">
														<svg data-slot="icon" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
															<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"></path>
														</svg>
														<span className="text-gray-800 ml-1">Ada pertanyaan? Tanyakan pada kami</span>
													</div>

													<button
														className=" rounded-md bg-green-500 text-white px-4 py-2 hover:bg-green-600"
														onClick={() => formRef.current.formFaq.focus()}
													>
														Tulis Pertanyaan
													</button>
												</div>
											}
										</div>

										<dl className='mt-10'>
											{productQna.map((qna, index) => (
												<Fragment key={index + 'qna'}>
													<div className='border mb-6 rounded-lg'>
														<div className="flex items-start bg-white p-4 rounded-b-lg rounded-t-lg">
															{/* Avatar di samping pertanyaan */}
															<img
																src={qna.questioner.image}
																alt={qna.questioner.username}
																className="h-8 w-8 rounded-full mr-3"
															/>
															<div className='mb-3'>
																<p className=" text-gray-900 font-bold">{qna.questioner.username}</p>
																<p className="text-gray-500 text-xs mt-1">{formattedDate(qna.time_question)}</p>
																<p className="font-medium text-gray-500 mt-2">{qna.question}</p>
															</div>
														</div>
														{qna.answered &&
															<div className="flex items-start pl-14 p-4 bg-gray-50 rounded-b-lg">
																<img
																	src={qna.answered.image}
																	alt={qna.questioner.username}
																	className="h-8 w-8 rounded-full mr-3"
																/>
																<div>
																	<p className="text-gray-900 font-bold">{qna.answered.username} (Admin)</p>
																	<p className="text-gray-500 text-xs mt-1">{formattedDate(qna.time_answer)}</p>
																	<p className="prose prose-sm max-w-none text-gray-500 mt-2">{qna.answer}</p>
																</div>
															</div>
														}
													</div>
												</Fragment>
											))}
										</dl>
										{/* Form untuk menambahkan pertanyaan baru */}
										{!user?.is_admin &&
											<div className="border border-green-500 rounded-lg p-4 mt-8">
												<form className="flex flex-col">
													<textarea
														className="border-0 rounded-md p-2 mb-4 resize-y overflow-auto focus:outline-none foucs:border-none focus:ring-0" // Menghilangkan border dan menambahkan kemampuan scroll
														placeholder="Tulis pertanyaan Anda di sini..."
														rows={4}
														ref={(el) => formRef.current.formFaq = el}
													/>
													{
														errorsFormFaq?.question?.map(err => (
															<p key={err} className='text-red-600 pl-3 text-sm'>{err}</p>
														))
													}
													<button
														type="button"
														className="self-end rounded-md border border-green-500 bg-white text-green-500 px-4 py-2 hover:bg-green-500 hover:text-white transition"
														onClick={() => {handleClickSendQuestion()}}
													>
														Kirim
													</button>
												</form>
											</div>
										}
									</TabPanel>
								</TabPanels>
							</TabGroup>
						</div>
					</div>
				</div>
			</div>
			<FooterUser />
		</>
	)
}
