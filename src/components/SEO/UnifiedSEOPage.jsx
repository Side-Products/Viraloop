import PageWrapper from "@/layout/PageWrapper";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";

/**
 * Check if the image URL is valid (not a placeholder path)
 */
function isValidImageUrl(url) {
	if (!url) return false;
	return url.startsWith("http://") || url.startsWith("https://");
}
import { ChevronRightIcon } from "@/components/ui/chevron-right";
import { ClockIcon } from "@/components/ui/clock";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { UserIcon } from "@/components/ui/user";
import { formatPublishDate, calculateReadingTime } from "@/lib/pseo/utils/blog-helpers";
import CTASection from "./CTASection";

/**
 * Smart function to apply gradient to key phrases in titles
 * Automatically detects and highlights important words/phrases
 * @param {string} title - The title text
 * @returns {JSX.Element} - Title with gradient applied to key phrase
 */
function applyTitleGradient(title) {
	if (!title) return null;

	// High-priority keywords (platform names, nouns) - prefer these
	const highPriorityKeywords = [
		"AI Influencer",
		"AI Influencers",
		"Virtual Influencer",
		"Virtual Influencers",
		"Virtual Creator",
		"Virtual Creators",
		"TikTok",
		"Instagram",
		"YouTube",
		"Social Media",
		"Content Creator",
		"Content Automation",
		"Viraloop",
	];

	// Medium-priority keywords (descriptive terms)
	const mediumPriorityKeywords = ["Complete Guide", "Ultimate Guide", "Content Guide", "Creator", "Success", "Tutorial", "Master", "Automation"];

	const words = title.split(" ");
	let bestMatch = { start: -1, length: 0, priority: -1 };

	// Strategy 1: Look for high-priority keyword phrases (prefer later in title)
	for (let i = 0; i < words.length; i++) {
		const twoWords = i < words.length - 1 ? words.slice(i, i + 2).join(" ") : "";
		const threeWords = i < words.length - 2 ? words.slice(i, i + 3).join(" ") : "";

		// Check 3-word phrases with high priority
		if (threeWords && highPriorityKeywords.some((kw) => threeWords.toLowerCase() === kw.toLowerCase())) {
			if (bestMatch.priority < 3 || (bestMatch.priority === 3 && i > bestMatch.start)) {
				bestMatch = { start: i, length: 3, priority: 3 };
			}
		}
		// Check 2-word phrases with high priority
		else if (twoWords && highPriorityKeywords.some((kw) => twoWords.toLowerCase() === kw.toLowerCase())) {
			if (bestMatch.priority < 3 || (bestMatch.priority === 3 && i > bestMatch.start)) {
				bestMatch = { start: i, length: 2, priority: 3 };
			}
		}
		// Check 3-word phrases with medium priority
		else if (threeWords && mediumPriorityKeywords.some((kw) => threeWords.toLowerCase().includes(kw.toLowerCase()))) {
			if (bestMatch.priority < 2) {
				bestMatch = { start: i, length: 3, priority: 2 };
			}
		}
		// Check 2-word phrases with medium priority
		else if (twoWords && mediumPriorityKeywords.some((kw) => twoWords.toLowerCase().includes(kw.toLowerCase()))) {
			if (bestMatch.priority < 2) {
				bestMatch = { start: i, length: 2, priority: 2 };
			}
		}
	}

	// Strategy 2: If no keyword match, highlight last 2-3 words (noun phrases tend to be at the end)
	if (bestMatch.start === -1 && words.length >= 4) {
		bestMatch = { start: words.length - 3, length: 3, priority: 0 };
	} else if (bestMatch.start === -1 && words.length >= 2) {
		bestMatch = { start: words.length - 2, length: 2, priority: 0 };
	}

	// If title is too short, return plain title
	if (bestMatch.start === -1) {
		return <>{title}</>;
	}

	// Build the title with gradient
	const beforeHighlight = words.slice(0, bestMatch.start).join(" ");
	const highlightText = words.slice(bestMatch.start, bestMatch.start + bestMatch.length).join(" ");
	const afterHighlight = words.slice(bestMatch.start + bestMatch.length).join(" ");

	return (
		<>
			{beforeHighlight && <>{beforeHighlight} </>}
			<span className="bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">{highlightText}</span>
			{afterHighlight && <> {afterHighlight}</>}
		</>
	);
}

