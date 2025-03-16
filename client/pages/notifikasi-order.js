import AuthMiddleware from "@/components/authMiddleware"
import {SweetAlertError} from "@/components/sweetAlert"
import {detailOrder} from "@/lib/fetchApi"
import Link from "next/link"
import {useRouter} from "next/router"
import {useEffect, useState} from "react"

export default function NotifikasiOrder() {
	const router = useRouter()
	const {status, order_code} = router.query
	const [loadingPage, setLoadingPage] = useState(true)

	useEffect(() => {
		detailOrder(order_code, status, (res) => {
		}, (err) => {
			if(err.response.status == 404) {
				SweetAlertError(err.response.data.message)
				router.push('/orderan-saya')
			}
		}, () => {
			setLoadingPage(false)
		})
	}, [router])

	if(loadingPage) return '...Loading'

	return (
		<AuthMiddleware>
			{status == 'processing' &&
				<main className="bg-white px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:py-32">
					<div className="mx-auto max-w-3xl">
						<div className="max-w-xl">
							<h1 className="text-base font-medium text-green-600">Terimakasih</h1>
							<p className="mt-2 text-4xl text-green-600 font-bold tracking-tight">Orderanmu telah kami terima!</p>
							<p className="mt-2 text-base text-gray-500">Nomor order {order_code} akan segera kami proses, kami akan selalu menginformasikan status terbaru dari orderanmu :)</p>
						</div>

						{/* Tombol Kembali ke Orderan Saya dan Lanjutkan Belanja */}
						<div className="mt-12 flex space-x-4">
							<Link
								href={`/orderan-saya`}
								className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
							>
								Ke Orderan Saya
							</Link>
							<button
								onClick={() => window.location.href = '/produk'}  // Ganti dengan route yang benar untuk melanjutkan belanja
								className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700"
							>
								Lanjutkan Belanja
							</button>
						</div>
					</div>
				</main>
			}

			{status == 'cancelled' &&
				<main className="bg-white px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:py-32">
					<div className="mx-auto max-w-3xl">
						<div className="max-w-xl">
							<h1 className="text-base font-medium text-red-600">Pesanan Gagal</h1>
							<p className="mt-2 text-4xl text-red-600 font-bold tracking-tight">Orderanmu gagal diproses!</p>
							<p className="mt-2 text-base text-gray-500">Uppss.. Terjadi kegagalan orderan pada order {order_code}, coba lagi nanti yaa :(</p>
						</div>

						{/* Tombol Kembali ke Orderan Saya dan Lanjutkan Belanja */}
						<div className="mt-12 flex">
							<Link
								href={`/orderan-saya`}  // Ganti dengan route yang benar untuk order history
								className="inline-flex items-center justify-center rounded-md border border-transparent  py-2 text-base font-medium text-indigo-500 shadow-sm hover:text-indigo-700"
							>
								Ke Orderan Saya
							</Link>
						</div>
					</div>
				</main>
			}
		</AuthMiddleware>
	)
}
