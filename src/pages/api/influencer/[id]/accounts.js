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

// GET /api/influencer/[id]/accounts - Get all connected accounts for an influencer
const getInfluencerAccounts = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id || req.user.id;
	const { id: influencerId } = req.query;

	if (!influencerId) {
		return next(new ErrorHandler("Please provide influencerId", 400));
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

	// Get connected accounts
	const [youtubeAuth, tiktokAuth, instagramAuth] = await Promise.all([
		YoutubeAuth.findOne({
			influencerId: influencerId,
			teamId: teamId,
			deleted: { $ne: true },
		}).sort({ createdAt: -1 }),
		TiktokAuth.findOne({
			influencerId: influencerId,
			teamId: teamId,
			deleted: { $ne: true },
		}).sort({ createdAt: -1 }),
		InstagramAuth.findOne({
			influencerId: influencerId,
			teamId: teamId,
			deleted: { $ne: true },
		}).sort({ createdAt: -1 }),
	]);

	res.status(200).json({
		success: true,
		accounts: {
			youtube: youtubeAuth
				? {
						connected: true,
						channelName: youtubeAuth.channelInfo?.snippet?.title || null,
						channelId: youtubeAuth.channelInfo?.id || null,
						thumbnailUrl: youtubeAuth.channelInfo?.snippet?.thumbnails?.default?.url || null,
						subscriberCount: youtubeAuth.channelInfo?.statistics?.subscriberCount || null,
					}
				: { connected: false },
			tiktok: tiktokAuth
				? {
						connected: true,
						username: tiktokAuth.userInfo?.username || tiktokAuth.userInfo?.display_name || null,
						displayName: tiktokAuth.userInfo?.display_name || null,
						avatarUrl: tiktokAuth.userInfo?.avatar_url || null,
						followerCount: tiktokAuth.userInfo?.follower_count || null,
					}
				: { connected: false },
			instagram: instagramAuth
				? {
						connected: true,
						username: instagramAuth.accountInfo?.username || null,
						profilePictureUrl: instagramAuth.accountInfo?.profile_picture_url || null,
						followersCount: instagramAuth.accountInfo?.followers_count || null,
						accountType: instagramAuth.accountInfo?.account_type || null,
					}
				: { connected: false },
		},
	});
});

handler.use(isAuthenticatedUser).get(async (req, res, next) => {
	await dbConnect();
	return getInfluencerAccounts(req, res, next);
});

export default handler;
