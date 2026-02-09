import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { CopyIcon } from "@/components/ui/copy";
import { CheckIcon } from "@/components/ui/check";
import Prism from "prismjs";
import "prismjs/themes/prism.css"; // Light theme
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

/**
 * Code Section for Blog Posts
 * Renders code blocks with syntax highlighting and copy button
 * Adapted for Viraloop's light theme
 */
export default function CodeSection({ section }) {
	const { title, content } = section;
	const [copied, setCopied] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const codeRef = useRef(null);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (isClient && codeRef.current) {
			try {
				Prism.highlightElement(codeRef.current);
			} catch (error) {
				console.warn("Failed to highlight code block:", error);
				// Code will still display, just without syntax highlighting
			}
		}
	}, [content.code, isClient]);

	const handleCopy = () => {
		navigator.clipboard.writeText(content.code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// Normalize language name to match Prism's naming conventions
	const normalizeLanguage = (lang) => {
		if (!lang) return "plaintext";
		const langMap = {
			js: "javascript",
			ts: "typescript",
			py: "python",
			rb: "ruby",
			sh: "bash",
			yml: "yaml",
		};
		const normalized = lang.toLowerCase().trim();
		return langMap[normalized] || normalized;
	};

	const language = normalizeLanguage(content.language);

	return (
		<motion.section
			initial={{ opacity: 0, y: 15 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "0px 0px -50px 0px" }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="mb-12"
		>
			{title && <h3 className="text-2xl font-bold text-dark-100 mb-4">{title}</h3>}

			<div className="relative">
				{/* Language badge and copy button */}
				<div className="flex items-center justify-between bg-light-200 rounded-t-lg px-4 py-2 border-b border-light-300">
					{content.language && <span className="text-sm text-dark-400 font-mono uppercase">{content.language}</span>}
					<button onClick={handleCopy} className="flex items-center space-x-2 text-dark-400 hover:text-dark-100 transition">
						{copied ? (
							<>
								<CheckIcon size={16} />
								<span className="text-sm">Copied!</span>
							</>
						) : (
							<>
								<CopyIcon size={16} />
								<span className="text-sm">Copy</span>
							</>
						)}
					</button>
				</div>

				{/* Code block with syntax highlighting */}
				<pre className="bg-light-100 rounded-b-lg p-4 overflow-x-auto border border-light-300" suppressHydrationWarning>
					<code ref={codeRef} className={`language-${language} text-sm font-mono leading-relaxed block`} suppressHydrationWarning>
						{content.code}
					</code>
				</pre>
			</div>

			{content.caption && <p className="text-dark-400 text-sm mt-2 italic">{content.caption}</p>}
		</motion.section>
	);
}
