import mongoose from "mongoose";
import Subscription from "../../models/subscription";
import Team from "../../models/team";
import User from "../../models/user";
import CreditHistory from "../../models/creditHistory";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import getRawBody from "raw-body";
import { getPlanFromStripePriceId, getLatestSubscriptionPlansVersion, getPlanLimitsFromStripePriceId } from "@/utils/Helpers";
import { PRICE_PER_CREDIT, SUBSCRIPTION_CREDITS } from "@/config/constants";
import { createOrGetCustomer } from "./paymentController";

const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);

/**
 * Get credits for a subscription plan
 * @param {string} planName - The plan name (trial, growth, pro, ultra)
 * @returns {number} Number of credits for the plan
 */
const getCreditsForPlan = (planName) => {
	if (!planName) return 0;
	const planLower = planName.toLowerCase().replace(/\s*\(.*\)/, ""); // Remove (monthly) or (annual)
	return SUBSCRIPTION_CREDITS[planLower] || 0;
};

/**
 * Add credits to a team with transaction safety and idempotency
 * @param {Object} params - Parameters for adding credits
 * @returns {Promise<Object>} Result with creditHistory and idempotent flag
 */
export const addCreditsToTeam = async ({
	teamId,
	userId,
	amount_total,
	creditsToAdd,
	type = "recurring",
	idempotencyKey = null,
	stripeSessionId = null,
	stripeInvoiceId = null,
}) => {
	const mongoSession = await mongoose.startSession();

	try {
		mongoSession.startTransaction();

		// Check idempotency
		if (idempotencyKey) {
			const existing = await CreditHistory.findOne({ idempotencyKey }, null, { session: mongoSession });
			if (existing) {
				await mongoSession.abortTransaction();
				mongoSession.endSession();
				console.log(`[CREDITS IDEMPOTENT] Credits already added for key: ${idempotencyKey}`);
				return { idempotent: true, creditHistory: existing };
			}
		}

		const team = await Team.findById(teamId).session(mongoSession);
		if (!team) {
			throw new Error(`Team not found: ${teamId}`);
		}

		// Create credit history record
		const creditHistory = new CreditHistory({
			userId,
			teamId: team._id,
			amount_total,
			credits: creditsToAdd,
			type,
			idempotencyKey,
			stripeSessionId,
			stripeInvoiceId,
		});
		await creditHistory.save({ session: mongoSession });

		// Update team credits
		team.credits = team.credits + creditsToAdd;
		await team.save({ session: mongoSession });

		await mongoSession.commitTransaction();
		mongoSession.endSession();

		console.log(`[CREDITS] Added ${creditsToAdd} credits to team ${teamId}`);
		return { idempotent: false, creditHistory };
	} catch (error) {
		await mongoSession.abortTransaction();
		mongoSession.endSession();

		// Handle duplicate key error (concurrent request)
		if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
			console.log(`[CREDITS IDEMPOTENT] Duplicate key - credits already added for key: ${idempotencyKey}`);
			const existing = await CreditHistory.findOne({ idempotencyKey });
			return { idempotent: true, creditHistory: existing };
		}

		throw error;
	}
};

/**
 * Handle credit purchase checkout completion
 */
const stripeWebhookCreditsCheckoutSessionCompleted = catchAsyncErrors(async (req, res, eventData) => {
	const session = eventData.object;
	const idempotencyKey = `checkout_credits_${session.id}`;

	try {
		const amountPaid = session.metadata.amount / 100; // cents to dollars
		const creditsToAdd = Math.floor(amountPaid / PRICE_PER_CREDIT);

		console.log(`[CREDITS] Processing credit purchase: $${amountPaid} = ${creditsToAdd} credits`);

		const result = await addCreditsToTeam({
			teamId: session.metadata.team,
			userId: session.client_reference_id,
			amount_total: session.amount_total,
			creditsToAdd,
			type: "topup",
			idempotencyKey,
			stripeSessionId: session.id,
		});

		return res.status(200).json({
			success: true,
			creditHistory: result.creditHistory,
			idempotent: result.idempotent,
			creditsAdded: creditsToAdd,
		});
	} catch (error) {
		console.error("[STRIPE ERROR] Credits checkout failed:", error);
		return res.status(200).json({ success: false, error: error.message });
	}
});

