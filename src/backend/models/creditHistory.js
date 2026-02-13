import mongoose from "mongoose";

const creditHistorySchema = new mongoose.Schema(
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
		amount_total: {
			type: Number,
			default: 0,
			required: true,
		},
		credits: {
			type: Number,
			default: 0,
			required: true,
		},
		type: {
			type: String,
			enum: ["recurring", "topup", "spending", "trial", "spin"],
			default: "recurring",
		},
		// Viraloop-specific tracking
		influencerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Influencer",
		},
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
		},
		platform: {
			type: String,
		},
		spendingType: {
			type: String,
		},
		// Idempotency tracking
		idempotencyKey: {
			type: String,
			index: true,
			sparse: true,
		},
		stripeSessionId: {
			type: String,
			index: true,
			sparse: true,
		},
		stripeInvoiceId: {
			type: String,
			index: true,
			sparse: true,
		},
	},
	{ timestamps: true }
);

// Indexes for efficient queries
creditHistorySchema.index({ type: 1, createdAt: -1 });
creditHistorySchema.index({ teamId: 1, type: 1, createdAt: -1 });
creditHistorySchema.index(
	{ idempotencyKey: 1 },
	{
		unique: true,
		sparse: true,
		partialFilterExpression: { idempotencyKey: { $exists: true, $ne: null } },
	}
);

export default mongoose.models.CreditHistory || mongoose.model("CreditHistory", creditHistorySchema);
