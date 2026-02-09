/**
 * Blog Image Generator
 * Generates images for blog posts using multiple providers
 * Supports Nano Banana (AI generation) and Pexels (stock photos)
 */

const { createClient } = require("pexels");

/**
 * Image provider configuration
 * Adjust weights to control which provider is used more often
 */
const IMAGE_PROVIDER_CONFIG = {
	providers: {
		nanoBanana: {
			weight: 0, // Disabled - not using Nano Banana for pSEO
			enabled: false,
		},
		pexels: {
			weight: 100, // 100% of the time
			enabled: true,
		},
	},
	// Image generation settings
	settings: {
		imagesPerBlog: 3, // Number of images to add per blog (min)
		maxImagesPerBlog: 5, // Maximum images per blog
		imagePositions: [2, 4, 6], // After which section numbers to insert images
	},
};

/**
 * Select a random provider based on configured weights
 * @returns {string} - Provider name ('nanoBanana' or 'pexels')
 */
function selectProvider() {
	const providers = IMAGE_PROVIDER_CONFIG.providers;
	const enabledProviders = Object.entries(providers).filter(([_, config]) => config.enabled);

	if (enabledProviders.length === 0) {
		throw new Error("No image providers enabled");
	}

	// Calculate total weight
	const totalWeight = enabledProviders.reduce((sum, [_, config]) => sum + config.weight, 0);

	// Random selection based on weights
	let random = Math.random() * totalWeight;

	for (const [provider, config] of enabledProviders) {
		random -= config.weight;
		if (random <= 0) {
			return provider;
		}
	}

	// Fallback to first enabled provider
	return enabledProviders[0][0];
}

/**
 * Generate image using Nano Banana (AI generation)
 * @param {string} prompt - Image generation prompt
 * @param {object} options - Generation options
 * @returns {Promise<object>} - Image data
 */
