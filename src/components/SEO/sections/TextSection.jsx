import { motion } from "framer-motion";

/**
 * Text Section Component for SEO Pages
 * Renders formatted text content with proper typography
 * Adapted for Viraloop's light theme
 */
export default function TextSection({ section }) {
	const { title, content } = section;

	return (
		<motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
			{title && <h2 className="text-3xl font-bold text-dark-100 mb-6">{title}</h2>}

			<div className="prose prose-lg max-w-none">
				{content.text && <div className="text-dark-300 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: formatText(content.text) }} />}

				{content.highlights && content.highlights.length > 0 && (
					<div className="grid md:grid-cols-2 gap-6 mt-8">
						{content.highlights.map((highlight, index) => (
							<div key={index} className="bg-primary-50 border border-primary-200 rounded-lg p-6">
								{highlight.icon && <div className="text-4xl mb-3">{highlight.icon}</div>}
								<h3 className="text-xl font-semibold text-primary-600 mb-2">{highlight.title}</h3>
								<p className="text-dark-300">{highlight.description}</p>
							</div>
						))}
					</div>
				)}
			</div>
		</motion.section>
	);
}

/**
 * Format plain text to HTML with paragraphs
 */
function formatText(text) {
	if (!text) return "";

	// Split by double newlines for paragraphs
	const paragraphs = text
		.split("\n\n")
		.filter((p) => p.trim())
		.map((p) => `<p>${p.trim()}</p>`)
		.join("");

	return paragraphs;
}
