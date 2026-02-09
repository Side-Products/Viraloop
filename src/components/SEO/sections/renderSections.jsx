/**
 * Unified Section Renderer
 * Handles all section types for both pSEO and blog templates
 */

// pSEO section components
import TextSection from "./TextSection";
import FeaturesSection from "./FeaturesSection";
import StepsSection from "./StepsSection";

// Blog section components
import ParagraphSection from "../Blog/sections/ParagraphSection";
import CodeSection from "../Blog/sections/CodeSection";
import ImageSection from "../Blog/sections/ImageSection";
import VideoSection from "../Blog/sections/VideoSection";
import QuoteSection from "../Blog/sections/QuoteSection";

/**
 * Render a single section based on its type
 * @param {object} section - Section configuration
 * @param {number} index - Section index
 * @returns {JSX.Element|null} - Rendered section component
 */
export function renderSection(section, index) {
	const key = `section-${section.type}-${index}`;

	switch (section.type) {
		// pSEO section types
		case "text":
		case "content":
			return <TextSection key={key} section={section} />;
		case "features":
			return <FeaturesSection key={key} section={section} />;
		case "steps":
			return <StepsSection key={key} section={section} />;

		// Blog section types
		case "paragraph":
			return <ParagraphSection key={key} section={section} />;
		case "code":
			return <CodeSection key={key} section={section} />;
		case "image":
			return <ImageSection key={key} section={section} />;
		case "video":
			return <VideoSection key={key} section={section} />;
		case "quote":
			return <QuoteSection key={key} section={section} />;

		// Handled elsewhere
		case "comparison":
		case "testimonials":
		case "faq":
		case "cta":
			// These are typically handled by the layout component
			return null;

		default:
			console.warn(`Unknown section type: ${section.type}`);
			return null;
	}
}

/**
 * Render all sections from a content array
 * @param {array} sections - Array of section configurations
 * @returns {JSX.Element[]} - Array of rendered section components
 */
export function renderSections(sections) {
	if (!sections || !Array.isArray(sections)) return null;

	// Sort by order if specified
	const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

	return sortedSections.map((section, index) => renderSection(section, index)).filter(Boolean);
}

// Export individual section components for direct use
export { TextSection, FeaturesSection, StepsSection, ParagraphSection, CodeSection, ImageSection, VideoSection, QuoteSection };
