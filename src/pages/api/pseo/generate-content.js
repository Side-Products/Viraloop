/**
 * API Route: /api/pseo/generate-content
 * AI-powered content generation for SEO pages
 * Adapted for Viraloop - AI Influencer Platform
 */

import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
	try {
		if (req.method !== "POST") {
			return res.status(405).json({ success: false, message: "Method not allowed" });
		}

		// Check authentication
		const session = await getServerSession(req, res, authOptions);
		if (!session) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		const { template, keyword, targetKeywords = [], customPrompt } = req.body;

		if (!template || !keyword) {
			return res.status(400).json({
				success: false,
				message: "Template and keyword are required",
			});
		}

		// Generate content based on template type
		const content = await generateContentForTemplate(template, keyword, targetKeywords, customPrompt);

		return res.status(200).json({
			success: true,
			content,
		});
	} catch (error) {
		console.error("Content generation error:", error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}

/**
 * Generate content for different template types
 */
async function generateContentForTemplate(template, keyword, targetKeywords, customPrompt) {
	let systemPrompt = "";
	let userPrompt = "";

	switch (template) {
		case "tool":
			systemPrompt = `You are an expert SEO content writer for Viraloop, an AI influencer platform that helps users create and manage virtual influencers for social media. Create comprehensive, engaging content for tool pages that ranks well and converts visitors.`;
			userPrompt =
				customPrompt ||
				`Create content for a tool page about "${keyword}". Include:
1. A compelling hero title and subtitle
2. 3-4 main content sections explaining the tool's features, benefits, and how to use it
3. 5-6 key features with descriptions
4. Step-by-step instructions (4-5 steps)
5. 5 frequently asked questions with detailed answers

Target keywords: ${targetKeywords.join(", ") || keyword}

Return the content as a JSON object with this structure:
{
  "metadata": {
    "title": "SEO-optimized title (max 60 chars)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["keyword1", "keyword2", ...]
  },
  "hero": {
    "title": "Hero title",
    "subtitle": "Hero subtitle",
    "cta": { "text": "CTA text", "url": "/influencers" }
  },
  "sections": [
    {
      "type": "text",
      "title": "Section title",
      "content": { "text": "Detailed paragraph text..." },
      "order": 1
    },
    {
      "type": "features",
      "title": "Key Features",
      "content": {
        "features": [
          { "title": "Feature name", "description": "Description", "icon": "⚡" }
        ]
      },
      "order": 2
    },
    {
      "type": "steps",
      "title": "How to Use",
      "content": {
        "steps": [
          { "title": "Step title", "description": "Step description" }
        ]
      },
      "order": 3
    }
  ],
  "faq": [
    { "question": "Question?", "answer": "Detailed answer..." }
  ]
}`;
			break;

		case "niche":
			systemPrompt = `You are an expert SEO content writer for Viraloop, an AI influencer platform. Create comprehensive content about virtual influencer niches that educates and converts.`;
			userPrompt =
				customPrompt ||
				`Create content for a niche page about "${keyword}" AI influencers. Include:
1. A compelling hero explaining what ${keyword} AI influencers are
2. 3-4 main sections about creating, best practices, and examples
3. 6-8 key features or benefits of creating ${keyword} AI influencers
4. 5-step guide to creating ${keyword} AI influencers with Viraloop
5. 6 frequently asked questions

Target keywords: ${targetKeywords.join(", ") || keyword}

Return as JSON with the same structure as the tool template.`;
			break;

		case "use-case":
			systemPrompt = `You are an expert SEO content writer for Viraloop, an AI influencer platform. Create compelling use case content that demonstrates platform value.`;
			userPrompt =
				customPrompt ||
				`Create content for a use case page about "${keyword}". Include:
1. Hero explaining the use case and its value
2. 3-4 sections covering the problem, solution, and results
3. 5-7 key benefits or features
4. 4-6 step process
5. 5 FAQs

Target keywords: ${targetKeywords.join(", ") || keyword}

Return as JSON with the same structure as the tool template.`;
			break;

		case "blog":
			systemPrompt = `You are an expert blog writer for Viraloop, an AI influencer platform that helps users create virtual influencers for social media. Write in a conversational, engaging style that feels like a real person sharing knowledge with a friend.

CRITICAL WRITING GUIDELINES:
- Write 2-4 paragraphs per section, NOT just one paragraph per heading
- Vary paragraph lengths naturally (some 2-3 sentences, others 5-6 sentences)
- Use conversational transitions between paragraphs ("Here's the thing...", "What most people don't realize is...", "I've seen this work particularly well when...")
- Include occasional rhetorical questions to engage readers
- Never start consecutive paragraphs the same way
- Group related ideas under fewer headings instead of one paragraph per heading
- Make some sections longer than others - avoid uniform structure
- Share insights as if you're explaining to a colleague, not writing a textbook

IMPORTANT: When including code examples, you MUST create separate "code" type sections. NEVER put code blocks inside paragraph text.`;
			userPrompt =
				customPrompt ||
				`Write a comprehensive blog post about "${keyword}".

STRUCTURE REQUIREMENTS:
- 4-6 main sections (NOT 8+ tiny sections with one paragraph each)
- Each section MUST have 2-4 substantial paragraphs (this is critical - no single-paragraph sections)
- Introduction: 2-3 paragraphs that hook the reader and set context
- Conclusion: 2 paragraphs with key takeaways
- Total word count: 1500-2500 words

WRITING STYLE:
- Conversational and engaging, like explaining to a friend over coffee
- Use "you" and occasionally "we" to connect with readers
- Include personal insights, observations, or real-world examples
- Vary sentence structure and paragraph lengths throughout
- Add rhetorical questions naturally ("Ever wondered why...?", "What does this mean for you?")
- Avoid generic filler - every paragraph should add value

Include:
1. An engaging title and subtitle
2. Key takeaways woven naturally throughout (not as a separate list)
3. 4-6 FAQs at the end
4. Suggested category and 3-5 tags
5. Author info (use "Viraloop Team" as default)

Target keywords: ${targetKeywords.join(", ") || keyword}

Return as a JSON object with this structure:
{
  "metadata": {
    "title": "SEO-optimized title (max 60 chars)",
    "description": "Meta description (max 160 chars)",
    "keywords": ["keyword1", "keyword2", ...],
    "ogImage": "/images/blog/suggested-image-name.jpg"
  },
  "hero": {
    "title": "Blog post title",
    "subtitle": "Engaging subtitle",
    "featuredImage": "/images/blog/featured.jpg",
    "author": {
      "name": "Viraloop Team",
      "bio": "AI influencer creation experts"
    },
    "publishedAt": "${new Date().toISOString().split("T")[0]}",
    "category": "Suggested Category",
    "tags": ["tag1", "tag2", "tag3"]
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
      "title": "Section Title",
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
- Vary section lengths - some can be longer than others
- Code examples MUST be in separate sections with type "code"
- Paragraph sections should only contain plain text with markdown formatting`;
			break;

		default:
			throw new Error(`Unsupported template type: ${template}`);
	}

	// Call OpenAI API
	const completion = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userPrompt },
		],
		response_format: { type: "json_object" },
		temperature: 0.7,
		max_tokens: 4000,
	});

	const generatedContent = JSON.parse(completion.choices[0].message.content);

	return generatedContent;
}
