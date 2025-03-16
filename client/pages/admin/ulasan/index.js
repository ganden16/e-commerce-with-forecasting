import SelectSimpleCustom from '@/components/admin/selectSimpleCustom'
import Sidebar from '@/components/admin/sidebar'
import Toggle from '@/components/admin/toggleWithRightLabel'
import {formattedDate} from '@/helper/formater'
import {getAllProducts, getAllReviews, getProductReviews, updateOrCreateReplyReview} from '@/lib/fetchApi'
import {act, useEffect, useRef, useState} from 'react'
import {CheckIcon, ChevronUpDownIcon, StarIcon} from '@heroicons/react/20/solid'
import {Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Switch} from '@headlessui/react'
import {useSelector} from 'react-redux'
import {sweetAlertSubmitData, SweetAlertSuccess} from '@/components/sweetAlert'
import Link from 'next/link'

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export default function IndexUlasan() {
	const [loadingPage, setLoadingPage] = useState(true)
	const [enabledToggle, setEnabledToggle] = useState(true)
	const [selectedProduct, setSelectedProduct] = useState(null)
	const user = useSelector((state) => state.user.user)
	const [activeReplyForm, setActiveReplyForm] = useState(null)
	const formRef = useRef({})
	const [reviews, setReviews] = useState(null)
	const [products, setProducts] = useState(null)
	const [errors, setErrors] = useState(null)

	const handleClickTanggapi = (index) => {
		if(activeReplyForm == index) setActiveReplyForm(null)
		else setActiveReplyForm(index)
		setErrors(null)
	}

	const handleClickSendReply = (productReviewId) => {
		sweetAlertSubmitData(() => {
			updateOrCreateReplyReview(productReviewId, {
				reply: formRef.current.reply.value
			}, (res) => {
				fetchProductReviews()
				setActiveReplyForm(null)
				SweetAlertSuccess(res.data.message)
			}, (err) => {
				setErrors(err.response.data.errors)
			})
		})
	}
	const fetchProductReviews = () => {
		getProductReviews(selectedProduct?.id || '', enabledToggle, (res) => {
			setReviews(res.data)
			setLoadingPage(false)
		}, (err) => {})
	}
	useEffect(() => {
		if(activeReplyForm != null) {
			formRef.current.reply.focus()
		}
	}, [activeReplyForm])

	useEffect(() => {
		fetchProductReviews()
	}, [selectedProduct, enabledToggle])

	useEffect(() => {
		getAllProducts('', (res) => {
			setProducts(res.data)
			setLoadingPage(false)
		})
	}, [])

	if(loadingPage) {
		return <p>...Loading</p>
	}
	console.log('reviews', reviews)

	return (
		<Sidebar headingPage="Ulasan">
			<div className='flex items-center'>
				<div className='w-1/2 mb-3'>
					Filter
					<Listbox value={selectedProduct} onChange={(value) => setSelectedProduct(value)}>
						<div className="relative mt-2">
							<ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
								<span className="block truncate">{selectedProduct?.name ?? 'Semua Produk'}</span>
								<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
									<ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
								</span>
							</ListboxButton>

							<ListboxOptions
								transition
								className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
							>
								<ListboxOption
									value={''}
									className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
								>
									<span className="block truncate font-normal group-data-[selected]:font-semibold">Semua Produk</span>
									<span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
										<CheckIcon aria-hidden="true" className="h-5 w-5" />
									</span>
								</ListboxOption>
								{products?.map((item) => (
									<ListboxOption
										key={item.id + 'select'}
										value={item}
										className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
									>
										<span className="block truncate font-normal group-data-[selected]:font-semibold">{item.name}</span>

										<span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
											<CheckIcon aria-hidden="true" className="h-5 w-5" />
										</span>
									</ListboxOption>
								))}
							</ListboxOptions>
						</div>
					</Listbox>
				</div>
				<div className='ml-5'>
					<Field className="flex items-center">
						<Label as="span" className="mx-3 text-sm">
							<span className="font-medium text-gray-900">Semua</span>
						</Label>
						<Switch
							checked={enabledToggle}
							onChange={() => setEnabledToggle((prev) => !prev)}
							className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600"
						>
							<span
								aria-hidden="true"
								className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
							/>
						</Switch>
						<Label as="span" className="ml-3 text-sm">
							<span className="font-medium text-gray-900">Belum Ditanggapi</span>
						</Label>
					</Field>
				</div>
			</div>
			<div className="bg-white rounded-lg">
				<div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-8 lg:px-8">
					<div className="lg:col-span-4">
						<h2 className="text-2xl font-bold tracking-tight text-gray-900">{selectedProduct?.name || 'Semua ulasan'} {enabledToggle ? ' belum ditanggapi' : ''} </h2>
						<div className="mt-3 flex items-center">
							<div>
								<div className="flex items-center">
									{[0, 1, 2, 3, 4].map((rating) => (
										<StarIcon
											key={rating}
											aria-hidden="true"
											className={classNames(
												reviews?.rating > rating ? 'text-yellow-400' : 'text-gray-300',
												'h-5 w-5 flex-shrink-0',
											)}
										/>
									))}
								</div>
							</div>
							<p className="ml-2 text-sm text-gray-900">Berdasarkan {reviews?.total_reviews} ulasan</p>
						</div>

						<div className="mt-6">
							<dl className="space-y-3">
								{reviews?.count_star?.map((star, index) => (
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
															style={{width: `calc(${star} / ${reviews?.total_reviews} * 100%)`}}
															className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
														/>
													) : null}
												</div>
											</div>
										</dt>
										<dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-900">
											{Math.round((star / reviews?.total_reviews) * 100)}%
										</dd>
									</div>
								))}
							</dl>
						</div>
					</div>

					<div className="mt-16 lg:col-span-7 lg:col-start-6 lg:mt-0">
						<div className="flow-root">
							<div className="-my-12 divide-y divide-gray-200">
								{reviews?.reviews?.map((review, index) => (
									<div key={index + 'review'} className="flex space-x-4 text-sm text-gray-500">
										<div className="flex-none py-10">
											<img alt={review.reviewer.username} src={review.reviewer.image} className="h-10 w-10 rounded-full bg-gray-100" />
										</div>
										<div className={classNames(index === 0 ? '' : 'border-t border-gray-200', 'py-10', 'w-full')}>
											<div className='flex justify-between'>
												<h3 className="font-semibold text-gray-900">{review.reviewer.username}</h3>
												<Link href={`/admin/laporan/${review.order.order_code}`} className="font-semibold text-xs text-gray-900 underline underline-offset-1">{review.order.order_code}</Link>
											</div>
											<p className='text-gray-500 text-xs mt-1'>
												{formattedDate(review.time_review)}
											</p>

											<Link href={`/produk/detail/${review.product_id}`} className='mt-2 underline underline-offset-1'>{review.product.name}</Link>
											<div className="mt-3 flex items-center">
												{[0, 1, 2, 3, 4].map((rating) => (
													<StarIcon
														key={rating + 'ulasan user'}
														aria-hidden="true"
														className={classNames(
															review.stars > rating ? 'text-yellow-400' : 'text-gray-300',
															'h-5 w-5 flex-shrink-0', 'block'
														)}
													/>
												))}
											</div>
											<div className="prose prose-sm mt-4 max-w-none text-gray-500">
												{review.review}
											</div>
											{!review.reply_by &&
												<p
													className="self-center cursor-pointer font-bold text-green-700 underline mt-2 w-max"
													onClick={() => handleClickTanggapi(index)}
												>
													{activeReplyForm == index ? 'Tutup' : 'Tanggapi'}
												</p>
											}
											{activeReplyForm == index && !review.reply_by &&
												<div className="flex items-start flex-col p-4 bg-gray-50 rounded-lg mt-2">
													<div className='flex flex-row'>
														<img
															src={user.image}
															alt={user.username}
															className="h-8 w-8 rounded-full mr-3"
														/>
														<p className="text-gray-900 font-bold">{user.username}</p>
													</div>
													<div className="border border-green-500 rounded-lg p-4 mt-6 w-full">
														<form className="flex flex-col">
															<textarea
																className="border-0 w-full rounded-md p-2 mb-4 overflow-auto focus:outline-none focus:ring-0"
																placeholder="Tulis tanggapan disini"
																rows={2}
																style={{resize: 'none', backgroundColor: '#f9f9f9'}}
																ref={(el) => formRef.current.reply = el}
															/>

														</form>
														<button
															type="button"
															className="self-end rounded-md border border-green-500 bg-green-500 text-white px-4 py-2 hover:bg-green-600 transition"
															onClick={() => handleClickSendReply(review.id)}
														>
															Kirim
														</button>
													</div>
													{
														errors?.reply?.map(err => (
															<p key={err} className='text-red-600 pl-3 text-sm'>{err}</p>
														))
													}

												</div>
											}
											{review.reply_by &&
												<div className="flex items-start p-3 bg-gray-50 rounded-lg mt-3">
													<img
														src={review.reply_by.image}
														alt={review.reply_by.username}
														className="h-8 w-8 rounded-full mr-3"
													/>
													<div>
														<p className="text-gray-900 font-bold">{review.reply_by.username}</p>
														<p className="text-gray-500 text-xs mt-1">{formattedDate(review.time_reply)}</p>
														<p className="prose prose-sm max-w-none text-gray-500 mt-1">{review.reply}</p>
													</div>
												</div>
											}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Sidebar>
	)
}
