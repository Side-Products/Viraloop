import mongoose from "mongoose";

const influencerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter an influencer name"],
			trim: true,
			maxLength: [100, "Influencer name cannot exceed 100 characters"],
		},
		description: {
			type: String,
			trim: true,
			maxLength: [500, "Description cannot exceed 500 characters"],
		},
		niche: {
			type: String,
			enum: ["fitness", "lifestyle", "tech", "beauty", "business", "education", "entertainment", "gaming", "food", "travel", "other"],
			required: [true, "Please select a niche"],
		},
		// Generated portrait image (Nano Banana Pro)
		imageUrl: {
			type: String,
			required: [true, "Influencer image is required"],
		},
		imagePrompt: {
			type: String,
			trim: true,
			maxLength: [1000, "Image prompt cannot exceed 1000 characters"],
		},
		// ElevenLabs voice configuration
		voice: {
			voice_id: {
				type: String,
				required: [true, "Voice ID is required"],
			},
			name: {
				type: String,
				required: [true, "Voice name is required"],
			},
			labels: {
				type: Object,
				default: {},
			},
			preview_url: {
				type: String,
			},
		},
		// Video preview generated using Veo 3.1
		videoPreview: {
			status: {
				type: String,
				enum: ["pending", "processing", "completed", "failed"],
				default: "pending",
			},
			videoUrl: {
				type: String,
			},
			s3Key: {
				type: String,
			},
			publicUrl: {
				type: String,
			},
			thumbnailUrl: {
				type: String,
			},
			taskId: {
				type: String,
			}, // KIE.ai/Veo task ID
			error: {
				type: String,
			},
			completedAt: {
				type: Date,
			},
		},
		// Platform-specific profiles
		platforms: {
			tiktok: {
				username: { type: String },
				bio: { type: String },
				hashtags: [{ type: String }],
			},
			instagram: {
				username: { type: String },
				bio: { type: String },
				hashtags: [{ type: String }],
			},
			youtube: {
				channelName: { type: String },
				bio: { type: String },
				tags: [{ type: String }],
			},
		},
		// Connected social media accounts
		socialAccounts: {
			youtube: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "YoutubeAuth",
			},
			tiktok: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "TiktokAuth",
			},
			instagram: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "InstagramAuth",
			},
		},
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: true,
		},
		usageCount: {
			type: Number,
			default: 0,
		},
		lastUsedAt: {
			type: Date,
		},
	},
	{ timestamps: true }
);

// Indexes for efficient querying
influencerSchema.index({ userId: 1, teamId: 1 });
influencerSchema.index({ isActive: 1 });
influencerSchema.index({ createdAt: -1 });
influencerSchema.index({ niche: 1, teamId: 1 });

// Method to increment usage count
influencerSchema.methods.incrementUsage = async function () {
	this.usageCount += 1;
	this.lastUsedAt = new Date();
	await this.save();
};

export default mongoose.models.Influencer || mongoose.model("Influencer", influencerSchema);
