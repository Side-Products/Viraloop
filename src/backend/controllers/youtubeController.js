import { google } from "googleapis";
import absoluteUrl from "next-absolute-url";
import YoutubeAuth from "../models/youtubeAuth";
import Influencer from "../models/influencer";
import Member from "../models/member";
import ErrorHandler from "@/backend/utils/errorHandler";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";

// YouTube OAuth - Initiate OAuth flow
export const youtubeOauth = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id || req.user.id;
	const { influencerId } = req.query;

	if (!userId || !influencerId) {
		return next(new ErrorHandler("Please provide influencerId", 400));
	}

	// Verify influencer exists and belongs to user's team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	const influencer = await Influencer.findOne({ _id: influencerId, teamId, isActive: true });
	if (!influencer) {
		return next(new ErrorHandler("Influencer not found", 404));
	}

	const { origin } = absoluteUrl(req);

	const oauth2Client = new google.auth.OAuth2(
		process.env.YOUTUBE_CLIENT_ID,
		process.env.YOUTUBE_CLIENT_SECRET,
		`${origin}/api/oauth/callback/youtube`
	);

	const scopes = ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/youtube"];

	// Store influencerId in state parameter
	const state = Buffer.from(JSON.stringify({ influencerId, teamId, userId })).toString("base64");

	const authorizeUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: scopes,
		prompt: "consent",
		state: state,
	});

	// Create pending auth record
	await YoutubeAuth.create({
		userId: userId,
		teamId: teamId,
		influencerId: influencerId,
		deleted: true,
	});

	res.status(200).json({ success: true, url: authorizeUrl });
});

// YouTube OAuth Callback
export const youtubeOauthCallback = catchAsyncErrors(async (req, res, next) => {
	const { code, state, error } = req.query;

	const { origin } = absoluteUrl(req);

	if (error) {
		console.error("YouTube OAuth error:", error);
		return res.redirect(`${origin}/accounts?error=${encodeURIComponent(error)}`);
	}

	// Decode state to get influencerId
	let stateData;
	try {
		stateData = JSON.parse(Buffer.from(state, "base64").toString());
	} catch (e) {
		return res.redirect(`${origin}/accounts?error=${encodeURIComponent("Invalid OAuth state")}`);
	}

	const { influencerId, teamId, userId } = stateData;

	try {
		const oauth2Client = new google.auth.OAuth2(
			process.env.YOUTUBE_CLIENT_ID,
			process.env.YOUTUBE_CLIENT_SECRET,
			`${origin}/api/oauth/callback/youtube`
		);

		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);

		// Get channel info
		const youtube = google.youtube({
			version: "v3",
			auth: oauth2Client,
		});

		const { data } = await youtube.channels.list({
			part: "snippet,contentDetails,statistics",
			mine: true,
		});

		// Find the pending auth record
		const youtubeAuth = await YoutubeAuth.findOne({
			influencerId: influencerId,
			deleted: true,
		}).sort({ createdAt: -1 });

		if (!youtubeAuth) {
			// Create new if not found
			const newAuth = await YoutubeAuth.create({
				userId: userId,
				teamId: teamId,
				influencerId: influencerId,
				tokens: tokens,
				channelInfo: data.items?.[0] || null,
				deleted: false,
			});

			// Update influencer's socialAccounts reference
			await Influencer.findByIdAndUpdate(influencerId, {
				"socialAccounts.youtube": newAuth._id,
			});
		} else {
			youtubeAuth.tokens = tokens;
			youtubeAuth.channelInfo = data.items?.[0] || null;
			youtubeAuth.deleted = false;
			await youtubeAuth.save();

			// Update influencer's socialAccounts reference
			await Influencer.findByIdAndUpdate(influencerId, {
				"socialAccounts.youtube": youtubeAuth._id,
			});
		}

		return res.redirect(`${origin}/accounts?success=youtube&influencer=${influencerId}`);
	} catch (error) {
		console.error("Error in YouTube OAuth callback:", error);
		return res.redirect(`${origin}/accounts?error=${encodeURIComponent("Failed to connect YouTube account. Please try again.")}`);
	}
});

// Get YouTube account info for an influencer
export const getYoutubeAccountInfo = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const { influencerId } = req.query;

	if (!influencerId) {
		return next(new ErrorHandler("Please provide influencerId", 400));
	}

	// Verify access
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	const youtubeAuth = await YoutubeAuth.findOne({
		influencerId: influencerId,
		teamId: teamId,
		deleted: { $ne: true },
	}).sort({ createdAt: -1 });

	if (!youtubeAuth) {
		return res.status(200).json({
			success: true,
			connected: false,
			channelInfo: null,
		});
	}

	res.status(200).json({
		success: true,
		connected: true,
		channelInfo: youtubeAuth.channelInfo,
	});
});

// Disconnect YouTube account from influencer
export const disconnectYoutube = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const { influencerId } = req.query;

	if (!influencerId) {
		return next(new ErrorHandler("Please provide influencerId", 400));
	}

	// Verify access
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	const youtubeAuth = await YoutubeAuth.findOne({
		influencerId: influencerId,
		teamId: teamId,
		deleted: { $ne: true },
	}).sort({ createdAt: -1 });

	if (!youtubeAuth) {
		return next(new ErrorHandler("YouTube account not connected", 400));
	}

	// Soft delete the auth record
	youtubeAuth.deleted = true;
	await youtubeAuth.save();

	// Remove reference from influencer
	await Influencer.findByIdAndUpdate(influencerId, {
		"socialAccounts.youtube": null,
	});

	return res.status(200).json({
		success: true,
		message: "YouTube account disconnected",
	});
});
