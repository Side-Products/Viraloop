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
} from "../config/constants";

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
 * Returns { influencers, imagesPerMonth, videosPerMonth, platforms }
 */
export const getPlanLimitsFromStripePriceId = (stripePriceId) => {
	if (!stripePriceId) {
		return { influencers: 0, imagesPerMonth: 0, videosPerMonth: 0, platforms: 0 }; // No access without payment
	}

	const subscriptionData = findSubscriptionByStripePriceId(stripePriceId, getObjectWithHighestKey(subscriptionPlans));
	if (subscriptionData) {
		return {
			influencers: subscriptionData.influencers,
			imagesPerMonth: subscriptionData.imagesPerMonth,
			videosPerMonth: subscriptionData.videosPerMonth,
			platforms: subscriptionData.platforms,
		};
	}

	return { influencers: 0, imagesPerMonth: 0, videosPerMonth: 0, platforms: 0 };
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
