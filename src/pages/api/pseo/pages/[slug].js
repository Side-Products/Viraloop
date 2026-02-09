/**
 * API Route: /api/pseo/pages/[slug]
 * Handles operations for individual SEO pages
 */

import { seoDataLayer } from "@/lib/pseo/core/data-layer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
	try {
		const { slug } = req.query;

		// Check authentication for non-GET requests
		if (req.method !== "GET") {
			const session = await getServerSession(req, res, authOptions);
			if (!session) {
				return res.status(401).json({ success: false, message: "Unauthorized" });
			}
		}

		switch (req.method) {
			case "GET":
				return await handleGet(req, res, slug);
			case "PUT":
				return await handlePut(req, res, slug);
			case "DELETE":
				return await handleDelete(req, res, slug);
			default:
				return res.status(405).json({ success: false, message: "Method not allowed" });
		}
	} catch (error) {
		console.error("API Error:", error);
		return res.status(500).json({ success: false, message: error.message });
	}
}

/**
 * GET - Retrieve a single SEO page
 */
async function handleGet(req, res, slug) {
	const page = await seoDataLayer.getPageBySlug(slug, {
		includeAnalytics: true,
	});

	if (!page) {
		return res.status(404).json({
			success: false,
			message: "Page not found",
		});
	}

	return res.status(200).json({
		success: true,
		page,
	});
}

/**
 * PUT - Update an existing SEO page
 */
async function handlePut(req, res, slug) {
	const updates = req.body;

	const page = await seoDataLayer.updatePage(slug, updates);

	if (!page) {
		return res.status(404).json({
			success: false,
			message: "Page not found",
		});
	}

	return res.status(200).json({
		success: true,
		page,
		message: "Page updated successfully",
	});
}

/**
 * DELETE - Remove an SEO page
 */
async function handleDelete(req, res, slug) {
	const page = await seoDataLayer.deletePage(slug);

	if (!page) {
		return res.status(404).json({
			success: false,
			message: "Page not found",
		});
	}

	return res.status(200).json({
		success: true,
		message: "Page deleted successfully",
	});
}
