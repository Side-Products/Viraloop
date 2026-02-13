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

// Versioned subscription plans (following faceless pattern)
export const subscriptionPlans = {
	// Version 1: Pricing structure
	// Trial: $1 one-time - 1 influencer, 1 image, 1 video
	// Growth: $39/mo - 5 influencers, 40 images, 30 videos
	// Pro: $69/mo - 15 influencers, 70 images, 60 videos
	// Ultra: $99/mo - 50 influencers, 100 images, 100 videos
	1: {
		// Trial: $1 one-time - 1 influencer, 1 image, 1 video
		trialSubscription: {
			monthly: {
				name: "Trial",
				price: 1,
				stripePriceId: "price_1SyuIo480cIYlJtw77WJVmRe",
				isOneTime: true, // One-time purchase, not recurring
				influencers: 1,
				imagesPerMonth: 1,
				videosPerMonth: 1,
				platforms: 1,
			},
		},
		// Growth: $39/mo - 5 influencers, 40 images, 30 videos
		growthSubscription: {
			monthly: {
				name: "Growth (monthly)",
				price: 39,
				originalPrice: 59,
				stripePriceId: "price_1SyuLS480cIYlJtwyCAgy8bb",
				validForDays: 30,
				influencers: 5,
				imagesPerMonth: 40,
				videosPerMonth: 30,
				platforms: 2,
			},
			annual: {
				name: "Growth (annual)",
				price: 32, // ~$390/year = ~$32/mo
				originalPrice: 49,
				pricePerYear: 390,
				stripePriceId: "price_1SyuLS480cIYlJtwbfB4U3wU",
				validForDays: 365,
				influencers: 5,
				imagesPerMonth: 40,
				videosPerMonth: 30,
				platforms: 2,
			},
		},
		// Pro: $69/mo - 15 influencers, 70 images, 60 videos
		proSubscription: {
			monthly: {
				name: "Pro (monthly)",
				price: 69,
				originalPrice: 129,
				stripePriceId: "price_1SyuMD480cIYlJtwVb367Kie",
				validForDays: 30,
				influencers: 15,
				imagesPerMonth: 70,
				videosPerMonth: 60,
				platforms: 3,
			},
			annual: {
				name: "Pro (annual)",
				price: 57, // ~$690/year = ~$57/mo
				originalPrice: 107,
				pricePerYear: 690,
				stripePriceId: "price_1SyuMD480cIYlJtwp5evP1E5",
				validForDays: 365,
				influencers: 15,
				imagesPerMonth: 70,
				videosPerMonth: 60,
				platforms: 3,
			},
		},
		// Ultra: $99/mo - 50 influencers, 100 images, 100 videos
		ultraSubscription: {
			monthly: {
				name: "Ultra (monthly)",
				price: 99,
				originalPrice: 199,
				stripePriceId: "price_1SyuMu480cIYlJtw174Srzq2",
				validForDays: 30,
				influencers: 50,
				imagesPerMonth: 100,
				videosPerMonth: 100,
				platforms: 3,
			},
			annual: {
				name: "Ultra (annual)",
				price: 82, // ~$990/year = ~$82/mo
				originalPrice: 166,
				pricePerYear: 990,
				stripePriceId: "price_1SyuMu480cIYlJtw670ddsS3",
				validForDays: 365,
				influencers: 50,
				imagesPerMonth: 100,
				videosPerMonth: 100,
				platforms: 3,
			},
		},
	},
};

// Get current version's plans
const v1Plans = subscriptionPlans[CURRENT_SUBSCRIPTION_VERSION];

// Pricing Features for detailed display
export const PRICING_FEATURES = {
	trial: {
		highlights: [
			{ icon: "influencer", text: "1 AI Influencer" },
			{ icon: "image", text: "1 image" },
			{ icon: "video", text: "1 video" },
			{ icon: "platform", text: "1 social platform", platforms: ["tiktok"] },
		],
		features: [
			{ icon: "video", text: "HD video quality" },
			{ icon: "support", text: "Email support" },
		],
	},
	growth: {
		inheritFrom: "Trial",
		highlights: [
			{ icon: "influencer", text: "5 AI Influencers" },
			{ icon: "image", text: "40 images/month" },
			{ icon: "video", text: "30 videos/month" },
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
			{ icon: "influencer", text: "15 AI Influencers" },
			{ icon: "image", text: "70 images/month" },
			{ icon: "video", text: "60 videos/month" },
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
			{ icon: "influencer", text: "50 AI Influencers" },
			{ icon: "image", text: "100 images/month" },
			{ icon: "video", text: "100 videos/month" },
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
		subscription: v1Plans?.trialSubscription,
		features: PRICING_FEATURES.trial,
		highlighted: false,
		isTrial: true,
	},
	growth: {
		name: "Growth",
		description: "Perfect for getting started",
		subscription: v1Plans?.growthSubscription,
		features: PRICING_FEATURES.growth,
		highlighted: false,
	},
	pro: {
		name: "Pro",
		description: "Most popular for serious creators",
		subscription: v1Plans?.proSubscription,
		features: PRICING_FEATURES.pro,
		highlighted: true,
		badge: "MOST POPULAR",
	},
	ultra: {
		name: "Ultra",
		description: "For agencies and power users",
		subscription: v1Plans?.ultraSubscription,
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

// =====================
// CREDIT SYSTEM
// =====================

// Credit pricing
export const PRICE_PER_CREDIT = 0.1; // $0.10 per credit

// Stripe product for credit purchases (create in Stripe dashboard)
export const CREDITS_STRIPE_PRODUCT_ID = "prod_CREDITS_VIRALOOP"; // TODO: Replace with actual Stripe product ID

// Credit costs for operations
export const CREDITS_REQUIRED = {
	IMAGE_GENERATION: 2,
	VIDEO_GENERATION_KLING: 10,
	VIDEO_GENERATION_VEO_FAST: 8,
	VIDEO_GENERATION_VEO_QUALITY: 15,
	TTS_GENERATION: 1,
	INFLUENCER_CREATION: 5,
};

// Credits per subscription tier (monthly)
export const SUBSCRIPTION_CREDITS = {
	trial: 20, // One-time
	growth: 200, // Monthly
	pro: 400, // Monthly
	ultra: 800, // Monthly
};
