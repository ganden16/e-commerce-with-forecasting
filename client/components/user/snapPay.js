import {useRouter} from 'next/router'
import {useEffect} from 'react'

const MidtransPayment = ({transactionToken, orderCode, onSuccess, onError, onPending, onClose}) => {
	const router = useRouter()
	if(window.snap && transactionToken) {
		window.snap.pay(transactionToken, {
			onSuccess: (result) => {
				console.log('Payment Success:', result)
				window.location.href = `/notifikasi-order?status=processing&order_code=${result.order_id}`
				// router.push(`/notifikasi-order?status=processing&order_code=${result.order_id}`).then(() => {
				// 	router.reload()
				// })
			},
			onPending: (result) => {
				console.log('Payment Pending:', result)
				window.location.href = `/orderan-saya/type1?orderCode=${result.order_id}&status=pending`
				// router.push(`/orderan-saya/type1?orderCode=${result.order_id}&status=pending`).then(() => {
				// 	router.reload()
				// })
			},
			onError: (result) => {
				console.log('Payment Error:', result)
				window.location.href = `/notifikasi-order?status=cancelled&order_code=${result.order_id}`
				// router.push(`/notifikasi-order?status=cancelled&order_code=${result.order_id}`).then(() => {
				// 	router.reload()
				// })
			},
			onClose: () => {
				console.log('Payment popup closed without completing the payment')
				window.location.href = `/orderan-saya/type1?orderCode=${orderCode}&status=pending`
				// router.push(`/orderan-saya/type1?orderCode=${orderCode}&status=pending`).then(() => {
				// 	router.reload()
				// })
			}
		})
	}
	return
}

export default MidtransPayment
