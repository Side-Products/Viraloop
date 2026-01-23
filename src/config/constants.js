// Viraloop Configuration Constants

export const PRODUCT_NAME = "Viraloop";
export const PRODUCT_URL = "https://viraloop.so";
export const DOMAIN = "viraloop.so";
export const CONTACT_EMAIL = "support@viraloop.so";

// Social Links
export const SOCIAL_LINKS = {
	twitter: "https://twitter.com/viraloop",
	instagram: "https://instagram.com/viraloop",
	tiktok: "https://tiktok.com/@viraloop",
	youtube: "https://youtube.com/@viraloop",
};

// Pricing
export const PRICE_PER_CREDIT = 0.1; // $0.10 per credit
export const CREDITS_PER_VIDEO = 1;

// Plans
export const PLANS = {
	free: {
		name: "Free",
		price: 0,
		influencers: 2,
		postsPerMonth: 10,
		platforms: 1,
		features: ["Basic video generation", "1 social platform", "Community support"],
	},
	starter: {
		name: "Starter",
		priceMonthly: 29,
		priceYearly: 290,
		influencers: 5,
		postsPerMonth: 50,
		platforms: 2,
		features: ["HD video quality", "2 social platforms", "Scheduling", "Email support"],
	},
	pro: {
		name: "Pro",
		priceMonthly: 79,
		priceYearly: 790,
		influencers: 15,
		postsPerMonth: 200,
		platforms: 3,
		features: ["4K video quality", "All platforms", "Loop posting", "Analytics", "Priority support"],
	},
	business: {
		name: "Business",
		priceMonthly: 199,
		priceYearly: 1990,
		influencers: -1, // Unlimited
		postsPerMonth: -1, // Unlimited
		platforms: 3,
		features: ["Everything in Pro", "API access", "White-label", "Dedicated support", "Custom integrations"],
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