const stripeWebhook = catchAsyncErrors(async (req, res) => {
	// Get raw body
	const rawBody = await getRawBody(req);

	let eventData;
	let eventType;
	// Check if webhook signing is configured.
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (webhookSecret) {
		// Retrieve the event by verifying the signature using the raw body and secret.
		let event;
		let signature = req.headers["stripe-signature"];

		try {
			event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
		} catch (err) {
			console.log(`Webhook signature verification failed.`);
			return res.status(400).json({
				success: false,
				title: "Webhook signature verification failed",
				error: err,
				message: err.message,
			});
		}

		// Extract the object from the event.
		eventData = event.data;
		eventType = event.type;
	} else {
		// Webhook signing is recommended, but if the secret is not configured,
		// retrieve the event data directly from the request body.
		eventData = rawBody.data;
		eventType = rawBody.type;
	}

	console.log("stripe event:", eventType);

	// Check if this is for viraloop.io
	if (eventData?.object?.metadata?.domain && eventData?.object?.metadata?.domain !== "viraloop.io") {
		console.log("Event not from viraloop.io, ignoring");
		return res.status(200).json({
			success: false,
			message: "Event not from viraloop.io",
		});
	}

	// Handle credit purchases separately
	if (eventData?.object?.metadata?.type === "credits") {
		if (eventType === "checkout.session.completed") {
			return await stripeWebhookCreditsCheckoutSessionCompleted(req, res, eventData);
		}
		return res.status(200).json({ success: true, message: "Unhandled credits event" });
	}

	switch (eventType) {
		case "checkout.session.completed":
			// Payment is successful and the subscription is created.
			await stripeWebhookCheckoutSessionCompleted(req, res, eventData);
			break;
		case "invoice.paid":
			// Continue to provision the subscription as payments continue to be made.
			await stripeInvoicePaid(req, res, eventData);
			break;
		case "invoice.payment_failed":
			// The payment failed or the customer does not have a valid payment method.
			await stripeInvoiceFailed(req, res, eventData);
			break;
		case "customer.subscription.created":
			await stripeCustomerSubscriptionCreated(req, res, eventData);
			break;
		case "customer.subscription.updated":
			// Handle subscription updated from portal
			await stripeCustomerSubscriptionUpdated(req, res, eventData);
			break;
		default:
			break;
	}
});

/**
 * Update team limits based on subscription plan
 */
const updateTeamLimits = async (teamId, stripePriceId) => {
	console.log("\n--- Updating Team Limits ---");
	console.log("Team ID:", teamId);
	console.log("Stripe Price ID:", stripePriceId);

	const limits = getPlanLimitsFromStripePriceId(stripePriceId);
	console.log("Resolved limits:", JSON.stringify(limits, null, 2));

	if (limits.influencers === 0 && limits.imagesPerMonth === 0 && limits.videosPerMonth === 0) {
		console.log("⚠️ Warning: All limits are 0 - price ID may not match any plan!");
	}

	const updatedTeam = await Team.findByIdAndUpdate(
		teamId,
		{
			influencerLimit: limits.influencers,
			imageLimit: limits.imagesPerMonth,
			videoLimit: limits.videosPerMonth,
			// Reset usage counts for new subscription
			imagesUsedThisMonth: 0,
			videosUsedThisMonth: 0,
			usagePeriodStart: new Date(),
		},
		{ new: true }
	);

	if (updatedTeam) {
		console.log(`✅ Updated team ${teamId} limits:`);
		console.log(`   - Influencers: ${updatedTeam.influencerLimit}`);
		console.log(`   - Images/month: ${updatedTeam.imageLimit}`);
		console.log(`   - Videos/month: ${updatedTeam.videoLimit}`);
	} else {
		console.log(`❌ Team ${teamId} not found!`);
	}

	return updatedTeam;
};

