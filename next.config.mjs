/** @type {import('next').NextConfig} */

const nextConfig = {
	turbopack: {},
	output: "export",
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	allowedDevOrigins: ["*.theopenbuilder.com"],
	basePath: "/Job-Application-Tracker",
	assetPrefix: "/Job-Application-Tracker/",
};

export default nextConfig;
