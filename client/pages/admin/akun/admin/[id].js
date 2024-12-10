import Sidebar from '@/components/admin/sidebar'
import {ArrowLeftIcon} from '@heroicons/react/20/solid'

const adminDetail = {
	name: 'Leslie Alexander',
	email: 'leslie.alexander@example.com',
	role: 'Co-Founder / CEO',
	imageUrl:
		'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
	lastSeen: '3 hours ago',
	lastSeenDateTime: '2023-01-23T13:23Z',
	about: 'Passionate leader with a deep understanding of business strategy and operations.',
	phone: '+1 (555) 012-3456',
	address: '123 Main Street, Anytown, USA',
	orders: [
		{id: '#0928340235', date: '2023-10-01', status: 'Completed'},
		{id: '#0928340236', date: '2023-09-25', status: 'Pending'},
		{id: '#0928340237', date: '2023-09-15', status: 'Canceled'},
	],
}

export default function AdminDetail() {
	return (
		<Sidebar>
			<div className="p-6">
				<div className="bg-white shadow-lg rounded-lg p-6">
					<div className="flex items-center">
						<img
							alt={adminDetail.name}
							src={adminDetail.image}
							className="h-24 w-24 rounded-full border-2 border-blue-500"
						/>
						<div className="ml-4">
							<h2 className="text-2xl font-bold text-gray-900">{adminDetail.name}</h2>
							<p className="text-sm text-gray-500">{adminDetail.role}</p>
							<p className="text-sm text-gray-500">{adminDetail.email}</p>
							<p className="text-sm text-gray-500">Last seen: <time dateTime={adminDetail.lastSeenDateTime}>{adminDetail.lastSeen}</time></p>
						</div>
					</div>

					<div className="mt-6">
						<h3 className="text-lg font-semibold text-gray-900">About</h3>
						<p className="mt-2 text-gray-600">{adminDetail.about}</p>
					</div>

					<div className="mt-6">
						<h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
						<p className="mt-2 text-gray-600">Phone: {adminDetail.phone}</p>
						<p className="mt-2 text-gray-600">Address: {adminDetail.address}</p>
						<p className="mt-2 text-gray-600">{adminDetail.address}</p>
					</div>

				</div>
			</div>
		</Sidebar>
	)
}
