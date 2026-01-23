import mongoose from "mongoose";

const socialPostSchema = new mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		platform: {
			type: String,
			enum: ["youtube", "tiktok", "instagram"],
			required: true,
		},
		status: {
			type: String,
			enum: ["draft", "scheduled", "processing", "posted", "failed", "cancelled"],
			default: "draft",
		},
		scheduledTime: {
			type: Date,
		},
		postedAt: {
			type: Date,
		},
		taskId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
		},
		// Platform-specific post ID
		platformPostId: {
			type: String,
		},
		// Direct URL to the post
		postUrl: {
			type: String,
		},
		// Platform-specific metadata
		metadata: {
			type: Object,
			// Contains: title, description, caption, hashtags, privacy settings, etc.
		},
		// Analytics from the platform
		analytics: {
			views: { type: Number, default: 0 },
			likes: { type: Number, default: 0 },
			comments: { type: Number, default: 0 },
			shares: { type: Number, default: 0 },
			lastSyncedAt: { type: Date },
		},
		// Error information
		error: {
			message: { type: String },
			code: { type: String },
			details: { type: Object },
		},
	},
	{ timestamps: true }
);

// Indexes for efficient querying
socialPostSchema.index({ postId: 1, platform: 1 });
socialPostSchema.index({ teamId: 1, platform: 1, status: 1 });
socialPostSchema.index({ status: 1, scheduledTime: 1 });
socialPostSchema.index({ postedAt: -1 });

export default mongoose.models.SocialPost || mongoose.model("SocialPost", socialPostSchema);
