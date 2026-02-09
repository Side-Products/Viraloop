import { useRouter } from "next/router";
import Head from "next/head";
import UnifiedSEOPage from "@/components/SEO/UnifiedSEOPage";
import { renderSections } from "@/components/SEO/sections";
import { seoDataLayer } from "@/lib/pseo/core/data-layer";
import { generateCompleteMetadata, generateStructuredData } from "@/lib/pseo/core/metadata-generator";
import { autoGenerateLinks } from "@/lib/pseo/core/internal-linking";
import { generateBreadcrumbSchema } from "@/lib/pseo/core/metadata-generator";
import { formatMarkdown } from "@/lib/markdown/formatMarkdown";

/**
 * Blog Post Page
 * Dynamic page for individual blog posts
 * Adapted for Viraloop's light theme
 */
export default function BlogPostPage({ page, metadata, structuredData, breadcrumbs, relatedPosts }) {
	const router = useRouter();

	if (router.isFallback) {
		return (
			<div className="min-h-screen bg-light-100 flex items-center justify-center">
				<div className="text-neutral-900 text-xl">Loading...</div>
			</div>
		);
	}

	if (!page) {
		return (
			<div className="min-h-screen bg-light-100 flex items-center justify-center">
				<div className="text-neutral-900 text-xl">Blog post not found</div>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>{metadata.title}</title>
				<meta name="description" content={metadata.description} />
				<meta name="keywords" content={metadata.keywords} />
				<meta name="robots" content={metadata.robots} />
				<meta name="author" content={page.content.hero?.author?.name || "Viraloop Team"} />

				{/* Article-specific meta tags */}
				<meta property="article:published_time" content={page.content.hero?.publishedAt} />
				{page.lastModified && <meta property="article:modified_time" content={page.lastModified} />}
				{page.content.hero?.author?.name && <meta property="article:author" content={page.content.hero.author.name} />}
				{page.content.hero?.category && <meta property="article:section" content={page.content.hero.category} />}
				{page.content.hero?.tags?.map((tag, index) => (
					<meta key={index} property="article:tag" content={tag} />
				))}

				{/* Open Graph */}
				<meta property="og:title" content={metadata.openGraph.title} />
				<meta property="og:description" content={metadata.openGraph.description} />
				<meta property="og:url" content={metadata.openGraph.url} />
				<meta property="og:type" content="article" />
				{metadata.openGraph.images?.[0] && <meta property="og:image" content={metadata.openGraph.images[0].url} />}

				{/* Twitter Card */}
				<meta name="twitter:card" content={metadata.twitter.card} />
				<meta name="twitter:title" content={metadata.twitter.title} />
				<meta name="twitter:description" content={metadata.twitter.description} />
				{metadata.twitter.images?.[0] && <meta name="twitter:image" content={metadata.twitter.images[0]} />}

				{/* Canonical URL */}
				{metadata.alternates?.canonical && <link rel="canonical" href={metadata.alternates.canonical} />}

				{/* Structured Data */}
				{structuredData.map((schema, index) => (
					<script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
				))}
			</Head>

			<UnifiedSEOPage page={page} breadcrumbs={breadcrumbs} relatedContent={relatedPosts}>
				{/* Render blog content sections */}
				{page.content.sections && renderSections(page.content.sections)}
			</UnifiedSEOPage>
		</>
	);
}

export async function getStaticPaths() {
	try {
		const pages = await seoDataLayer.getPagesByTemplate("blog", { limit: 100 });

		const paths = pages.map((page) => ({
			params: { slug: page.slug.replace("blog/", "") },
		}));

		return {
			paths,
			fallback: "blocking",
		};
	} catch (error) {
		console.error("Error generating static paths:", error);
		return {
			paths: [],
			fallback: "blocking",
		};
	}
}

export async function getStaticProps({ params }) {
	try {
		const { slug } = params;
		const fullSlug = `blog/${slug}`;

		const page = await seoDataLayer.getPageBySlug(fullSlug);

		if (!page) {
			return {
				notFound: true,
				revalidate: 300,
			};
		}

		// Auto-generate internal links if needed
		if (!page.seo?.internalLinks || page.seo.internalLinks.length === 0) {
			try {
				await autoGenerateLinks(fullSlug, {
					maxLinks: 5,
					preferTemplates: ["blog", "niche", "use-case"],
				});
			} catch (error) {
				console.error("Error auto-generating links:", error);
			}
		}

		// Get related posts
		const relatedPosts = await seoDataLayer.getRelatedPages(page, { limit: 3 });

		// Pre-process markdown content for SEO (server-side rendering)
		if (page.content.sections) {
			page.content.sections = page.content.sections.map((section) => {
				if (section.type === "paragraph" && section.content?.text) {
					return {
						...section,
						content: {
							...section.content,
							html: formatMarkdown(section.content.text), // Pre-rendered HTML for SEO
							text: section.content.text, // Keep original for potential editing
						},
					};
				}
				return section;
			});
		}

		// Generate metadata
		const metadata = generateCompleteMetadata(page, {
			baseUrl: "https://viraloop.io",
		});

		// Generate structured data
		const structuredData = generateStructuredData(page, {
			baseUrl: "https://viraloop.io",
		});

		// Generate breadcrumbs (without category pages - they don't exist)
		const breadcrumbs = [
			{ name: "Home", path: "/" },
			{ name: "Blog", path: "/blog" },
			{ name: page.metadata.title, path: `/${fullSlug}` },
		];

		// Add breadcrumb schema to structured data
		const breadcrumbSchema = generateBreadcrumbSchema({
			items: breadcrumbs,
			baseUrl: "https://viraloop.io",
		});

		// Serialize metadata (convert URL objects to strings)
		const serializedMetadata = {
			...metadata,
			metadataBase: metadata.metadataBase?.href || metadata.metadataBase,
		};

		return {
			props: {
				page: JSON.parse(JSON.stringify(page)),
				metadata: serializedMetadata,
				structuredData: JSON.parse(JSON.stringify([...structuredData, breadcrumbSchema])),
				breadcrumbs,
				relatedPosts: JSON.parse(JSON.stringify(relatedPosts)),
			},
			revalidate: 3600, // Revalidate every hour
		};
	} catch (error) {
		console.error("Error in getStaticProps:", error);
		return {
			notFound: true,
			revalidate: 300,
		};
	}
}
