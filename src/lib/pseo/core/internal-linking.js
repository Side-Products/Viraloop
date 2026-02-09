/**
 * Internal Linking Engine for Programmatic SEO
 * Automatically generates contextual internal links
 * Customized for Viraloop - AI Influencer Platform
 */

import { seoDataLayer } from "./data-layer";

/**
 * Link opportunity scoring weights
 */
const SCORING_WEIGHTS = {
	KEYWORD_MATCH: 10,
	TEMPLATE_MATCH: 5,
	ANALYTICS_BOOST: 3,
	FRESHNESS_BOOST: 2,
};

/**
 * Generate internal link suggestions for a page
 * @param {object} page - Current SEO page
 * @param {object} options - Configuration options
 * @returns {array} - Array of link suggestions
 */
export async function generateInternalLinks(page, options = {}) {
	const { maxLinks = 5, minScore = 5, excludeSlugs = [], preferTemplates = [], includeAnalytics = false } = options;

	// Get potential link targets
	const candidates = await findLinkCandidates(page, {
		excludeSlugs: [page.slug, ...excludeSlugs],
		limit: 50,
	});

	// Score each candidate
	const scoredCandidates = candidates.map((candidate) => ({
		...candidate,
		score: calculateLinkScore(page, candidate),
	}));

	// Sort by score and filter by minimum score
	const topCandidates = scoredCandidates
		.filter((c) => c.score >= minScore)
		.sort((a, b) => {
			// Prefer specified templates
			if (preferTemplates.length > 0) {
				const aPreferred = preferTemplates.includes(a.template);
				const bPreferred = preferTemplates.includes(b.template);
				if (aPreferred && !bPreferred) return -1;
				if (!aPreferred && bPreferred) return 1;
			}
			return b.score - a.score;
		})
		.slice(0, maxLinks);

	// Format as link objects
	return topCandidates.map((candidate) => ({
		anchor: generateAnchorText(page, candidate),
		url: `/${candidate.slug}`,
		title: candidate.metadata.title,
		score: candidate.score,
		...(includeAnalytics && { analytics: candidate.analytics }),
	}));
}

/**
 * Find potential link candidates for a page
 */
async function findLinkCandidates(page, options = {}) {
	const { excludeSlugs = [], limit = 50 } = options;

	// Get pages with similar keywords
	const keywordPages = await seoDataLayer.getPages(
		{
			"metadata.keywords": {
				$in: page.metadata.keywords || [],
			},
			slug: { $nin: excludeSlugs },
		},
		{ limit }
	);

	// Get pages from same template
	const templatePages = await seoDataLayer.getPagesByTemplate(page.template, {
		limit: 20,
	});

	// Get top performing pages
	const topPages = await seoDataLayer.getTopPages({ limit: 10 });

	// Combine and deduplicate
	const allCandidates = [...keywordPages, ...templatePages, ...topPages];
	const uniqueCandidates = Array.from(new Map(allCandidates.map((p) => [p.slug, p])).values());

	return uniqueCandidates.filter((c) => !excludeSlugs.includes(c.slug));
}

/**
 * Calculate relevance score for a link candidate
 */
function calculateLinkScore(sourcePage, targetPage) {
	let score = 0;

	// Keyword overlap score
	const sourceKeywords = new Set(sourcePage.metadata.keywords || []);
	const targetKeywords = new Set(targetPage.metadata.keywords || []);
	const keywordOverlap = [...sourceKeywords].filter((k) => targetKeywords.has(k)).length;
	score += keywordOverlap * SCORING_WEIGHTS.KEYWORD_MATCH;

	// Same template bonus
	if (sourcePage.template === targetPage.template) {
		score += SCORING_WEIGHTS.TEMPLATE_MATCH;
	}

	// Analytics boost (pages with good CTR get priority)
	if (targetPage.analytics?.ctr > 3) {
		score += SCORING_WEIGHTS.ANALYTICS_BOOST;
	}

	// Freshness boost (recently updated pages)
	const daysSinceUpdate = (Date.now() - new Date(targetPage.lastModified)) / (1000 * 60 * 60 * 24);
	if (daysSinceUpdate < 30) {
		score += SCORING_WEIGHTS.FRESHNESS_BOOST;
	}

	return score;
}

/**
 * Generate contextual anchor text for a link
 */
function generateAnchorText(sourcePage, targetPage) {
	const { title, keywords = [] } = targetPage.metadata;

	// Strategy 1: Use shared keyword
	const sourceKeywords = new Set(sourcePage.metadata.keywords || []);
	const sharedKeyword = keywords.find((k) => sourceKeywords.has(k));
	if (sharedKeyword) {
		return sharedKeyword;
	}

	// Strategy 2: Extract main keyword from title
	const titleWords = title.toLowerCase().split(" ");
	const stopWords = ["how", "to", "the", "a", "an", "for", "with", "in", "on", "at", "by"];
	const meaningfulWords = titleWords.filter((w) => !stopWords.includes(w) && w.length > 3);

	if (meaningfulWords.length >= 2) {
		return meaningfulWords.slice(0, 3).join(" ");
	}

	// Strategy 3: Use shortened title
	if (title.length <= 50) {
		return title;
	}

	// Strategy 4: Return first part of title
	return title.split("-")[0].trim();
}

