/**
 * Programmatic SEO Engine
 * Main export file for easy imports
 */

// Core modules
export { interpolate, interpolateObject, renderTemplate, TemplateRegistry, globalTemplateRegistry } from "./core/template-engine";

export { SEODataLayer, seoDataLayer, invalidateCache } from "./core/data-layer";

export {
	generateMetaTags,
	generateOpenGraph,
	generateTwitterCard,
	generateSoftwareApplicationSchema,
	generateHowToSchema,
	generateFAQSchema,
	generateVideoSchema,
	generateBlogPostingSchema,
	generatePersonSchema,
	generateBreadcrumbSchema,
	generateOrganizationSchema,
	generateCompleteMetadata,
	generateStructuredData,
} from "./core/metadata-generator";

export { generateInternalLinks, insertLinksIntoContent, generateCTALinks, validateInternalLinks, autoGenerateLinks } from "./core/internal-linking";

export { generateSitemap, generateSitemapIndex, generateTemplateSitemap, generateSitemapJson, submitSitemap, validateSitemap } from "./core/sitemap-generator";

// Configuration
export { PSEO_CONFIG, getTemplateConfig, getPageUrl, getCacheTTL, isFeatureEnabled, getCTAConfig } from "./config";

// Components (re-export for convenience)
export { default as UnifiedSEOPage } from "../../components/SEO/UnifiedSEOPage";
export {
	TextSection,
	FeaturesSection,
	StepsSection,
	ParagraphSection,
	CodeSection,
	ImageSection,
	VideoSection,
	QuoteSection,
	renderSection,
	renderSections,
} from "../../components/SEO/sections";

// Blog components
export { default as BlogListItem } from "../../components/SEO/Blog/BlogListItem";

// Blog utilities
export {
	calculateReadingTime,
	extractHeadings,
	generateExcerpt,
	formatPublishDate,
	slugify,
	getWordCount,
	extractCategories,
	extractTags,
	groupPostsByMonth,
	calculateReadingProgress,
} from "./utils/blog-helpers";

// Model
export { default as SEOPage } from "../../backend/models/seoPage";
