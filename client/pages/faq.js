import FooterUser from '@/components/user/footer'
import HeaderUser from '@/components/user/header'
import {Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import {MinusSmallIcon, PlusSmallIcon} from '@heroicons/react/24/outline'
const brandApp = process.env.NEXT_PUBLIC_APP_BRAND

const faqs = [
	{
		question: `Apa saja yang dijual di ${brandApp}?`,
		answer:
			"Kami menjual beberapa produk makanan brownies dan kue kering yang siap dikonsumsi",
	},
	{
		question: `Bagaimana cara memesannya?`,
		answer:
			"Anda dapat memesan produk melalui website ini dengan cara login -> memilih produk -> memasukkan ke keranjang -> checkout -> memilih kurir -> melakukan pembayaran",
	},
	{
		question: `Apakah semua data saya aman?`,
		answer:
			"Kami menjamin semua data pribadi yang anda berikan akan aman dan hanya digunakan untuk kebutuhan transaksi jual beli",
	},
	{
		question: `Bagaimana melihat status pesanan saya?`,
		answer:
			"Anda dapat melihat status pesanan di halaman orderan saya, anda juga bisa melihat faktur di halaman detail order setelah pembayaran terkonfirmasi",
	},
	{
		question: `Berapa lama pesanan saya sampai?`,
		answer:
			"Waktu tunggu pesanan anda sampai tergantung kurir pengiriman yang anda pilih ketika checkout, pastikan memilih kurir terbaik",
	},
	{
		question: `Apakah bisa melakukan return?`,
		answer:
			"Tidak, anda tidak bisa melakukan return, transaksi yang sudah dilakukan tidak bisa dibatalkan atau melakukan pengembalian dana",
	},
]

export default function Faq() {
	return (
		<>
			<HeaderUser />
			<div className="bg-white">
				<div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
					<div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
						<h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Frequently Asked Questions</h2>
						<dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
							{faqs.map((faq) => (
								<Disclosure key={faq.question} as="div" className="pt-6">
									<dt>
										<DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900">
											<span className="text-base font-semibold leading-7">{faq.question}</span>
											<span className="ml-6 flex h-7 items-center">
												<PlusSmallIcon aria-hidden="true" className="h-6 w-6 group-data-[open]:hidden" />
												<MinusSmallIcon aria-hidden="true" className="h-6 w-6 [.group:not([data-open])_&]:hidden" />
											</span>
										</DisclosureButton>
									</dt>
									<DisclosurePanel as="dd" className="mt-2 pr-12">
										<p className="text-base leading-7 text-gray-600">{faq.answer}</p>
									</DisclosurePanel>
								</Disclosure>
							))}
						</dl>
					</div>
				</div>
			</div>
			<FooterUser />
		</>
	)
}
