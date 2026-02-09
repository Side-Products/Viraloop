import { useState } from "react";
import Head from "next/head";
import PageWrapper from "@/layout/PageWrapper";
import BlogListItem from "@/components/SEO/Blog/BlogListItem";
import { seoDataLayer } from "@/lib/pseo/core/data-layer";
import { extractCategories } from "@/lib/pseo/utils/blog-helpers";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Check if the image URL is valid (not a placeholder path)
 */
function isValidImageUrl(url) {
	if (!url) return false;
	return url.startsWith("http://") || url.startsWith("https://");
}
import { SearchIcon } from "@/components/ui/search";
import { SparklesIcon } from "@/components/ui/sparkles";
import { ChevronRightIcon } from "@/components/ui/chevron-right";
import { Filter } from "lucide-react";
import CTASection from "@/components/SEO/CTASection";

/**
 * Modern Blog Listing Page
 * Interactive blog display with search, filters, and animations
 * Adapted for Viraloop's light theme
 */
export default function BlogIndexPage({ posts, categories, currentPage, totalPages, featuredPost }) {
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Filter posts by category and search
	const filteredPosts = posts.filter((post) => {
		const matchesCategory = selectedCategory === "all" || post.content.hero?.category === selectedCategory;
		const matchesSearch =
			searchQuery === "" ||
			post.content.hero?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesCategory && matchesSearch;
	});

	return (
		<>
			<Head>
				<title>Blog - Viraloop AI Influencer Platform</title>
				<meta name="description" content="Learn about AI influencers, content automation, tips, tutorials, and insights from the Viraloop team." />
				<meta name="keywords" content="blog, ai influencers, tutorials, guides, content creation, virtual creators" />
				<meta property="og:title" content="Blog - Viraloop" />
				<meta property="og:description" content="Learn about AI influencers and content automation." />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://viraloop.io/blog" />
			</Head>

			<div className="min-h-screen bg-gradient-to-b from-light-100 via-white to-light-100">
				{/* Background decoration - spans hero and featured section */}
				<div className="absolute top-0 left-0 right-0 h-[900px] overflow-hidden pointer-events-none">
					<div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
					<div className="absolute top-1/2 -translate-y-1/2 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
				</div>

				{/* Hero Header */}
				<section className="relative pt-32 pb-20 overflow-hidden">
					<div className="relative z-10 container mx-auto">
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
							{/* Badge */}
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: 0.1 }}
								className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-6 border border-primary-200"
							>
								<SparklesIcon size={16} />
								<span>Insights & Tutorials</span>
							</motion.div>

							{/* Title */}
							<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6 tracking-tight">
								Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-400">Blog</span>
							</h1>

							{/* Subtitle */}
							<p className="text-xl md:text-2xl text-neutral-500 mb-10 leading-relaxed">
								Learn about AI influencers, content automation, tips, tutorials, and insights from our team.
							</p>

							{/* Search Bar */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="max-w-2xl mx-auto"
							>
								<div className="relative">
									<SearchIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
									<input
										type="text"
										placeholder="Search articles..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full pl-12 pr-4 py-4 bg-white border border-light-300 rounded-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition shadow-sm"
									/>
								</div>
							</motion.div>
						</motion.div>
					</div>
				</section>

				{/* Featured Post */}
				{featuredPost && selectedCategory === "all" && searchQuery === "" && (
					<section className="container mx-auto pb-16 pt-8">
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
							<div className="flex items-center gap-2 mb-6">
								<SparklesIcon size={20} className="text-primary-500" />
								<h2 className="text-2xl font-bold text-neutral-900">Featured Article</h2>
							</div>
							<Link
								href={`/${featuredPost.slug}`}
								className="group block relative overflow-hidden bg-gradient-to-br from-white to-light-100 rounded-2xl border border-light-300 hover:border-primary-500/50 transition-all duration-300 shadow-sm hover:shadow-lg"
							>
								<div className="grid md:grid-cols-2 gap-8 p-8 md:p-10">
									{/* Content */}
									<div className="flex flex-col justify-center">
										{featuredPost.content.hero?.category && (
											<span className="inline-block mb-4 px-4 py-1.5 bg-primary-100 text-primary-600 rounded-full text-sm font-medium w-fit border border-primary-200">
												{featuredPost.content.hero.category}
											</span>
										)}
										<h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 group-hover:text-primary-500 transition">
											{featuredPost.content.hero?.title || featuredPost.metadata.title}
										</h3>
										<p className="text-lg text-neutral-500 mb-6 line-clamp-3">{featuredPost.metadata.description}</p>
										<div className="flex items-center text-primary-500 font-semibold group-hover:gap-2 transition-all">
											Read Article
											<ChevronRightIcon size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
										</div>
									</div>

									{/* Image */}
									{isValidImageUrl(featuredPost.content.hero?.featuredImage) ? (
										<div className="relative aspect-video md:aspect-square rounded-xl overflow-hidden">
											<Image
												src={featuredPost.content.hero.featuredImage}
												alt={featuredPost.content.hero?.title || "Featured post"}
												fill
												className="object-cover group-hover:scale-105 transition-transform duration-500"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-light-100/50 to-transparent"></div>
										</div>
									) : (
										<div className="relative aspect-video md:aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
											<div className="text-primary-400 text-8xl font-bold opacity-30">
												{(featuredPost.content.hero?.title || "V").charAt(0).toUpperCase()}
											</div>
										</div>
									)}
								</div>
							</Link>
						</motion.div>
					</section>
				)}

				{/* Filters & View Toggle */}
				<section className="container mx-auto pb-8">
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm">
						{/* Category Pills */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4 }}
							className="flex items-center gap-3 flex-wrap"
						>
							<Filter className="w-5 h-5 text-neutral-400 hidden md:block" />
							<button
								onClick={() => setSelectedCategory("all")}
								className={`px-4 py-1.5 rounded-sm font-medium transition-all ${
									selectedCategory === "all"
										? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
										: "bg-white text-neutral-500 hover:bg-light-200 hover:text-neutral-900 border border-light-300"
								}`}
							>
								All ({posts.length})
							</button>
							{categories.map((category) => (
								<button
									key={category.name}
									onClick={() => setSelectedCategory(category.name)}
									className={`px-4 py-1.5 rounded-sm font-medium transition-all ${
										selectedCategory === category.name
											? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
											: "bg-white text-neutral-500 hover:bg-light-200 hover:text-neutral-900 border border-light-300"
									}`}
								>
									{category.name} ({category.count})
								</button>
							))}
						</motion.div>

						{/* Results count */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4 }}
							className="text-neutral-400 text-sm"
						>
							{filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
						</motion.div>
					</div>
				</section>

				{/* Blog Posts Grid */}
				<section className="container mx-auto pb-10">
					<AnimatePresence mode="wait">
						{filteredPosts.length > 0 ? (
							<motion.div
								key="posts-grid"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
							>
								{filteredPosts.map((post, index) => (
									<BlogListItem key={post.slug} post={post} index={index} />
								))}
							</motion.div>
						) : (
							<motion.div
								key="no-posts"
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								className="text-center py-20"
							>
								<div className="max-w-md mx-auto">
									<div className="w-16 h-16 bg-light-200 rounded-full flex items-center justify-center mx-auto mb-4">
										<SearchIcon size={32} className="text-neutral-400" />
									</div>
									<h3 className="text-2xl font-bold text-neutral-900 mb-2">No articles found</h3>
									<p className="text-neutral-500 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
									<button
										onClick={() => {
											setSearchQuery("");
											setSelectedCategory("all");
										}}
										className="px-6 py-3 bg-primary-500 text-white rounded-sm font-semibold hover:bg-primary-600 transition"
									>
										Clear Filters
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Pagination */}
					{totalPages > 1 && filteredPosts.length > 0 && (
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-2 mt-16">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
								<Link
									key={page}
									href={page === 1 ? "/blog" : `/blog/page/${page}`}
									className={`px-4 py-2 rounded-sm transition-all font-medium ${
										page === currentPage
											? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
											: "bg-white text-neutral-500 hover:bg-light-200 hover:text-neutral-900 border border-light-300"
									}`}
								>
									{page}
								</Link>
							))}
						</motion.div>
					)}
				</section>

				{/* CTA Section */}
				<CTASection />
			</div>
		</>
	);
}

