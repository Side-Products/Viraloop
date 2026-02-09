#!/usr/bin/env node

/**
 * Bulk Blog Generator CLI Script
 * Usage: npm run blog:bulk <number>
 *
 * Generates multiple unique blog posts using AI
 * Automatically avoids duplicate topics by checking existing blogs
 * Adapted for Viraloop - AI Influencer Platform
 *
 * Examples:
 *   npm run blog:bulk 5    # Generate 5 unique blogs
 *   npm run blog:bulk 10   # Generate 10 unique blogs
 */

const OpenAI = require("openai");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Import the SEO Page model
const SEOPage = require("../backend/models/seoPage").default;

// Import image generation utilities
const { generateBlogImages, extractImageTopics, getImageConfig } = require("../lib/pseo/utils/blog-image-generator.cjs");

// Import config for size tiers
const { PSEO_CONFIG } = require("../lib/pseo/config");

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Get size tier configuration
function getSizeTierConfig(size) {
	const tiers = PSEO_CONFIG.contentGeneration.sizeTiers;
	return tiers[size] || tiers.normal;
}

// Select random size based on distribution weights
function selectRandomSize() {
	const dist = PSEO_CONFIG.contentGeneration.bulkSizeDistribution;
	const rand = Math.random() * 100;

	// Check XL first (lowest probability)
	if (rand < dist.xl) return "xl";
	// Then check large
	if (rand < dist.xl + dist.large) return "large";
	// Default to normal
	return "normal";
}

// Size display labels
const SIZE_LABELS = {
	normal: "📄 NORMAL",
	large: "📑 LARGE",
	xl: "📚 XL",
};

// Colors for terminal output
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	green: "\x1b[32m",
	blue: "\x1b[34m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	cyan: "\x1b[36m",
	magenta: "\x1b[35m",
};

function log(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function slugify(text) {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

async function getExistingBlogTitles() {
	const existingBlogs = await SEOPage.find({ template: "blog" }).select("metadata.title slug").lean();
	return {
		titles: existingBlogs.map((blog) => blog.metadata.title.toLowerCase()),
		slugs: existingBlogs.map((blog) => blog.slug),
	};
}

async function generateUniqueBlogTopics(count, existingTitles) {
	log("\n🎯 Generating unique blog topics...", "blue");

	const systemPrompt = `You are a content strategist for Viraloop, an AI influencer platform that helps users create and manage virtual influencers for social media. Generate diverse, SEO-optimized blog post topics that would be valuable for content creators, influencer marketers, and social media managers.

Focus areas:
- AI influencer creation and management
- Virtual influencer marketing strategies
- Social media growth strategies (TikTok, YouTube, Instagram)
- AI tools and automation for content creation
- Influencer monetization strategies
- Platform-specific guides for AI influencers
- Virtual creator trends and best practices
- Audience engagement with AI content
- Brand partnerships with virtual influencers

Generate topics that are:
- Specific and actionable
- SEO-friendly with clear search intent
- Different from existing topics
- Trending or evergreen
- Valuable for the target audience`;

	const existingList =
		existingTitles.length > 0 ? `\n\nExisting topics to AVOID (generate completely different topics):\n${existingTitles.slice(0, 50).join("\n")}` : "";

	const userPrompt = `Generate ${count} unique blog post topics for an AI influencer platform.${existingList}

Return as a JSON object with this structure:
{
  "topics": [
    {
      "title": "Engaging blog topic title",
      "description": "Brief 1-sentence description of what the blog will cover",
      "category": "Tutorials|Tips|Guides|Case Studies|News|Industry Insights",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

IMPORTANT:
- Each topic must be unique and different from the existing topics
- Focus on practical, actionable content
- Include a mix of tutorial, guide, and list-style topics
- Ensure topics are relevant to AI influencer creators`;

	const completion = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userPrompt },
		],
		response_format: { type: "json_object" },
		temperature: 0.9, // Higher temperature for more variety
		max_tokens: 2000,
	});

	const result = JSON.parse(completion.choices[0].message.content);
	log(`✅ Generated ${result.topics.length} unique topics`, "green");
	return result.topics;
}