const stripeWebhookCheckoutSessionCompleted = catchAsyncErrors(async (req, res, eventData) => {
	try {
		const session = eventData.object;
		const isOneTime = session.metadata?.isOneTime === "true";

		console.log("\n========== CHECKOUT SESSION COMPLETED ==========");
		console.log("Session ID:", session.id);
		console.log("Payment Status:", session.payment_status);
		console.log("Mode:", session.mode);
		console.log("Is One-Time:", isOneTime);
		console.log("Subscription ID:", session.subscription);
		console.log("Client Reference ID:", session.client_reference_id);
		console.log("Metadata:", JSON.stringify(session.metadata, null, 2));

		// Handle one-time payment (e.g., $1 trial)
		if (isOneTime || !session.subscription) {
			console.log("\n--- Processing One-Time Payment (Trial) ---");

			const user = await User.findById(session.client_reference_id);
			console.log("User found:", !!user, user?.email);

			if (user) {
				await createOrGetCustomer(user.email);
			}

			// Update team limits directly for one-time payment
			const stripePriceId = session.metadata?.stripePriceId;
			const teamId = session.metadata?.team;

			console.log("Team ID from metadata:", teamId);
			console.log("Price ID from metadata:", stripePriceId);

			if (teamId && stripePriceId) {
				await updateTeamLimits(teamId, stripePriceId);

				// Add credits for trial
				const planName = getPlanFromStripePriceId(stripePriceId);
				const creditsForPlan = getCreditsForPlan(planName);
				if (creditsForPlan > 0) {
					const creditIdempotencyKey = `trial_${session.id}`;
					await addCreditsToTeam({
						teamId,
						userId: session.client_reference_id,
						amount_total: session.amount_total,
						creditsToAdd: creditsForPlan,
						type: "topup",
						idempotencyKey: creditIdempotencyKey,
						stripeSessionId: session.id,
					});
					console.log(`[CREDITS] Added ${creditsForPlan} credits for trial purchase`);
				}

				console.log(`✅ One-time payment processed successfully for team ${teamId}`);
				console.log("========== END CHECKOUT SESSION ==========\n");
			} else {
				console.log("⚠️ Missing team ID or price ID in metadata - limits NOT updated!");
				console.log("========== END CHECKOUT SESSION (INCOMPLETE) ==========\n");
			}

			return res.status(200).json({
				success: true,
				message: "One-time payment processed successfully",
			});
		}

		// Handle subscription payment
		// Check if subscription has already been created for this session
		const existingSubscription = await Subscription.findOne({
			stripe_subscription: session.subscription,
		});

		if (existingSubscription) {
			return res.status(200).json({
				success: true,
				message: "Subscription already created for this session",
				subscription: existingSubscription,
			});
		}

		const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
		const invoice = await stripe.invoices.retrieve(session.invoice);

		const user = await User.findById(session.client_reference_id);
		if (user) {
			await createOrGetCustomer(user.email);
		}

		const subscription = await Subscription.create({
			user: mongoose.Types.ObjectId(session.client_reference_id),
			team: mongoose.Types.ObjectId(session.metadata.team),
			version: getLatestSubscriptionPlansVersion(),
			plan: getPlanFromStripePriceId(stripeSubscription.plan.id),
			stripe_subscription: session.subscription,
			stripe_subscription_status: stripeSubscription.status,
			stripe_priceId: stripeSubscription.plan.id,
			stripe_customer: session.customer,
			stripe_invoice: session.invoice,
			stripe_hosted_invoice_url: invoice.hosted_invoice_url || "",
			amount_total: session.amount_total, // divide by 100 when retrieving from db
			currency: session.currency,
			paymentInfo: {
				id: session.payment_intent,
				status: session.payment_status,
			},
			subscriptionValidUntil: parseInt(stripeSubscription.current_period_end) * 1000, // seconds to milliseconds
		});
		await subscription.save();

		// Update team limits based on the plan
		const validStatusesForLimits = ["active", "trialing"];
		if (validStatusesForLimits.includes(stripeSubscription.status)) {
			await updateTeamLimits(session.metadata?.team, stripeSubscription.plan.id);

			// Add credits for the subscription
			const planName = getPlanFromStripePriceId(stripeSubscription.plan.id);
			const creditsForPlan = getCreditsForPlan(planName);
			if (creditsForPlan > 0) {
				const creditIdempotencyKey = `subscription_${session.subscription}_${new Date().toISOString().slice(0, 7)}`;
				await addCreditsToTeam({
					teamId: session.metadata.team,
					userId: session.client_reference_id,
					amount_total: session.amount_total,
					creditsToAdd: creditsForPlan,
					type: "recurring",
					idempotencyKey: creditIdempotencyKey,
					stripeInvoiceId: session.invoice,
				});
				console.log(`[CREDITS] Added ${creditsForPlan} credits for new ${planName} subscription`);
			}
		}

		return res.status(200).json({
			success: true,
			subscription,
		});
	} catch (error) {
		console.error("[STRIPE ERROR] Checkout payment:", error);
		return res.status(200).json({
			success: false,
			message: "Error processing checkout session",
			error: error.message,
		});
	}
});

