import axios, {endpoint} from '@/lib/axios'
import {me} from '@/lib/fetchApi'
import {setUser} from '@/redux/userSlice'
import {useRouter} from 'next/router'
import React, {useEffect} from 'react'
import {useDispatch} from 'react-redux'

export default function authGoogleRedirect() {
	const router = useRouter()
	const dispatch = useDispatch()

	useEffect(() => {
		if(router.query.token) {
			axios.get(`${endpoint.auth}/me`, {
				headers: {
					Authorization: `Bearer ${router.query.token}`
				}
			}).then((res) => {
				if(res.data) {
					localStorage.setItem('token', router.query.token)
					dispatch(setUser(res.data))
					router.push('/produk')
				}
			}).catch((err) => {
				router.push('/login')
			})
		}
	}, [router.query.token])
	return (
		'Loading....'
	)
}
