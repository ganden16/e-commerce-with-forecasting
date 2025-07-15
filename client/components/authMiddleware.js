import {useSelector} from 'react-redux'
import {useRouter} from 'next/router'
import {useEffect} from 'react'

const AuthMiddleware = ({children}) => {
	const user = useSelector((state) => state.user.user)
	const router = useRouter()

	useEffect(() => {
		if(!user) {
			window.location = '/login'
		}
		if(user?.is_admin) {
			window.location = '/admin'
		}
	}, [router])

	return user && !user?.is_admin ? children : <></>
}



export default AuthMiddleware
