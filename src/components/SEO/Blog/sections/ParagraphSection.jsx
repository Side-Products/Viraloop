import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
// Import language support
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-markup-templating"; // Required for PHP
import "prismjs/components/prism-php";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import { formatMarkdown, slugify } from "@/lib/markdown/formatMarkdown";

/**
 * Paragraph Section for Blog Posts
 * Renders rich text paragraphs with proper formatting
 * Adapted for Viraloop's light theme
 */
export default function ParagraphSection({ section }) {
	const { title, content } = section;
	const contentRef = useRef(null);

	// Use pre-rendered HTML from server if available (SSR/SSG - good for SEO!)
	// Otherwise fallback to client-side rendering (for backward compatibility)
	const htmlContent = content.html || formatMarkdown(content.text);

	useEffect(() => {
		if (contentRef.current) {
			// Apply syntax highlighting to code blocks (client-side only for visual enhancement)
			const codeBlocks = contentRef.current.querySelectorAll("pre code[class*='language-']");
			codeBlocks.forEach((block) => {
				try {
					Prism.highlightElement(block);
				} catch (error) {
					console.warn("Failed to highlight code block:", error);
					// Code will still display, just without syntax highlighting
				}
			});
		}
	}, []); // Run once on mount - HTML is already rendered

	return (
		<motion.section
			initial={{ opacity: 0, y: 15 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "0px 0px -50px 0px" }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="mb-12"
		>
			{title && (
				<h2 id={slugify(title)} className="text-3xl font-bold text-dark-100 mb-6">
					{title}
				</h2>
			)}

			<div ref={contentRef} className="prose prose-lg max-w-none">
				<div className="text-dark-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />
			</div>
		</motion.section>
	);
}