export async function getStaticProps() {
	try {
		// Get all blog posts (no limit - show all)
		const blogPosts = await seoDataLayer.getPagesByTemplate("blog", {
			sortBy: "-createdAt", // Sort by creation date (Mongoose default field)
		});

		// Get all niche pages (no limit - show all)
		const nichePosts = await seoDataLayer.getPagesByTemplate("niche", {
			sortBy: "-createdAt",
		});

		// Get all use case pages (no limit - show all)
		const useCasePosts = await seoDataLayer.getPagesByTemplate("use-case", {
			sortBy: "-createdAt",
		});

		// Add "Niche" category to niche posts
		const nichePostsWithCategory = nichePosts.map((post) => ({
			...post,
			content: {
				...post.content,
				hero: {
					...post.content.hero,
					category: "Niche",
				},
			},
		}));

		// Add "Use Case" category to use case posts
		const useCasePostsWithCategory = useCasePosts.map((post) => ({
			...post,
			content: {
				...post.content,
				hero: {
					...post.content.hero,
					category: "Use Case",
				},
			},
		}));

		// Combine all posts - no pagination, show all
		const allPosts = [...blogPosts, ...nichePostsWithCategory, ...useCasePostsWithCategory];

		// Extract categories
		const categories = extractCategories(allPosts);

		// Get featured post (most recent blog post)
		const featuredPost = blogPosts[4] || null;

		return {
			props: {
				posts: JSON.parse(JSON.stringify(allPosts)), // Return all posts without pagination
				categories,
				currentPage: 1,
				totalPages: 1, // Single page with all posts
				featuredPost: featuredPost ? JSON.parse(JSON.stringify(featuredPost)) : null,
			},
			revalidate: 60, // Revalidate every 60 seconds for faster updates
		};
	} catch (error) {
		console.error("Error in getStaticProps:", error);
		return {
			props: {
				posts: [],
				categories: [],
				currentPage: 1,
				totalPages: 1,
				featuredPost: null,
			},
			revalidate: 300,
		};
	}
}