async function generateWithNanoBanana(prompt, options = {}) {
	try {
		// Call the Nano Banana API endpoint
		const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/generate-image`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt,
				outputFormat: options.format || "jpg",
			}),
		});

		if (!response.ok) {
			throw new Error(`Nano Banana API error: ${response.statusText}`);
		}

		const data = await response.json();

		return {
			url: data.imageUrl,
			alt: prompt,
			caption: `AI-generated image: ${prompt}`,
			provider: "nanoBanana",
			fallback: data.fallback || false,
		};
	} catch (error) {
		console.error("Nano Banana generation failed:", error);
		throw error;
	}
}

/**
 * Extract main keywords from a query for better Pexels search
 * @param {string} query - Original search query
 * @returns {string} - Optimized search query
 */
function optimizePexelsQuery(query) {
	// Remove common filler words that don't help image search
	const fillerWords = [
		"how",
		"to",
		"what",
		"why",
		"when",
		"where",
		"who",
		"which",
		"the",
		"a",
		"an",
		"and",
		"or",
		"but",
		"for",
		"with",
		"about",
		"create",
		"creating",
		"make",
		"making",
		"build",
		"building",
		"guide",
		"tutorial",
		"tips",
		"tricks",
		"secrets",
		"best",
		"top",
		"ultimate",
		"complete",
		"comprehensive",
		"your",
		"you",
		"can",
		"should",
		"will",
		"using",
		"use",
		"used",
	];

	// Convert to lowercase and split into words
	let words = query.toLowerCase().split(/\s+/);

	// Remove filler words
	words = words.filter((word) => !fillerWords.includes(word));

	// Remove numbers and special characters
	words = words.map((word) => word.replace(/[^a-z]/g, "")).filter((word) => word.length > 2);

	// Take the most important keywords (first 3-4 words)
	const keyWords = words.slice(0, 4).join(" ");

	// If we removed too much, fall back to original
	if (keyWords.length < 3) {
		return query;
	}

	return keyWords;
}

/**
 * Search and fetch image from Pexels
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {Promise<object>} - Image data
 */
async function fetchFromPexels(query, options = {}) {
	const apiKey = process.env.PEXELS_API_KEY;

	if (!apiKey) {
		throw new Error("PEXELS_API_KEY not found in environment variables");
	}

	try {
		const client = createClient(apiKey);

		// Optimize the search query for better results
		const optimizedQuery = optimizePexelsQuery(query);

		// Random page selection (1-5) for variety across generations
		const randomPage = Math.floor(Math.random() * 5) + 1;
		console.log(`Pexels search: "${query}" → "${optimizedQuery}" (page ${randomPage})`);

		// Search for photos with optimized query
		const result = await client.photos.search({
			query: optimizedQuery,
			per_page: 15, // Get more results for better variety
			page: randomPage, // Random page for different results each time
			orientation: options.orientation || "landscape",
		});

		if (!result.photos || result.photos.length === 0) {
			// Try with original query if optimized query fails
			console.log(`No results for "${optimizedQuery}", trying original query...`);
			const fallbackResult = await client.photos.search({
				query: query,
				per_page: 10,
				page: 1, // Use page 1 for fallback
				orientation: options.orientation || "landscape",
			});

			if (!fallbackResult.photos || fallbackResult.photos.length === 0) {
				throw new Error(`No Pexels images found for query: ${query}`);
			}

			const photo = fallbackResult.photos[Math.floor(Math.random() * fallbackResult.photos.length)];
			return {
				url: photo.src.large2x || photo.src.large,
				alt: photo.alt || query,
				caption: photo.photographer ? `Photo by ${photo.photographer}` : "",
				provider: "pexels",
				photographerUrl: photo.photographer_url,
				pexelsUrl: photo.url,
			};
		}

		// Select a random photo from results (prefer photos from first half for relevance)
		const topResults = result.photos.slice(0, Math.min(8, result.photos.length));
		const photo = topResults[Math.floor(Math.random() * topResults.length)];

		return {
			url: photo.src.large2x || photo.src.large,
			alt: photo.alt || query,
			caption: photo.photographer ? `Photo by ${photo.photographer}` : "",
			provider: "pexels",
			photographerUrl: photo.photographer_url,
			pexelsUrl: photo.url,
		};
	} catch (error) {
		console.error("Pexels fetch failed:", error);
		throw error;
	}
}

/**
 * Generate placeholder image (fallback)
 * @param {string} topic - Topic for placeholder
 * @returns {object} - Placeholder image data
 */
function generatePlaceholder(topic) {
	const seed = encodeURIComponent(topic);
	return {
		url: `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=ED6B2F,ff4f01,FFCAB0`,
		alt: topic,
		caption: "Placeholder image",
		provider: "placeholder",
		fallback: true,
	};
}

/**
 * Generate image using the selected provider
 * @param {string} topic - Image topic/prompt
 * @param {object} options - Generation options
 * @returns {Promise<object>} - Image data
 */
async function generateBlogImage(topic, options = {}) {
	const provider = options.provider || selectProvider();

	try {
		if (provider === "nanoBanana") {
			// Create a descriptive prompt for AI generation
			const prompt = options.prompt || `High quality, professional photograph of ${topic}, vibrant colors, detailed, 4K`;
			return await generateWithNanoBanana(prompt, options);
		} else if (provider === "pexels") {
			// Use topic as search query
			const query = options.query || topic;
			return await fetchFromPexels(query, options);
		}

		throw new Error(`Unknown provider: ${provider}`);
	} catch (error) {
		console.error(`Image generation failed with ${provider}:`, error.message);

		// Try alternate provider if available
		if (options.noFallback) {
			throw error;
		}

		const alternateProvider = provider === "nanoBanana" ? "pexels" : "nanoBanana";
		const alternateEnabled = IMAGE_PROVIDER_CONFIG.providers[alternateProvider]?.enabled;

		if (alternateEnabled) {
			console.log(`Retrying with ${alternateProvider}...`);
			try {
				return await generateBlogImage(topic, { ...options, provider: alternateProvider, noFallback: true });
			} catch (retryError) {
				console.error(`Alternate provider ${alternateProvider} also failed:`, retryError.message);
			}
		}

		// Final fallback to placeholder
		console.log("Using placeholder image as final fallback");
		return generatePlaceholder(topic);
	}
}

/**
 * Generate multiple images for a blog post
 * @param {array} topics - Array of image topics
 * @param {object} options - Generation options
 * @returns {Promise<array>} - Array of image data objects
 */
async function generateBlogImages(topics, options = {}) {
	const images = [];
	const delay = options.delay || 1000; // Delay between requests to avoid rate limits

	for (let i = 0; i < topics.length; i++) {
		try {
			const image = await generateBlogImage(topics[i], options);
			images.push(image);

			// Add delay between requests
			if (i < topics.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		} catch (error) {
			console.error(`Failed to generate image ${i + 1}:`, error.message);
			// Continue with other images
		}
	}

	return images;
}

/**
 * Detect if the content is social media related
 * @param {string} text - Text to analyze
 * @returns {boolean}
 */
function isSocialMediaRelated(text) {
	const socialKeywords = [
		"tiktok",
		"instagram",
		"youtube",
		"facebook",
		"twitter",
		"x",
		"snapchat",
		"linkedin",
		"social media",
		"social",
		"viral",
		"video",
		"content creator",
		"influencer",
		"post",
		"posting",
		"shorts",
		"reels",
		"stories",
		"feed",
		"engagement",
		"followers",
		"likes",
		"views",
		"algorithm",
		"trending",
		"platform",
		"ai influencer",
		"virtual influencer",
	];

	const lowerText = text.toLowerCase();
	return socialKeywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Extract main subject from blog title for better image relevance
 * @param {string} title - Blog title
 * @returns {string} - Main subject/topic
 */
function extractMainSubject(title) {
	// Check if this is social media related
	const isSocial = isSocialMediaRelated(title);

	// Remove common blog title patterns to get to the core subject
	let subject = title
		.toLowerCase()
		.replace(/^(how to|what is|why|when|where|guide to|tips for|secrets of|mastering|understanding)\s+/i, "")
		.replace(/:\s*.*$/, "") // Remove everything after colon
		.replace(/\s+-\s+.*$/, "") // Remove everything after dash
		.replace(/[^a-z0-9\s]/g, "") // Remove special characters
		.trim();

	// Extract key nouns
	const words = subject.split(/\s+/);
	const meaningfulWords = words.filter((word) => word.length > 3 && !["this", "that", "with", "from", "into", "your", "their"].includes(word));

	let result = meaningfulWords.slice(0, 3).join(" ") || subject;

	// If social media related, add context
	if (isSocial) {
		// Enhance with social media context
		if (!result.includes("social") && !result.includes("media")) {
			result = `${result} social media`;
		}
	}

	return result;
}

/**
 * Extract image topics from blog content
 * @param {string} blogTitle - Blog title
 * @param {array} sections - Blog sections
 * @param {number} count - Number of images to generate
 * @returns {array} - Array of image topics
 */
function extractImageTopics(blogTitle, sections, count) {
	const topics = [];
	const usedTopics = new Set();

	// Extract main subject from title
	const mainSubject = extractMainSubject(blogTitle);

	// Add main subject as first topic
	if (mainSubject) {
		topics.push(mainSubject);
		usedTopics.add(mainSubject.toLowerCase());
	}

	// Extract topics from section titles
	if (sections && Array.isArray(sections)) {
		for (const section of sections) {
			if (section.title && topics.length < count) {
				// Clean up the title to make it a good search query
				let cleanTitle = section.title
					.replace(/[0-9]+\./g, "") // Remove numbering
					.replace(/^(Step|How to|What is|Why|When|Where)\s+/i, "") // Remove common prefixes
					.replace(/^(The|A|An)\s+/i, "") // Remove articles
					.trim();

				// Extract main keywords from section
				const sectionSubject = extractMainSubject(cleanTitle);

				// Only add if it's different from what we already have
				if (sectionSubject.length > 3 && !usedTopics.has(sectionSubject.toLowerCase())) {
					topics.push(sectionSubject);
					usedTopics.add(sectionSubject.toLowerCase());
				}
			}
		}
	}

	// If we need more topics, create contextual variations
	const isSocial = isSocialMediaRelated(blogTitle);

	let variations;
	if (isSocial) {
		// Social media focused variations
		variations = [
			`social media content creation`,
			`smartphone social media app`,
			`content creator workspace`,
			`social media marketing`,
			`digital content creation`,
			`social media engagement`,
			`influencer marketing`,
			`video content creation`,
			`mobile social media`,
			`social media platform`,
		];
	} else {
		// General variations
		variations = [
			`${mainSubject} workspace`,
			`${mainSubject} tools`,
			`${mainSubject} technology`,
			`${mainSubject} creative`,
			`${mainSubject} digital`,
			`${mainSubject} professional`,
			`${mainSubject} modern`,
		];
	}

	for (const variation of variations) {
		if (topics.length >= count) break;
		if (!usedTopics.has(variation.toLowerCase())) {
			topics.push(variation);
			usedTopics.add(variation.toLowerCase());
		}
	}

	return topics.slice(0, count);
}

/**
 * Get configuration for image providers
 * @returns {object} - Current configuration
 */
function getImageConfig() {
	return IMAGE_PROVIDER_CONFIG;
}

/**
 * Update image provider weights
 * @param {object} weights - New weights { nanoBanana: number, pexels: number }
 */
function updateProviderWeights(weights) {
	if (weights.nanoBanana !== undefined) {
		IMAGE_PROVIDER_CONFIG.providers.nanoBanana.weight = weights.nanoBanana;
	}
	if (weights.pexels !== undefined) {
		IMAGE_PROVIDER_CONFIG.providers.pexels.weight = weights.pexels;
	}
}

/**
 * Add images to a blog page object
 * This is a high-level function that:
 * 1. Extracts topics from the page content
 * 2. Generates images for those topics
 * 3. Adds images to the page sections and hero
 * @param {object} pageData - Blog page data object
 * @returns {Promise<object>} - Page data with images added
 */
async function addImagesToPage(pageData) {
	const settings = IMAGE_PROVIDER_CONFIG.settings;
	const blogTitle = pageData.content.hero?.title || pageData.metadata.title;
	const sections = pageData.content.sections || [];

	// Extract topics for images
	const imageCount = Math.min(Math.max(settings.imagesPerBlog, Math.floor(sections.length / 2)), settings.maxImagesPerBlog);

	const topics = extractImageTopics(blogTitle, sections, imageCount);
	console.log(`  Generating ${topics.length} images for topics:`, topics.slice(0, 3).join(", ") + "...");

	// Generate images
	const images = await generateBlogImages(topics, { delay: 500 });

	if (images.length === 0) {
		console.log(`  No images generated, returning page without images`);
		return pageData;
	}

	// Add featured image (first image)
	if (images[0] && pageData.content?.hero && !pageData.content.hero.featuredImage) {
		pageData.content.hero.featuredImage = images[0].url;
		console.log(`  Added featured image`);
	}

	// Add images to sections
	let imageIndex = 1; // Skip first image (used for featured)
	const imagePositions = settings.imagePositions || [2, 4, 6];

	for (let i = 0; i < imagePositions.length && imageIndex < images.length; i++) {
		const position = imagePositions[i];
		if (position < sections.length) {
			// Insert image section after the specified position
			const imageSection = {
				type: "image",
				content: {
					url: images[imageIndex].url,
					alt: images[imageIndex].alt || topics[imageIndex],
					caption: images[imageIndex].caption || "",
				},
				order: sections[position].order + 0.5, // Insert between sections
			};

			sections.splice(position + i, 0, imageSection);
			imageIndex++;
			console.log(`  Added image section at position ${position}`);
		}
	}

	// Re-order sections
	sections.forEach((section, index) => {
		section.order = index + 1;
	});

	pageData.content.sections = sections;
	console.log(`  Total ${imageIndex} images added to page`);

	return pageData;
}

module.exports = {
	generateBlogImage,
	generateBlogImages,
	extractImageTopics,
	selectProvider,
	getImageConfig,
	updateProviderWeights,
	addImagesToPage,
	IMAGE_PROVIDER_CONFIG,
};
