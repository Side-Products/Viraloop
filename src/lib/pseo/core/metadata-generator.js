/**
 * Metadata Generator for Programmatic SEO
 * Generates meta tags, Open Graph, Twitter Cards, and JSON-LD structured data
 * Customized for Viraloop - AI Influencer Platform
 */

/**
 * Generate basic meta tags
 * @param {object} config - Configuration object
 * @returns {object} - Meta tags object for Next.js metadata API
 */
export function generateMetaTags({
	title,
	description,
	keywords = [],
	canonicalUrl,
	robots = "index, follow",
	author = "Viraloop",
	siteUrl = "https://viraloop.io",
}) {
	return {
		title,
		description,
		keywords: keywords.join(", "),
		authors: [{ name: author }],
		robots,
		...(canonicalUrl && {
			alternates: {
				canonical: canonicalUrl,
			},
		}),
		metadataBase: new URL(siteUrl),
	};
}

/**
 * Generate Open Graph meta tags
 * @param {object} config - Configuration object
 * @returns {object} - Open Graph metadata
 */
export function generateOpenGraph({ title, description, url, image, type = "website", siteName = "Viraloop - AI Influencer Platform" }) {
	return {
		title,
		description,
		url,
		siteName,
		type,
		...(image && {
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		}),
	};
}

/**
 * Generate Twitter Card meta tags
 * @param {object} config - Configuration object
 * @returns {object} - Twitter Card metadata
 */
export function generateTwitterCard({ title, description, image, card = "summary_large_image", site = "@viraloop_io", creator = "@viraloop_io" }) {
	return {
		card,
		title,
		description,
		site,
		creator,
		...(image && {
			images: [image],
		}),
	};
}

/**
 * Generate SoftwareApplication JSON-LD schema
 * @param {object} config - Configuration object
 * @returns {object} - JSON-LD structured data
 */
export function generateSoftwareApplicationSchema({
	name = "Viraloop",
	description = "AI-powered virtual influencer platform",
	url = "https://viraloop.io",
	applicationCategory = "SocialNetworkingApplication",
	operatingSystem = "Web",
	offers = {
		"@type": "Offer",
		price: "0",
		priceCurrency: "USD",
	},
	aggregateRating,
}) {
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name,
		description,
		url,
		applicationCategory,
		operatingSystem,
		offers,
		...(aggregateRating && { aggregateRating }),
	};
}

/**
 * Generate HowTo JSON-LD schema
 * @param {object} config - Configuration object
 * @returns {object} - JSON-LD structured data
 */
export function generateHowToSchema({ name, description, steps, image, estimatedCost, totalTime }) {
	return {
		"@context": "https://schema.org",
		"@type": "HowTo",
		name,
		description,
		...(image && { image }),
		...(estimatedCost && { estimatedCost }),
		...(totalTime && { totalTime }),
		step: steps.map((step, index) => ({
			"@type": "HowToStep",
			position: index + 1,
			name: step.name,
			text: step.text,
			...(step.image && { image: step.image }),
			...(step.url && { url: step.url }),
		})),
	};
}

/**
 * Generate FAQPage JSON-LD schema
 * @param {object} config - Configuration object
 * @returns {object} - JSON-LD structured data
 */
export function generateFAQSchema({ faqs }) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};
}

/**
 * Generate VideoObject JSON-LD schema
 * @param {object} config - Configuration object
 * @returns {object} - JSON-LD structured data
 */
export function generateVideoSchema({ name, description, thumbnailUrl, uploadDate, duration, contentUrl, embedUrl }) {
	return {
		"@context": "https://schema.org",
		"@type": "VideoObject",
		name,
		description,
		thumbnailUrl,
		uploadDate,
		...(duration && { duration }),
		...(contentUrl && { contentUrl }),
		...(embedUrl && { embedUrl }),
	};
}

/**
 * Generate BlogPosting JSON-LD schema
 * @param {object} config - Configuration object
 * @returns {object} - JSON-LD structured data
 */
export function generateBlogPostingSchema({
	headline,
	description,
	image,
	datePublished,
	dateModified,
	author,
	publisher = {
		"@type": "Organization",
		name: "Viraloop",
		logo: {
			"@type": "ImageObject",
			url: "https://viraloop.io/viraloop-logo.png",
		},
	},
	url,
	keywords = [],
	articleSection,
	wordCount,
}) {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline,
		description,
		...(image && { image }),
		datePublished,
		...(dateModified && { dateModified }),
		author: {
			"@type": "Person",
			name: author?.name || "Viraloop Team",
			...(author?.url && { url: author.url }),
			...(author?.image && { image: author.image }),
		},
		publisher,
		url,
		...(keywords.length > 0 && { keywords: keywords.join(", ") }),
		...(articleSection && { articleSection }),
		...(wordCount && { wordCount }),
	};
}

