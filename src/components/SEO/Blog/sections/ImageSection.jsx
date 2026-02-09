import { motion } from "framer-motion";
import Image from "next/image";

/**
 * Image Section for Blog Posts
 * Renders optimized images with captions
 * Adapted for Viraloop's light theme
 */
export default function ImageSection({ section }) {
	const { content } = section;

	// Support both 'src' and 'url' fields for backwards compatibility
	const imageUrl = content.url || content.src;

	// Don't render if no valid image URL
	if (!imageUrl || imageUrl === "" || imageUrl === null) {
		return null;
	}

	return (
		<motion.section
			initial={{ opacity: 0, y: 15 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "0px 0px -50px 0px" }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="mb-12"
		>
			<div className="relative rounded-lg overflow-hidden border border-light-300 shadow-sm">
				<Image
					src={imageUrl}
					alt={content.alt || "Blog post image"}
					width={content.width || 1200}
					height={content.height || 630}
					className="w-full h-auto"
					priority={content.priority || false}
				/>
			</div>

			{content.caption && <p className="text-dark-400 text-sm mt-3 text-center italic">{content.caption}</p>}
		</motion.section>
	);
}
