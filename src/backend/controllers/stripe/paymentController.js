import absoluteUrl from "next-absolute-url";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import User from "../../models/user";

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
	const { promoCode } = req.body;

	// Retrieve the promotion code
	const promotionCode = await stripe.promotionCodes.list({
		code: promoCode,
		limit: 1,
	});

	if (!promotionCode.data.length) {
		return res.status(200).json({ success: false, message: "Invalid promo code." });
	}

	const couponId = promotionCode.data[0].coupon.id;

	// Validate the coupon
	const coupon = await stripe.coupons.retrieve(couponId);

	if (!coupon || !coupon.valid) {
		return res.status(200).json({ success: false, message: "Invalid or expired promo code." });
	}

	// If the coupon is valid, apply it to the customer
	const customer = await createOrGetCustomer(req.user.email);

	await stripe.customers.update(customer.id, {
		coupon: couponId,
	});

	return res.status(200).json({ success: true, message: "Promo code applied successfully.", coupon });
});

export {
	stripeCheckoutSession,
	stripeCreatePortalSession,
	createOrGetCustomer,
	findCustomer,
	applyPromoCode,
	createPaymentIntent,
};