/**
 * Generate Person JSON-LD schema (for authors)
 * @param {object} config - Configuration object
 * @returns {object} - JSON-LD structured data
 */
export function generatePersonSchema({ name, url, image, jobTitle, sameAs = [] }) {
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name,
		...(url && { url }),
		...(image && { image }),
		...(jobTitle && { jobTitle }),
		...(sameAs.length > 0 && { sameAs }),
	};
}

/**
 * Generate BreadcrumbList JSON-LD schema
 * @param {object} config - Configuration object
 * @returns {object} - JSON-LD structured data
 */
export function generateBreadcrumbSchema({ items, baseUrl = "https://viraloop.io" }) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: `${baseUrl}${item.path}`,
		})),
	};
}

/**
 * Generate Organization JSON-LD schema
 * @param {object} config - Configuration object
 * @returns {object} - JSON-LD structured data
 */
export function generateOrganizationSchema({
	name = "Viraloop",
	url = "https://viraloop.io",
	logo = "https://viraloop.io/viraloop-logo.png",
	sameAs = ["https://twitter.com/viraloop_io", "https://www.youtube.com/@viraloop_io"],
	contactPoint,
}) {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name,
		url,
		logo,
		sameAs,
		...(contactPoint && { contactPoint }),
	};
}

/**
 * Generate complete metadata for a page
 * @param {object} page - SEO page data
 * @param {object} config - Additional configuration
 * @returns {object} - Complete metadata object
 */
export function generateCompleteMetadata(page, config = {}) {
	const baseUrl = config.baseUrl || "https://viraloop.io";
	const pageUrl = `${baseUrl}/${page.slug}`;

	// Basic meta tags
	const metadata = generateMetaTags({
		title: page.metadata.title,
		description: page.metadata.description,
		keywords: page.metadata.keywords || [],
		canonicalUrl: page.metadata.canonicalUrl || pageUrl,
		robots: page.metadata.robots,
		...config,
	});

	// Open Graph
	metadata.openGraph = generateOpenGraph({
		title: page.metadata.title,
		description: page.metadata.description,
		url: pageUrl,
		image: page.metadata.ogImage,
		...config.openGraph,
	});

	// Twitter Card
	metadata.twitter = generateTwitterCard({
		title: page.metadata.title,
		description: page.metadata.description,
		image: page.metadata.ogImage,
		...config.twitter,
	});

	return metadata;
}

/**
 * Generate structured data based on page type and content
 * @param {object} page - SEO page data
 * @param {object} config - Additional configuration
 * @returns {object[]} - Array of JSON-LD schemas
 */
export function generateStructuredData(page, config = {}) {
	const schemas = [];

	// Always include Organization schema
	schemas.push(generateOrganizationSchema(config.organization || {}));

	// Add breadcrumbs if path is deep
	const pathParts = page.slug.split("/").filter(Boolean);
	if (pathParts.length > 1) {
		const breadcrumbItems = pathParts.map((part, index) => ({
			name: part.replace(/-/g, " "),
			path: "/" + pathParts.slice(0, index + 1).join("/"),
		}));
		breadcrumbItems.unshift({ name: "Home", path: "/" });
		schemas.push(generateBreadcrumbSchema({ items: breadcrumbItems }));
	}

	// Template-specific schemas
	if (page.template === "tutorial" || page.template === "guide") {
		const steps = page.content.sections?.filter((s) => s.type === "steps")?.flatMap((s) => s.content?.steps || []);

		if (steps?.length > 0) {
			schemas.push(
				generateHowToSchema({
					name: page.metadata.title,
					description: page.metadata.description,
					steps: steps.map((step) => ({
						name: step.title || step.name,
						text: step.description || step.text,
						image: step.image,
					})),
				})
			);
		}
	}

	// Add FAQ schema if page has FAQ content
	if (page.content.faq?.length > 0) {
		schemas.push(
			generateFAQSchema({
				faqs: page.content.faq,
			})
		);
	}

	// Add blog posting schema for blog pages
	if (page.template === "blog") {
		const hero = page.content?.hero || {};
		schemas.push(
			generateBlogPostingSchema({
				headline: page.metadata.title,
				description: page.metadata.description,
				image: hero.featuredImage || page.metadata.ogImage,
				datePublished: hero.publishedAt || page.publishedAt,
				dateModified: page.lastModified,
				author: hero.author,
				url: `https://viraloop.io/${page.slug}`,
				keywords: page.metadata.keywords || [],
				articleSection: hero.category,
				wordCount: page.seo?.wordCount,
			})
		);
	}

	// Merge with any custom structured data
	if (page.structuredData && Object.keys(page.structuredData).length > 0) {
		schemas.push(page.structuredData);
	}

	return schemas;
}
