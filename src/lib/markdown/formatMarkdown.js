/**
 * Markdown Formatting Utility
 * Server-safe markdown to HTML converter for blog posts
 * Can be used in both Next.js getStaticProps (server) and React components (client)
 * Customized for Viraloop's light theme
 */

/**
 * Convert markdown-style formatting to HTML
 * @param {string} text - Raw markdown text
 * @returns {string} - Formatted HTML
 */
export function formatMarkdown(text) {
	if (!text) return "";

	let html = text;
	const placeholders = [];
	let placeholderIndex = 0;

	// Step 1: Extract and replace code blocks with placeholders
	html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
		const lang = normalizeLanguage(language);
		const escapedCode = escapeHtml(code.trim());
		const codeBlockHtml = `<div class="code-block-wrapper my-6">
			<div class="flex items-center justify-between bg-light-200 rounded-t-lg px-4 py-2 border-b border-light-300">
				<span class="text-sm text-dark-400 font-mono uppercase">${language || "plaintext"}</span>
			</div>
			<pre class="bg-light-100 rounded-b-lg p-4 overflow-x-auto border border-light-300 !mt-0"><code class="language-${lang} text-sm font-mono leading-relaxed block text-dark-200">${escapedCode}</code></pre>
		</div>`;
		const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
		placeholders[placeholderIndex] = codeBlockHtml;
		placeholderIndex++;
		return placeholder;
	});

	// Step 2: Process inline markdown (these won't affect code blocks)
	// Headers
	html = html.replace(/^### (.+)$/gm, '<h3 class="text-2xl font-bold text-dark-100 mt-8 mb-4">$1</h3>');
	html = html.replace(/^## (.+)$/gm, '<h2 class="text-3xl font-bold text-dark-100 mt-10 mb-6">$1</h2>');

	// Bold
	html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-dark-100 font-semibold">$1</strong>');

	// Italic (but not bold)
	html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em class="italic">$1</em>');

	// Inline code
	html = html.replace(/`([^`]+?)`/g, '<code class="bg-light-200 text-primary-600 px-2 py-1 rounded text-sm">$1</code>');

	// Links
	html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary-500 hover:text-primary-600 underline">$1</a>');

	// Step 3: Process paragraphs (split by double newlines)
	const sections = html.split("\n\n");
	const processedSections = sections.map((section) => {
		const trimmed = section.trim();
		if (!trimmed) return "";
		// Don't wrap if it's a placeholder, header, or already HTML
		if (trimmed.startsWith("__CODE_BLOCK_") || trimmed.startsWith("<h") || trimmed.startsWith("<div")) {
			return trimmed;
		}
		return `<p class="mb-4">${trimmed}</p>`;
	});

	html = processedSections.join("");

	// Step 4: Restore code blocks
	placeholders.forEach((codeBlockHtml, index) => {
		html = html.replace(`__CODE_BLOCK_${index}__`, codeBlockHtml);
	});

	return html;
}

/**
 * Normalize language name to match Prism's naming conventions
 * @param {string} lang - Language identifier (e.g., "py", "js")
 * @returns {string} - Normalized language name
 */
export function normalizeLanguage(lang) {
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
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
	const map = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Slugify text for anchor IDs
 * @param {string} text - Text to slugify
 * @returns {string} - Slugified text
 */
export function slugify(text) {
	return text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w\-]+/g, "")
		.replace(/\-\-+/g, "-");
}
