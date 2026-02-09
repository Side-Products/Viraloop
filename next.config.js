/** @type {import('next').NextConfig} */

// Suppress autoprefixer deprecation warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
	if (args[0] && typeof args[0] === "string" && args[0].includes("color-adjust")) {
		return;
	}
	originalConsoleWarn.apply(console, args);
};

const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	async redirects() {
		return [
			// Redirect www to non-www
			{
				source: "/:path*",
				has: [
					{
						type: "host",
						value: "www.viraloop.io",
					},
				],
				destination: "https://viraloop.io/:path*",
				permanent: true,
			},
		];
	},
	async rewrites() {
		return [
			{
				source: "/js/script.js",
				destination: "https://datafa.st/js/script.js",
			},
			{
				source: "/api/events",
				destination: "https://datafa.st/api/events",
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "replicate.delivery",
			},
			{
				protocol: "https",
				hostname: "s3.wasabisys.com",
			},
			{
				protocol: "https",
				hostname: "exports.viraloop.so",
			},
			{
				protocol: "https",
				hostname: "i.ytimg.com",
			},
			{
				protocol: "https",
				hostname: "pbs.twimg.com",
			},
			{
				protocol: "https",
				hostname: "scontent.cdninstagram.com",
			},
			{
				protocol: "https",
				hostname: "platform-lookaside.fbsbx.com",
			},
			{
				protocol: "https",
				hostname: "images.pexels.com",
			},
			{
				protocol: "https",
				hostname: "videos.pexels.com",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
			},
		],
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback.fs = false;
			config.resolve.fallback.tls = false;
			config.resolve.fallback.net = false;
			config.resolve.fallback.http = false;
			config.resolve.fallback.child_process = false;
		}

		// Filter out CSS deprecation warnings
		config.infrastructureLogging = {
			level: "error",
		};

		return config;
	},
};

module.exports = nextConfig;
