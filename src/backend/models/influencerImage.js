import mongoose from "mongoose";

const influencerImageSchema = new mongoose.Schema(
	{
		influencerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Influencer",
			required: true,
		},
		// Image URL (S3 or external)
		imageUrl: {
			type: String,
			required: [true, "Image URL is required"],
		},
		s3Key: {
			type: String,
		},
		publicUrl: {
			type: String,
		},
		// Generation details
		imagePrompt: {
			type: String,
			trim: true,
			maxLength: [1000, "Image prompt cannot exceed 1000 characters"],
		},
		// Status tracking for async generation
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "failed"],
			default: "completed",
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
		// Primary image flag
		isPrimary: {
			type: Boolean,
			default: false,
		},
		// Image dimension/aspect ratio
		dimension: {
			type: String,
			enum: ["9:16", "16:9", "1:1"],
			default: "9:16",
		},
		// Reference images used for generation
		referenceImages: [
			{
				type: String,
			},
		],
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
influencerImageSchema.index({ influencerId: 1 });
influencerImageSchema.index({ teamId: 1, createdAt: -1 });
influencerImageSchema.index({ influencerId: 1, isPrimary: 1 });
influencerImageSchema.index({ status: 1 });

export default mongoose.models.InfluencerImage || mongoose.model("InfluencerImage", influencerImageSchema);