async function generateBlogContent(topic, size = "normal") {
	const tierConfig = getSizeTierConfig(size);

	const systemPrompt = `You are an expert blog writer for Viraloop, an AI influencer platform. Write in a conversational, engaging style that feels like a real person sharing knowledge with a friend.

CRITICAL WRITING GUIDELINES:
- Write 2-4 paragraphs per section, NOT just one paragraph per heading
- Vary paragraph lengths naturally (some 2-3 sentences, others 5-6 sentences)
- Use conversational transitions between paragraphs ("Here's the thing...", "What most people don't realize is...", "I've seen this work particularly well when...")
- Include occasional rhetorical questions to engage readers
- Never start consecutive paragraphs the same way
- Group related ideas under fewer headings instead of one paragraph per heading
- Make some sections longer than others - avoid uniform structure
- Share insights as if you're explaining to a colleague, not writing a textbook`;

	const sizeInstruction =
		size === "xl"
			? "This is a pillar/cornerstone content piece - be extremely thorough, cover all aspects of the topic, include examples, case studies, and actionable advice. Make it the definitive guide on this topic."
			: size === "large"
				? "This is a comprehensive guide - go deeper than typical blog posts, include examples and detailed explanations."
				: "";

	const userPrompt = `Write a comprehensive${size !== "normal" ? `, ${size === "xl" ? "in-depth pillar" : "detailed"} ` : " "}blog post about "${topic.title}".

Description: ${topic.description}
Category: ${topic.category}
Keywords: ${topic.keywords.join(", ")}

STRUCTURE REQUIREMENTS:
- ${tierConfig.minSections}-${tierConfig.maxSections} main sections (NOT more tiny sections with one paragraph each)
- Each section MUST have 2-4 substantial paragraphs (this is critical - no single-paragraph sections)
- Introduction: 2-3 paragraphs that hook the reader and set context
- Conclusion: 2 paragraphs with key takeaways
- Total word count: ${tierConfig.minWordCount}-${tierConfig.maxWordCount} words

WRITING STYLE:
- Conversational and engaging, like explaining to a friend over coffee
- Use "you" and occasionally "we" to connect with readers
- Include personal insights, observations, or real-world examples
- Vary sentence structure and paragraph lengths throughout
- Add rhetorical questions naturally ("Ever wondered why...?", "What does this mean for you?")
- Avoid generic filler - every paragraph should add value

${sizeInstruction}

Include:
1. An engaging title and subtitle
2. Key takeaways woven naturally throughout (not as a separate list)
3. ${tierConfig.minFaqs}-${tierConfig.maxFaqs} FAQs at the end
4. SEO metadata (title, description, keywords)

Target audience: Content creators, influencer marketers, and social media enthusiasts

Return as a JSON object with this exact structure:
{
  "metadata": {
    "title": "SEO-optimized title (max 60 chars, include main keyword)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  },
  "hero": {
    "title": "${topic.title}",
    "subtitle": "Engaging subtitle that expands on the title",
    "featuredImage": "/images/blog/default-featured.jpg",
    "author": {
      "name": "Viraloop Team",
      "bio": "AI influencer creation experts helping thousands of creators build their virtual presence",
      "avatar": "/images/team/viraloop-avatar.jpg"
    },
    "publishedAt": "${new Date().toISOString().split("T")[0]}",
    "category": "${topic.category}",
    "tags": ${JSON.stringify(topic.keywords)}
  },
  "sections": [
    {
      "type": "paragraph",
      "title": "Introduction",
      "content": { "text": "2-3 paragraphs here with engaging hook, context setting, and what readers will learn. Separate paragraphs with double newlines." },
      "order": 1
    },
    {
      "type": "paragraph",
      "title": "Main Section Title",
      "content": { "text": "2-4 paragraphs here exploring this topic in depth. Each paragraph builds on the previous. Use conversational transitions between paragraphs." },
      "order": 2
    }
  ],
  "faq": [
    { "question": "Question?", "answer": "Detailed answer..." }
  ]
}

CRITICAL RULES:
- Each section's "text" field MUST contain 2-4 paragraphs separated by double newlines (\\n\\n)
- NO single-paragraph sections - this makes content look AI-generated
- Vary section lengths - some can be longer than others`;

	const completion = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userPrompt },
		],
		response_format: { type: "json_object" },
		temperature: 0.7,
		max_tokens: tierConfig.maxTokens,
	});

	return JSON.parse(completion.choices[0].message.content);
}

