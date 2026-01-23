import mongoose from "mongoose";

const influencerVideoSchema = new mongoose.Schema(
	{
		influencerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Influencer",
			required: true,
		},
		// Source image used for video generation
		sourceImageId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "InfluencerImage",
		},
		sourceImageUrl: {
			type: String,
		},
		// Video storage
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
		// Status tracking for async generation
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "failed"],
			default: "pending",
		},
		taskId: {
			type: String,
		},
		error: {
			type: String,
		},
		completedAt: {
			type: Date,
		},
		// Generation config
		actionPrompt: {
			type: String,
			trim: true,
			maxLength: [1000, "Action prompt cannot exceed 1000 characters"],
		},
		duration: {
			type: Number, // Duration in seconds
		},
		// Video dimension/aspect ratio
		dimension: {
			type: String,
			enum: ["9:16", "16:9", "1:1"],
			default: "9:16",
		},
		// Primary video flag
		isPrimary: {
			type: Boolean,
			default: false,
		},
		// Ownership
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
	},
	{ timestamps: true }
);

// Indexes for efficient querying
influencerVideoSchema.index({ influencerId: 1 });
influencerVideoSchema.index({ teamId: 1, createdAt: -1 });
influencerVideoSchema.index({ influencerId: 1, isPrimary: 1 });
influencerVideoSchema.index({ sourceImageId: 1 });
influencerVideoSchema.index({ status: 1 });

export default mongoose.models.InfluencerVideo || mongoose.model("InfluencerVideo", influencerVideoSchema);
