import nc from "next-connect";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

const DATAFAST_API_KEY = process.env.DATAFAST_API_KEY;

/**
 * POST /api/datafast/track-goal
 *
 * Track a custom goal event with DataFast analytics.
 * This server-side tracking is more reliable than client-side tracking
 * as it's not affected by ad blockers.
 *
 * Request body:
 * {
 *   "name": "goal_name",           // Required: Goal name (lowercase, numbers, _, -, max 32 chars)
 *   "metadata": {                  // Optional: Custom parameters (max 10)
 *     "key": "value"
 *   }
 * }
 */
handler.post(async (req, res) => {
	try {
		const { name, metadata = {} } = req.body;

		// Validate goal name
		if (!name) {
			return res.status(400).json({
				success: false,
				error: "Goal name is required",
			});
		}

		// Validate goal name format
		if (!/^[a-z0-9_-]{1,32}$/.test(name)) {
			return res.status(400).json({
				success: false,
				error: "Goal name must be lowercase letters, numbers, underscores, or hyphens (max 32 chars)",
			});
		}

		// Validate metadata
		if (Object.keys(metadata).length > 10) {
			return res.status(400).json({
				success: false,
				error: "Maximum 10 custom parameters allowed",
			});
		}

		// Get DataFast visitor ID from cookies
		const datafast_visitor_id = req.cookies.datafast_visitor_id;

		if (!datafast_visitor_id) {
			// If no visitor ID, log warning but don't fail
			// The user might have cookies blocked or be a first-time visitor
			console.warn("No DataFast visitor ID found in cookies");
			return res.status(200).json({
				success: true,
				message: "Goal tracking skipped - no visitor ID available",
			});
		}

		// Check if API key is configured
		if (!DATAFAST_API_KEY) {
			console.error("DATAFAST_API_KEY not configured in environment variables");
			return res.status(500).json({
				success: false,
				error: "DataFast API key not configured",
			});
		}

		// Send goal to DataFast API
		const response = await fetch("https://datafa.st/api/v1/goals", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${DATAFAST_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				datafast_visitor_id,
				name,
				metadata,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("DataFast API error:", errorData);

			// Handle specific error cases
			if (response.status === 404) {
				// Visitor has no pageviews yet - this is expected for some cases
				return res.status(200).json({
					success: true,
					message: "Goal tracking skipped - visitor has no pageviews yet",
				});
			}

			if (response.status === 400) {
				// Visitor might be a bot
				return res.status(200).json({
					success: true,
					message: "Goal tracking skipped - visitor filtered",
				});
			}

			return res.status(response.status).json({
				success: false,
				error: errorData,
			});
		}

		const result = await response.json();

		return res.status(200).json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("Error tracking DataFast goal:", error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

export default handler;
