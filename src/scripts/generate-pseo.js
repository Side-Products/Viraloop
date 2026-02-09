#!/usr/bin/env node

/**
 * pSEO Page Generator CLI Script
 * Usage: npm run pseo <template> "keyword or topic"
 *
 * Templates: tool, niche, use-case, comparison, tutorial, guide
 * Adapted for Viraloop - AI Influencer Platform
 *
 * Examples:
 *   npm run pseo tool "AI influencer creation"
 *   npm run pseo niche "fashion virtual influencers"
 *   npm run pseo use-case "brand ambassador campaigns"
 */

const OpenAI = require("openai");
const mongoose = require("mongoose");
require("dotenv").config();

// Import the SEO Page model
const SEOPage = require("../backend/models/seoPage").default;

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

function getTemplateConfig(template) {
	const configs = {
		tool: {
			basePath: "tools",
			systemPrompt: `You are an expert content writer for Viraloop, an AI influencer platform. Create detailed, feature-rich content about AI influencer tools that helps users understand capabilities and use cases.`,
			userPromptTemplate: (keyword) => `Create a comprehensive landing page about "${keyword}" for AI influencer creators. Include:

1. An engaging hero title and subtitle
2. 3-5 key features with descriptions
3. 4-6 use cases with practical examples
4. Benefits section highlighting value propositions
5. 5-7 FAQs
6. Call-to-action encouraging users to try the tool
7. SEO metadata (title, description, keywords)

Target audience: Content creators, influencer marketers, brands
Writing style: Professional, feature-focused, benefit-driven

Return as JSON with this structure:
{
  "metadata": {
    "title": "SEO title (max 60 chars, include keyword)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["${keyword}", "related keyword 2", "keyword 3", "keyword 4", "keyword 5"]
  },
  "hero": {
    "title": "Main headline with ${keyword}",
    "subtitle": "Compelling subtitle explaining the value",
    "cta": { "text": "Create AI Influencer", "url": "/influencers" }
  },
  "features": [
    {
      "title": "Feature Name",
      "description": "Detailed feature description (50-100 words)",
      "icon": "suggested-icon-name"
    }
  ],
  "useCases": [
    {
      "title": "Use Case Title",
      "description": "Practical example and benefits (50-80 words)"
    }
  ],
  "benefits": [
    "Benefit 1 with clear value proposition",
    "Benefit 2 with clear value proposition",
    "Benefit 3 with clear value proposition"
  ],
  "faq": [
    { "question": "Common question?", "answer": "Detailed answer (50-100 words)" }
  ]
}`,
		},
		niche: {
			basePath: "niches",
			systemPrompt: `You are an expert content writer for Viraloop, an AI influencer platform. Create comprehensive, educational content about AI influencer niches that helps creators succeed in their specific market.`,
			userPromptTemplate: (keyword) => `Create a comprehensive landing page about "${keyword}" for AI influencer creators. Include:

1. An engaging hero title and subtitle
2. 5-7 content sections explaining the niche, trends, and best practices
3. 3-5 key strategies or tips
4. 4-6 use cases with examples
5. 6-8 FAQs
6. SEO metadata

Target audience: Content creators exploring this niche
Writing style: Educational, trend-focused, opportunity-driven

Return as JSON with this structure:
{
  "metadata": {
    "title": "SEO title (max 60 chars)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["${keyword}", "keyword 2", "keyword 3", "keyword 4", "keyword 5"]
  },
  "hero": {
    "title": "Main headline about ${keyword}",
    "subtitle": "Engaging subtitle about opportunities in this niche"
  },
  "sections": [
    {
      "type": "content",
      "title": "Section Title",
      "content": "Rich paragraph content (150-250 words) with insights",
      "order": 1
    }
  ],
  "strategies": [
    {
      "title": "Strategy Name",
      "description": "Actionable strategy explanation (50-100 words)"
    }
  ],
  "useCases": [
    {
      "title": "Use Case Title",
      "description": "Practical example (50-80 words)"
    }
  ],
  "faq": [
    { "question": "Question?", "answer": "Detailed answer" }
  ]
}`,
		},
		"use-case": {
			basePath: "use-cases",
			systemPrompt: `You are an expert content writer for Viraloop, an AI influencer platform. Create problem-solution focused content that shows how AI influencers solve specific business and creative challenges.`,
			userPromptTemplate: (keyword) => `Create a comprehensive use case page about "${keyword}". Include:

1. An engaging hero title and subtitle
2. Problem statement (what challenge this solves)
3. Solution explanation (how AI influencers address it)
4. 4-6 benefits of using this approach
5. Step-by-step process (4-6 steps)
6. Real-world examples or case studies
7. 5-7 FAQs
8. SEO metadata

Target audience: Business owners, marketers, content strategists
Writing style: Problem-solution focused, results-driven, practical

Return as JSON with this structure:
{
  "metadata": {
    "title": "SEO title (max 60 chars)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["${keyword}", "keyword 2", "keyword 3", "keyword 4", "keyword 5"]
  },
  "hero": {
    "title": "Main headline about ${keyword}",
    "subtitle": "Compelling subtitle about the solution"
  },
  "problem": {
    "title": "The Challenge",
    "description": "Detailed problem statement (100-150 words)"
  },
  "solution": {
    "title": "The Solution",
    "description": "How AI influencers solve this (150-200 words)"
  },
  "benefits": [
    {
      "title": "Benefit Title",
      "description": "Detailed benefit explanation (50-80 words)"
    }
  ],
  "process": [
    {
      "step": 1,
      "title": "Step Title",
      "description": "Step-by-step instructions (50-80 words)"
    }
  ],
  "examples": [
    {
      "title": "Example Title",
      "description": "Real-world example or case study (80-120 words)"
    }
  ],
  "faq": [
    { "question": "Question?", "answer": "Detailed answer" }
  ]
}`,
		},
		comparison: {
			basePath: "comparisons",
			systemPrompt: `You are an expert content writer for Viraloop, an AI influencer platform. Create balanced, analytical comparison content that helps users make informed decisions.`,
			userPromptTemplate: (keyword) => `Create a comparison page about "${keyword}". Include:

1. Hero with title and subtitle
2. Overview of what's being compared
3. 5-7 comparison points with pros/cons
4. Feature comparison table
5. Recommendations for different use cases
6. 5-7 FAQs
7. SEO metadata

Writing style: Analytical, balanced, decision-focused

Return as JSON with this structure:
{
  "metadata": {
    "title": "SEO title (max 60 chars)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["${keyword}", "comparison", "keyword 3", "keyword 4", "keyword 5"]
  },
  "hero": {
    "title": "Main comparison headline",
    "subtitle": "What this comparison covers"
  },
  "overview": "Introduction explaining the comparison (150-200 words)",
  "comparisonPoints": [
    {
      "title": "Comparison Point",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"]
    }
  ],
  "recommendations": [
    {
      "title": "Best for [Use Case]",
      "description": "Recommendation with reasoning (80-120 words)"
    }
  ],
  "faq": [
    { "question": "Question?", "answer": "Detailed answer" }
  ]
}`,
		},
		tutorial: {
			basePath: "tutorials",
			systemPrompt: `You are an expert content writer for Viraloop, an AI influencer platform. Create clear, step-by-step tutorial content that helps users accomplish specific goals.`,
			userPromptTemplate: (keyword) => `Create a tutorial page about "${keyword}". Include:

1. Hero with title and subtitle
2. Overview and prerequisites
3. 6-10 detailed steps with instructions
4. Tips and best practices
5. Common mistakes to avoid
6. Next steps and related tutorials
7. 5-7 FAQs
8. SEO metadata

Writing style: Instructional, clear, beginner-friendly

Return as JSON with this structure:
{
  "metadata": {
    "title": "SEO title (max 60 chars)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["${keyword}", "tutorial", "how to", "keyword 4", "keyword 5"]
  },
  "hero": {
    "title": "Tutorial headline with ${keyword}",
    "subtitle": "What you'll learn"
  },
  "overview": {
    "description": "Tutorial overview (100-150 words)",
    "duration": "Estimated time",
    "difficulty": "Beginner|Intermediate|Advanced",
    "prerequisites": ["Prerequisite 1", "Prerequisite 2"]
  },
  "steps": [
    {
      "step": 1,
      "title": "Step Title",
      "description": "Detailed instructions (100-150 words)",
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "bestPractices": [
    {
      "title": "Best Practice",
      "description": "Explanation (50-80 words)"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "Common mistake description",
      "solution": "How to avoid or fix it"
    }
  ],
  "faq": [
    { "question": "Question?", "answer": "Detailed answer" }
  ]
}`,
		},
		guide: {
			basePath: "guides",
			systemPrompt: `You are an expert content writer for Viraloop, an AI influencer platform. Create comprehensive, authoritative guide content that serves as a complete resource on a topic.`,
			userPromptTemplate: (keyword) => `Create a comprehensive guide about "${keyword}". Include:

1. Hero with title and subtitle
2. Table of contents (5-8 main sections)
3. Introduction explaining the guide's value
4. 5-8 detailed sections with subsections
5. Key takeaways and action items
6. Resources and tools
7. 6-8 FAQs
8. SEO metadata

Writing style: Comprehensive, authoritative, resource-focused

Return as JSON with this structure:
{
  "metadata": {
    "title": "SEO title (max 60 chars)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["${keyword}", "guide", "complete", "keyword 4", "keyword 5"]
  },
  "hero": {
    "title": "The Complete Guide to ${keyword}",
    "subtitle": "Everything you need to know"
  },
  "introduction": "Comprehensive introduction (200-300 words)",
  "tableOfContents": [
    { "title": "Section Title", "anchor": "section-slug" }
  ],
  "sections": [
    {
      "title": "Main Section Title",
      "content": "Detailed content (250-400 words)",
      "subsections": [
        {
          "title": "Subsection Title",
          "content": "Subsection content (150-250 words)"
        }
      ],
      "order": 1
    }
  ],
  "keyTakeaways": [
    "Key takeaway 1",
    "Key takeaway 2",
    "Key takeaway 3"
  ],
  "resources": [
    {
      "title": "Resource Name",
      "description": "Resource description",
      "url": "/resource-url"
    }
  ],
  "faq": [
    { "question": "Question?", "answer": "Detailed answer" }
  ]
}`,
		},
	};

	return configs[template];
}

