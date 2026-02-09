import { motion } from "framer-motion";

/**
 * Quote Section for Blog Posts
 * Renders pull quotes and blockquotes
 * Adapted for Viraloop's light theme
 */
export default function QuoteSection({ section }) {
	const { content } = section;

	return (
		<motion.section
			initial={{ opacity: 0, x: -15 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true, margin: "0px 0px -50px 0px" }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="mb-12"
		>
			<blockquote className="border-l-4 border-primary-500 pl-6 py-4 bg-primary-50 rounded-r-lg">
				<p className="text-xl text-dark-200 italic leading-relaxed mb-4">{content.quote}</p>
				{content.author && (
					<cite className="text-dark-400 not-italic">
						— {content.author}
						{content.authorTitle && <span className="text-dark-500">, {content.authorTitle}</span>}
					</cite>
				)}
			</blockquote>
		</motion.section>
	);
}
