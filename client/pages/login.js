import {SweetAlertError, SweetAlertSuccess} from "@/components/sweetAlert"
import GuestMiddleware from "@/components/guestMiddleware"
import {getAllCarts, login} from "@/lib/fetchApi"
import {setUser} from "@/redux/userSlice"
import {useRouter} from "next/router"
import {useRef, useState} from "react"
import {useDispatch} from "react-redux"
import Link from "next/link"
import {setCart} from "@/redux/cartSlice"

export default function Login() {
	const router = useRouter()
	const formRef = useRef({})
	const [errors, setErrors] = useState([])
	const dispatch = useDispatch()

	const handleLoginGoogle = () => {
		window.location.href = process.env.NEXT_PUBLIC_BASE_API_URL + '/api/auth/google'
	}

	const handleSubmitLogin = () => {
		login({
			username: formRef.current.username.value,
			password: formRef.current.password.value
		}, (res) => {
			if(res.status == 200) {
				localStorage.setItem('token', res.data.token)
				dispatch(setUser(res.data.user))
				getAllCarts((res) => {
					dispatch(setCart(res.data))
				}, () => {})
				if(res.data.user.is_admin) {
					SweetAlertSuccess(res.data.message, 'Selamat Datang Admin !')
					router.push('/admin')
				} else {
					SweetAlertSuccess(res.data.message)
					router.push('/produk')
				}
			}
		},
			(err) => {
				if(err.status == 422) {
					setErrors(err.response.data.errors)
				}
				if(err.status == 401) {
					SweetAlertError(err.response.data.message)
				}
			})
	}
	return (
		<GuestMiddleware>
			<div className="flex min-h-screen flex-1 ">
				<div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
					<div className="mx-auto w-max max-w-sm lg:w-96">
						<div className="w-max">
							<Link href={'/'} className="w-max">
								<img
									alt="Your Company"
									src="/faycook/logo2.webp"
									className="w-28 rounded-lg"
								/>
							</Link>
							<h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
								Login Akun
							</h2>
							<p className="mt-2 text-sm leading-6 text-gray-500">
								Belum punya akun?{' '}
								<Link href="/daftar" className="font-semibold text-indigo-600 hover:text-indigo-500 underline">
									daftar disini
								</Link>
							</p>
						</div>

						<div className="mt-10">
							<div>
								<form action="#" method="POST" className="space-y-6">
									<div>
										<label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
											Username
										</label>
										<div className="mt-2">
											<input
												id="username"
												name="username"
												type="text"
												className="block w-full text-gray-800 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
												ref={(el) => formRef.current.username = el}
											/>
											{
												errors?.username?.map(err => (
													<p key={err} className='text-red-600 pl-3 text-sm'>{err}</p>
												))
											}
										</div>
									</div>

									<div>
										<label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
											Password
										</label>
										<div className="mt-2">
											<input
												id="password"
												name="password"
												type="password"
												className="block text-gray-800 w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
												ref={(el) => formRef.current.password = el}
											/>
											{
												errors?.password?.map(err => (
													<p key={err} className='text-red-600 pl-3 text-sm'>{err}</p>
												))
											}
										</div>
									</div>

									<div className="flex items-center justify-end">
										{/* <div className="flex items-center">
											<input
												id="remember-me"
												name="remember-me"
												type="checkbox"
												className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
											/>
											<label htmlFor="remember-me" className="ml-3 block text-sm leading-6 text-gray-700">
												Remember me
											</label>
										</div> */}

										<div className="text-sm leading-6">
											<Link href="/lupa-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
												Lupa Password?
											</Link>
										</div>
									</div>

									<div>
										<button
											type="button"
											className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
											onClick={() => handleSubmitLogin()}
										>
											Masuk
										</button>
									</div>
								</form>
							</div>

							<div className="mt-10">
								<div className="relative">
									<div aria-hidden="true" className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-gray-200" />
									</div>
									<div className="relative flex justify-center text-sm font-medium leading-6">
										<span className="bg-white px-6 text-gray-900">atau masuk dengan</span>
									</div>
								</div>

								<div className="mt-6 grid gap-4">
									<a
										href="#"
										className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
										onClick={() => handleLoginGoogle()}
									>
										<svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
											<path
												d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
												fill="#EA4335"
											/>
											<path
												d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
												fill="#4285F4"
											/>
											<path
												d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
												fill="#FBBC05"
											/>
											<path
												d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
												fill="#34A853"
											/>
										</svg>
										<span className="text-sm font-semibold leading-6">Google</span>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="relative hidden w-0 flex-1 lg:block bg-white">
					<img
						alt=""
						src="/faycook/bg/sign3.webp"
						className="absolute inset-0 h-full w-full object-cover"
						onError={(e) => e.target.style.display = 'none'} // Sembunyikan jika gambar tidak ditemukan
					/>
				</div>
			</div>
		</GuestMiddleware>
	)
}
