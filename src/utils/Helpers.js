import {
	subscriptionPlans,
	trialPlan,
	growthPlanMonthly,
	growthPlanAnnual,
	proPlanMonthly,
	proPlanAnnual,
	ultraPlanMonthly,
	ultraPlanAnnual,
	CURRENT_SUBSCRIPTION_VERSION,
	SUBSCRIPTION_CREDITS,
} from "../config/constants";

// Plan tier names (without billing period)
export const PLAN_TIERS = {
	FREE: "Free",
	TRIAL: "Trial",
	GROWTH: "Growth",
	PRO: "Pro",
	ULTRA: "Ultra",
};

/**
 * Get the highest key from an object (for versioned subscription plans)
 */
const getHighestKeyFromObject = (obj) => {
	let highestKey = null;
	for (const key in obj) {
		if (highestKey === null || parseInt(key) > parseInt(highestKey)) {
			highestKey = key;
		}
	}
	return parseInt(highestKey);
};

/**
 * Get the object with the highest key (latest version of subscription plans)
 */
const getObjectWithHighestKey = (obj) => {
	const highestKey = getHighestKeyFromObject(obj);
	return obj[highestKey];
};

/**
 * Get the latest subscription plans version
 */
export const getLatestSubscriptionPlansVersion = () => {
	return getHighestKeyFromObject(subscriptionPlans);
};

/**
 * Helper function to find a subscription by Stripe price ID
 */
const findSubscriptionByStripePriceId = (stripePriceId, plans) => {
	if (!plans) return null;

	const allSubscriptions = [
		plans.trialSubscription,
		plans.growthSubscription,
		plans.proSubscription,
		plans.ultraSubscription,
	].filter(Boolean);

	for (const subscription of allSubscriptions) {
		if (subscription?.monthly?.stripePriceId === stripePriceId) {
			return subscription.monthly;
		}
		if (subscription?.annual?.stripePriceId === stripePriceId) {
			return subscription.annual;
		}
	}

	return null;
};

/**
 * Get plan name from Stripe price ID
 */
export const getPlanFromStripePriceId = (stripePriceId) => {
	if (!stripePriceId) return trialPlan;

	const subscriptionData = findSubscriptionByStripePriceId(stripePriceId, getObjectWithHighestKey(subscriptionPlans));
	if (subscriptionData) return subscriptionData.name;

	return trialPlan;
};

/**
 * Get subscription period from Stripe price ID (monthly or annual)
 */
export const getSubscriptionPeriodFromStripePriceId = (stripePriceId, version) => {
	if (!stripePriceId) return null;

	const plans = subscriptionPlans[version];
	if (!plans) return null;

	const allSubscriptions = [
		plans.trialSubscription,
		plans.growthSubscription,
		plans.proSubscription,
		plans.ultraSubscription,
	].filter(Boolean);

	for (const subscription of allSubscriptions) {
		if (subscription?.monthly?.stripePriceId === stripePriceId) {
			return "monthly";
		}
		if (subscription?.annual?.stripePriceId === stripePriceId) {
			return "annual";
		}
	}

	return null;
};

/**
 * Get plan limits from Stripe price ID
 * Returns { influencers, images, videos, platforms }
 */
export const getPlanLimitsFromStripePriceId = (stripePriceId) => {
	console.log("[getPlanLimitsFromStripePriceId] Looking up limits for price ID:", stripePriceId);

	if (!stripePriceId) {
		console.log("[getPlanLimitsFromStripePriceId] No price ID provided, returning zeros");
		return { influencers: 0, images: 0, videos: 0, platforms: [] };
	}

	const plans = getObjectWithHighestKey(subscriptionPlans);
	const subscriptionData = findSubscriptionByStripePriceId(stripePriceId, plans);

	if (subscriptionData) {
		const limits = {
			influencers: subscriptionData.influencers,
			images: subscriptionData.images,
			videos: subscriptionData.videos,
			platforms: subscriptionData.platforms,
		};
		console.log("[getPlanLimitsFromStripePriceId] Found plan:", subscriptionData.name, "Limits:", limits);
		return limits;
	}

	console.log("[getPlanLimitsFromStripePriceId] No matching plan found for price ID:", stripePriceId);
	console.log("[getPlanLimitsFromStripePriceId] Available plans:", {
		trial: plans.trialSubscription?.monthly?.stripePriceId,
		growthMonthly: plans.growthSubscription?.monthly?.stripePriceId,
		growthAnnual: plans.growthSubscription?.annual?.stripePriceId,
		proMonthly: plans.proSubscription?.monthly?.stripePriceId,
		proAnnual: plans.proSubscription?.annual?.stripePriceId,
		ultraMonthly: plans.ultraSubscription?.monthly?.stripePriceId,
		ultraAnnual: plans.ultraSubscription?.annual?.stripePriceId,
	});

	return { influencers: 0, images: 0, videos: 0, platforms: [] };
};

/**
 * Get current subscription tier from subscription object
 */
