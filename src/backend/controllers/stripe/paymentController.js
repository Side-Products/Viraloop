import absoluteUrl from "next-absolute-url";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import User from "../../models/user";
import { CREDITS_STRIPE_PRODUCT_ID } from "@/config/constants";

const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);

// Generate stripe checkout session => /api/stripe/checkout-session
const stripeCheckoutSession = catchAsyncErrors(async (req, res) => {
	try {
		// Get origin
		const { origin } = absoluteUrl(req);
		const billingPeriod = req.query.billingPeriod;
		const isOneTime = req.query.isOneTime === "true";

		// Create stripe checkout session
		const sessionConfig = {
			mode: isOneTime ? "payment" : "subscription",
			success_url: `https://viraloop.io/payment-success/${req.query.stripePriceId}?team=${req.query.teamId}`,
			cancel_url: `https://viraloop.io/pricing?paymentfailed=true`,
			customer_email: req.user.email,
			client_reference_id: req.user._id || req.user.id,
			metadata: {
				team: req.query.teamId,
				stripePriceId: req.query.stripePriceId,
				client_reference_id: req.user._id || req.user.id,
				billingPeriod: billingPeriod,
				isOneTime: isOneTime ? "true" : "false",
				promotekit_referral: req.query.referral,
				domain: "viraloop.io",
				datafast_visitor_id: req.cookies?.datafast_visitor_id,
				datafast_session_id: req.cookies?.datafast_session_id,
			},
			line_items: [
				{
					price: req.query.stripePriceId,
					quantity: 1,
				},
			],
			billing_address_collection: "auto",
			currency: "usd",
			allow_promotion_codes: true,
		};

		const session = await stripe.checkout.sessions.create(sessionConfig);

		return res.status(200).json(session);
	} catch (err) {
		console.log("checkout error:", err);
		return res.status(500).json({ error: err.message });
	}
});

const stripeCreatePortalSession = catchAsyncErrors(async (req, res) => {
	// Get origin
	const { origin } = absoluteUrl(req);

	// This is the url to which the customer will be redirected when they are done
	// managing their billing with the portal.
	const returnUrl = `https://viraloop.io/billing`;

	const portalSession = await stripe.billingPortal.sessions.create({
		customer: req.user.stripe_customer_id,
		return_url: returnUrl,
	});

	res.status(200).json({ portalSessionUrl: portalSession.url });
});

const createCustomer = async (userEmail) => {
	const customer = await stripe.customers.create({
		email: userEmail,
	});
	return customer;
};

const findCustomer = async (customerId) => {
	try {
		const customer = await stripe.customers.retrieve(customerId);
		if (customer?.deleted) return null;
		return customer;
	} catch (error) {
		if (error.type === "StripeInvalidRequestError" && error.message.includes("No such customer")) {
			return null;
		}
		throw error;
	}
};

const createOrGetCustomer = async (userEmail) => {
	let user = await User.findOne({ email: userEmail });
	let customer = {};
	if (!user.stripe_customer_id) {
		customer = await createCustomer(userEmail);
		if (customer && customer.message) throw new Error(customer.message);
		user.stripe_customer_id = customer.id;
		user = await user.save();
	} else {
		customer = await findCustomer(user.stripe_customer_id);
		if (!customer) {
			console.log("Customer not found in Stripe, creating new customer");
			customer = await createCustomer(userEmail);
			if (customer && customer.message) throw new Error(customer.message);
			user.stripe_customer_id = customer.id;
			user = await user.save();
		}
	}
	return customer;
};

const createPaymentIntent = catchAsyncErrors(async (req, res) => {
	const { stripePriceId, teamId, amount } = req.body;

	try {
		const customer = await createOrGetCustomer(req.user.email);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount, // Amount in cents
			currency: "usd",
			customer: customer.id,
			metadata: {
				stripePriceId: stripePriceId,
				client_reference_id: req.user._id || req.user.id,
				team: teamId,
				isOneTime: "true",
				domain: "viraloop.io",
				datafast_visitor_id: req.cookies?.datafast_visitor_id,
				datafast_session_id: req.cookies?.datafast_session_id,
			},
			automatic_payment_methods: {
				enabled: true,
			},
		});

		return res.status(200).json({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		console.log("Error creating payment intent:", error);
		return res.status(500).json({ error: error.message });
	}
});

