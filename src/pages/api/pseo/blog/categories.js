/**
 * API Route: /api/pseo/blog/categories
 * Get all blog categories with post counts
 */

import { seoDataLayer } from "@/lib/pseo/core/data-layer";
import { extractCategories } from "@/lib/pseo/utils/blog-helpers";

export default async function handler(req, res) {
	try {
		if (req.method !== "GET") {
			return res.status(405).json({ success: false, message: "Method not allowed" });
		}

		// Get all published blog posts
		const posts = await seoDataLayer.getPagesByTemplate("blog", {
			limit: 1000,
		});

		// Extract categories with counts
		const categories = extractCategories(posts);

		return res.status(200).json({
			success: true,
			categories,
			count: categories.length,
		});
	} catch (error) {
		console.error("API Error:", error);
		return res.status(500).json({ success: false, message: error.message });
	}
}
