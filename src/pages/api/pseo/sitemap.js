/**
 * API Route: /api/pseo/sitemap
 * Generates dynamic sitemap for programmatic SEO pages
 */

import { generateSitemap, generateTemplateSitemap, generateSitemapIndex } from "@/lib/pseo/core/sitemap-generator";

export default async function handler(req, res) {
	try {
		const { type = "all", template } = req.query;

		let xml;

		switch (type) {
			case "index":
				xml = await generateSitemapIndex({
					baseUrl: "https://viraloop.io",
				});
				break;

			case "template":
				if (!template) {
					return res.status(400).json({
						success: false,
						message: "Template parameter is required for template sitemaps",
					});
				}
				xml = await generateTemplateSitemap(template, {
					baseUrl: "https://viraloop.io",
				});
				break;

			case "all":
			default:
				xml = await generateSitemap({
					baseUrl: "https://viraloop.io",
					includeStatic: true,
				});
				break;
		}

		// Set appropriate headers for XML
		res.setHeader("Content-Type", "application/xml");
		res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

		return res.status(200).send(xml);
	} catch (error) {
		console.error("Sitemap generation error:", error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}
