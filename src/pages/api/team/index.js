import nc from "next-connect";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import Team from "@/backend/models/team";
import Member from "@/backend/models/member";
import Influencer from "@/backend/models/influencer";
import Subscription from "@/backend/models/subscription";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

// Create a new team
handler.use(isAuthenticatedUser).post(async (req, res) => {
	await dbConnect();

	const { name } = req.body;
	const userId = req.user._id;

	if (!name || !name.trim()) {
		return res.status(400).json({
			success: false,
			message: "Team name is required",
		});
	}

	// Generate API key for the team
	const apiKey = crypto.randomBytes(32).toString("hex");

	// Create the team
	const team = await Team.create({
		name: name.trim(),
		createdBy: userId,
		apiKey,
		isDefault: false,
	});

	// The Member record is created automatically via Team model's post-save hook

	res.status(201).json({
		success: true,
		team,
	});
});

// Get all teams for the authenticated user
handler.use(isAuthenticatedUser).get(async (req, res) => {
	await dbConnect();

	const userId = req.user._id;

	// Find all teams the user is a member of
	const members = await Member.find({ userId }).populate("teamId");

	// Get team IDs for influencer count query
	const teamIds = members.filter((m) => m.teamId).map((m) => m.teamId._id);

	// Count influencers per team
	const influencerCounts = await Influencer.aggregate([
		{ $match: { teamId: { $in: teamIds } } },
		{ $group: { _id: "$teamId", count: { $sum: 1 } } },
	]);
	const countMap = Object.fromEntries(influencerCounts.map((c) => [c._id.toString(), c.count]));

	// Get active subscriptions for each team
	const subscriptions = await Subscription.find({
		team: { $in: teamIds },
		subscriptionValidUntil: { $gte: new Date() },
	}).sort({ createdAt: -1 });
	const subscriptionMap = {};
	subscriptions.forEach((sub) => {
		const teamIdStr = sub.team.toString();
		// Only keep the most recent subscription per team
		if (!subscriptionMap[teamIdStr]) {
			subscriptionMap[teamIdStr] = {
				plan: sub.plan,
				status: sub.stripe_subscription_status,
				validUntil: sub.subscriptionValidUntil,
				stripe_priceId: sub.stripe_priceId,
				stripe_subscription_status: sub.stripe_subscription_status,
				subscriptionValidUntil: sub.subscriptionValidUntil,
				version: sub.version || 1,
			};
		}
	});

	// Extract teams from member records
	const teams = members
		.filter((member) => member.teamId) // Filter out any null teamIds
		.map((member) => ({
			_id: member.teamId._id,
			name: member.teamId.name,
			credits: member.teamId.credits || 0,
			isDefault: member.teamId.isDefault || false,
			role: member.role,
			// Usage limits
			influencerLimit: member.teamId.influencerLimit || 0,
			influencersCount: countMap[member.teamId._id.toString()] || 0,
			// Subscription info
			subscription: subscriptionMap[member.teamId._id.toString()] || null,
		}));

	res.status(200).json({
		success: true,
		teams,
	});
});

export default handler;