const stripeCustomerSubscriptionCreated = catchAsyncErrors(async (req, res, eventData) => {
	try {
		const session = eventData.object;

		const client_reference_id = session.metadata?.client_reference_id || session.client_reference_id;
		if (!client_reference_id) {
			return res.status(200).json({
				success: false,
				message: "No client reference id found",
			});
		}

		if (session.subscription === null) return res.status(404).json({ success: false });
		const stripeSubscription = await stripe.subscriptions.retrieve(session.id);

		const user = await User.findById(client_reference_id);
		if (user) {
			await createOrGetCustomer(user.email);
		}

		const old_subscription = await Subscription.findOne({ stripe_subscription: session.id }).sort({ createdAt: "desc" });
		if (old_subscription) {
			return res.status(200).json({
				success: false,
				subscription: old_subscription,
			});
		}

		const subscription = await Subscription.create({
			user: mongoose.Types.ObjectId(client_reference_id),
			team: mongoose.Types.ObjectId(session.metadata?.team),
			version: getLatestSubscriptionPlansVersion(),
			plan: getPlanFromStripePriceId(stripeSubscription.plan.id),
			stripe_subscription: session.id,
			stripe_subscription_status: stripeSubscription.status,
			stripe_priceId: stripeSubscription.plan.id,
			stripe_customer: session.customer,
			stripe_invoice: session.latest_invoice,
			stripe_hosted_invoice_url: "",
			amount_total: session.plan.amount, // divide by 100 when retrieving from db
			currency: session.plan.currency,
			paymentInfo: {
				id: session.payment_intent,
				status: session.payment_status,
			},
			subscriptionValidUntil: parseInt(stripeSubscription.current_period_end) * 1000, // seconds to milliseconds
		});
		await subscription.save();

		// Update team limits based on the plan
		const validStatusesForLimits = ["active", "trialing"];
		if (validStatusesForLimits.includes(stripeSubscription.status)) {
			await updateTeamLimits(session.metadata?.team, stripeSubscription.plan.id);
		}

		return res.status(200).json({
			success: true,
			subscription,
		});
	} catch (error) {
		console.error("[STRIPE ERROR] stripeCustomerSubscriptionCreated:", error);
		return res.status(200).json({
			success: false,
			message: "Error creating subscription",
			error: error.message,
		});
	}
});

const stripeCustomerSubscriptionUpdated = catchAsyncErrors(async (req, res, eventData) => {
	try {
		const session = eventData.object;
		if (session.subscription === null) return res.status(404).json({ success: false });

		const old_subscription = await Subscription.findOne({ stripe_subscription: session.id }).sort({ createdAt: "desc" });
		if (!old_subscription) return res.status(200).json({ success: true, message: "No matching subscription found" });

		old_subscription.stripe_subscription_status = session.status;
		old_subscription.stripe_priceId = session.plan.id;
		old_subscription.plan = getPlanFromStripePriceId(session.plan.id);
		old_subscription.stripe_invoice = session.latest_invoice;
		old_subscription.stripe_hosted_invoice_url = session.hosted_invoice_url || old_subscription.stripe_hosted_invoice_url || "";
		old_subscription.amount_total = session.total || old_subscription.amount_total;
		old_subscription.currency = session.currency;
		old_subscription.paymentInfo = {
			id: session.payment_intent,
			status: session.status,
		};

		// Only update subscriptionValidUntil if status indicates active subscription
		const validStatuses = ["active", "trialing"];
		if (validStatuses.includes(session.status)) {
			old_subscription.subscriptionValidUntil = parseInt(session.current_period_end) * 1000;
			// Update team limits when subscription is active
			await updateTeamLimits(old_subscription.team, session.plan.id);
		} else {
			old_subscription.subscriptionValidUntil = Date.now();
			// Reset team limits to 0 when subscription is no longer active
			await Team.findByIdAndUpdate(old_subscription.team, {
				influencerLimit: 0,
				imageLimit: 0,
				videoLimit: 0,
			});
		}

		old_subscription.updatedAt = Date.now();
		await old_subscription.save();

		return res.status(200).json({
			success: true,
			subscription: old_subscription,
		});
	} catch (error) {
		console.log("Error in stripeCustomerSubscriptionUpdated:", error);
		res.status(500).json({
			success: false,
			message: "Error updating subscription",
		});
	}
});

