#!/usr/bin/env node

/**
 * Blog Generator CLI Script
 * Usage: npm run blog "blog topic or description"
 *
 * Generates a complete AI-powered blog post and saves it to MongoDB
 * Adapted for Viraloop - AI Influencer Platform
 */

const OpenAI = require("openai");
const mongoose = require("mongoose");
require("dotenv").config();

// Import the SEO Page model
const SEOPage = require("../backend/models/seoPage").default;

// Import image generation utilities
const { generateBlogImages, extractImageTopics, getImageConfig } = require("../lib/pseo/utils/blog-image-generator.cjs");

// Import config for size tiers
const { PSEO_CONFIG } = require("../lib/pseo/config");

// Get size tier configuration
function getSizeTierConfig(size) {
	const tiers = PSEO_CONFIG.contentGeneration.sizeTiers;
	return tiers[size] || tiers.normal;
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Colors for terminal output
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	green: "\x1b[32m",
	blue: "\x1b[34m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	cyan: "\x1b[36m",
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

async function generateBlogContent(topic, size = "normal") {
	const tierConfig = getSizeTierConfig(size);
	const sizeLabel = size === "normal" ? "" : ` (${size.toUpperCase()})`;
	log(`\n🤖 Generating ${size.toUpperCase()} blog content with AI...`, "blue");
	log(`   📊 Target: ${tierConfig.minWordCount}-${tierConfig.maxWordCount} words, ${tierConfig.minSections}-${tierConfig.maxSections} sections`, "cyan");

	const systemPrompt = `You are an expert blog writer for Viraloop, an AI influencer platform that helps users create and manage virtual influencers for social media. Write in a conversational, engaging style that feels like a real person sharing knowledge with a friend.

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

	const userPrompt = `Write a comprehensive${size !== "normal" ? `, ${size === "xl" ? "in-depth pillar" : "detailed"} ` : " "}blog post about "${topic}".

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
4. Suggested category and 3-5 relevant tags
5. Author info (use "Viraloop Team" as default)

Target audience: Content creators, marketers, influencer marketing professionals, and social media enthusiasts
Note: Do NOT include code examples or technical code blocks

Return as a JSON object with this exact structure:
{
  "metadata": {
    "title": "SEO-optimized title (max 60 chars)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "ogImage": "/images/blog/suggested-image-name.jpg"
  },
  "hero": {
    "title": "Blog post title",
    "subtitle": "Engaging subtitle that expands on the title",
    "featuredImage": "/images/blog/featured-image.jpg",
    "author": {
      "name": "Viraloop Team",
      "bio": "AI influencer creation experts helping thousands of creators build their virtual presence"
    },
    "publishedAt": "${new Date().toISOString().split("T")[0]}",
    "category": "Suggested Category",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
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

	try {
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

		const content = JSON.parse(completion.choices[0].message.content);
		log("✅ Content generated successfully!", "green");
		return content;
	} catch (error) {
		log(`❌ Error generating content: ${error.message}`, "red");
		throw error;
	}
}

async function addImagesToContent(content, size = "normal") {
	log("\n🖼️  Generating images for blog post...", "blue");

	const tierConfig = getSizeTierConfig(size);
	const imageCount = Math.min(tierConfig.imagesPerBlog + Math.floor(Math.random() * 2), tierConfig.maxImagesPerBlog);

	try {
		// Extract image topics from blog content
		const topics = extractImageTopics(content.hero.title, content.sections, imageCount);

		log(`   📝 Generating ${topics.length} images for ${size.toUpperCase()} blog...`, "yellow");

		// Generate images
		const images = await generateBlogImages(topics, { delay: 500 });

		log(`   ✅ Generated ${images.length} images`, "green");

		if (images.length === 0) {
			log(`   ⚠️  No images generated`, "yellow");
			return content;
		}

		// Set the first image as the featured image for the hero section
		if (images[0] && content.hero) {
			content.hero.featuredImage = images[0].url;
			log(`   ✅ Set featured image: ${images[0].url.substring(0, 50)}...`, "green");
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

		log(`   ✅ Added ${imagesAdded} images to blog sections`, "green");

		return content;
	} catch (error) {
		log(`   ⚠️  Image generation failed: ${error.message}`, "yellow");
		log(`   📝 Continuing without images...`, "yellow");
		return content;
	}
}

async function saveBlogPost(content, topic) {
	log("\n💾 Saving blog post to database...", "blue");

	// Generate slug from title
	const slug = `blog/${slugify(content.metadata.title)}`;

	// Check if slug already exists
	const existing = await SEOPage.findOne({ slug });
	if (existing) {
		const timestamp = Date.now();
		const newSlug = `${slug}-${timestamp}`;
		log(`⚠️  Slug already exists, using: ${newSlug}`, "yellow");
		return saveBlogPostWithSlug(content, newSlug);
	}

	return saveBlogPostWithSlug(content, slug);
}

async function saveBlogPostWithSlug(content, slug) {
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
	};

	try {
		const page = await SEOPage.create(blogPost);
		log("✅ Blog post saved successfully!", "green");
		return page;
	} catch (error) {
		log(`❌ Error saving blog post: ${error.message}`, "red");
		throw error;
	}
}

async function connectDatabase() {
	const mongoUri = process.env.MONGODB_URI;

	if (!mongoUri) {
		throw new Error("MONGODB_URI not found in environment variables");
	}

	log("\n🔌 Connecting to MongoDB...", "blue");

	try {
		await mongoose.connect(mongoUri);
		log("✅ Connected to MongoDB", "green");
	} catch (error) {
		log(`❌ MongoDB connection error: ${error.message}`, "red");
		throw error;
	}
}

async function disconnectDatabase() {
	await mongoose.disconnect();
	log("🔌 Disconnected from MongoDB\n", "blue");
}

function printBlogInfo(page, content) {
	log("\n" + "=".repeat(60), "cyan");
	log("📝 BLOG POST GENERATED SUCCESSFULLY!", "bright");
	log("=".repeat(60), "cyan");

	log(`\n📌 Title: ${content.metadata.title}`, "bright");
	log(`🔗 Slug: ${page.slug}`);
	log(`📂 Category: ${content.hero.category}`);
	log(`🏷️  Tags: ${content.hero.tags.join(", ")}`);
	log(`📊 Word Count: ~${estimateWordCount(content.sections)} words`);
	log(`⏱️  Reading Time: ~${calculateReadingTime(content.sections)} min`);

	log(`\n🌐 URLs:`, "bright");
	log(`   Local:  http://localhost:3000/${page.slug}`, "cyan");
	log(`   Prod:   https://viraloop.io/${page.slug}`, "cyan");

	log(`\n📄 Preview:`, "bright");
	log(`   ${content.metadata.description}`);

	log(`\n✨ Sections (${content.sections.length}):`, "bright");
	content.sections.slice(0, 5).forEach((section, i) => {
		log(`   ${i + 1}. ${section.title || section.type}`, "cyan");
	});
	if (content.sections.length > 5) {
		log(`   ... and ${content.sections.length - 5} more`, "cyan");
	}

	log("\n" + "=".repeat(60), "cyan");
}

function estimateWordCount(sections) {
	let count = 0;
	for (const section of sections) {
		if (section.content?.text) {
			count += section.content.text.split(/\s+/).filter(Boolean).length;
		}
	}
	return count;
}

function calculateReadingTime(sections) {
	const wordCount = estimateWordCount(sections);
	return Math.ceil(wordCount / 200);
}

async function main() {
	// Parse CLI arguments - support both --large and large (without dashes)
	const args = process.argv.slice(2);
	const topic = args.find((arg) => !arg.startsWith("--") && arg !== "large" && arg !== "xl" && arg !== "normal");
	const size = args.includes("--xl") || args.includes("xl") ? "xl" : args.includes("--large") || args.includes("large") ? "large" : "normal";
	const tierConfig = getSizeTierConfig(size);

	// Print banner
	log("\n" + "=".repeat(60), "bright");
	log("  🚀 VIRALOOP BLOG GENERATOR", "bright");
	log("=".repeat(60), "bright");

	if (!topic) {
		log("\n❌ Error: Please provide a blog topic", "red");
		log("\nUsage:", "yellow");
		log('  npm run blog "your blog topic here" [large|xl]', "cyan");
		log("\nSize Options:", "yellow");
		log("  (default)  Normal: 1500-2500 words, 5-8 sections", "cyan");
		log("  large      Large:  4000-6000 words, 10-14 sections", "cyan");
		log("  xl         XL:     7000-10000 words, 15-20 sections", "cyan");
		log("\nExamples:", "yellow");
		log('  npm run blog "how to create viral AI influencers"', "cyan");
		log('  npm run blog "virtual influencer monetization guide" large', "cyan");
		log('  npm run blog "complete AI influencer marketing guide" xl\n', "cyan");
		process.exit(1);
	}

	log(`\n📝 Topic: "${topic}"`, "bright");
	log(`📏 Size: ${size.toUpperCase()} (${tierConfig.minWordCount}-${tierConfig.maxWordCount} words)`, "bright");

	// Check for OpenAI API key
	if (!process.env.OPENAI_API_KEY) {
		log("\n❌ Error: OPENAI_API_KEY not found in .env file", "red");
		log("Please add your OpenAI API key to the .env file\n", "yellow");
		process.exit(1);
	}

	try {
		// Connect to database
		await connectDatabase();

		// Generate content with size tier
		let content = await generateBlogContent(topic, size);

		// Add images to content with size tier
		content = await addImagesToContent(content, size);

		// Save to database
		const page = await saveBlogPost(content, topic);

		// Print summary
		printBlogInfo(page, content);

		log("\n✅ Blog post is live and ready to view!", "green");
		log("🎉 Happy blogging!\n", "bright");

		// Disconnect
		await disconnectDatabase();

		process.exit(0);
	} catch (error) {
		log(`\n❌ Fatal error: ${error.message}`, "red");
		if (error.stack) {
			log(`\nStack trace:`, "red");
			console.error(error.stack);
		}

		try {
			await disconnectDatabase();
		} catch (e) {
			// Ignore disconnect errors
		}

		process.exit(1);
	}
}

// Run the script
main();
