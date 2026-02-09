/**
 * Dynamic Sitemap Generator for Programmatic SEO
 * Generates XML sitemaps for all SEO pages
 * Customized for Viraloop - AI Influencer Platform
 */

import { seoDataLayer } from "./data-layer.js";

/**
 * Priority configurations by template
 */
const PRIORITY_MAP = {
	blog: 0.8,
	niche: 0.7,
	"use-case": 0.7,
	comparison: 0.6,
	default: 0.5,
};

/**
 * Change frequency configurations
 */
const CHANGEFREQ_MAP = {
	blog: "weekly",
	niche: "monthly",
	"use-case": "monthly",
	comparison: "monthly",
	default: "monthly",
};

/**
 * Generate XML sitemap for all SEO pages
 * @param {object} options - Configuration options
 * @returns {string} - XML sitemap content
 */
export async function generateSitemap(options = {}) {
	const { baseUrl = "https://viraloop.io", includeStatic = true } = options;

	const pages = await seoDataLayer.getAllPublishedPages({
		select: "slug template lastModified",
	});

	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

	// Add static pages if requested
	if (includeStatic) {
		const staticPages = getStaticPages();
		for (const page of staticPages) {
			xml += generateUrlEntry({ ...page, baseUrl });
		}
	}

	// Add dynamic SEO pages
	for (const page of pages) {
		xml += generateUrlEntry({
			loc: `${baseUrl}/${page.slug}`,
			lastmod: page.lastModified || new Date(),
			priority: PRIORITY_MAP[page.template] || PRIORITY_MAP.default,
			changefreq: CHANGEFREQ_MAP[page.template] || CHANGEFREQ_MAP.default,
		});
	}

	xml += "</urlset>";

	return xml;
}

/**
 * Generate sitemap index for multiple sitemaps
 * @param {object} options - Configuration options
 * @returns {string} - XML sitemap index content
 */
export async function generateSitemapIndex(options = {}) {
	const { baseUrl = "https://viraloop.io" } = options;

	const templates = await seoDataLayer.getPageCountByTemplate();

	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
	xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

	// Add main sitemap
	xml += generateSitemapEntry({
		loc: `${baseUrl}/sitemap-static.xml`,
		lastmod: new Date(),
	});

	// Add template-specific sitemaps
	for (const template of Object.keys(templates)) {
		xml += generateSitemapEntry({
			loc: `${baseUrl}/sitemap-${template}.xml`,
			lastmod: new Date(),
		});
	}

	xml += "</sitemapindex>";

	return xml;
}

/**
 * Generate sitemap for a specific template
 * @param {string} template - Template type
 * @param {object} options - Configuration options
 * @returns {string} - XML sitemap content
 */
export async function generateTemplateSitemap(template, options = {}) {
	const { baseUrl = "https://viraloop.io", limit = 50000 } = options;

	const pages = await seoDataLayer.getPagesByTemplate(template, {
		limit,
		sortBy: "-lastModified",
	});

	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

	for (const page of pages) {
		xml += generateUrlEntry({
			loc: `${baseUrl}/${page.slug}`,
			lastmod: page.lastModified || new Date(),
			priority: PRIORITY_MAP[template] || PRIORITY_MAP.default,
			changefreq: CHANGEFREQ_MAP[template] || CHANGEFREQ_MAP.default,
		});
	}

	xml += "</urlset>";

	return xml;
}

/**
 * Generate a single URL entry for sitemap
 */
function generateUrlEntry({ loc, lastmod, priority, changefreq }) {
	let entry = "  <url>\n";
	entry += `    <loc>${escapeXml(loc)}</loc>\n`;

	if (lastmod) {
		const date = lastmod instanceof Date ? lastmod : new Date(lastmod);
		entry += `    <lastmod>${date.toISOString()}</lastmod>\n`;
	}

	if (changefreq) {
		entry += `    <changefreq>${changefreq}</changefreq>\n`;
	}

	if (priority) {
		entry += `    <priority>${priority}</priority>\n`;
	}

	entry += "  </url>\n";

	return entry;
}

/**
 * Generate a single sitemap entry for sitemap index
 */
function generateSitemapEntry({ loc, lastmod }) {
	let entry = "  <sitemap>\n";
	entry += `    <loc>${escapeXml(loc)}</loc>\n`;

	if (lastmod) {
		const date = lastmod instanceof Date ? lastmod : new Date(lastmod);
		entry += `    <lastmod>${date.toISOString()}</lastmod>\n`;
	}

	entry += "  </sitemap>\n";

	return entry;
}

/**
 * Get static pages for sitemap
 */
