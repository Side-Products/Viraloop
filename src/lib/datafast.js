/**
 * DataFast Analytics Helper
 *
 * Provides utilities for tracking custom goals with DataFast analytics.
 * Supports both client-side and server-side tracking.
 */

/**
 * Send a custom goal to DataFast via server-side API
 *
 * @param {string} goalName - Name of the goal (lowercase, numbers, underscores, hyphens, max 32 chars)
 * @param {Object} metadata - Optional custom parameters (max 10 properties)
 * @returns {Promise<Object>} Response from the DataFast API
 *
 * @example
 * // Basic usage
 * await trackDatafastGoal("influencer_created");
 *
 * @example
 * // With custom parameters
 * await trackDatafastGoal("pricing_plan_selected", {
 *   plan_type: "pro",
 *   price: "79",
 *   billing_cycle: "monthly"
 * });
 */
export async function trackDatafastGoal(goalName, metadata = {}) {
	try {
		const response = await fetch("/api/datafast/track-goal", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: goalName,
				metadata,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("DataFast tracking error:", error);
			return { success: false, error };
		}

		const result = await response.json();
		return { success: true, data: result };
	} catch (error) {
		console.error("Error sending goal to DataFast:", error);
		return { success: false, error: error.message };
	}
}

/**
 * Track a goal with client-side DataFast tracking
 * This is a fallback method with lower accuracy (can be blocked by ad blockers)
 *
 * @param {string} goalName - Name of the goal
 * @param {Object} metadata - Optional custom parameters
 */
export function trackDatafastGoalClientSide(goalName, metadata = {}) {
	if (typeof window !== "undefined" && window.datafast) {
		if (Object.keys(metadata).length > 0) {
			window.datafast(goalName, metadata);
		} else {
			window.datafast(goalName);
		}
	}
}