async function saveBlogPost(content) {
	const baseSlug = slugify(content.metadata.title);
	let slug = `blog/${baseSlug}`;

	// Check for existing slug and append number if needed
	let counter = 1;
	let existingPage = await SEOPage.findOne({ slug });

	while (existingPage) {
		slug = `blog/${baseSlug}-${counter}`;
		existingPage = await SEOPage.findOne({ slug });
		counter++;
	}

	const blogPost = {
		slug,
		template: "blog",
		metadata: content.metadata,
		content: {
			hero: content.hero,
			sections: content.sections,
			faq: content.faq || [],
		},
		status: "published",
		aiGenerated: true,
		generatedAt: new Date(),
	};

	const page = await SEOPage.create(blogPost);
	return page;
}

async function addImagesToContent(content, blogNum, totalBlogs, size = "normal") {
	const tierConfig = getSizeTierConfig(size);
	const imageCount = Math.min(tierConfig.imagesPerBlog + Math.floor(Math.random() * 2), tierConfig.maxImagesPerBlog);

	try {
		// Extract image topics from blog content
		const topics = extractImageTopics(content.hero.title, content.sections, imageCount);

		log(`   🖼️  Generating ${topics.length} images for ${size.toUpperCase()} blog...`, "yellow");

		// Generate images with less delay for bulk processing
		const images = await generateBlogImages(topics, { delay: 300 });

		if (images.length === 0) {
			log(`   ⚠️  No images generated`, "yellow");
			return content;
		}

		// Set the first image as the featured image for the hero section
		if (images[0] && content.hero) {
			content.hero.featuredImage = images[0].url;
			log(`   ✅ Set featured image`, "green");
		}

		// Insert remaining images as image sections using size-specific positions
		const imagePositions = tierConfig.imagePositions;
		let imagesAdded = 0;

		// Start from index 1 since index 0 is used for featured image
		for (let i = 0; i < imagePositions.length && i + 1 < images.length; i++) {
			const position = imagePositions[i];
			const image = images[i + 1]; // Skip first image (used for featured)

			if (position < content.sections.length) {
				// Create image section
				const imageSection = {
					type: "image",
					title: image.alt,
					content: {
						src: image.url,
						alt: image.alt,
						caption: image.caption,
					},
					order: position + 0.5, // Insert between sections
				};

				content.sections.push(imageSection);
				imagesAdded++;
			}
		}

		// Re-sort sections by order
		content.sections.sort((a, b) => (a.order || 0) - (b.order || 0));

		log(`   ✅ Added ${imagesAdded} images to sections`, "green");

		return content;
	} catch (error) {
		log(`   ⚠️  Image generation failed: ${error.message}`, "yellow");
		return content;
	}
}

function getWordCount(content) {
	let totalWords = 0;
	if (content.sections) {
		for (const section of content.sections) {
			if (section.content?.text) {
				totalWords += section.content.text.split(/\s+/).filter(Boolean).length;
			}
		}
	}
	return totalWords;
}

function calculateReadingTime(wordCount) {
	const minutes = Math.ceil(wordCount / 200);
	return minutes === 1 ? "1 min read" : `${minutes} min read`;
}

async function connectDatabase() {
	try {
		log("\n🔌 Connecting to MongoDB...", "blue");
		await mongoose.connect(process.env.MONGODB_URI);
		log("✅ Connected to MongoDB", "green");
	} catch (error) {
		log(`\n❌ Database connection failed: ${error.message}`, "red");
		process.exit(1);
	}
}

async function disconnectDatabase() {
	try {
		await mongoose.disconnect();
		log("\n👋 Disconnected from MongoDB\n", "blue");
	} catch (error) {
		console.error("Error disconnecting:", error);
	}
}