function getStaticPages() {
	return [
		// Homepage
		{
			loc: "https://viraloop.io",
			priority: 1.0,
			changefreq: "daily",
		},
		// Main Product Pages
		{
			loc: "https://viraloop.io/pricing",
			priority: 0.9,
			changefreq: "weekly",
		},
		{
			loc: "https://viraloop.io/influencers",
			priority: 0.9,
			changefreq: "daily",
		},
		{
			loc: "https://viraloop.io/dashboard",
			priority: 0.8,
			changefreq: "daily",
		},
		// Content & Resources
		{
			loc: "https://viraloop.io/blog",
			priority: 0.9,
			changefreq: "daily",
		},
		// Account & Features
		{
			loc: "https://viraloop.io/login",
			priority: 0.7,
			changefreq: "monthly",
		},
		{
			loc: "https://viraloop.io/schedule",
			priority: 0.6,
			changefreq: "monthly",
		},
		{
			loc: "https://viraloop.io/accounts",
			priority: 0.6,
			changefreq: "monthly",
		},
		// Legal
		{
			loc: "https://viraloop.io/terms",
			priority: 0.3,
			changefreq: "yearly",
		},
		{
			loc: "https://viraloop.io/privacy",
			priority: 0.3,
			changefreq: "yearly",
		},
	];
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
	return unsafe.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case "&":
				return "&amp;";
			case "'":
				return "&apos;";
			case '"':
				return "&quot;";
			default:
				return c;
		}
	});
}

/**
 * Generate sitemap as JSON (for Next.js API routes)
 * @param {object} options - Configuration options
 * @returns {array} - Array of URL objects
 */
export async function generateSitemapJson(options = {}) {
	const { baseUrl = "https://viraloop.io", includeStatic = true } = options;

	const pages = await seoDataLayer.getAllPublishedPages({
		select: "slug template lastModified",
	});

	const urls = [];

	// Add static pages
	if (includeStatic) {
		const staticPages = getStaticPages();
		urls.push(...staticPages);
	}

	// Add dynamic pages
	for (const page of pages) {
		urls.push({
			loc: `${baseUrl}/${page.slug}`,
			lastmod: page.lastModified || new Date(),
			priority: PRIORITY_MAP[page.template] || PRIORITY_MAP.default,
			changefreq: CHANGEFREQ_MAP[page.template] || CHANGEFREQ_MAP.default,
		});
	}

	return urls;
}

/**
 * Submit sitemap to search engines
 * @param {string} sitemapUrl - Full URL to sitemap
 * @param {object} options - Configuration options
 * @returns {object} - Submission results
 */
export async function submitSitemap(sitemapUrl, options = {}) {
	const { searchEngines = ["google", "bing"] } = options;
	const results = {};

	for (const engine of searchEngines) {
		try {
			let pingUrl;

			switch (engine) {
				case "google":
					pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
					break;
				case "bing":
					pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
					break;
				default:
					results[engine] = { success: false, error: "Unknown search engine" };
					continue;
			}

			const response = await fetch(pingUrl);
			results[engine] = {
				success: response.ok,
				status: response.status,
			};
		} catch (error) {
			results[engine] = {
				success: false,
				error: error.message,
			};
		}
	}

	return results;
}

/**
 * Validate sitemap structure
 * @param {string} xml - XML sitemap content
 * @returns {object} - Validation results
 */
export function validateSitemap(xml) {
	const issues = [];
	const warnings = [];

	// Check XML declaration
	if (!xml.startsWith('<?xml version="1.0"')) {
		issues.push("Missing or invalid XML declaration");
	}

	// Check urlset tag
	if (!xml.includes("<urlset") || !xml.includes("</urlset>")) {
		issues.push("Missing or invalid urlset tag");
	}

	// Count URLs
	const urlMatches = xml.match(/<url>/g);
	const urlCount = urlMatches ? urlMatches.length : 0;

	if (urlCount === 0) {
		warnings.push("Sitemap contains no URLs");
	} else if (urlCount > 50000) {
		issues.push(`Sitemap exceeds 50,000 URL limit (found ${urlCount})`);
	}

	// Check file size (approximate)
	const sizeInMB = Buffer.byteLength(xml, "utf8") / (1024 * 1024);
	if (sizeInMB > 50) {
		issues.push(`Sitemap exceeds 50MB size limit (${sizeInMB.toFixed(2)}MB)`);
	}

	// Check for required fields
	if (!xml.includes("<loc>")) {
		issues.push("No <loc> tags found");
	}

	return {
		valid: issues.length === 0,
		issues,
		warnings,
		urlCount,
		sizeInMB: sizeInMB.toFixed(2),
	};
}
