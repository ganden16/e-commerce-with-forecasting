import {useSelector} from 'react-redux';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';

const GuestMiddleware = ({children}) => {
	const user = useSelector((state) => state.user.user);
	const router = useRouter();

	useEffect(() => {
		if(user) {
			router.push('/');
		}
	}, [router]);
	
	return !user ? children : null;
};

export default GuestMiddleware;
