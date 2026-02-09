import mongoose from "mongoose";
import Member from "./member";

const teamSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter a name"],
			trim: true,
			maxLength: [100, "Name cannot exceed 100 characters"],
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		apiKey: {
			type: String,
			unique: true,
		},
		isDefault: {
			type: Boolean,
			default: false,
		},
		credits: {
			type: Number,
			default: 0,
		},
		// Viraloop-specific fields
		influencerLimit: {
			type: Number,
			default: 0, // No access without payment
		},
		imageLimit: {
			type: Number,
			default: 0, // No access without payment
		},
		videoLimit: {
			type: Number,
			default: 0, // No access without payment
		},
		// Monthly usage tracking (team-wide, not per influencer)
		imagesUsedThisMonth: {
			type: Number,
			default: 0,
		},
		videosUsedThisMonth: {
			type: Number,
			default: 0,
		},
		usagePeriodStart: {
			type: Date,
			default: Date.now,
		},
		postLimit: {
			type: Number,
			default: 0, // Deprecated - kept for backwards compatibility
		},
		// API key overrides
		OPENAI_API_KEY: {
			type: String,
		},
		REPLICATE_API_TOKEN: {
			type: String,
		},
		ELEVENLABS_API_KEY: {
			type: String,
		},
		KIE_AI_API_KEY: {
			type: String,
		},
		// Storage
		AWS_BUCKET_NAME: {
			type: String,
		},
		SES_S3_AWS_ACCESS_KEY_ID: {
			type: String,
		},
		SES_S3_AWS_SECRET_ACCESS_KEY: {
			type: String,
		},
		platform: {
			type: String,
			default: "web",
		},
	},
	{ timestamps: true }
);

// Adding user to member model
teamSchema.post("save", async function () {
	const member = await Member.findOne({ userId: this.createdBy, teamId: this._id });
	if (!member) await Member.create({ userId: this.createdBy, teamId: this._id, role: "admin" });
});

export default mongoose.models.Team || mongoose.model("Team", teamSchema);
