import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
	{
		scheduledTime: {
			type: Date,
			required: true,
		},
		completedAt: {
			type: Date,
		},
		task: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "completed", "failed", "processing", "cancelled"],
			default: "pending",
		},
		progress: {
			type: Number,
			default: 0,
		},
		// Viraloop-specific references
		influencerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Influencer",
		},
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
		},
		scheduleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Schedule",
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
		},
		socialPostId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "SocialPost",
		},
		result: {
			type: Object,
		},
		metadata: {
			type: Object,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