async function main() {
	// Parse CLI arguments - support both "5 large" and "large 5" formats
	const args = process.argv.slice(2);
	const countArg = args.find((arg) => !isNaN(parseInt(arg, 10)));
	const count = countArg ? parseInt(countArg, 10) : NaN;

	// Check for forced size flag (without dashes to avoid npm intercepting)
	const forceSize =
		args.includes("xl") || args.includes("--xl")
			? "xl"
			: args.includes("large") || args.includes("--large")
				? "large"
				: args.includes("normal") || args.includes("--normal")
					? "normal"
					: null; // null means random distribution

	// Validate inputs
	if (!count || isNaN(count) || count < 1 || count > 50) {
		log("\n❌ Invalid number of blogs", "red");
		log("\nUsage:", "yellow");
		log("  npm run blog:bulk <number> [size]\n", "cyan");
		log("Examples:", "yellow");
		log("  npm run blog:bulk 5         # Generate 5 blogs with random sizes", "green");
		log("  npm run blog:bulk 5 large   # Generate 5 LARGE blogs", "green");
		log("  npm run blog:bulk 10 xl     # Generate 10 XL blogs", "green");
		log("  npm run blog:bulk 3 normal  # Generate 3 NORMAL blogs", "green");
		log("\nSize Options:", "yellow");
		log("  (default)  Random: ~40% Normal, ~40% Large, ~20% XL", "cyan");
		log("  normal     All Normal: 1500-2500 words", "cyan");
		log("  large      All Large:  4000-6000 words", "cyan");
		log("  xl         All XL:     7000-10000 words", "cyan");
		log("\nNote: Maximum 50 blogs per run\n", "yellow");
		process.exit(1);
	}

	if (!process.env.OPENAI_API_KEY) {
		log("\n❌ OPENAI_API_KEY not found in environment variables", "red");
		log("Please add it to your .env file\n", "yellow");
		process.exit(1);
	}

	if (!process.env.MONGODB_URI) {
		log("\n❌ MONGODB_URI not found in environment variables", "red");
		log("Please add it to your .env file\n", "yellow");
		process.exit(1);
	}

	console.log("\n" + "=".repeat(80));
	log(`  🚀 VIRALOOP BULK BLOG GENERATOR`, "bright");
	console.log("=".repeat(80) + "\n");
	log(`📊 Target: Generate ${count} unique blog posts`, "cyan");

	// Show size mode
	if (forceSize) {
		const tierConfig = getSizeTierConfig(forceSize);
		log(`📏 Size Mode: ALL ${forceSize.toUpperCase()} (${tierConfig.minWordCount}-${tierConfig.maxWordCount} words each)\n`, "cyan");
	} else {
		const dist = PSEO_CONFIG.contentGeneration.bulkSizeDistribution;
		log(`📏 Size Distribution: ~${dist.normal}% Normal, ~${dist.large}% Large, ~${dist.xl}% XL\n`, "cyan");
	}

	try {
		// Connect to database
		await connectDatabase();

		// Get existing blog titles and slugs
		log("\n📚 Fetching existing blogs from database...", "blue");
		const { titles, slugs } = await getExistingBlogTitles();
		log(`✅ Found ${titles.length} existing blogs`, "green");

		// Generate unique topics
		const topics = await generateUniqueBlogTopics(count, titles);

		// Generate and save blogs
		const successfulBlogs = [];
		const failedBlogs = [];
		const sizeCounts = { normal: 0, large: 0, xl: 0 };

		for (let i = 0; i < topics.length; i++) {
			const topic = topics[i];
			const blogNum = i + 1;

			// Use forced size or select random size
			const size = forceSize || selectRandomSize();
			const tierConfig = getSizeTierConfig(size);
			sizeCounts[size]++;

			console.log("\n" + "-".repeat(80));
			log(`\n📝 [${blogNum}/${topics.length}] ${SIZE_LABELS[size]} - "${topic.title}"`, "magenta");
			log(
				`   📊 Target: ${tierConfig.minWordCount}-${tierConfig.maxWordCount} words, ${tierConfig.minSections}-${tierConfig.maxSections} sections`,
				"cyan"
			);

			try {
				// Generate content with size tier
				log(`   🤖 Generating ${size.toUpperCase()} content with AI...`, "blue");
				let content = await generateBlogContent(topic, size);
				log(`   ✅ Content generated`, "green");

				// Add images to content with size tier
				content = await addImagesToContent(content, blogNum, topics.length, size);

				// Save to database
				log(`   💾 Saving to database...`, "cyan");
				const page = await saveBlogPost(content);

				const wordCount = getWordCount(content);
				const readingTime = calculateReadingTime(wordCount);

				log(`   ✅ Blog saved successfully!`, "green");
				log(`   📄 Title: ${content.metadata.title}`, "cyan");
				log(`   🔗 Slug: ${page.slug}`, "cyan");
				log(`   📏 Size: ${size.toUpperCase()}`, "cyan");
				log(`   📊 Word count: ${wordCount}`, "cyan");
				log(`   ⏱️  Reading time: ${readingTime}`, "cyan");

				successfulBlogs.push({
					title: content.metadata.title,
					slug: page.slug,
					category: content.hero.category,
					size,
					wordCount,
					readingTime,
				});

				// Longer delay for larger blogs to avoid rate limits
				const delayMs = size === "xl" ? 4000 : size === "large" ? 3000 : 2000;
				if (i < topics.length - 1) {
					log(`   ⏳ Waiting ${delayMs / 1000} seconds before next generation...`, "yellow");
					await new Promise((resolve) => setTimeout(resolve, delayMs));
				}
			} catch (error) {
				log(`   ❌ Failed to generate blog: ${error.message}`, "red");
				failedBlogs.push({
					topic: topic.title,
					size,
					error: error.message,
				});
			}
		}

		// Print summary
		console.log("\n" + "=".repeat(80));
		log(`\n✨ BULK GENERATION COMPLETE!\n`, "bright");
		console.log("=".repeat(80) + "\n");

		log(`📊 Summary:`, "yellow");
		log(`   ✅ Successfully generated: ${successfulBlogs.length}/${count}`, "green");
		log(`   ❌ Failed: ${failedBlogs.length}/${count}`, "red");

		// Show size distribution
		log(`\n📏 Size Breakdown:`, "yellow");
		log(`   📄 Normal: ${sizeCounts.normal} blogs`, "cyan");
		log(`   📑 Large:  ${sizeCounts.large} blogs`, "cyan");
		log(`   📚 XL:     ${sizeCounts.xl} blogs`, "cyan");

		if (successfulBlogs.length > 0) {
			log(`\n📝 Generated Blogs:`, "yellow");
			successfulBlogs.forEach((blog, index) => {
				const sizeIcon = blog.size === "xl" ? "📚" : blog.size === "large" ? "📑" : "📄";
				log(`   ${index + 1}. ${sizeIcon} ${blog.title}`, "cyan");
				log(`      🔗 https://viraloop.io/${blog.slug}`, "cyan");
				log(`      📁 ${blog.category} | 📏 ${blog.size.toUpperCase()} | 📊 ${blog.wordCount} words | ⏱️  ${blog.readingTime}`, "cyan");
			});
		}

		if (failedBlogs.length > 0) {
			log(`\n❌ Failed Blogs:`, "red");
			failedBlogs.forEach((fail, index) => {
				log(`   ${index + 1}. [${fail.size.toUpperCase()}] ${fail.topic}`, "red");
				log(`      Error: ${fail.error}`, "red");
			});
		}

		log(`\n🌐 View all blogs: http://localhost:3000/blog`, "cyan");
		console.log("\n" + "=".repeat(80) + "\n");

		// Disconnect
		await disconnectDatabase();

		process.exit(failedBlogs.length === count ? 1 : 0);
	} catch (error) {
		log(`\n❌ Fatal error: ${error.message}`, "red");
		console.error(error);
		await disconnectDatabase();
		process.exit(1);
	}
}

// Run the script
main();
