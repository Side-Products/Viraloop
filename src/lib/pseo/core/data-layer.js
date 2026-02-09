/**
 * Data Layer for Programmatic SEO
 * Handles data fetching with MongoDB and Redis caching
 * Reusable across projects
 */

import SEOPage from "../../../backend/models/seoPage.js";
import dbConnect from "../../dbConnect.js";
import redisModule from "../../../backend/connections/redis.js";
const { redisGet, redisSet, redisConnect } = redisModule;

/**
 * Cache TTL configurations (in seconds)
 */
const CACHE_TTL = {
	PAGE: 3600, // 1 hour for individual pages
	LIST: 1800, // 30 minutes for lists
	ANALYTICS: 300, // 5 minutes for analytics data
};

/**
 * Generate cache key for Redis
 */
function getCacheKey(prefix, identifier) {
	return `pseo:${prefix}:${identifier}`;
}

/**
 * Get data from cache or execute callback
 */
async function getCached(cacheKey, ttl, callback) {
	try {
		// Ensure MongoDB connection before any database operation
		await dbConnect();
		await redisConnect();

		// Try to get from cache
		const cached = await redisGet(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		// Execute callback and cache result
		const result = await callback();
		if (result) {
			await redisSet(cacheKey, JSON.stringify(result), { EX: ttl });
		}

		return result;
	} catch (error) {
		console.error("Cache error:", error);
		// Ensure DB connection even in error fallback
		await dbConnect();
		return await callback();
	}
}

/**
 * Invalidate cache for a specific key or pattern
 */
export async function invalidateCache(pattern) {
	try {
		await redisConnect();
		const redis = global.redis;
		if (!redis || !redis.isOpen) return;

		const keys = await redis.keys(pattern);
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	} catch (error) {
		console.error("Cache invalidation error:", error);
	}
}

/**
 * Data Layer Class
 */
export class SEODataLayer {
	constructor(options = {}) {
		this.cacheEnabled = options.cacheEnabled !== false;
		this.cacheTTL = { ...CACHE_TTL, ...options.cacheTTL };
	}

	/**
	 * Get a single SEO page by slug
	 */
	async getPageBySlug(slug, options = {}) {
		const cacheKey = getCacheKey("page", slug);

		return getCached(cacheKey, this.cacheTTL.PAGE, async () => {
			const query = SEOPage.findOne({ slug, status: "published" });

			if (options.includeAnalytics) {
				query.select("+analytics");
			}

			const page = await query.lean();
			return page;
		});
	}

	/**
	 * Get multiple pages by template type
	 */
	async getPagesByTemplate(template, options = {}) {
		const { limit = 500, skip = 0, sortBy = "-createdAt" } = options;
		const cacheKey = getCacheKey("template", `${template}:${limit}:${skip}:${sortBy}`);

		return getCached(cacheKey, this.cacheTTL.LIST, async () => {
			const pages = await SEOPage.find({ template, status: "published" }).sort(sortBy).limit(limit).skip(skip).lean();

			return pages;
		});
	}

	/**
	 * Get pages with filters
	 */
	async getPages(filters = {}, options = {}) {
		await dbConnect();
		const { limit = 50, skip = 0, sortBy = "-createdAt" } = options;

		const query = {
			status: "published",
			...filters,
		};

		const pages = await SEOPage.find(query).sort(sortBy).limit(limit).skip(skip).lean();

		return pages;
	}

	/**
	 * Search pages by keyword
	 */
	async searchPages(keyword, options = {}) {
		await dbConnect();
		const { limit = 20 } = options;

		const pages = await SEOPage.find({
			status: "published",
			$or: [
				{ "metadata.title": { $regex: keyword, $options: "i" } },
				{ "metadata.description": { $regex: keyword, $options: "i" } },
				{ "metadata.keywords": { $in: [new RegExp(keyword, "i")] } },
			],
		})
			.limit(limit)
			.lean();

		return pages;
	}

	/**
	 * Get related pages based on keywords and template
	 */
	async getRelatedPages(page, options = {}) {
		const { limit = 5 } = options;
		const cacheKey = getCacheKey("related", `${page.slug}:${limit}`);

		return getCached(cacheKey, this.cacheTTL.LIST, async () => {
			const relatedPages = await SEOPage.find({
				status: "published",
				_id: { $ne: page._id },
				$or: [{ template: page.template }, { "metadata.keywords": { $in: page.metadata.keywords || [] } }],
			})
				.limit(limit)
				.select("slug metadata.title metadata.description")
				.lean();

			return relatedPages;
		});
	}

	/**
	 * Get top performing pages by analytics
	 */
	async getTopPages(options = {}) {
		const { limit = 10, metric = "impressions" } = options;
		const cacheKey = getCacheKey("top", `${metric}:${limit}`);

		return getCached(cacheKey, this.cacheTTL.ANALYTICS, async () => {
			const pages = await SEOPage.find({ status: "published" })
				.sort({ [`analytics.${metric}`]: -1 })
				.limit(limit)
				.select("slug metadata.title analytics")
				.lean();

			return pages;
		});
	}

	/**
	 * Get all published pages for sitemap generation
	 */
	async getAllPublishedPages(options = {}) {
		await dbConnect();
		const { select = "slug lastModified" } = options;

		const pages = await SEOPage.find({ status: "published" }).select(select).sort("-lastModified").lean();

		return pages;
	}

	/**
	 * Get page count by template
	 */
	async getPageCountByTemplate() {
		const cacheKey = getCacheKey("stats", "count-by-template");

		return getCached(cacheKey, this.cacheTTL.LIST, async () => {
			const counts = await SEOPage.aggregate([
				{ $match: { status: "published" } },
				{ $group: { _id: "$template", count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
			]);

			return counts.reduce((acc, { _id, count }) => {
				acc[_id] = count;
				return acc;
			}, {});
		});
	}

	/**
	 * Create a new SEO page
	 */
	async createPage(data) {
		await dbConnect();
		const page = await SEOPage.create(data);

		// Invalidate relevant caches
		await invalidateCache(`pseo:template:${data.template}:*`);
		await invalidateCache(`pseo:stats:*`);

		return page;
	}

	/**
	 * Update an existing SEO page
	 */
	async updatePage(slug, updates) {
		await dbConnect();
		const page = await SEOPage.findOneAndUpdate({ slug }, updates, {
			new: true,
			runValidators: true,
		});

		if (page) {
			// Invalidate caches
			await invalidateCache(getCacheKey("page", slug));
			await invalidateCache(`pseo:template:${page.template}:*`);
			await invalidateCache(`pseo:related:*`);
		}

		return page;
	}

	/**
	 * Update analytics for a page
	 */
	async updateAnalytics(slug, analyticsData) {
		await dbConnect();
		const page = await SEOPage.findOne({ slug });
		if (!page) return null;

		page.analytics = {
			...page.analytics,
			...analyticsData,
			lastUpdated: new Date(),
		};

		page.updateCTR();
		await page.save();

		// Invalidate analytics cache
		await invalidateCache(getCacheKey("page", slug));
		await invalidateCache(`pseo:top:*`);

		return page;
	}

	/**
	 * Delete a page
	 */
	async deletePage(slug) {
		await dbConnect();
		const page = await SEOPage.findOneAndDelete({ slug });

		if (page) {
			// Invalidate all related caches
			await invalidateCache(`pseo:page:${slug}`);
			await invalidateCache(`pseo:template:${page.template}:*`);
			await invalidateCache(`pseo:related:*`);
			await invalidateCache(`pseo:stats:*`);
		}

		return page;
	}

	/**
	 * Bulk create pages
	 */
	async bulkCreatePages(pagesData) {
		await dbConnect();
		const pages = await SEOPage.insertMany(pagesData, { ordered: false });

		// Invalidate all list caches
		await invalidateCache("pseo:template:*");
		await invalidateCache("pseo:stats:*");

		return pages;
	}
}

// Export singleton instance
export const seoDataLayer = new SEODataLayer();

// Export class for custom instances
export default SEODataLayer;
