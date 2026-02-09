/**
 * API Route: /api/pseo/blog/posts
 * List blog posts with filters
 */

import { seoDataLayer } from "@/lib/pseo/core/data-layer";

export default async function handler(req, res) {
	try {
		if (req.method !== "GET") {
			return res.status(405).json({ success: false, message: "Method not allowed" });
		}

		const { category, tag, limit = 20, skip = 0, sortBy = "-publishedAt" } = req.query;

		const filters = { template: "blog", status: "published" };

		// Filter by category
		if (category) {
			filters["content.hero.category"] = category;
		}

		// Filter by tag
		if (tag) {
			filters["content.hero.tags"] = tag;
		}

		const posts = await seoDataLayer.getPages(filters, {
			limit: parseInt(limit),
			skip: parseInt(skip),
			sortBy,
		});

		return res.status(200).json({
			success: true,
			posts,
			count: posts.length,
		});
	} catch (error) {
		console.error("API Error:", error);
		return res.status(500).json({ success: false, message: error.message });
	}
}
