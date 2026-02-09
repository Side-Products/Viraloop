/**
 * API Route: /api/pseo/pages
 * Handles CRUD operations for SEO pages
 */

import { seoDataLayer } from "@/lib/pseo/core/data-layer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
	try {
		// Check authentication for non-GET requests
		if (req.method !== "GET") {
			const session = await getServerSession(req, res, authOptions);
			if (!session) {
				return res.status(401).json({ success: false, message: "Unauthorized" });
			}
		}

		switch (req.method) {
			case "GET":
				return await handleGet(req, res);
			case "POST":
				return await handlePost(req, res);
			default:
				return res.status(405).json({ success: false, message: "Method not allowed" });
		}
	} catch (error) {
		console.error("API Error:", error);
		return res.status(500).json({ success: false, message: error.message });
	}
}

/**
 * GET - List SEO pages with filters
 */
async function handleGet(req, res) {
	const { template, status = "published", limit = 50, skip = 0, sortBy = "-createdAt" } = req.query;

	const filters = { status };
	if (template) {
		filters.template = template;
	}

	const pages = await seoDataLayer.getPages(filters, {
		limit: parseInt(limit),
		skip: parseInt(skip),
		sortBy,
	});

	return res.status(200).json({
		success: true,
		pages,
		count: pages.length,
	});
}

/**
 * POST - Create a new SEO page
 */
async function handlePost(req, res) {
	const pageData = req.body;

	// Validate required fields
	if (!pageData.slug || !pageData.template || !pageData.metadata) {
		return res.status(400).json({
			success: false,
			message: "Missing required fields: slug, template, metadata",
		});
	}

	// Create page
	const page = await seoDataLayer.createPage(pageData);

	return res.status(201).json({
		success: true,
		page,
		message: "Page created successfully",
	});
}
