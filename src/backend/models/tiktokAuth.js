import mongoose from "mongoose";

const tiktokAuthSchema = new mongoose.Schema(
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
			// Contains: access_token, refresh_token, expires_in, refresh_expires_in,
			// access_token_expires_at, refresh_token_expires_at, last_refreshed_at
		},
		userInfo: {
			type: Object,
			// Contains: display_name, username, avatar_url, bio, video_count, follower_count, likes_count
		},
		channelInfo: {
			type: Array,
			default: [],
		},
		deleted: {
			type: Boolean,
			default: false,
		},
		code: {
			type: String,
		},
		scopes: {
			type: String,
		},
		csrfState: {
			type: String,
		},
	},
	{ timestamps: true }
);

// Index for efficient lookups
tiktokAuthSchema.index({ teamId: 1, deleted: 1 });
tiktokAuthSchema.index({ userId: 1, teamId: 1 });
tiktokAuthSchema.index({ influencerId: 1, deleted: 1 });
tiktokAuthSchema.index({ teamId: 1, influencerId: 1, deleted: 1 });

export default mongoose.models.TiktokAuth || mongoose.model("TiktokAuth", tiktokAuthSchema);