/**
 * Insert internal links into content sections
 * @param {array} sections - Content sections
 * @param {array} links - Array of link objects
 * @returns {array} - Sections with inserted links
 */
export function insertLinksIntoContent(sections, links) {
	if (!sections || !links || links.length === 0) {
		return sections;
	}

	const modifiedSections = JSON.parse(JSON.stringify(sections)); // Deep clone
	let linksUsed = 0;

	for (let i = 0; i < modifiedSections.length && linksUsed < links.length; i++) {
		const section = modifiedSections[i];

		// Only insert links in text sections with sufficient content
		if (section.type === "text" && section.content?.text) {
			const link = links[linksUsed];
			const linkHtml = `<a href="${link.url}" title="${link.title}">${link.anchor}</a>`;

			// Find a good insertion point (after first paragraph)
			const paragraphs = section.content.text.split("\n\n");
			if (paragraphs.length >= 2) {
				// Insert link at the end of first or second paragraph
				const targetParagraph = paragraphs.length > 2 ? 1 : 0;
				paragraphs[targetParagraph] += ` Learn more about ${linkHtml}.`;
				section.content.text = paragraphs.join("\n\n");
				linksUsed++;
			}
		}
	}

	return modifiedSections;
}

/**
 * Generate contextual CTA links for a page
 * @param {object} page - Current page
 * @param {object} options - Configuration options
 * @returns {array} - Array of CTA link objects
 */
export function generateCTALinks(page, options = {}) {
	const { baseUrl = "https://viraloop.io" } = options;

	const ctas = [];

	// Template-specific CTAs
	if (page.template === "tutorial" || page.template === "guide") {
		ctas.push({
			text: "Create your AI influencer",
			url: `${baseUrl}/influencers`,
			type: "primary",
		});
		ctas.push({
			text: "View examples",
			url: `${baseUrl}/dashboard`,
			type: "secondary",
		});
	}

	if (page.template === "niche") {
		ctas.push({
			text: `Create ${page.metadata.title} AI influencer`,
			url: `${baseUrl}/influencers`,
			type: "primary",
		});
		ctas.push({
			text: "Explore other niches",
			url: `${baseUrl}/blog`,
			type: "secondary",
		});
	}

	// Default CTAs
	if (ctas.length === 0) {
		ctas.push({
			text: "Get started for free",
			url: `${baseUrl}/login`,
			type: "primary",
		});
	}

	return ctas;
}

/**
 * Validate internal links in a page
 * @param {object} page - SEO page to validate
 * @returns {object} - Validation results
 */
export async function validateInternalLinks(page) {
	const links = page.seo?.internalLinks || [];
	const issues = [];
	const warnings = [];

	// Check if page has enough internal links
	if (links.length < 2) {
		warnings.push("Page has fewer than 2 internal links (recommended: 3-5)");
	} else if (links.length > 10) {
		warnings.push("Page has more than 10 internal links (may dilute link equity)");
	}

	// Validate each link
	for (const link of links) {
		if (!link.url || !link.anchor) {
			issues.push(`Invalid link structure: ${JSON.stringify(link)}`);
			continue;
		}

		// Extract slug from URL
		const slug = link.url.replace(/^\//, "");

		// Check if target page exists
		const targetPage = await seoDataLayer.getPageBySlug(slug);
		if (!targetPage) {
			issues.push(`Broken link to: ${link.url} (target page not found)`);
		}

		// Check anchor text quality
		if (link.anchor.length < 3) {
			warnings.push(`Anchor text too short: "${link.anchor}"`);
		} else if (link.anchor.length > 60) {
			warnings.push(`Anchor text too long: "${link.anchor}"`);
		}
	}

	return {
		valid: issues.length === 0,
		issues,
		warnings,
		linkCount: links.length,
	};
}

/**
 * Auto-generate and update internal links for a page
 * @param {string} slug - Page slug
 * @param {object} options - Configuration options
 * @returns {object} - Updated page
 */
export async function autoGenerateLinks(slug, options = {}) {
	const page = await seoDataLayer.getPageBySlug(slug);
	if (!page) {
		throw new Error(`Page not found: ${slug}`);
	}

	// Generate link suggestions
	const links = await generateInternalLinks(page, options);

	// Update page with generated links
	const updatedPage = await seoDataLayer.updatePage(slug, {
		"seo.internalLinks": links.map((link) => ({
			anchor: link.anchor,
			url: link.url,
		})),
	});

	return {
		page: updatedPage,
		linksGenerated: links.length,
		links,
	};
}
