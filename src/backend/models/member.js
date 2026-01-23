import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
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
		role: {
			type: String,
			enum: ["member", "admin"],
			default: "member",
			required: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Member || mongoose.model("Member", memberSchema);
