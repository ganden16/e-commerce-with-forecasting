import GuestMiddleware from '@/components/guestMiddleware';
import {SweetAlertError, SweetAlertSuccess} from '@/components/sweetAlert';
import {confirmForgotPassword, otpExpiry, sendOtpForgotPassword} from '@/lib/fetchApi';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useState, useEffect, useRef} from 'react';

export default function KonfirmasiLupaPassword() {
	const router = useRouter();
	const [loadingPage, setLoadingPage] = useState(true);
	const [timeLeft, setTimeLeft] = useState(0);
	const formRef = useRef({});
	const [errors, setErrors] = useState({});

	useEffect(() => {
		const {identifier} = router.query;
		if(identifier) {
			localStorage.setItem('identifier', identifier);
		} else {
			const storedIdentifier = localStorage.getItem('identifier');
			if(storedIdentifier) {
				router.replace({
					pathname: router.pathname,
					query: {identifier: storedIdentifier},
				});
			} else {
				router.push('/lupa-password');
			}
		}
	}, [router.query.identifier]);

	const getOtpExpired_at = () => {
		const identifier = router.query.identifier || localStorage.getItem('identifier');
		if(!identifier) return;

		otpExpiry(
			identifier,
			(res) => {
				if(res.status === 200) {
					const expiryDateTime = new Date(res.data.expired_at);
					const now = new Date();
					const diffInMs = expiryDateTime - now;
					const diffInSeconds = Math.floor(diffInMs / 1000);
					setTimeLeft(diffInSeconds > 0 ? diffInSeconds : 0);
					setLoadingPage(false);
				}
			},
			(err) => {
				if(err.response.status === 400) {
					SweetAlertError(err.response.data.message);
					router.push('/lupa-password');
					setLoadingPage(false);
				}
			}
		);
	};

	const handleSendOtp = () => {
		sendOtpForgotPassword(
			{
				identifier: router.query.identifier,
			},
			(res) => {
				if(res.status === 200) {
					SweetAlertSuccess(res.data.message);
					getOtpExpired_at();
				}
			},
			(err) => {
				if(err.response.status === 400 || err.response.status === 500) {
					SweetAlertError(err.response.data.message);
				}
			}
		);
	};

	const handleConfirmResetPassword = () => {
		confirmForgotPassword(
			{
				identifier: router.query.identifier,
				otp: formRef.current.otp.value,
				newPassword: formRef.current.newPassword.value,
				newPassword_confirmation: formRef.current.newPasswordConfirmation.value,
			},
			(res) => {
				if(res.status === 200) {
					SweetAlertSuccess(res.data.message);
					router.push('/login');
				}
			},
			(err) => {
				setErrors(null)
				if(err.response.status === 422) {
					setErrors(err.response.data.errors);
				}
				if(err.response.status === 400) {
					SweetAlertError(err.response.data.message);
				}
			}
		);
	};

	useEffect(() => {
		getOtpExpired_at();
	}, [router.query.identifier]);

	useEffect(() => {
		if(timeLeft > 0) {
			const timer = setInterval(() => {
				setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
			}, 1000);

			return () => clearInterval(timer);
		}
	}, [timeLeft]);

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	};

	if(loadingPage) return 'Loading...';

	return (
		<GuestMiddleware>
			<div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<div>
						<div className="flex justify-center">
							<Link href={'/'} className="inline-block">
								<img className="mx-auto h-20 w-20 rounded-lg" src="/faycook/logo2.webp" alt="Faycook" />
							</Link>
						</div>
						<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Masukkan OTP dan Kata Sandi Baru</h2>
						<p className="mt-2 text-center text-sm text-gray-600">Masukkan kode OTP yang Anda terima dan buat kata sandi baru.</p>
					</div>
					<form className="mt-8 space-y-6">
						<div className="rounded-md shadow-sm space-y-4">
							{/* Input OTP */}
							<div>
								<div className="flex justify-between items-center">
									<label htmlFor="otp" className="block text-sm font-medium text-gray-700">
										Kode OTP
									</label>
									<span className="text-sm text-gray-500">
										{timeLeft > 0 ? (
											<>Waktu tersisa: {formatTime(timeLeft)}</>
										) : (
											<p className="text-red-600">Waktu habis, kirim ulang kode otp</p>
										)}
									</span>
								</div>
								<input
									id="otp"
									name="otp"
									type="text"
									className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${timeLeft == 0 ? 'cursor-not-allowed' : ''
										}`}
									disabled={timeLeft === 0}
									placeholder="Masukkan Kode OTP"
									ref={(el) => (formRef.current.otp = el)}
								/>
								{errors?.otp?.map((err, index) => (
									<p key={index} className="text-red-600 pl-3 text-sm">
										{err}
									</p>
								))}
								{/* Tombol Kirim Ulang OTP */}
								<div className="mt-2 text-right">
									<button
										type="button"
										className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
										onClick={handleSendOtp}
									>
										Kirim Ulang OTP
									</button>
								</div>
							</div>
			
							{/* Input Kata Sandi Baru */}
							<div>
								<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
									Kata Sandi Baru
								</label>
								<input
									id="newPassword"
									name="newPassword"
									type="password"
									className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${timeLeft === 0 ? 'cursor-not-allowed' : ''
										}`}
									disabled={timeLeft === 0}
									placeholder="Masukkan Kata Sandi Baru"
									ref={(el) => (formRef.current.newPassword = el)}
								/>
								{errors?.newPassword?.map((err, index) => (
									<p key={index} className="text-red-600 pl-3 text-sm">
										{err}
									</p>
								))}
							</div>
			
							{/* Input Konfirmasi Kata Sandi */}
							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
									Konfirmasi Kata Sandi
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${timeLeft === 0 ? 'cursor-not-allowed' : ''
										}`}
									disabled={timeLeft === 0 ? 'cursor-not-allowed' : ''}
									placeholder="Konfirmasi Kata Sandi Baru"
									ref={(el) => (formRef.current.newPasswordConfirmation = el)}
								/>
								{errors?.newPasswordConfirmation?.map((err, index) => (
									<p key={index} className="text-red-600 pl-3 text-sm">
										{err}
									</p>
								))}
							</div>
						</div>
			
						<div>
							<button
								type="button"
								className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${timeLeft === 0 ? 'cursor-not-allowed' : ''
									}`}
								onClick={handleConfirmResetPassword}
								disabled={timeLeft === 0}
							>
								Reset Password
							</button>
						</div>
					</form>
				</div>
			</div>
		</GuestMiddleware>
	);
}

