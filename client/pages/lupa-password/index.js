import {useState} from 'react';
import {useRouter} from 'next/router';
import {sendOtpForgotPassword} from '@/lib/fetchApi';
import {SweetAlertError, SweetAlertSuccess} from '@/components/sweetAlert';
import GuestMiddleware from '@/components/guestMiddleware';
import Link from 'next/link';

export default function LupaPassword() {
	const [identifier, setIdentifier] = useState(null);
	const router = useRouter();

	const handleSubmit = (e) => {
		sendOtpForgotPassword(
			{identifier},
			(res) => {
				if(res.status == 200) {
					SweetAlertSuccess(res.data.message)
					router.push(`lupa-password/konfirmasi?identifier=${identifier}`)
				}
			}, (err) => {
				if(err.response.status == 422) {
					SweetAlertError(err.response.data.errors.identifier[0])
				}
				if(err.response.status == 400 || err.response.status == 500) {
					SweetAlertError(err.response.data.message)
				}
			})
	};

	return (
		<GuestMiddleware>
			<div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<div>
						<div className='flex justify-center'>
							<Link href={'/'} className='inline-block'>
								<img
									className="mx-auto h-20 w-20 rounded-lg"
									src="/faycook/logo2.webp"
									alt="Faycook"
								/>
							</Link>
						</div>
						<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
							Lupa Password
						</h2>
						<p className="mt-2 text-center text-sm text-gray-600">
							Masukkan username atau nomor WhatsApp untuk melanjutkan.
						</p>
					</div>
					<form className="mt-8 space-y-6" >
						<div className="rounded-md shadow-sm -space-y-px">
							<div>
								<label htmlFor="identifier" className="sr-only">
									Username atau WhatsApp
								</label>
								<input
									id="identifier"
									name="identifier"
									type="text"
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
									placeholder="Username atau Nomor WhatsApp"
								/>
								{/* {error && (
									<p className="text-red-500 text-xs mt-2">{error}</p>
								)} */}
							</div>
						</div>

						<div>
							<button
								type="button"
								className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								onClick={() => handleSubmit()}
							>
								Lanjutkan
							</button>
						</div>
					</form>
				</div>
			</div>
		</GuestMiddleware>
	);
}
