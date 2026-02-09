import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
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
		type: {
			type: String,
			default: "stripe",
			trim: true,
		},
		version: {
			type: Number,
			default: 1,
			required: true,
		},
		plan: {
			type: String,
			default: "",
			trim: true,
		},
		stripe_subscription: {
			type: String,
			default: "",
			trim: true,
			unique: true,
			index: true,
		},
		stripe_subscription_status: {
			type: String,
			default: "",
			trim: true,
		},
		stripe_priceId: {
			type: String,
			default: "",
			trim: true,
		},
		stripe_customer: {
			type: String,
			default: "",
			trim: true,
		},
		stripe_invoice: {
			type: String,
			default: "",
			trim: true,
		},
		stripe_hosted_invoice_url: {
			type: String,
			default: "",
			trim: true,
		},
		amount_total: {
			type: Number,
			default: 0,
		},
		currency: {
			type: String,
			default: "",
			trim: true,
		},
		paymentInfo: {
			id: {
				type: String,
				default: "",
			},
			status: {
				type: String,
				default: "",
			},
		},
		subscriptionValidUntil: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
