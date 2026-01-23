import mongoose from "mongoose";

const instagramAuthSchema = new mongoose.Schema(
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
			// Contains: access_token, token_type, expires_in, expires_at
		},
		accountInfo: {
			type: Object,
			// Contains: pageId, instagramBusinessAccountId, username, profile_picture_url, followers_count
		},
		userInfo: {
			type: Object,
			// Contains: name, username, profile_picture_url, followers_count, media_count
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
instagramAuthSchema.index({ teamId: 1, deleted: 1 });
instagramAuthSchema.index({ userId: 1, teamId: 1 });
instagramAuthSchema.index({ influencerId: 1, deleted: 1 });
instagramAuthSchema.index({ teamId: 1, influencerId: 1, deleted: 1 });

export default mongoose.models.InstagramAuth || mongoose.model("InstagramAuth", instagramAuthSchema);
