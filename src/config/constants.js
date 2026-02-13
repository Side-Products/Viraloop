// Viraloop Configuration Constants

export const PRODUCT_NAME = "Viraloop";
export const PRODUCT_URL = "https://viraloop.io";
export const DOMAIN = "viraloop.io";
export const CONTACT_EMAIL = "hello@viraloop.io";

// Social Links
export const SOCIAL_LINKS = {
	twitter: "https://twitter.com/viraloop",
	instagram: "https://instagram.com/viraloop",
	tiktok: "https://tiktok.com/@viraloop",
	youtube: "https://youtube.com/@viraloop",
};

// Plan name constants
export const trialPlan = "Trial";
export const growthPlanMonthly = "Growth (monthly)";
export const growthPlanAnnual = "Growth (annual)";
export const proPlanMonthly = "Pro (monthly)";
export const proPlanAnnual = "Pro (annual)";
export const ultraPlanMonthly = "Ultra (monthly)";
export const ultraPlanAnnual = "Ultra (annual)";

// Current subscription version
export const CURRENT_SUBSCRIPTION_VERSION = 1;

// =====================
// CREDIT SYSTEM (defined early so subscription plans can reference these)
// =====================

// Credit pricing
export const PRICE_PER_CREDIT = 0.1; // $0.10 per credit

// Credit costs for operations
export const CREDITS_REQUIRED = {
	IMAGE_GENERATION: 3,
	VIDEO_GENERATION_KLING: 10,
	VIDEO_GENERATION_VEO_FAST: 15,
	VIDEO_GENERATION_VEO_QUALITY: 30,
	TTS_GENERATION: 2,
	INFLUENCER_CREATION: 5,
};

// Credits per subscription tier (monthly)
export const SUBSCRIPTION_CREDITS = {
	trial: 20, // One-time
	growth: 300, // Monthly
	pro: 700, // Monthly
	ultra: 1000, // Monthly
};

// Helper to calculate images/videos from credits
const calcImages = (credits) => Math.floor(credits / CREDITS_REQUIRED.IMAGE_GENERATION);
const calcVideos = (credits) => Math.floor(credits / CREDITS_REQUIRED.VIDEO_GENERATION_VEO_FAST);

// Production Stripe Price IDs (Live mode)
const productionSubscriptionPlans = {
	1: {
		trialSubscription: {
			monthly: {
				name: "Trial",
				price: 1,
				stripePriceId: "price_1SyuIo480cIYlJtw77WJVmRe",
				isOneTime: true,
				influencers: 1,
				images: 1,
				videos: 1,
				platforms: ["tiktok"],
			},
		},
		growthSubscription: {
			monthly: {
				name: "Growth (monthly)",
				price: 39,
				originalPrice: 59,
				stripePriceId: "price_1SyuLS480cIYlJtwyCAgy8bb",
				validForDays: 30,
				influencers: 5,
				images: calcImages(SUBSCRIPTION_CREDITS.growth),
				videos: calcVideos(SUBSCRIPTION_CREDITS.growth),
				platforms: ["tiktok", "instagram", "youtube"],
			},
			annual: {
				name: "Growth (annual)",
				price: 32,
				originalPrice: 49,
				pricePerYear: 390,
				stripePriceId: "price_1SyuLS480cIYlJtwbfB4U3wU",
				validForDays: 365,
				influencers: 5,
				images: calcImages(SUBSCRIPTION_CREDITS.growth),
				videos: calcVideos(SUBSCRIPTION_CREDITS.growth),
				platforms: ["tiktok", "instagram", "youtube"],
			},
		},
		proSubscription: {
			monthly: {
				name: "Pro (monthly)",
				price: 69,
				originalPrice: 129,
				stripePriceId: "price_1SyuMD480cIYlJtwVb367Kie",
				validForDays: 30,
				influencers: 15,
				images: calcImages(SUBSCRIPTION_CREDITS.pro),
				videos: calcVideos(SUBSCRIPTION_CREDITS.pro),
				platforms: ["tiktok", "instagram", "youtube"],
			},
			annual: {
				name: "Pro (annual)",
				price: 57,
				originalPrice: 107,
				pricePerYear: 690,
				stripePriceId: "price_1SyuMD480cIYlJtwp5evP1E5",
				validForDays: 365,
				influencers: 15,
				images: calcImages(SUBSCRIPTION_CREDITS.pro),
				videos: calcVideos(SUBSCRIPTION_CREDITS.pro),
				platforms: ["tiktok", "instagram", "youtube"],
			},
		},
		ultraSubscription: {
			monthly: {
				name: "Ultra (monthly)",
				price: 99,
				originalPrice: 199,
				stripePriceId: "price_1SyuMu480cIYlJtw174Srzq2",
				validForDays: 30,
				influencers: 50,
				images: calcImages(SUBSCRIPTION_CREDITS.ultra),
				videos: calcVideos(SUBSCRIPTION_CREDITS.ultra),
				platforms: ["tiktok", "instagram", "youtube"],
			},
			annual: {
				name: "Ultra (annual)",
				price: 82,
				originalPrice: 166,
				pricePerYear: 990,
				stripePriceId: "price_1SyuMu480cIYlJtw670ddsS3",
				validForDays: 365,
				influencers: 50,
				images: calcImages(SUBSCRIPTION_CREDITS.ultra),
				videos: calcVideos(SUBSCRIPTION_CREDITS.ultra),
				platforms: ["tiktok", "instagram", "youtube"],
			},
		},
	},
};

