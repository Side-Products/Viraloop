/**
 * Programmatic SEO Configuration
 * Centralized configuration for the pSEO system
 * Customized for Viraloop - AI Influencer Platform
 */

export const PSEO_CONFIG = {
	// Base configuration
	baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://viraloop.io",
	siteName: "Viraloop - AI Influencer Platform",

	// Branding
	branding: {
		name: "Viraloop",
		logo: "/viraloop-logo.png",
		tagline: "AI-Powered Virtual Influencers",
		twitterHandle: "@viraloop_io",
	},

	// Social links
	socialLinks: ["https://x.com/viraloop_io", "https://www.youtube.com/@viraloop_io"],

	// Template configuration
	templates: {
		tool: {
			basePath: "tools",
			priority: 0.9,
			changefreq: "weekly",
			revalidate: 3600, // 1 hour
		},
		niche: {
			basePath: "niche",
			priority: 0.7,
			changefreq: "monthly",
			revalidate: 3600,
		},
		"use-case": {
			basePath: "use-cases",
			priority: 0.7,
			changefreq: "monthly",
			revalidate: 3600,
		},
		comparison: {
			basePath: "vs",
			priority: 0.6,
			changefreq: "weekly",
			revalidate: 3600,
		},
		blog: {
			basePath: "blog",
			priority: 0.8,
			changefreq: "weekly",
			revalidate: 3600, // 1 hour
		},
	},

	// Caching configuration
	cache: {
		enabled: true,
		ttl: {
			page: 3600, // 1 hour
			list: 1800, // 30 minutes
			analytics: 300, // 5 minutes
		},
	},

	// Internal linking configuration
	internalLinking: {
		defaultMaxLinks: 5,
		minScore: 5,
		weights: {
			keywordMatch: 10,
			templateMatch: 5,
			analyticsBoost: 3,
			freshnessBoost: 2,
		},
	},

	// Content generation configuration
	contentGeneration: {
		model: "gpt-4o",
		temperature: 0.7,
		// Size tier configurations for blogs
		// Note: Fewer sections with more paragraphs each = more human-like content
		sizeTiers: {
			normal: {
				maxTokens: 4000,
				minWordCount: 1500,
				maxWordCount: 2500,
				minSections: 4,
				maxSections: 6,
				minFaqs: 3,
				maxFaqs: 5,
				imagesPerBlog: 2,
				maxImagesPerBlog: 3,
				imagePositions: [2, 4], // Adjusted for fewer sections
			},
			large: {
				maxTokens: 8000,
				minWordCount: 4000,
				maxWordCount: 6000,
				minSections: 6,
				maxSections: 9,
				minFaqs: 6,
				maxFaqs: 8,
				imagesPerBlog: 3,
				maxImagesPerBlog: 4,
				imagePositions: [2, 5, 7], // Adjusted for fewer sections
			},
			xl: {
				maxTokens: 16000,
				minWordCount: 7000,
				maxWordCount: 10000,
				minSections: 8,
				maxSections: 12,
				minFaqs: 8,
				maxFaqs: 12,
				imagesPerBlog: 4,
				maxImagesPerBlog: 5,
				imagePositions: [3, 6, 9, 11], // Adjusted for fewer sections
			},
		},
		// Random distribution for bulk generation (percentages)
		bulkSizeDistribution: {
			normal: 20,
			large: 30,
			xl: 50,
		},
		// Legacy defaults (for backward compatibility)
		maxTokens: 4000,
		minWordCount: 800,
		maxWordCount: 3000,
	},

	// SEO best practices
	seo: {
		titleMaxLength: 60,
		descriptionMaxLength: 160,
		keywordsMin: 3,
		keywordsMax: 10,
		minInternalLinks: 2,
		maxInternalLinks: 10,
		targetKeywordDensity: 0.015, // 1.5%
	},

	// Sitemap configuration
	sitemap: {
		includeStatic: true,
		maxUrlsPerSitemap: 50000,
		maxSizeInMB: 50,
		staticPages: [
			{ path: "/", priority: 1.0, changefreq: "daily" },
			{ path: "/pricing", priority: 0.9, changefreq: "weekly" },
			{ path: "/influencers", priority: 0.9, changefreq: "daily" },
			{ path: "/dashboard", priority: 0.8, changefreq: "daily" },
			{ path: "/login", priority: 0.7, changefreq: "monthly" },
		],
	},

	// CTA configuration
	ctas: {
		primary: {
			text: "Create AI Influencer",
			url: "/influencers",
		},
		secondary: {
			text: "View Pricing",
			url: "/pricing",
		},
		tool: {
			text: "Try this tool now",
			url: null, // Will use current page URL
		},
		blog: {
			text: "Get Started Free",
			url: "/dashboard",
		},
	},

	// Analytics integration
	analytics: {
		trackingEnabled: true,
		updateInterval: 86400000, // 24 hours
		metrics: ["impressions", "clicks", "ctr", "avgPosition"],
	},

	// Feature flags
	features: {
		autoGenerateLinks: true,
		aiContentGeneration: true,
		analyticsTracking: true,
		structuredData: true,
		breadcrumbs: true,
		relatedPages: true,
		faqSection: true,
		ctaSection: true,
	},
};

/**
 * Get configuration for a specific template
 */
export function getTemplateConfig(template) {
	return PSEO_CONFIG.templates[template] || null;
}

/**
 * Get full URL for a slug
 */
export function getPageUrl(slug) {
	return `${PSEO_CONFIG.baseUrl}/${slug}`;
}

/**
 * Get cache TTL for a key type
 */
export function getCacheTTL(type) {
	return PSEO_CONFIG.cache.ttl[type] || PSEO_CONFIG.cache.ttl.page;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature) {
	return PSEO_CONFIG.features[feature] !== false;
}

/**
 * Get CTA configuration for a template
 */
export function getCTAConfig(template) {
	return PSEO_CONFIG.ctas[template] || PSEO_CONFIG.ctas.primary;
}

export default PSEO_CONFIG;