export const getCurrentSubscriptionTier = (subscription) => {
	const validStripeStatuses = ["active", "trialing"];
	const isSubscriptionValid =
		subscription &&
		((subscription.subscriptionValidUntil && new Date(subscription.subscriptionValidUntil) > Date.now()) || !subscription.subscriptionValidUntil) &&
		validStripeStatuses.includes(subscription.stripe_subscription_status);

	if (!isSubscriptionValid) {
		return null; // No valid subscription
	}

	const versionPlans = subscriptionPlans[subscription.version];
	if (!versionPlans) return null;

	const plans = [
		{
			condition: subscription.stripe_priceId === versionPlans?.trialSubscription?.monthly?.stripePriceId,
			plan: trialPlan,
		},
		{
			condition: subscription.stripe_priceId === versionPlans?.growthSubscription?.monthly?.stripePriceId,
			plan: growthPlanMonthly,
		},
		{
			condition: subscription.stripe_priceId === versionPlans?.growthSubscription?.annual?.stripePriceId,
			plan: growthPlanAnnual,
		},
		{
			condition: subscription.stripe_priceId === versionPlans?.proSubscription?.monthly?.stripePriceId,
			plan: proPlanMonthly,
		},
		{
			condition: subscription.stripe_priceId === versionPlans?.proSubscription?.annual?.stripePriceId,
			plan: proPlanAnnual,
		},
		{
			condition: subscription.stripe_priceId === versionPlans?.ultraSubscription?.monthly?.stripePriceId,
			plan: ultraPlanMonthly,
		},
		{
			condition: subscription.stripe_priceId === versionPlans?.ultraSubscription?.annual?.stripePriceId,
			plan: ultraPlanAnnual,
		},
	];

	for (const { condition, plan } of plans) {
		if (condition) return plan;
	}

	return null;
};

/**
 * Get subscription plan name for display
 */
export const getSubscriptionPlanName = (plan) => {
	const subscriptionPlansHighestKey = getObjectWithHighestKey(subscriptionPlans);

	const planMappings = [
		{ plan: trialPlan, name: subscriptionPlansHighestKey.trialSubscription?.monthly?.name },
		{ plan: growthPlanMonthly, name: subscriptionPlansHighestKey.growthSubscription?.monthly?.name },
		{ plan: growthPlanAnnual, name: subscriptionPlansHighestKey.growthSubscription?.annual?.name },
		{ plan: proPlanMonthly, name: subscriptionPlansHighestKey.proSubscription?.monthly?.name },
		{ plan: proPlanAnnual, name: subscriptionPlansHighestKey.proSubscription?.annual?.name },
		{ plan: ultraPlanMonthly, name: subscriptionPlansHighestKey.ultraSubscription?.monthly?.name },
		{ plan: ultraPlanAnnual, name: subscriptionPlansHighestKey.ultraSubscription?.annual?.name },
	];

	for (const mapping of planMappings) {
		if (plan === mapping.plan && mapping.name) {
			return mapping.name;
		}
	}

	return plan;
};

/**
 * Extract the plan tier name from a full plan name (e.g., "Growth (monthly)" -> "Growth")
 * Also handles direct tier names like "Growth", "Pro", etc.
 */
export const getPlanTierName = (planName) => {
	if (!planName) return null;

	const lowerPlan = planName.toLowerCase();

	if (lowerPlan.includes("ultra")) return PLAN_TIERS.ULTRA;
	if (lowerPlan.includes("pro")) return PLAN_TIERS.PRO;
	if (lowerPlan.includes("growth")) return PLAN_TIERS.GROWTH;
	if (lowerPlan.includes("trial")) return PLAN_TIERS.TRIAL;

	return null;
};

/**
 * Get the current plan tier for a team
 * Checks subscription first, then falls back to inferring from influencer limits
 * @param {Object} team - The team object from TeamContext
 * @returns {{ tier: string, maxCredits: number, isFromSubscription: boolean }}
 */
export const getTeamPlanInfo = (team) => {
	if (!team) {
		return {
			tier: PLAN_TIERS.FREE,
			maxCredits: 0,
			isFromSubscription: false,
		};
	}

	// First, try to get tier from subscription
	if (team.subscription?.plan) {
		const tier = getPlanTierName(team.subscription.plan);
		if (tier) {
			const creditsKey = tier.toLowerCase();
			return {
				tier,
				maxCredits: SUBSCRIPTION_CREDITS[creditsKey] || SUBSCRIPTION_CREDITS.trial,
				isFromSubscription: true,
			};
		}
	}

	// Fallback: infer from influencer limit
	if (team.influencerLimit >= 50) {
		return { tier: PLAN_TIERS.ULTRA, maxCredits: SUBSCRIPTION_CREDITS.ultra, isFromSubscription: false };
	}
	if (team.influencerLimit >= 15) {
		return { tier: PLAN_TIERS.PRO, maxCredits: SUBSCRIPTION_CREDITS.pro, isFromSubscription: false };
	}
	if (team.influencerLimit >= 5) {
		return { tier: PLAN_TIERS.GROWTH, maxCredits: SUBSCRIPTION_CREDITS.growth, isFromSubscription: false };
	}
	// Trial has 3 influencers
	if (team.influencerLimit >= 3) {
		return { tier: PLAN_TIERS.TRIAL, maxCredits: SUBSCRIPTION_CREDITS.trial, isFromSubscription: false };
	}

	// Default to Free (no plan purchased)
	return {
		tier: PLAN_TIERS.FREE,
		maxCredits: 0,
		isFromSubscription: false,
	};
};
