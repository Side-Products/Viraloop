/**
 * API Route: /api/pseo/bulk-create
 * Bulk create multiple SEO pages at once
 */

import { seoDataLayer } from "@/lib/pseo/core/data-layer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
	try {
		if (req.method !== "POST") {
			return res.status(405).json({ success: false, message: "Method not allowed" });
		}

		// Check authentication
		const session = await getServerSession(req, res, authOptions);
		if (!session) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		const { pages } = req.body;

		if (!pages || !Array.isArray(pages) || pages.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Pages array is required and must not be empty",
			});
		}

		// Validate each page has required fields
		const errors = [];
		pages.forEach((page, index) => {
			if (!page.slug || !page.template || !page.metadata) {
				errors.push(`Page at index ${index} missing required fields`);
			}
		});

		if (errors.length > 0) {
			return res.status(400).json({
				success: false,
				message: "Validation errors",
				errors,
			});
		}

		// Bulk create pages
		const createdPages = await seoDataLayer.bulkCreatePages(pages);

		return res.status(201).json({
			success: true,
			count: createdPages.length,
			pages: createdPages,
			message: `Successfully created ${createdPages.length} pages`,
		});
	} catch (error) {
		console.error("Bulk create error:", error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}
