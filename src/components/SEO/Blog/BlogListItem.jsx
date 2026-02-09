import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { ClockIcon } from "@/components/ui/clock";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { ChevronRightIcon } from "@/components/ui/chevron-right";
import { formatPublishDate, calculateReadingTime, generateExcerpt } from "@/lib/pseo/utils/blog-helpers";

/**
 * Check if the image URL is valid (not a placeholder path)
 */
function isValidImageUrl(url) {
	if (!url) return false;
	// Check if it's a real URL (starts with http/https) not a placeholder path
	return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Blog List Item Component
 * Card component for displaying blog post previews in listings
 * Adapted for Viraloop's light theme
 */
export default function BlogListItem({ post, index = 0 }) {
	const { hero } = post.content || {};
	const readingTime = calculateReadingTime(post.content?.sections);
	const excerpt = generateExcerpt(post.content?.sections, 140);
	const [imageError, setImageError] = useState(false);

	// Check if featured image is valid
	const hasValidImage = isValidImageUrl(hero?.featuredImage) && !imageError;

	return (
		<motion.article
			initial={{ opacity: 0, y: 15 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "0px 0px -50px 0px" }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="group h-full"
		>
			<Link
				href={`/${post.slug}`}
				className="flex flex-col h-full bg-white rounded-xl border border-light-300 hover:border-primary-500 transition overflow-hidden relative shadow-sm hover:shadow-md"
			>
				{/* Featured Image */}
				{hasValidImage ? (
					<div className="relative aspect-video overflow-hidden bg-light-200 flex-shrink-0">
						<Image
							src={hero.featuredImage}
							alt={hero.title || post.metadata.title}
							fill
							className="object-cover group-hover:scale-105 transition duration-300"
							onError={() => setImageError(true)}
						/>
					</div>
				) : (
					<div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex-shrink-0 flex items-center justify-center">
						<div className="text-primary-400 text-6xl font-bold opacity-30">
							{(hero?.title || post.metadata.title || "V").charAt(0).toUpperCase()}
						</div>
					</div>
				)}

				<div className="p-6 flex flex-col flex-grow">
					{/* Title */}
					<h2 className="text-2xl font-bold text-dark-100 mb-3 group-hover:text-primary-500 transition line-clamp-2">
						{hero?.title || post.metadata.title}
					</h2>

					{/* Excerpt */}
					<p className="text-dark-400 mb-4 line-clamp-3 flex-grow">{excerpt || post.metadata.description}</p>

					{/* Tags */}
					{hero?.tags && hero.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-4">
							{hero.tags.slice(0, 3).map((tag, idx) => (
								<span key={idx} className="px-2 py-1 bg-light-200 text-dark-400 rounded text-xs border border-light-300">
									{tag}
								</span>
							))}
						</div>
					)}

					{/* Meta Information */}
					<div className="flex items-center gap-4 text-sm text-dark-500 mb-4">
						{hero?.publishedAt && (
							<div className="flex items-center space-x-1">
								<CalendarDaysIcon size={16} />
								<span>{formatPublishDate(hero.publishedAt, { style: "short" })}</span>
							</div>
						)}
						<div className="flex items-center space-x-1">
							<ClockIcon size={16} />
							<span>{readingTime}</span>
						</div>
					</div>

					{/* Read More Link */}
					<div className="flex items-center text-primary-500 font-medium group-hover:text-primary-600 mt-auto">
						Read More
						<ChevronRightIcon size={16} className="ml-1 group-hover:translate-x-1 transition" />
					</div>
				</div>

				{/* Category Badge - Bottom Right */}
				{hero?.category && (
					<span className="absolute bottom-4 right-4 px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium border border-primary-200">
						{hero.category}
					</span>
				)}
			</Link>
		</motion.article>
	);
}