// Sandbox Stripe Price IDs (Test mode) - Replace with your Stripe test mode price IDs
const sandboxSubscriptionPlans = {
	1: {
		trialSubscription: {
			monthly: {
				name: "Trial",
				price: 1,
				stripePriceId: "price_1T0LcRKoeqMlLw1bfOWgJr9K",
				isOneTime: true,
				influencers: 1,
				images: 1,
				videos: 1,
				platforms: ["tiktok"],
			},
		},
		growthSubscription: {
			monthly: {
				name: "Growth (monthly)",
				price: 39,
				originalPrice: 59,
				stripePriceId: "price_1T0LpMKoeqMlLw1bqdJRoFRd",
				validForDays: 30,
				influencers: 5,
				images: calcImages(SUBSCRIPTION_CREDITS.growth),
				videos: calcVideos(SUBSCRIPTION_CREDITS.growth),
				platforms: ["tiktok", "instagram", "youtube"],
			},
			annual: {
				name: "Growth (annual)",
				price: 32,
				originalPrice: 49,
				pricePerYear: 390,
				stripePriceId: "price_1T0LpMKoeqMlLw1bUBRPjkLy",
				validForDays: 365,
				influencers: 5,
				images: calcImages(SUBSCRIPTION_CREDITS.growth),
				videos: calcVideos(SUBSCRIPTION_CREDITS.growth),
				platforms: ["tiktok", "instagram", "youtube"],
			},
		},
		proSubscription: {
			monthly: {
				name: "Pro (monthly)",
				price: 69,
				originalPrice: 129,
				stripePriceId: "price_1T0LqAKoeqMlLw1b5BymHdqi",
				validForDays: 30,
				influencers: 15,
				images: calcImages(SUBSCRIPTION_CREDITS.pro),
				videos: calcVideos(SUBSCRIPTION_CREDITS.pro),
				platforms: ["tiktok", "instagram", "youtube"],
			},
			annual: {
				name: "Pro (annual)",
				price: 57,
				originalPrice: 107,
				pricePerYear: 690,
				stripePriceId: "price_1T0LqAKoeqMlLw1bXxnpe5p8",
				validForDays: 365,
				influencers: 15,
				images: calcImages(SUBSCRIPTION_CREDITS.pro),
				videos: calcVideos(SUBSCRIPTION_CREDITS.pro),
				platforms: ["tiktok", "instagram", "youtube"],
			},
		},
		ultraSubscription: {
			monthly: {
				name: "Ultra (monthly)",
				price: 99,
				originalPrice: 199,
				stripePriceId: "price_1T0LqgKoeqMlLw1brnIN2l0D",
				validForDays: 30,
				influencers: 50,
				images: calcImages(SUBSCRIPTION_CREDITS.ultra),
				videos: calcVideos(SUBSCRIPTION_CREDITS.ultra),
				platforms: ["tiktok", "instagram", "youtube"],
			},
			annual: {
				name: "Ultra (annual)",
				price: 82,
				originalPrice: 166,
				pricePerYear: 990,
				stripePriceId: "price_1T0LqgKoeqMlLw1bcCY9CYG3",
				validForDays: 365,
				influencers: 50,
				images: calcImages(SUBSCRIPTION_CREDITS.ultra),
				videos: calcVideos(SUBSCRIPTION_CREDITS.ultra),
				platforms: ["tiktok", "instagram", "youtube"],
			},
		},
	},
};

// Determine if we're in sandbox/development mode based on NEXTAUTH_URL
const isProduction = typeof process !== "undefined" && process.env?.NEXTAUTH_URL?.includes("viraloop.io");
// Export the appropriate subscription plans based on environment
export const subscriptionPlans = isProduction ? productionSubscriptionPlans : sandboxSubscriptionPlans;

