import {useSelector} from 'react-redux';
import {useRouter} from 'next/router';
import {useEffect} from 'react';

const UserMiddleware = ({children}) => {
	const user = useSelector((state) => state.user.user);
	const router = useRouter();

	useEffect(() => {
		if(user?.is_admin != 0) {
			router.push('/admin');
		}
	}, [router]);

	return user?.is_admin == 0 ? children : null;
};

export default UserMiddleware;