/**
 * Unified SEO Page Component
 * Handles all pSEO templates with template-based customization
 * Supports: tool, niche, use-case, comparison, tutorial, guide, blog
 * Adapted for Viraloop's light theme
 */
export default function UnifiedSEOPage({ page, children, breadcrumbs, relatedContent = [] }) {
	const { template } = page;
	const isBlog = template === "blog";
	const { hero } = page.content || {};

	// Blog-specific data
	const readingTime = isBlog ? calculateReadingTime(page.content.sections) : null;

	// Use compact container for all templates (no extra padding)
	const useDefaultContainer = false;

	return (
		<PageWrapper useDefaultContainer={useDefaultContainer}>
			<div className="min-h-screen bg-light-100">
				{/* Breadcrumbs */}
				{breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs breadcrumbs={breadcrumbs} template={template} />}

				{/* Hero Section - Template-specific styling */}
				{isBlog ? <BlogHero hero={hero} readingTime={readingTime} /> : <ProductHero hero={hero} />}

				{/* Main Content */}
				<article className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
					{/* Blog: Featured Image */}
					{isBlog && isValidImageUrl(hero?.featuredImage) && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="mb-16 rounded-xl overflow-hidden border border-light-300 shadow-xl"
						>
							<Image src={hero.featuredImage} alt={hero?.title || "Blog post"} width={1200} height={630} className="w-full h-auto" priority />
						</motion.div>
					)}

					{/* Content Sections */}
					<div
						className={`prose prose-lg max-w-none
							prose-headings:font-bold prose-headings:tracking-tight
							prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-dark-100
							prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-dark-100
							prose-p:text-dark-400 prose-p:leading-relaxed prose-p:mb-6
							prose-a:text-primary-500 prose-a:no-underline hover:prose-a:text-primary-600
							prose-strong:text-dark-100 prose-strong:font-semibold
							prose-ul:text-dark-400 prose-ol:text-dark-400
							prose-li:marker:text-primary-500
							prose-code:text-primary-600 prose-code:bg-light-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
							prose-pre:bg-light-200 prose-pre:border prose-pre:border-light-300
							prose-img:rounded-lg prose-img:border prose-img:border-light-300
							prose-blockquote:border-l-primary-500 prose-blockquote:bg-light-200 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r`}
					>
						{children}
					</div>

					{/* Blog: Tags */}
					{isBlog && hero.tags && hero.tags.length > 0 && (
						<div className="mt-16 pt-8 border-t border-light-300">
							<div className="flex flex-wrap gap-2">
								{hero.tags.map((tag, index) => (
									<span
										key={index}
										className="px-3 py-1.5 bg-light-200 text-dark-400 rounded-lg text-sm hover:bg-light-300 transition-colors"
									>
										#{tag}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Blog: Author Bio */}
					{isBlog && hero.author?.bio && (
						<div className="my-10 p-6 md:p-8 bg-light-200 rounded-xl border border-light-300">
							<div className="flex items-start gap-4 md:gap-6">
								{hero.author.avatar && (
									<Image
										src={hero.author.avatar}
										alt={hero.author.name}
										width={80}
										height={80}
										className="rounded-full ring-2 ring-light-300"
									/>
								)}
								<div className="flex-1">
									<h3 className="text-xl font-bold text-dark-100 mb-2">About {hero.author.name}</h3>
									<p className="text-dark-400 leading-relaxed">{hero.author.bio}</p>
								</div>
							</div>
						</div>
					)}
				</article>

				{/* Related Content (Posts or Pages) */}
				{relatedContent && relatedContent.length > 0 && <RelatedContent content={relatedContent} template={template} />}

				{/* FAQ Section */}
				{page.content.faq && page.content.faq.length > 0 && <FAQSection faqs={page.content.faq} template={template} />}

				{/* CTA Section */}
				<CTASection />
			</div>
		</PageWrapper>
	);
}

/**
 * Breadcrumbs Component - Unified modern styling for all templates
 */
function Breadcrumbs({ breadcrumbs }) {
	return (
		<div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
			<div className="pt-32 pb-4 border-b border-light-300">
				<nav className="flex items-center space-x-2 text-sm">
					{breadcrumbs.map((crumb, index) => (
						<div key={index} className="flex items-center">
							{index > 0 && <ChevronRightIcon size={14} className="mx-1.5 text-dark-500" />}
							{index === breadcrumbs.length - 1 ? (
								<span className="text-dark-400 font-medium">{crumb.name}</span>
							) : (
								<Link href={crumb.path} className="text-dark-500 hover:text-primary-500 transition-colors">
									{crumb.name}
								</Link>
							)}
						</div>
					))}
				</nav>
			</div>
		</div>
	);
}

/**
 * Blog Hero - Article-style hero with author, date, reading time
 */
function BlogHero({ hero, readingTime }) {
	return (
		<article className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
			<div className="pt-12 pb-8">
				{/* Category Badge */}
				{hero.category && (
					<span className="inline-flex items-center mb-6 px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium border border-primary-200">
						{hero.category}
					</span>
				)}

				{/* Title */}
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark-100 mb-6 leading-[1.1] tracking-tight"
				>
					{applyTitleGradient(hero.title)}
				</motion.h1>

				{/* Subtitle */}
				{hero.subtitle && (
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-lg md:text-xl text-dark-400 mb-8 leading-relaxed"
					>
						{hero.subtitle}
					</motion.p>
				)}

				{/* Meta Information */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex flex-wrap items-center gap-4 mb-10 pb-8 border-b border-light-300"
				>
					{/* Author */}
					{hero.author && (
						<div className="flex items-center space-x-2.5 text-sm">
							{hero.author.avatar && (
								<Image
									src={hero.author.avatar}
									alt={hero.author.name}
									width={40}
									height={40}
									className="rounded-full ring-2 ring-light-300"
								/>
							)}
							{!hero.author.avatar && <UserIcon size={20} className="text-dark-500" />}
							<span className="text-dark-300 font-medium">{hero.author.name}</span>
						</div>
					)}

					{/* Publish Date */}
					{hero.publishedAt && (
						<div className="flex items-center space-x-2 text-sm text-dark-500">
							<CalendarDaysIcon size={16} />
							<span>{formatPublishDate(hero.publishedAt)}</span>
						</div>
					)}

					{/* Reading Time */}
					{readingTime && (
						<div className="flex items-center space-x-2 text-sm text-dark-500">
							<ClockIcon size={16} />
							<span>{readingTime}</span>
						</div>
					)}
				</motion.div>
			</div>
		</article>
	);
}

/**
 * Product Hero - Modern landing page-style hero with CTA (matches blog design)
 */
function ProductHero({ hero }) {
	return (
		<article className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
			<div className="pt-12 pb-8">
				{/* Category Badge (if available) */}
				{hero.category && (
					<div className="inline-flex items-center mb-6 px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium border border-primary-200">
						{hero.category}
					</div>
				)}

				{/* Title */}
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark-100 mb-6 leading-[1.1] tracking-tight"
				>
					{applyTitleGradient(hero.title)}
				</motion.h1>

				{/* Subtitle */}
				{hero.subtitle && (
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-lg md:text-xl text-dark-400 mb-8 leading-relaxed"
					>
						{hero.subtitle}
					</motion.p>
				)}

				{/* CTA Button */}
				{hero.cta && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="mb-10 pb-8 border-b border-light-300"
					>
						<Link
							href={hero.cta.url}
							className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105 overflow-hidden"
						>
							{/* Animated shine effect */}
							<span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>

							<span className="relative z-10 flex items-center">
								{hero.cta.text}
								<ChevronRightIcon size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
							</span>
						</Link>
					</motion.div>
				)}
			</div>
		</article>
	);
}

/**
 * Related Content - Handles both blog posts and pSEO pages
 */
function RelatedContent({ content, template }) {
	const isBlog = template === "blog";
	const title = isBlog ? "Related Articles" : "Related Resources";

	if (isBlog) {
		return (
			<section className="container mx-auto px-4 md:px-6 lg:px-8 py-20 border-t border-light-300 max-w-5xl">
				<h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-10">{title}</h2>
				<div className="grid md:grid-cols-3 gap-6">
					{content.slice(0, 3).map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
						>
							<Link
								href={`/${item.slug}`}
								className="block p-6 bg-white rounded-xl border border-light-300 hover:border-primary-500/50 transition-all group h-full shadow-sm hover:shadow-md"
							>
								<h3 className="text-lg font-bold text-dark-100 mb-3 group-hover:text-primary-500 transition-colors">
									{item.metadata?.title || item.content?.hero?.title}
								</h3>
								<p className="text-dark-400 text-sm line-clamp-3 leading-relaxed">{item.metadata?.description}</p>
							</Link>
						</motion.div>
					))}
				</div>
			</section>
		);
	}

	return (
		<section className="container mx-auto px-4 py-16 border-t border-light-300">
			<h2 className="text-3xl font-bold text-dark-100 mb-8">{title}</h2>
			<div className="grid md:grid-cols-3 gap-6">
				{content.map((item, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: index * 0.1 }}
					>
						<Link
							href={`/${item.slug}`}
							className="block p-6 bg-white rounded-lg border border-light-300 hover:border-primary-500 transition group shadow-sm hover:shadow-md"
						>
							<h3 className="text-xl font-semibold text-dark-100 mb-2 group-hover:text-primary-500 transition">
								{item.title || item.metadata?.title}
							</h3>
							{item.description && <p className="text-dark-400 text-sm">{item.description}</p>}
						</Link>
					</motion.div>
				))}
			</div>
		</section>
	);
}

