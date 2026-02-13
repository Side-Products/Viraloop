import Team from "@/backend/models/team";
import WheelSpin from "@/backend/models/wheelSpin";
import CreditHistory from "@/backend/models/creditHistory";
import Subscription from "@/backend/models/subscription";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import ErrorHandler from "@/backend/utils/errorHandler";
import { getPlanTierName, PLAN_TIERS } from "@/utils/Helpers";

const PRIZES_ORDER = [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 100];

// Valid plan tiers that can spin the wheel (paid subscriptions only)
const ALLOWED_TIERS = [PLAN_TIERS.GROWTH, PLAN_TIERS.PRO, PLAN_TIERS.ULTRA];

// Helper to check if team has a valid paid subscription
const hasValidPaidSubscription = async (teamId) => {
	const subscription = await Subscription.findOne({ team: teamId }).sort({ createdAt: -1 });

	if (!subscription) return { isValid: false, tier: null };

	const validStripeStatuses = ["active", "trialing"];
	const isSubscriptionValid =
		subscription &&
		((subscription.subscriptionValidUntil && new Date(subscription.subscriptionValidUntil) > Date.now()) ||
			!subscription.subscriptionValidUntil) &&
		validStripeStatuses.includes(subscription.stripe_subscription_status);

	if (!isSubscriptionValid) return { isValid: false, tier: null };

	const tier = getPlanTierName(subscription.plan);
	const isAllowedTier = tier && ALLOWED_TIERS.includes(tier);

	return { isValid: isAllowedTier, tier };
};

const prizes = [
	{ value: 1, weight: 30 },
	{ value: 2, weight: 25 },
	{ value: 3, weight: 22 },
	{ value: 5, weight: 20 },
	{ value: 10, weight: 1.2 },
	{ value: 15, weight: 0.9 },
	{ value: 20, weight: 0.5 },
	{ value: 25, weight: 0.25 },
	{ value: 30, weight: 0.1 },
	{ value: 40, weight: 0.025 },
	{ value: 50, weight: 0.02 },
	{ value: 100, weight: 0.005 },
];

const selectPrize = () => {
	const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
	let random = Math.random() * totalWeight;

	for (const prize of prizes) {
		if (random < prize.weight) {
			return prize.value;
		}
		random -= prize.weight;
	}
	return prizes[0].value;
};

// Spin the wheel => POST /api/wheel/spin
const spinWheel = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const teamId = req.query.teamId || req.user.team;

	// Check for valid paid subscription
	const { isValid, tier } = await hasValidPaidSubscription(teamId);
	if (!isValid) {
		return next(new ErrorHandler("Spin & Win is only available for Growth, Pro, and Ultra subscribers. Please upgrade your plan.", 403));
	}

	const lastSpin = await WheelSpin.findOne({ user: userId }).sort({ createdAt: -1 });

	const now = new Date();
	if (lastSpin) {
		const lastSpinTime = new Date(lastSpin.createdAt);
		const diff = now.getTime() - lastSpinTime.getTime();
		const hours = diff / (1000 * 60 * 60);
		if (hours < 24) {
			return next(new ErrorHandler("You can only spin the wheel once every 24 hours", 429));
		}
	}

	const prize = selectPrize();
	const prizeIndex = PRIZES_ORDER.indexOf(prize);

	const team = await Team.findById(teamId);
	if (!team) {
		return next(new ErrorHandler("Team not found", 404));
	}
	team.credits += prize;
	await team.save();

	await CreditHistory.create({
		userId: userId,
		teamId: teamId,
		amount_total: 0,
		credits: prize,
		type: "spin",
	});

	await WheelSpin.create({
		user: userId,
		team: teamId,
		creditsWon: prize,
	});

	res.status(200).json({ prize, prizeIndex });
});

// Get wheel status => GET /api/wheel/status
const getWheelStatus = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const teamId = req.query.teamId || req.user.team;

	const lastSpin = await WheelSpin.findOne({ user: userId }).sort({ createdAt: -1 });
	const team = await Team.findById(teamId);

	if (!team) {
		return res.status(200).json({
			lastWheelSpin: null,
			credits: 0,
			hasValidSubscription: false,
			tier: null,
		});
	}

	// Check subscription status
	const { isValid, tier } = await hasValidPaidSubscription(teamId);

	res.status(200).json({
		lastWheelSpin: lastSpin ? lastSpin.createdAt : null,
		creditsWon: lastSpin ? lastSpin.creditsWon : 0,
		credits: team.credits,
		hasValidSubscription: isValid,
		tier: tier,
	});
});

export { spinWheel, getWheelStatus };
