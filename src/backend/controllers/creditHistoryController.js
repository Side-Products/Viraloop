import CreditHistory from "../models/creditHistory";
import Team from "../models/team";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";

/**
 * Get credit history for a team
 * GET /api/team/credit-history?teamId=xxx
 */
const getCreditHistory = catchAsyncErrors(async (req, res, next) => {
	const { teamId } = req.query;

	if (!teamId) {
		return next(new ErrorHandler("Team ID is required", 400));
	}

	const team = await Team.findById(teamId);
	if (!team) {
		return next(new ErrorHandler("Team not found", 404));
	}

	const creditHistory = await CreditHistory.find({ teamId })
		.sort({ createdAt: -1 })
		.limit(100)
		.populate("influencerId", "name imageUrl")
		.populate("postId", "title");

	res.status(200).json({
		success: true,
		creditHistory,
		currentBalance: team.credits,
	});
});

/**
 * Get credit spending analytics for a team
 * GET /api/team/credit-analytics?teamId=xxx
 */
const getCreditAnalytics = catchAsyncErrors(async (req, res, next) => {
	const { teamId } = req.query;

	if (!teamId) {
		return next(new ErrorHandler("Team ID is required", 400));
	}

	const team = await Team.findById(teamId);
	if (!team) {
		return next(new ErrorHandler("Team not found", 404));
	}

	// Get spending breakdown by type
	const spendingByType = await CreditHistory.aggregate([
		{ $match: { teamId: team._id, type: "spending" } },
		{
			$group: {
				_id: "$spendingType",
				totalCredits: { $sum: { $abs: "$credits" } },
				count: { $sum: 1 },
			},
		},
		{ $sort: { totalCredits: -1 } },
	]);

	// Get credits added breakdown by type
	const creditsAdded = await CreditHistory.aggregate([
		{ $match: { teamId: team._id, type: { $in: ["recurring", "topup"] } } },
		{
			$group: {
				_id: "$type",
				totalCredits: { $sum: "$credits" },
				count: { $sum: 1 },
			},
		},
	]);

	// Get last 30 days spending trend
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const spendingTrend = await CreditHistory.aggregate([
		{
			$match: {
				teamId: team._id,
				type: "spending",
				createdAt: { $gte: thirtyDaysAgo },
			},
		},
		{
			$group: {
				_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
				totalCredits: { $sum: { $abs: "$credits" } },
			},
		},
		{ $sort: { _id: 1 } },
	]);

	res.status(200).json({
		success: true,
		currentBalance: team.credits,
		spendingByType,
		creditsAdded,
		spendingTrend,
	});
});

export { getCreditHistory, getCreditAnalytics };
