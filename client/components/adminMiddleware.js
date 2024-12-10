import {useSelector} from 'react-redux';
import {useRouter} from 'next/router';
import {useEffect} from 'react';

const AdminMiddleware = ({children}) => {
	const user = useSelector((state) => state.user.user);
	const router = useRouter();

	useEffect(() => {
		if(user?.is_admin != 1) {
			router.push('/');
		}
	}, [router]);

	return user?.is_admin ? children : null;
};

export default AdminMiddleware;
