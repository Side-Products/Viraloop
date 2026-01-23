import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";
import ErrorHandler from "@/backend/utils/errorHandler";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import Influencer from "@/backend/models/influencer";
import YoutubeAuth from "@/backend/models/youtubeAuth";
import TiktokAuth from "@/backend/models/tiktokAuth";
import InstagramAuth from "@/backend/models/instagramAuth";
import Member from "@/backend/models/member";

const handler = nc({ onError });

// DELETE /api/influencer/[id]/accounts/[platform] - Disconnect a specific platform
const disconnectAccount = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id || req.user.id;
	const { id: influencerId, platform } = req.query;

	if (!influencerId || !platform) {
		return next(new ErrorHandler("Please provide influencerId and platform", 400));
	}

	const validPlatforms = ["youtube", "tiktok", "instagram"];
	if (!validPlatforms.includes(platform)) {
		return next(new ErrorHandler(`Invalid platform. Must be one of: ${validPlatforms.join(", ")}`, 400));
	}

	// Verify access - user must be a member of the same team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	// Get influencer
	const influencer = await Influencer.findOne({ _id: influencerId, teamId, isActive: true });
	if (!influencer) {
		return next(new ErrorHandler("Influencer not found", 404));
	}

	// Find and soft delete the auth record based on platform
	let authRecord;
	switch (platform) {
		case "youtube":
			authRecord = await YoutubeAuth.findOne({
				influencerId: influencerId,
				teamId: teamId,
				deleted: { $ne: true },
			}).sort({ createdAt: -1 });
			break;
		case "tiktok":
			authRecord = await TiktokAuth.findOne({
				influencerId: influencerId,
				teamId: teamId,
				deleted: { $ne: true },
			}).sort({ createdAt: -1 });
			break;
		case "instagram":
			authRecord = await InstagramAuth.findOne({
				influencerId: influencerId,
				teamId: teamId,
				deleted: { $ne: true },
			}).sort({ createdAt: -1 });
			break;
	}

	if (!authRecord) {
		return next(new ErrorHandler(`${platform} account not connected`, 400));
	}

	// Soft delete the auth record
	authRecord.deleted = true;
	await authRecord.save();

	// Remove reference from influencer
	await Influencer.findByIdAndUpdate(influencerId, {
		[`socialAccounts.${platform}`]: null,
	});

	return res.status(200).json({
		success: true,
		message: `${platform} account disconnected`,
	});
});

handler.use(isAuthenticatedUser).delete(async (req, res, next) => {
	await dbConnect();
	return disconnectAccount(req, res, next);
});

export default handler;
