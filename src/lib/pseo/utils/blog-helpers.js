/**
 * Blog Helper Utilities
 * Helper functions for blog post management
 */

/**
 * Calculate reading time based on content
 * @param {object|string} content - Content sections or plain text
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {string} - Reading time string (e.g., "5 min read")
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
	let wordCount = 0;

	if (typeof content === "string") {
		wordCount = content.split(/\s+/).filter(Boolean).length;
	} else if (Array.isArray(content)) {
		// Content is sections array
		for (const section of content) {
			if (section.content?.text) {
				wordCount += section.content.text.split(/\s+/).filter(Boolean).length;
			}
			if (section.content?.code) {
				// Count code as 50% of normal reading speed
				wordCount += Math.floor(section.content.code.split(/\s+/).filter(Boolean).length * 0.5);
			}
		}
	}

	const minutes = Math.ceil(wordCount / wordsPerMinute);
	return minutes === 1 ? "1 min read" : `${minutes} min read`;
}

/**
 * Extract headings from content sections to build table of contents
 * @param {array} sections - Content sections
 * @returns {array} - Array of TOC items with level, title, and anchor
 */
export function extractHeadings(sections) {
	if (!sections || !Array.isArray(sections)) return [];

	const toc = [];

	for (const section of sections) {
		if (section.title) {
			// Determine heading level (default to H2 for sections)
			const level = section.headingLevel || 2;
			const anchor = slugify(section.title);

			toc.push({
				level,
				title: section.title,
				anchor: `#${anchor}`,
			});
		}

		// Extract headings from paragraph content
		if (section.type === "paragraph" && section.content?.text) {
			const headingRegex = /^(#{2,6})\s+(.+)$/gm;
			let match;

			while ((match = headingRegex.exec(section.content.text)) !== null) {
				const level = match[1].length; // Number of # symbols
				const title = match[2].trim();
				const anchor = slugify(title);

				toc.push({
					level,
					title,
					anchor: `#${anchor}`,
				});
			}
		}
	}

	return toc;
}

/**
 * Generate excerpt from content
 * @param {object|string} content - Content sections or plain text
 * @param {number} maxLength - Maximum excerpt length in characters
 * @returns {string} - Excerpt string
 */
export function generateExcerpt(content, maxLength = 160) {
	let text = "";

	if (typeof content === "string") {
		text = content;
	} else if (Array.isArray(content)) {
		// Find first text section
		for (const section of content) {
			if (section.type === "paragraph" && section.content?.text) {
				text = section.content.text;
				break;
			} else if (section.type === "text" && section.content?.text) {
				text = section.content.text;
				break;
			}
		}
	}

	// Strip HTML tags
	text = text.replace(/<[^>]*>/g, "");

	// Strip markdown formatting
	text = text.replace(/[#*_`\[\]]/g, "");

	// Truncate to max length
	if (text.length > maxLength) {
		text = text.substring(0, maxLength);
		// Find last complete word
		const lastSpace = text.lastIndexOf(" ");
		if (lastSpace > 0) {
			text = text.substring(0, lastSpace);
		}
		text += "...";
	}

	return text.trim();
}

/**
 * Format publish date in human-readable format
 * @param {Date|string} date - Date to format
 * @param {object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export function formatPublishDate(date, options = {}) {
	const { style = "long", relative = false } = options;

	const dateObj = date instanceof Date ? date : new Date(date);

	// Relative date (e.g., "2 days ago")
	if (relative) {
		const now = new Date();
		const diffMs = now - dateObj;
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return `${Math.floor(diffDays / 365)} years ago`;
	}

	// Absolute date
	if (style === "short") {
		// e.g., "Jan 15, 2025"
		return dateObj.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	}

	// e.g., "January 15, 2025"
	return dateObj.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Slugify a string for URL-safe anchors
 * @param {string} text - Text to slugify
 * @returns {string} - Slugified string
 */
export function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w\-]+/g, "") // Remove non-word chars
		.replace(/\-\-+/g, "-") // Replace multiple - with single -
		.replace(/^-+/, "") // Trim - from start
		.replace(/-+$/, ""); // Trim - from end
}

/**
 * Get word count from content
 * @param {object|string} content - Content sections or plain text
 * @returns {number} - Word count
 */
export function getWordCount(content) {
	let wordCount = 0;

	if (typeof content === "string") {
		wordCount = content.split(/\s+/).filter(Boolean).length;
	} else if (Array.isArray(content)) {
		for (const section of content) {
			if (section.content?.text) {
				wordCount += section.content.text.split(/\s+/).filter(Boolean).length;
			}
		}
	}

	return wordCount;
}

/**
 * Extract all categories from blog posts
 * @param {array} posts - Array of blog post objects
 * @returns {array} - Array of unique categories with counts
 */
export function extractCategories(posts) {
	const categoryMap = new Map();

	for (const post of posts) {
		const category = post.content?.hero?.category;
		if (category) {
			if (categoryMap.has(category)) {
				categoryMap.set(category, categoryMap.get(category) + 1);
			} else {
				categoryMap.set(category, 1);
			}
		}
	}

	return Array.from(categoryMap, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

/**
 * Extract all tags from blog posts
 * @param {array} posts - Array of blog post objects
 * @returns {array} - Array of unique tags with counts
 */
export function extractTags(posts) {
	const tagMap = new Map();

	for (const post of posts) {
		const tags = post.content?.hero?.tags || [];
		for (const tag of tags) {
			if (tagMap.has(tag)) {
				tagMap.set(tag, tagMap.get(tag) + 1);
			} else {
				tagMap.set(tag, 1);
			}
		}
	}

	return Array.from(tagMap, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

/**
 * Group posts by month for archive view
 * @param {array} posts - Array of blog post objects
 * @returns {object} - Posts grouped by month
 */
export function groupPostsByMonth(posts) {
	const grouped = {};

	for (const post of posts) {
		const date = new Date(post.content?.hero?.publishedAt || post.publishedAt);
		const monthYear = date.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});

		if (!grouped[monthYear]) {
			grouped[monthYear] = [];
		}

		grouped[monthYear].push(post);
	}

	return grouped;
}

/**
 * Calculate estimated reading progress percentage
 * @param {number} scrollPosition - Current scroll position
 * @param {number} contentHeight - Total content height
 * @param {number} windowHeight - Window height
 * @returns {number} - Progress percentage (0-100)
 */
export function calculateReadingProgress(scrollPosition, contentHeight, windowHeight) {
	const maxScroll = contentHeight - windowHeight;
	if (maxScroll <= 0) return 100;

	const progress = (scrollPosition / maxScroll) * 100;
	return Math.min(100, Math.max(0, progress));
}