/**
 * FAQ Section - Interactive accordion with template-aware styling
 */
function FAQSection({ faqs, template }) {
	const [openIndex, setOpenIndex] = useState(null);

	const containerClass = "container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 border-t border-light-300 max-w-5xl";

	const toggleFAQ = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className={containerClass}>
			{/* Section Header */}
			<div className="text-center mb-12">
				<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block mb-4">
					<span className="inline-flex items-center px-4 py-1.5 bg-primary-100 text-primary-600 rounded-full text-sm font-medium border border-primary-200">
						FAQ
					</span>
				</motion.div>
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-100 mb-4"
				>
					Frequently Asked Questions
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
					className="text-lg text-dark-400 max-w-2xl mx-auto"
				>
					Find answers to common questions about our platform
				</motion.p>
			</div>

			{/* FAQ Accordion */}
			<div className="max-w-3xl mx-auto space-y-4">
				{faqs.map((faq, index) => {
					const isOpen = openIndex === index;

					return (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.05 }}
							className={`group bg-white rounded-xl border border-light-300 overflow-hidden transition-all duration-300 hover:border-primary-500/30 ${isOpen ? "shadow-lg shadow-primary-500/10" : "shadow-sm"}`}
						>
							{/* Question Button */}
							<button
								onClick={() => toggleFAQ(index)}
								className="w-full text-left p-6 md:p-7 flex items-start justify-between gap-4 transition-all duration-200"
							>
								<div className="flex-1">
									<h3
										className={`text-lg md:text-xl font-semibold transition-colors ${
											isOpen ? "text-primary-500" : "text-dark-100 group-hover:text-primary-500"
										}`}
									>
										{faq.question}
									</h3>
								</div>

								{/* Icon */}
								<div
									className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
										isOpen
											? "bg-primary-500 text-white rotate-180"
											: "bg-light-200 text-dark-400 group-hover:bg-primary-100 group-hover:text-primary-500"
									}`}
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</div>
							</button>

							{/* Answer */}
							<motion.div
								initial={false}
								animate={{
									height: isOpen ? "auto" : 0,
									opacity: isOpen ? 1 : 0,
								}}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className="overflow-hidden"
							>
								<div className={`px-6 md:px-7 pb-6 md:pb-7 pt-0 text-dark-400 leading-relaxed text-[15px] md:text-base`}>{faq.answer}</div>
							</motion.div>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}