async function generatePSEOContent(template, keyword) {
	const config = getTemplateConfig(template);

	if (!config) {
		throw new Error(`Unknown template: ${template}`);
	}

	log(`\n🤖 Generating ${template} page content with AI...`, "blue");

	const completion = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{ role: "system", content: config.systemPrompt },
			{ role: "user", content: config.userPromptTemplate(keyword) },
		],
		response_format: { type: "json_object" },
		temperature: 0.7,
		max_tokens: 4000,
	});

	const content = JSON.parse(completion.choices[0].message.content);
	return { content, basePath: config.basePath };
}

async function savePSEOPage(content, template, keyword, basePath) {
	log("\n💾 Saving to database...", "cyan");

	const baseSlug = slugify(content.metadata.title || keyword);
	let slug = `${basePath}/${baseSlug}`;

	// Check for existing slug and append number if needed
	let counter = 1;
	let existingPage = await SEOPage.findOne({ slug });

	while (existingPage) {
		slug = `${basePath}/${baseSlug}-${counter}`;
		existingPage = await SEOPage.findOne({ slug });
		counter++;
	}

	const pageData = {
		slug,
		template,
		metadata: content.metadata,
		content: {
			hero: content.hero,
			...(content.features && { features: content.features }),
			...(content.useCases && { useCases: content.useCases }),
			...(content.benefits && { benefits: content.benefits }),
			...(content.sections && { sections: content.sections }),
			...(content.strategies && { strategies: content.strategies }),
			...(content.problem && { problem: content.problem }),
			...(content.solution && { solution: content.solution }),
			...(content.process && { process: content.process }),
			...(content.examples && { examples: content.examples }),
			...(content.overview && { overview: content.overview }),
			...(content.comparisonPoints && { comparisonPoints: content.comparisonPoints }),
			...(content.recommendations && { recommendations: content.recommendations }),
			...(content.introduction && { introduction: content.introduction }),
			...(content.tableOfContents && { tableOfContents: content.tableOfContents }),
			...(content.keyTakeaways && { keyTakeaways: content.keyTakeaways }),
			...(content.resources && { resources: content.resources }),
			...(content.bestPractices && { bestPractices: content.bestPractices }),
			...(content.commonMistakes && { commonMistakes: content.commonMistakes }),
			faq: content.faq || [],
		},
		status: "published",
		aiGenerated: true,
		generatedAt: new Date(),
	};

	const page = await SEOPage.create(pageData);
	log("✅ Page saved successfully!", "green");

	return page;
}

