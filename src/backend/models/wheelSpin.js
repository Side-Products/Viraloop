import mongoose from "mongoose";

const wheelSpinSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		team: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: true,
		},
		creditsWon: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.WheelSpin || mongoose.model("WheelSpin", wheelSpinSchema);