// Get current version's plans
const PLANS = subscriptionPlans[CURRENT_SUBSCRIPTION_VERSION];

// Export trial price ID for use in payment-success page
export const TRIAL_PRICE_ID = PLANS?.trialSubscription?.monthly?.stripePriceId;

// Stripe product for credit purchases (create in Stripe dashboard)
export const CREDITS_STRIPE_PRODUCT_ID = "prod_CREDITS_VIRALOOP"; // TODO: Replace with actual Stripe product ID

// Helper to calculate how many operations can be done with given credits
export const calculateOperationsFromCredits = (credits) => ({
	images: Math.floor(credits / CREDITS_REQUIRED.IMAGE_GENERATION),
	videos: Math.floor(credits / CREDITS_REQUIRED.VIDEO_GENERATION_KLING),
	influencers: Math.floor(credits / CREDITS_REQUIRED.INFLUENCER_CREATION),
	tts: Math.floor(credits / CREDITS_REQUIRED.TTS_GENERATION),
});

// Helper to generate trial highlights dynamically based on credits
const generateTrialHighlights = () => {
	const credits = SUBSCRIPTION_CREDITS.trial;
	return [
		{ icon: "credits", text: `${credits} credits` },
		{ icon: "influencer", text: `${PLANS.trialSubscription.monthly.influencers} AI Influencer` },
		{ icon: "image", text: `${PLANS.trialSubscription.monthly.images} image` },
		{ icon: "video", text: `${PLANS.trialSubscription.monthly.videos} video` },
		{ icon: "platform", text: "1 platform", platforms: PLANS.trialSubscription.monthly.platforms },
	];
};

// Pricing Features for detailed display
export const PRICING_FEATURES = {
	trial: {
		highlights: generateTrialHighlights(),
		features: [
			{ icon: "platform", text: "1 social platform", platforms: ["tiktok"] },
			{ icon: "video", text: "HD video quality" },
			{ icon: "support", text: "Email support" },
		],
	},
	growth: {
		inheritFrom: "Trial",
		highlights: [
			{ icon: "credits", text: `${SUBSCRIPTION_CREDITS.growth} credits/month` },
			{ icon: "influencer", text: `${PLANS.growthSubscription.monthly.influencers} AI Influencers` },
			{ icon: "image", text: `${PLANS.growthSubscription.monthly.images} images/month` },
			{ icon: "video", text: `${PLANS.growthSubscription.monthly.videos} videos/month` },
			{ icon: "platform", text: "All platforms", platforms: ["tiktok", "instagram", "youtube"] },
		],
		features: [
			{ icon: "video", text: "HD video quality" },
			{ icon: "schedule", text: "Post scheduling" },
			{ icon: "support", text: "Email support" },
		],
	},
	pro: {
		inheritFrom: "Growth",
		highlights: [
			{ icon: "credits", text: `${SUBSCRIPTION_CREDITS.pro} credits/month` },
			{ icon: "influencer", text: `${PLANS.proSubscription.monthly.influencers} AI Influencers` },
			{ icon: "image", text: `${PLANS.proSubscription.monthly.images} images/month` },
			{ icon: "video", text: `${PLANS.proSubscription.monthly.videos} videos/month` },
			{ icon: "platform", text: "All platforms", platforms: ["tiktok", "instagram", "youtube"] },
		],
		features: [
			{ icon: "video", text: "HD video quality" },
			{ icon: "loop", text: "Loop posting" },
			{ icon: "analytics", text: "Basic analytics" },
			{ icon: "support", text: "Priority support" },
		],
	},
	ultra: {
		inheritFrom: "Pro",
		highlights: [
			{ icon: "credits", text: `${SUBSCRIPTION_CREDITS.ultra.toLocaleString()} credits/month` },
			{ icon: "influencer", text: `${PLANS.ultraSubscription.monthly.influencers} AI Influencers` },
			{ icon: "image", text: `${PLANS.ultraSubscription.monthly.images} images/month` },
			{ icon: "video", text: `${PLANS.ultraSubscription.monthly.videos} videos/month` },
			{ icon: "platform", text: "All platforms", platforms: ["tiktok", "instagram", "youtube"] },
		],
		features: [
			{ icon: "video", text: "4K video quality" },
			{ icon: "analytics", text: "Advanced analytics" },
			{ icon: "custom", text: "Custom voice cloning" },
			{ icon: "support", text: "Priority support" },
		],
	},
};

