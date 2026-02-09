/**
 * API Route: /api/pseo/blog/popular
 * Get popular blog posts by analytics
 */

import { seoDataLayer } from "@/lib/pseo/core/data-layer";

export default async function handler(req, res) {
	try {
		if (req.method !== "GET") {
			return res.status(405).json({ success: false, message: "Method not allowed" });
		}

		const { limit = 10, metric = "impressions" } = req.query;

		const posts = await seoDataLayer.getTopPages({
			limit: parseInt(limit),
			metric,
		});

		// Filter to only blog posts
		const blogPosts = posts.filter((post) => post.template === "blog");

		return res.status(200).json({
			success: true,
			posts: blogPosts,
			count: blogPosts.length,
		});
	} catch (error) {
		console.error("API Error:", error);
		return res.status(500).json({ success: false, message: error.message });
	}
}
