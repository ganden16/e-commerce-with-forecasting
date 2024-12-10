import {CheckIcon, HandThumbUpIcon, UserIcon} from '@heroicons/react/20/solid'

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export default function SimpleFeed({data}) {
	return (
		<div className="flow-root">
			<ul role="list" className="-mb-8">
				{data.map((item, index) => (
					<li key={item.model}>
						<div className="relative pb-8">
							{index !== data.length - 1 ? (
								<span aria-hidden="true" className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" />
							) : null}
							<div className="relative flex space-x-3">
								<div>
									<span
										className={classNames(
											'bg-green-500',
											'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white',
										)}
									>
										<CheckIcon aria-hidden="true" className="h-5 w-5 text-white" />
									</span>
								</div>
								<div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
									<div>
										<p className="text-sm text-gray-500">
											{item.model}{' '}
										</p>
									</div>
									<div className="whitespace-nowrap text-right text-sm text-gray-500">
										<p>{Math.round(item.forecast)}</p>
									</div>
								</div>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
