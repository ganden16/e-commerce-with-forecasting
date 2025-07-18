/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: 'standalone',
	async redirects() {
		return [
			{
				source: '/admin',
				destination: '/admin/dashboard',
				permanent: true,
			},
			{
				source: '/tentang-kami',
				destination: '/',
				permanent: true,
			},
		]
	}
}

export default nextConfig