const stripeInvoicePaid = catchAsyncErrors(async (req, res, eventData) => {
	try {
		await new Promise((resolve) => setTimeout(resolve, 2000)); // Sleep for 2 seconds

		const session = eventData.object;
		if (session.subscription === null) return res.status(404).json({ success: false });

		const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

		const old_subscription = await Subscription.findOne({ stripe_subscription: session.subscription }).sort({ createdAt: "desc" });
		if (!old_subscription) return res.status(200).json({ success: true, message: "No matching subscription found" });

		old_subscription.stripe_subscription_status = stripeSubscription.status;
		old_subscription.stripe_priceId = stripeSubscription.plan.id;
		old_subscription.plan = getPlanFromStripePriceId(stripeSubscription.plan.id);
		old_subscription.stripe_invoice = session.id;
		old_subscription.stripe_hosted_invoice_url = session.hosted_invoice_url || old_subscription.stripe_hosted_invoice_url || "";
		old_subscription.amount_total = session.total;
		old_subscription.currency = session.currency;
		old_subscription.paymentInfo = {
			id: session.payment_intent,
			status: session.status,
		};

		// Only update subscriptionValidUntil if status indicates active subscription
		const validStatuses = ["active", "trialing"];
		if (validStatuses.includes(stripeSubscription.status)) {
			old_subscription.subscriptionValidUntil = parseInt(stripeSubscription.current_period_end) * 1000;
			// Update team limits when subscription is renewed
			await updateTeamLimits(old_subscription.team, stripeSubscription.plan.id);

			// Add credits for subscription renewal
			const planName = getPlanFromStripePriceId(stripeSubscription.plan.id);
			const creditsForPlan = getCreditsForPlan(planName);
			if (creditsForPlan > 0) {
				const creditIdempotencyKey = `invoice_${session.id}_${new Date().toISOString().slice(0, 7)}`;
				await addCreditsToTeam({
					teamId: old_subscription.team,
					userId: old_subscription.user,
					amount_total: session.total,
					creditsToAdd: creditsForPlan,
					type: "recurring",
					idempotencyKey: creditIdempotencyKey,
					stripeInvoiceId: session.id,
				});
				console.log(`[CREDITS] Added ${creditsForPlan} credits for ${planName} renewal`);
			}
		} else {
			old_subscription.subscriptionValidUntil = Date.now();
			// Reset team limits to 0 when subscription is no longer active
			await Team.findByIdAndUpdate(old_subscription.team, {
				influencerLimit: 0,
				imageLimit: 0,
				videoLimit: 0,
			});
		}

		old_subscription.updatedAt = Date.now();
		await old_subscription.save();

		return res.status(200).json({
			success: true,
			subscription: old_subscription,
		});
	} catch (error) {
		console.error("[STRIPE ERROR] stripeInvoicePaid:", error);
		return res.status(200).json({
			success: false,
			message: "Error processing paid invoice",
			error: error.message,
		});
	}
});

const stripeInvoiceFailed = catchAsyncErrors(async (req, res, eventData) => {
	try {
		const session = eventData.object;
		if (session.subscription === null) return res.status(404).json({ success: false });

		const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

		const old_subscription = await Subscription.findOne({ stripe_subscription: session.subscription }).sort({ createdAt: "desc" });
		if (!old_subscription) return res.status(200).json({ success: true, message: "No matching subscription found" });

		const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
		if (paymentIntent.status === "requires_action") {
			console.log("Invoice failed: Payment requires action");
		} else {
			// Cancel the subscription if payment fails
			await stripe.subscriptions.del(session.subscription);
		}

		old_subscription.stripe_subscription_status = stripeSubscription.status;
		old_subscription.stripe_priceId = stripeSubscription?.plan?.id;
		old_subscription.plan = getPlanFromStripePriceId(stripeSubscription?.plan?.id);
		old_subscription.stripe_invoice = session.id;
		old_subscription.stripe_hosted_invoice_url = session.hosted_invoice_url || old_subscription.stripe_hosted_invoice_url || "";
		old_subscription.amount_total = session.total;
		old_subscription.currency = session.currency;
		old_subscription.paymentInfo = {
			id: session.payment_intent,
			status: session.status,
		};
		old_subscription.updatedAt = Date.now();
		await old_subscription.save();

		// Reset team limits to 0 on payment failure
		await Team.findByIdAndUpdate(old_subscription.team, {
			influencerLimit: 0,
			imageLimit: 0,
			videoLimit: 0,
		});

		// TODO: Send email to customer about payment failure

		return res.status(200).json({
			success: true,
			subscription: old_subscription,
		});
	} catch (error) {
		console.log("Error in stripe invoice failed:", error);
	}
});

export { stripeWebhook };
