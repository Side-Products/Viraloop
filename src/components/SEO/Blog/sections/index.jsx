/**
 * Blog Section Components Index
 * Re-exports from the unified section system
 *
 * This file is kept for backward compatibility
 * All blog sections are now part of the unified rendering system
 */

// Re-export from main sections directory
export {
	renderSection as renderBlogSection,
	renderSections as renderBlogSections,
	ParagraphSection,
	CodeSection,
	ImageSection,
	VideoSection,
	QuoteSection,
} from "../../sections";
