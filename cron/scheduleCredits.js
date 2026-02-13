import cron from "node-cron";
import mongoose from "mongoose";
import Subscription from "../src/backend/models/subscription.js";
import Team from "../src/backend/models/team.js";
import CreditHistory from "../src/backend/models/creditHistory.js";
import { SUBSCRIPTION_CREDITS } from "../src/config/constants.js";

/**
 * Get credits for a subscription plan
 * @param {string} planName - The plan name
 * @returns {number} Number of credits for the plan
 */
const getCreditsForPlan = (planName) => {
	if (!planName) return 0;
	// Remove period suffix like "(monthly)" or "(annual)"
	const planLower = planName.toLowerCase().replace(/\s*\(.*\)/, "").trim();
	return SUBSCRIPTION_CREDITS[planLower] || 0;
};

/**
 * Add recurring credits to teams with active subscriptions
 * This job runs daily and adds monthly credits to eligible subscriptions
 */
export async function scheduleCredits() {
	console.log("\n========== SCHEDULE CREDITS JOB ==========");
	console.log("Started at:", new Date().toISOString());

	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

	try {
		// Find active subscriptions eligible for credits
		// - Subscription is still valid (not expired)
		// - Created more than a month ago (already received initial credits)
		// - Status is active
		const subscriptions = await Subscription.find({
			subscriptionValidUntil: { $gt: new Date() },
			createdAt: { $lt: oneMonthAgo },
			stripe_subscription_status: "active",
		}).populate("user team");

		console.log(`Found ${subscriptions.length} eligible subscriptions`);

		let processed = 0;
		let skipped = 0;
		let failed = 0;

		for (const subscription of subscriptions) {
			// Generate idempotency key for this month
			const idempotencyKey = `cron_recurring_${subscription._id}_${new Date().toISOString().slice(0, 7)}`;

			const mongoSession = await mongoose.startSession();

			try {
				mongoSession.startTransaction();

				// Check idempotency - skip if already processed this month
				const existing = await CreditHistory.findOne({ idempotencyKey }, null, { session: mongoSession });

				if (existing) {
					console.log(`[SKIP] Already processed subscription ${subscription._id} this month`);
					await mongoSession.abortTransaction();
					skipped++;
					continue;
				}

				// Get credits for the plan
				const creditsToAdd = getCreditsForPlan(subscription.plan);
				if (creditsToAdd <= 0) {
					console.log(`[SKIP] No credits configured for plan: ${subscription.plan}`);
					await mongoSession.abortTransaction();
					skipped++;
					continue;
				}

				// Validate team exists
				if (!subscription.team) {
					console.log(`[SKIP] No team associated with subscription ${subscription._id}`);
					await mongoSession.abortTransaction();
					skipped++;
					continue;
				}

				// Create credit history record
				await CreditHistory.create(
					[
						{
							userId: subscription.user?._id,
							teamId: subscription.team._id,
							credits: creditsToAdd,
							amount_total: 0,
							type: "recurring",
							idempotencyKey,
						},
					],
					{ session: mongoSession }
				);

				// Update team credits
				await Team.findByIdAndUpdate(subscription.team._id, { $inc: { credits: creditsToAdd } }, { session: mongoSession });

				await mongoSession.commitTransaction();

				console.log(`[SUCCESS] Added ${creditsToAdd} credits to team ${subscription.team._id} (${subscription.team.name || "unnamed"})`);
				processed++;
			} catch (error) {
				await mongoSession.abortTransaction();

				// Duplicate key error is expected for concurrent executions
				if (error.code === 11000) {
					console.log(`[SKIP] Concurrent execution detected for subscription ${subscription._id}`);
					skipped++;
				} else {
					console.error(`[ERROR] Failed to process subscription ${subscription._id}:`, error.message);
					failed++;
				}
			} finally {
				mongoSession.endSession();
			}
		}

		console.log("\n--- SUMMARY ---");
		console.log(`Processed: ${processed}`);
		console.log(`Skipped: ${skipped}`);
		console.log(`Failed: ${failed}`);
		console.log("========== SCHEDULE CREDITS JOB COMPLETE ==========\n");
	} catch (error) {
		console.error("[FATAL] Schedule credits job failed:", error);
	}
}

// Run daily at midnight UTC (0 0 * * *)
const scheduleCreditsCron = cron.schedule("0 0 * * *", () => {
	console.log("[CRON] Triggering scheduled credits job...");
	scheduleCredits().catch((error) => {
		console.error("[CRON] Schedule credits job failed:", error);
	});
});

// Run on startup with a delay to allow DB connection
setTimeout(() => {
	console.log("[STARTUP] Running initial schedule credits job...");
	scheduleCredits().catch((error) => {
		console.error("[STARTUP] Initial schedule credits job failed:", error);
	});
}, 10000); // 10 second delay

export default scheduleCreditsCron;
