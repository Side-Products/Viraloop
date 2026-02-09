import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import Post from "@/backend/models/post";
import ErrorHandler from "@/backend/utils/errorHandler";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import onError from "@/backend/middlewares/errors";
import { isValidApiKeyOrisAuthenticatedUser } from "@/backend/middlewares/auth";

const handler = nc({ onError });

// POST /api/posts/calendar - Get all posts for a team within a date range
const getPostsByDateRange = catchAsyncErrors(async (req, res, next) => {
	await dbConnect();

	const { teamId, startDate, endDate, status } = req.body;

	if (!teamId) {
		return next(new ErrorHandler("Team ID is required", 400));
	}

	if (!startDate || !endDate) {
		return next(new ErrorHandler("Start and end dates are required", 400));
	}

	const start = new Date(startDate);
	const end = new Date(endDate);

	// Build base query for teamId
	const baseQuery = { teamId, isActive: true };

	// Add optional status filter
	if (status) {
		baseQuery.overallStatus = status;
	}

	// Find posts that fall within the date range based on:
	// 1. scheduledTime (for scheduled posts)
	// 2. createdAt (for other posts)
	const query = {
		...baseQuery,
		$or: [
			{
				scheduledTime: {
					$gte: start,
					$lte: end,
				},
			},
			{
				// For posts without scheduledTime, use createdAt
				scheduledTime: null,
				createdAt: {
					$gte: start,
					$lte: end,
				},
			},
		],
	};

	const posts = await Post.find(query)
		.sort({ scheduledTime: 1, createdAt: 1 })
		.populate("userId", "name email")
		.populate("influencerId", "name imageUrl")
		.lean();

	res.status(200).json({
		success: true,
		count: posts.length,
		posts,
	});
});

handler.use(isValidApiKeyOrisAuthenticatedUser).post(getPostsByDateRange);

export default handler;
