/** @type {import('next').NextConfig} */
const nextConfig = {
	// The 'output: "export"' line has been removed.
	// This is the only change needed to fix the errors.
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'utfs.io',
				pathname: '/f/*',
			},
			{
				protocol: 'https',
				hostname: 'ik.imagekit.io',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'img.youtube.com',
				pathname: '/vi/**',
			},
		],
	},
};

module.exports = nextConfig;
