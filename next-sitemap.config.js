const product_url = "https://viraloop.so";

module.exports = {
	siteUrl: product_url,
	generateRobotsTxt: true,
	exclude: ["/admin/*", "/api/*", "/sitemap.xml"],
	robotsTxtOptions: {
		policies: [
			{ userAgent: "*", disallow: "/admin/*" },
			{ userAgent: "*", disallow: "/api/*" },
			{ userAgent: "*", allow: "/" },
		],
		additionalSitemaps: [`${product_url}/sitemap.xml`],
	},
};
