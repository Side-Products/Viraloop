import mongoose from "mongoose";

const seoPageSchema = new mongoose.Schema(
	{
		slug: {
			type: String,
			required: [true, "Slug is required"],
			unique: true,
			trim: true,
			lowercase: true,
			index: true,
		},
		template: {
			type: String,
			required: [true, "Template type is required"],
			enum: ["niche", "use-case", "comparison", "blog"],
			index: true,
		},
		metadata: {
			title: {
				type: String,
				required: true,
				maxLength: [60, "Title should not exceed 60 characters"],
			},
			description: {
				type: String,
				required: true,
				maxLength: [160, "Description should not exceed 160 characters"],
			},
			keywords: [String],
			ogImage: String,
			canonicalUrl: String,
			robots: {
				type: String,
				default: "index, follow",
			},
		},
		content: {
			hero: {
				title: String,
				subtitle: String,
				cta: {
					text: String,
					url: String,
				},
				backgroundImage: String,
				featuredImage: String,
				author: {
					name: String,
					bio: String,
					avatar: String,
				},
				publishedAt: Date,
				category: String,
				tags: [String],
			},
			sections: [
				{
					type: {
						type: String,
						enum: [
							"text",
							"features",
							"steps",
							"comparison",
							"testimonials",
							"faq",
							"cta",
							"paragraph",
							"code",
							"image",
							"video",
							"quote",
							"content",
						],
					},
					title: String,
					content: mongoose.Schema.Types.Mixed, // Flexible structure per section type
					order: Number,
				},
			],
			faq: [
				{
					question: String,
					answer: String,
				},
			],
			relatedPages: [
				{
					title: String,
					slug: String,
					description: String,
				},
			],
		},
		structuredData: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		status: {
			type: String,
			enum: ["draft", "review", "published", "archived"],
			default: "draft",
			index: true,
		},
		analytics: {
			impressions: {
				type: Number,
				default: 0,
			},
			clicks: {
				type: Number,
				default: 0,
			},
			ctr: {
				type: Number,
				default: 0,
			},
			avgPosition: {
				type: Number,
				default: 0,
			},
			lastUpdated: Date,
		},
		seo: {
			targetKeywords: [String],
			secondaryKeywords: [String],
			internalLinks: [
				{
					anchor: String,
					url: String,
				},
			],
			externalLinks: [
				{
					anchor: String,
					url: String,
				},
			],
			wordCount: Number,
			readabilityScore: Number,
		},
		performance: {
			lighthouseScore: Number,
			coreWebVitals: {
				lcp: Number, // Largest Contentful Paint
				fid: Number, // First Input Delay
				cls: Number, // Cumulative Layout Shift
			},
			lastChecked: Date,
		},
		aiGenerated: {
			type: Boolean,
			default: false,
		},
		editorialReview: {
			reviewed: {
				type: Boolean,
				default: false,
			},
			reviewedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			reviewedAt: Date,
			notes: String,
		},
		publishedAt: Date,
		lastModified: Date,
	},
	{
		timestamps: true,
	}
);

// Indexes for performance
seoPageSchema.index({ template: 1, status: 1 });
seoPageSchema.index({ "metadata.keywords": 1 });
seoPageSchema.index({ "analytics.impressions": -1 });
seoPageSchema.index({ createdAt: -1 });

// Update lastModified on save
seoPageSchema.pre("save", function (next) {
	this.lastModified = new Date();
	if (this.status === "published" && !this.publishedAt) {
		this.publishedAt = new Date();
	}
	next();
});

// Virtual for full URL
seoPageSchema.virtual("url").get(function () {
	return `https://viraloop.io/${this.slug}`;
});

// Calculate CTR when analytics are updated
seoPageSchema.methods.updateCTR = function () {
	if (this.analytics.impressions > 0) {
		this.analytics.ctr = (this.analytics.clicks / this.analytics.impressions) * 100;
	}
};

export default mongoose.models.SEOPage || mongoose.model("SEOPage", seoPageSchema);
