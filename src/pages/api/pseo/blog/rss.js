/**
 * API Route: /api/pseo/blog/rss
 * Generate RSS feed for blog posts
 */

import { seoDataLayer } from "@/lib/pseo/core/data-layer";
import { generateExcerpt } from "@/lib/pseo/utils/blog-helpers";

export default async function handler(req, res) {
	try {
		if (req.method !== "GET") {
			return res.status(405).json({ success: false, message: "Method not allowed" });
		}

		const posts = await seoDataLayer.getPagesByTemplate("blog", {
			limit: 50,
			sortBy: "-publishedAt",
		});

		const rss = generateRSS(posts);

		res.setHeader("Content-Type", "application/xml");
		res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

		return res.status(200).send(rss);
	} catch (error) {
		console.error("RSS generation error:", error);
		return res.status(500).json({ success: false, message: error.message });
	}
}

/**
 * Generate RSS XML feed
 */
function generateRSS(posts) {
	const baseUrl = "https://viraloop.io";

	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
	xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
	xml += "  <channel>\n";
	xml += "    <title>Viraloop Blog</title>\n";
	xml += `    <link>${baseUrl}/blog</link>\n`;
	xml += "    <description>Learn about AI influencers, content automation, tips, and tutorials from Viraloop</description>\n";
	xml += "    <language>en-us</language>\n";
	xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
	xml += `    <atom:link href="${baseUrl}/api/pseo/blog/rss" rel="self" type="application/rss+xml"/>\n`;

	for (const post of posts) {
		const { hero } = post.content || {};
		const pubDate = hero?.publishedAt || post.publishedAt || post.createdAt;
		const excerpt = generateExcerpt(post.content?.sections, 300);

		xml += "    <item>\n";
		xml += `      <title>${escapeXml(post.metadata.title)}</title>\n`;
		xml += `      <link>${baseUrl}/${post.slug}</link>\n`;
		xml += `      <guid>${baseUrl}/${post.slug}</guid>\n`;
		xml += `      <description>${escapeXml(excerpt || post.metadata.description)}</description>\n`;
		xml += `      <pubDate>${new Date(pubDate).toUTCString()}</pubDate>\n`;

		if (hero?.author?.name) {
			xml += `      <author>${escapeXml(hero.author.name)}</author>\n`;
		}

		if (hero?.category) {
			xml += `      <category>${escapeXml(hero.category)}</category>\n`;
		}

		xml += "    </item>\n";
	}

	xml += "  </channel>\n";
	xml += "</rss>";

	return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
	if (!unsafe) return "";
	return unsafe.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case "&":
				return "&amp;";
			case "'":
				return "&apos;";
			case '"':
				return "&quot;";
			default:
				return c;
		}
	});
}
