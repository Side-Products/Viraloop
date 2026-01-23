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
		domains: [
			"lh3.googleusercontent.com",
			"replicate.delivery",
			"s3.wasabisys.com",
			"exports.viraloop.so",
			"i.ytimg.com",
			"pbs.twimg.com",
			"scontent.cdninstagram.com",
			"platform-lookaside.fbsbx.com",
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