const applyPromoCode = catchAsyncErrors(async (req, res) => {
	const { promoCode, paymentIntentId, originalAmount } = req.body;

	try {
		// Retrieve the promotion code
		const promotionCode = await stripe.promotionCodes.list({
			code: promoCode,
			limit: 1,
		});

		if (!promotionCode.data.length) {
			return res.status(200).json({ success: false, message: "Invalid promo code." });
		}

		const promoData = promotionCode.data[0];

		// Check if coupon exists on the promotion code (can be directly on object or nested under promotion)
		const couponId = promoData.coupon?.id || promoData.promotion?.coupon;

		if (!couponId) {
			return res.status(200).json({ success: false, message: "Promo code has no associated discount." });
		}

		// Retrieve the full coupon object
		const coupon = await stripe.coupons.retrieve(couponId);

		if (!coupon || !coupon.valid) {
			return res.status(200).json({ success: false, message: "Invalid or expired promo code." });
		}

		// Calculate the discounted amount
		let discountedAmount = originalAmount;
		let discountAmount = 0;

		if (coupon.percent_off) {
			discountAmount = Math.round(originalAmount * (coupon.percent_off / 100));
			discountedAmount = originalAmount - discountAmount;
		} else if (coupon.amount_off) {
			discountAmount = coupon.amount_off;
			discountedAmount = Math.max(0, originalAmount - coupon.amount_off);
		}

		// Stripe minimum charge is $0.50 (50 cents)
		const STRIPE_MINIMUM_AMOUNT = 50;

		// If discount makes it free or below minimum, cancel the PaymentIntent
		// and mark as free trial
		if (discountedAmount < STRIPE_MINIMUM_AMOUNT) {
			if (paymentIntentId) {
				await stripe.paymentIntents.cancel(paymentIntentId);
			}

			return res.status(200).json({
				success: true,
				message: "Promo code applied! Your trial is now free.",
				coupon,
				originalAmount,
				discountAmount: originalAmount, // Full discount
				discountedAmount: 0,
				isFree: true,
			});
		}

		// Update the PaymentIntent with the new amount if we have a paymentIntentId
		if (paymentIntentId && discountedAmount !== originalAmount) {
			await stripe.paymentIntents.update(paymentIntentId, {
				amount: discountedAmount,
			});
		}

		return res.status(200).json({
			success: true,
			message: "Promo code applied successfully.",
			coupon,
			originalAmount,
			discountAmount,
			discountedAmount,
			isFree: false,
		});
	} catch (error) {
		console.error("Error applying promo code:", error);
		return res.status(200).json({ success: false, message: error.message || "Failed to apply promo code." });
	}
});

// Generate stripe checkout session for credit purchases => /api/stripe/checkout-session-for-credits
const stripeCheckoutSessionForCredits = catchAsyncErrors(async (req, res) => {
	try {
		const amountInCents = parseInt(req.query.amount * 100);

		if (!amountInCents || amountInCents < 100) {
			return res.status(400).json({ error: "Minimum purchase amount is $1" });
		}

		if (!req.query.teamId) {
			return res.status(400).json({ error: "Team ID is required" });
		}

		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			success_url: `https://viraloop.io/billing?paymentsuccess=true&type=credits`,
			cancel_url: `https://viraloop.io/billing?paymentfailed=true`,
			customer_email: req.user.email,
			client_reference_id: (req.user._id || req.user.id).toString(),
			metadata: {
				team: req.query.teamId,
				client_reference_id: (req.user._id || req.user.id).toString(),
				amount: amountInCents,
				type: "credits",
				domain: "viraloop.io",
				datafast_visitor_id: req.cookies?.datafast_visitor_id,
				datafast_session_id: req.cookies?.datafast_session_id,
			},
			line_items: [
				{
					price_data: {
						unit_amount: amountInCents,
						currency: "usd",
						product: CREDITS_STRIPE_PRODUCT_ID,
					},
					quantity: 1,
				},
			],
			billing_address_collection: "auto",
		});

		return res.status(200).json(session);
	} catch (error) {
		console.log("stripe credit checkout error:", error);
		return res.status(500).json({ error: error.message });
	}
});

export {
	stripeCheckoutSession,
	stripeCreatePortalSession,
	createOrGetCustomer,
	findCustomer,
	applyPromoCode,
	createPaymentIntent,
	stripeCheckoutSessionForCredits,
};
