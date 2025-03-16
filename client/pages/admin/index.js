import Sidebar from '@/components/admin/sidebar'
import {useRouter} from 'next/router'
import React, {useEffect} from 'react'

export default function index() {
	const router = useRouter()
	useEffect(() => {
		router.push('/admin/dashboard')
	}, [router])
	return (
		<>
			<Sidebar />
		</>
	)
}
