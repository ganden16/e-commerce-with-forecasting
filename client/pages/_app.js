import {Provider, useDispatch} from 'react-redux'
import store from '../redux/store'
import "@/styles/globals.css"
import {clearUser, setUser} from '@/redux/userSlice'
import {useEffect, useState} from 'react'
import {getAllCarts, me} from '@/lib/fetchApi'
import axios from '@/lib/axios'
import {setCart} from '@/redux/cartSlice'
import NextNProgress from 'nextjs-progressbar'


function AuthWrapper({children}) {
	const dispatch = useDispatch()
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if(token) {
			me((res) => {
				if(res.data) {
					dispatch(setUser(res.data))
					setLoading(false)
				} else {
					localStorage.removeItem('token')
					dispatch(clearUser())
					setLoading(false)
				}
			}, (err) => {
				localStorage.removeItem('token')
				dispatch(clearUser())
				setLoading(false)
			})
		} else {
			setLoading(false)
		}
		getAllCarts((res) => {
			dispatch(setCart(res.data))
		}, (err) => {
			setLoading(false)
		})
		const scriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_SCRIPT_URL
		const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

		const scriptTag = document.createElement('script')
		scriptTag.src = scriptUrl
		scriptTag.setAttribute('data-client-key', clientKey)
		scriptTag.async = true
		document.body.appendChild(scriptTag)

		return () => {
			document.body.removeChild(scriptTag)
		}
	}, [])

	if(loading) {
		return '...Loading'
	} else {
		return <>{children}</>
	}
}

export default function App({Component, pageProps}) {
	axios.interceptors.request.use(
		(config) => {
			const token = localStorage.getItem('token')
			if(token) {
				config.headers['Authorization'] = `Bearer ${token}`
			}
			return config
		},
		(error) => {
			return Promise.reject(error)
		}
	)

	return (
		<>
			<NextNProgress />
			<Provider store={store}>
				<AuthWrapper>
					<Component {...pageProps} />
				</AuthWrapper>
			</Provider>
		</>
	)
}
