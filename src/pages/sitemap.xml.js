/**
 * Server-Side Sitemap Generation
 * Serves sitemap at /sitemap.xml
 * Dynamically generates XML from MongoDB on each request
 */

import { generateSitemap } from "@/lib/pseo/core/sitemap-generator";

export default function Sitemap() {
	// This component will never render
	// The getServerSideProps function handles everything
	return null;
}

export async function getServerSideProps({ res }) {
	try {
		// Generate sitemap XML from database
		const xml = await generateSitemap({
			baseUrl: "https://viraloop.io",
			includeStatic: true,
		});

		// Set response headers for XML
		res.setHeader("Content-Type", "application/xml; charset=utf-8");
		res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");

		// Write XML to response
		res.write(xml);
		res.end();

		return {
			props: {},
		};
	} catch (error) {
		console.error("Sitemap generation error:", error);

		// Return 500 error
		res.statusCode = 500;
		res.end();

		return {
			props: {},
		};
	}
}
