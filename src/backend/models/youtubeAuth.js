import mongoose from "mongoose";

const youtubeAuthSchema = new mongoose.Schema(
	{
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
		influencerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Influencer",
			required: true,
		},
		tokens: {
			type: Object,
			// Contains: access_token, refresh_token, expiry_date, token_type
		},
		channelInfo: {
			type: Object,
			// Contains: id, snippet (title, description, thumbnails), statistics (subscriberCount, videoCount, viewCount)
		},
		deleted: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Index for efficient lookups
youtubeAuthSchema.index({ teamId: 1, deleted: 1 });
youtubeAuthSchema.index({ userId: 1, teamId: 1 });
youtubeAuthSchema.index({ influencerId: 1, deleted: 1 });
youtubeAuthSchema.index({ teamId: 1, influencerId: 1, deleted: 1 });

export default mongoose.models.YoutubeAuth || mongoose.model("YoutubeAuth", youtubeAuthSchema);
