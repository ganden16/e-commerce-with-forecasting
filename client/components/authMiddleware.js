import {useSelector} from 'react-redux'
import {useRouter} from 'next/router'
import {useEffect} from 'react'

const AuthMiddleware = ({children}) => {
	const user = useSelector((state) => state.user.user)
	const router = useRouter()

	useEffect(() => {
		if(!user) {
			router.push('/login')
		}
		if(user?.is_admin) {
			router.push('/admin')
		}
	}, [router])

	return user && !user?.is_admin ? children : null
}



export default AuthMiddleware
