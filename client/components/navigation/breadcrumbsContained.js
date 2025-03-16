import {ChevronRightIcon, HomeIcon} from '@heroicons/react/20/solid'
import Link from 'next/link'

export default function Breadcrumbs({pages}) {
	return (
		<nav aria-label="Breadcrumb" className="flex">
			<ol role="list" className="flex items-center space-x-1">
				<li>
					<div>
						<Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-500">
							<HomeIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
							<span className="sr-only">Home</span>
						</Link>
					</div>
				</li>
				{pages?.map((page, index) => (
					<li key={index}>
						<div className="flex items-center">
							<ChevronRightIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-gray-400" />
							<a
								href={page.href}
								aria-current={page.current ? 'page' : undefined}
								className="ml-1 text-sm font-bold text-gray-500 hover:text-gray-700"
							>
								{page.name}
							</a>
						</div>
					</li>
				))}
			</ol>
		</nav>
	)
}
