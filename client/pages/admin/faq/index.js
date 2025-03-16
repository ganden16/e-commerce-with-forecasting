import Sidebar from '@/components/admin/sidebar'
import {getAllProducts, getAllQna, getProductQna, updateOrCreateAnswer} from '@/lib/fetchApi'
import {TabPanel} from '@headlessui/react'
import React, {Fragment, useEffect, useRef, useState} from 'react'
import {CheckIcon, ChevronUpDownIcon, StarIcon} from '@heroicons/react/20/solid'
import {Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Switch} from '@headlessui/react'
import {useSelector} from 'react-redux'
import {sweetAlertSubmitData, SweetAlertSuccess} from '@/components/sweetAlert'
import {formattedDate} from '@/helper/formater'
import Link from 'next/link'

export default function index() {
	const user = useSelector((state) => state.user.user)
	const [productQna, setProductQna] = useState(null)
	const [products, setProducts] = useState(null)
	const [enabledToggle, setEnabledToggle] = useState(true)
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [activeAnswerForm, setActiveAnswerForm] = useState(null)
	const formRef = useRef({})
	const [errors, setErrors] = useState(null)

	const handleClickJawab = (index) => {
		if(activeAnswerForm == index) setActiveAnswerForm(null)
		else setActiveAnswerForm(index)
		setErrors(null)
	}

	const handleClickSendAnswer = (productQnaId) => {
		sweetAlertSubmitData(() => {
			updateOrCreateAnswer(productQnaId, {
				answer: formRef.current.answer.value
			}, (res) => {
				fetchProductQna()
				setActiveAnswerForm(null)
				SweetAlertSuccess(res.data.message)
			}, (err) => {
				setErrors(err.response.data.errors)
			})
		})
	}

	const fetchProductQna = () => {
		getProductQna(selectedProduct?.id || '', enabledToggle, (res) => {
			setProductQna(res.data)
		}, (err) => {})
	}

	useEffect(() => {
		if(activeAnswerForm != null) {
			formRef.current.answer.focus()
		}
	}, [activeAnswerForm])

	useEffect(() => {
		getAllProducts('', (res) => {
			setProducts(res.data)
		})
	}, [])

	useEffect(() => {
		fetchProductQna()
	}, [enabledToggle, selectedProduct])

	return (
		<Sidebar headingPage="Faq">
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
							<span className="font-medium text-gray-900">Belum Terjawab</span>
						</Label>
					</Field>
				</div>
			</div>
			<div className="text-sm text-gray-500">
				<div className="mt-5">
					<h2 className="text-lg font-semibold mb-1 mr-2">Pertanyaan ({productQna?.length})</h2>
					<h3 className="text-sm text-gray-600">{selectedProduct?.name || 'Semua pertanyaan'} {enabledToggle ? ' belum terjawab' : ''}</h3>
				</div>
				<dl className='mt-10'>
					{productQna?.map((qna, index) => (
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
										<Link href={`/produk/detail/${qna.product_id}`} className="text-gray-500 underline underline-offset-1 text-xs mt-1">{qna.product.name}</Link>
										<p className="font-medium text-gray-500 mt-2">{qna.question}</p>
									</div>
									{
										!qna.answered &&
										<p
											className="self-end cursor-pointer font-bold text-green-700 underline px-4"
											onClick={() => handleClickJawab(index)}
										>
											{activeAnswerForm == index ? 'Tutup' : 'Jawab'}
										</p>
									}
								</div>
								{qna.answered &&
									<div className="flex items-start pl-14 p-4 bg-gray-50 rounded-b-lg">
										<img
											src={qna.answered.image}
											alt={qna.answered.username}
											className="h-8 w-8 rounded-full mr-3"
										/>
										<div>
											<p className="text-gray-900 font-bold">{qna.answered.username} (Admin)</p>
											<p className="text-gray-500 text-xs mt-1">{formattedDate(qna.time_answer)}</p>
											<p className="prose prose-sm max-w-none text-gray-500 mt-2">{qna.answer}</p>
										</div>
									</div>
								}
								{activeAnswerForm == index && !qna.answered &&
									<div className="flex items-start pl-14 p-4 bg-gray-50 rounded-b-lg">
										<img
											src={user.image}
											alt={user.username}
											className="h-8 w-8 rounded-full mr-3"
										/>
										<p className="text-gray-900 font-bold">{user.username}</p>
										<div className="border border-green-500 rounded-lg p-4 mt-8 w-full"> {/* Warna background */}
											<form className="flex flex-col"> {/* Mengubah menjadi flex-col */}
												<textarea
													className="border-0 w-full rounded-md p-2 mb-4 overflow-auto focus:outline-none focus:ring-0"
													placeholder="Tulis jawaban disini"
													rows={2}
													style={{resize: 'none', backgroundColor: '#f9f9f9'}} // Mengatur background
													ref={(el) => formRef.current.answer = el}
												/>

											</form>
											<button
												type="button"
												className="self-end rounded-md border border-green-500 bg-green-500 text-white px-4 py-2 hover:bg-green-600 transition"
												onClick={() => handleClickSendAnswer(qna.id)}
											>
												Kirim
											</button>
											{
												errors?.answer?.map(err => (
													<p key={err} className='text-red-600 pl-2 text-sm mt-2'>{err}</p>
												))
											}
										</div>
									</div>
								}
							</div>
						</Fragment>
					))}
				</dl>

			</div>
		</Sidebar>
	)
}