function printPageInfo(page, content, template) {
	console.log("\n" + "=".repeat(80));
	log("\n✨ pSEO Page Generated Successfully!\n", "bright");
	console.log("=".repeat(80) + "\n");

	log("📄 Page Details:", "yellow");
	log(`   Title: ${content.metadata.title}`, "cyan");
	log(`   Template: ${template}`, "cyan");
	log(`   Slug: ${page.slug}`, "cyan");
	log(`   Status: ${page.status}`, "green");

	if (content.metadata.keywords) {
		log(`\n🏷️  Keywords:`, "yellow");
		content.metadata.keywords.forEach((keyword) => {
			log(`   • ${keyword}`, "cyan");
		});
	}

	log(`\n🌐 URLs:`, "yellow");
	log(`   Local: http://localhost:3000/${page.slug}`, "cyan");
	log(`   Production: https://viraloop.io/${page.slug}`, "cyan");

	// Template-specific info
	if (content.features) {
		log(`\n🎯 Features: ${content.features.length}`, "yellow");
	}
	if (content.sections) {
		log(`\n📝 Sections: ${content.sections.length}`, "yellow");
	}
	if (content.steps) {
		log(`\n📋 Steps: ${content.steps.length}`, "yellow");
	}
	if (content.useCases) {
		log(`\n💡 Use Cases: ${content.useCases.length}`, "yellow");
	}

	log(`\n❓ FAQs: ${content.faq?.length || 0}`, "yellow");

	console.log("\n" + "=".repeat(80) + "\n");
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
	const template = process.argv[2];
	const keyword = process.argv[3];

	// Validate inputs
	const validTemplates = ["tool", "niche", "use-case", "comparison", "tutorial", "guide"];

	if (!template || !keyword) {
		log("\n❌ Missing required arguments\n", "red");
		log("Usage:", "yellow");
		log('  npm run pseo <template> "keyword or topic"\n', "cyan");
		log("Available templates:", "yellow");
		validTemplates.forEach((t) => {
			log(`  • ${t}`, "cyan");
		});
		log("\nExamples:", "yellow");
		log('  npm run pseo tool "AI influencer creation"', "green");
		log('  npm run pseo niche "fashion virtual influencers"', "green");
		log('  npm run pseo use-case "brand ambassador campaigns"', "green");
		log('  npm run pseo comparison "AI influencers vs human influencers"', "green");
		log('  npm run pseo tutorial "create your first AI influencer"', "green");
		log('  npm run pseo guide "virtual influencer marketing strategy"\n', "green");
		process.exit(1);
	}

	if (!validTemplates.includes(template)) {
		log(`\n❌ Invalid template: ${template}`, "red");
		log("\nValid templates are:", "yellow");
		validTemplates.forEach((t) => {
			log(`  • ${t}`, "cyan");
		});
		log("");
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

	try {
		// Connect to database
		await connectDatabase();

		// Generate content
		const { content, basePath } = await generatePSEOContent(template, keyword);

		// Save to database
		const page = await savePSEOPage(content, template, keyword, basePath);

		// Print info
		printPageInfo(page, content, template);

		// Disconnect
		await disconnectDatabase();

		process.exit(0);
	} catch (error) {
		log(`\n❌ Error: ${error.message}`, "red");
		console.error(error);
		await disconnectDatabase();
		process.exit(1);
	}
}

// Run the script
main();