// Plan configurations for pricing page
export const PLAN_CONFIG = {
	trial: {
		name: "Trial",
		description: "Try before you subscribe",
		subscription: PLANS?.trialSubscription,
		features: PRICING_FEATURES.trial,
		highlighted: false,
		isTrial: true,
	},
	growth: {
		name: "Growth",
		description: "Perfect for getting started",
		subscription: PLANS?.growthSubscription,
		features: PRICING_FEATURES.growth,
		highlighted: false,
	},
	pro: {
		name: "Pro",
		description: "Most popular for serious creators",
		subscription: PLANS?.proSubscription,
		features: PRICING_FEATURES.pro,
		highlighted: true,
		badge: "MOST POPULAR",
	},
	ultra: {
		name: "Ultra",
		description: "For agencies and power users",
		subscription: PLANS?.ultraSubscription,
		features: PRICING_FEATURES.ultra,
		highlighted: false,
	},
};

// Task Types
export const TASKS = {
	GENERATE_INFLUENCER_PREVIEW: "generate_influencer_preview",
	GENERATE_POST_TTS: "generate_post_tts",
	GENERATE_POST_VIDEO: "generate_post_video",
	POST_TO_TIKTOK: "post_to_tiktok",
	POST_TO_INSTAGRAM: "post_to_instagram",
	POST_TO_YOUTUBE: "post_to_youtube",
	PROCESS_SCHEDULE: "process_schedule",
	SYNC_ANALYTICS: "sync_analytics",
	REFRESH_TOKENS: "refresh_tokens",
};

// Task Status
export const TASK_STATUS = {
	PENDING: "pending",
	PROCESSING: "processing",
	COMPLETED: "completed",
	FAILED: "failed",
	CANCELLED: "cancelled",
};

// Video Generation
export const VIDEO_CONFIG = {
	defaultAspectRatio: "9:16", // Vertical for social media
	maxDuration: 60, // Maximum video duration in seconds
	defaultFps: 30,
	maxScriptLength: 5000,
};

// Voice Speed Options
export const VOICE_SPEED_OPTIONS = [
	{ value: 0.75, label: "0.75x (Slow)" },
	{ value: 1.0, label: "1.0x (Normal)" },
	{ value: 1.25, label: "1.25x (Fast)" },
	{ value: 1.5, label: "1.5x (Very Fast)" },
];

// Influencer Niches
export const NICHES = [
	{ value: "fitness", label: "Fitness & Health" },
	{ value: "lifestyle", label: "Lifestyle" },
	{ value: "tech", label: "Technology" },
	{ value: "beauty", label: "Beauty & Fashion" },
	{ value: "business", label: "Business & Finance" },
	{ value: "education", label: "Education" },
	{ value: "entertainment", label: "Entertainment" },
	{ value: "gaming", label: "Gaming" },
	{ value: "food", label: "Food & Cooking" },
	{ value: "travel", label: "Travel" },
	{ value: "other", label: "Other" },
];

// Platform Configuration
export const PLATFORMS = {
	tiktok: {
		name: "TikTok",
		icon: "tiktok",
		color: "#000000",
		maxCaptionLength: 2200,
		maxHashtags: 30,
		privacyLevels: ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY"],
	},
	instagram: {
		name: "Instagram",
		icon: "instagram",
		color: "#E4405F",
		maxCaptionLength: 2200,
		maxHashtags: 30,
	},
	youtube: {
		name: "YouTube",
		icon: "youtube",
		color: "#FF0000",
		maxTitleLength: 100,
		maxDescriptionLength: 5000,
		maxTags: 500,
		privacyStatuses: ["public", "private", "unlisted"],
	},
};

// OAuth Scopes
export const OAUTH_SCOPES = {
	tiktok: "user.info.basic,user.info.profile,user.info.stats,video.publish,video.upload",
	instagram: "instagram_basic,instagram_content_publish,instagram_manage_comments,pages_read_engagement",
	youtube: "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/userinfo.profile",
};

// API Endpoints (external)
export const EXTERNAL_APIS = {
	kieAi: {
		generate: "https://api.kie.ai/api/v1/veo/generate",
		status: "https://api.kie.ai/api/v1/veo/record-info",
	},
	replicate: {
		nanoBanana: "google/nano-banana-pro",
	},
	elevenLabs: {
		baseUrl: "https://api.elevenlabs.io/v1",
	},
};

// Schedule Frequency Options
export const SCHEDULE_FREQUENCIES = [
	{ value: "hourly", label: "Every Hour" },
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "custom", label: "Custom Interval" },
];

// Days of Week
export const DAYS_OF_WEEK = [
	{ value: 0, label: "Sunday" },
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
];
