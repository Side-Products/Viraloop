import { motion } from "framer-motion";

/**
 * Video Section for Blog Posts
 * Renders embedded videos (YouTube, Vimeo, etc.)
 * Adapted for Viraloop's light theme
 */
export default function VideoSection({ section }) {
	const { title, content } = section;

	const getEmbedUrl = (url) => {
		// YouTube
		if (url.includes("youtube.com") || url.includes("youtu.be")) {
			const videoId = url.includes("youtu.be") ? url.split("youtu.be/")[1] : new URL(url).searchParams.get("v");
			return `https://www.youtube.com/embed/${videoId}`;
		}

		// Vimeo
		if (url.includes("vimeo.com")) {
			const videoId = url.split("vimeo.com/")[1];
			return `https://player.vimeo.com/video/${videoId}`;
		}

		// Return as-is if already an embed URL
		return url;
	};

	return (
		<motion.section
			initial={{ opacity: 0, y: 15 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "0px 0px -50px 0px" }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="mb-12"
		>
			{title && <h3 className="text-2xl font-bold text-dark-100 mb-4">{title}</h3>}

			<div className="relative rounded-lg overflow-hidden border border-light-300 bg-light-200 shadow-sm">
				<div className="aspect-video">
					<iframe
						src={getEmbedUrl(content.url)}
						title={content.title || "Video"}
						className="w-full h-full"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				</div>
			</div>

			{content.caption && <p className="text-dark-400 text-sm mt-3 text-center italic">{content.caption}</p>}
		</motion.section>
	);
}
