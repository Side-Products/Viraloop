import axios from "axios";
import absoluteUrl from "next-absolute-url";
import InstagramAuth from "../models/instagramAuth";
import Influencer from "../models/influencer";
import Member from "../models/member";
import ErrorHandler from "@/backend/utils/errorHandler";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import { exchangeForLongLivedToken, ensureValidInstagramToken } from "../utils/instagramTokenRefresh";

// For local development - set this to your ngrok URL when testing locally
const NGROK_URL = process.env.NGROK_URL || null;

// Instagram OAuth - Initiate OAuth flow
export const instagramOauth = catchAsyncErrors(async (req, res, next) => {
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
	const baseUrl = process.env.NODE_ENV === "development" && NGROK_URL ? NGROK_URL : origin;

	// Instagram API with Instagram Login uses OAuth 2.0
	const authUrl = "https://api.instagram.com/oauth/authorize";
	const redirectUri = `${baseUrl}/api/oauth/callback/instagram`;

	// Required scopes for content publishing
	const scopes = ["instagram_business_basic", "instagram_business_content_publish"].join(",");

	// Generate state parameter to pass influencerId, teamId and userId through OAuth flow
	const state = Buffer.from(JSON.stringify({ influencerId, teamId, userId: userId.toString() })).toString("base64");

	// Create pending auth record
	await InstagramAuth.create({
		userId: userId,
		teamId: teamId,
		influencerId: influencerId,
		deleted: true,
	});

	const params = new URLSearchParams({
		client_id: process.env.INSTAGRAM_OAUTH_CLIENT_ID,
		redirect_uri: redirectUri,
		scope: scopes,
		response_type: "code",
		state: state,
	});

	res.status(200).json({ success: true, url: `${authUrl}?${params.toString()}` });
});

// Instagram OAuth Callback
export const instagramOauthCallback = catchAsyncErrors(async (req, res) => {
	const { code, state, error, error_description } = req.query;

	const { origin } = absoluteUrl(req);
	const baseUrl = process.env.NODE_ENV === "development" && NGROK_URL ? NGROK_URL : origin;

	if (error) {
		return res.redirect(`${baseUrl}/accounts?error=${encodeURIComponent(error_description || error)}`);
	}

	// Decode state parameter to get influencerId, teamId and userId
	let influencerId, teamId, userId;
	try {
		const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
		influencerId = decodedState.influencerId;
		teamId = decodedState.teamId;
		userId = decodedState.userId;
	} catch (err) {
		console.error("Failed to decode state parameter:", err);
		return res.redirect(`${baseUrl}/accounts?error=${encodeURIComponent("Invalid OAuth state parameter")}`);
	}

	const redirectUri = `${baseUrl}/api/oauth/callback/instagram`;

	// Exchange code for access token
	const tokenUrl = "https://api.instagram.com/oauth/access_token";

	const params = new URLSearchParams({
		client_id: process.env.INSTAGRAM_OAUTH_CLIENT_ID,
		client_secret: process.env.INSTAGRAM_OAUTH_CLIENT_SECRET,
		grant_type: "authorization_code",
		redirect_uri: redirectUri,
		code: code,
	});

	try {
		const tokenResponse = await axios.post(tokenUrl, params, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		const { access_token, user_id } = tokenResponse.data;

		// Exchange short-lived token for long-lived token (60 days validity)
		console.log("Exchanging short-lived Instagram token for long-lived token");
		const longLivedTokenData = await exchangeForLongLivedToken(access_token, console);

		// Get account information using Instagram Graph API
		const accountInfoUrl = `https://graph.instagram.com/me`;
		const accountInfoParams = new URLSearchParams({
			fields: "id,username,account_type,media_count,followers_count,follows_count,profile_picture_url,biography",
			access_token: longLivedTokenData.access_token,
		});

		const accountInfoResponse = await axios.get(`${accountInfoUrl}?${accountInfoParams.toString()}`);

		// Find the pending auth record
		const instagramAuth = await InstagramAuth.findOne({
			influencerId: influencerId,
			deleted: true,
		}).sort({ createdAt: -1 });

		if (!instagramAuth) {
			// Create new if not found
			const newAuth = await InstagramAuth.create({
				userId: userId,
				teamId: teamId,
				influencerId: influencerId,
				tokens: {
					...longLivedTokenData,
					user_id, // Keep original user_id from OAuth
				},
				accountInfo: accountInfoResponse.data,
				deleted: false,
			});

			// Update influencer's socialAccounts reference
			await Influencer.findByIdAndUpdate(influencerId, {
				"socialAccounts.instagram": newAuth._id,
			});
		} else {
			instagramAuth.tokens = {
				...longLivedTokenData,
				user_id,
			};
			instagramAuth.accountInfo = accountInfoResponse.data;
			instagramAuth.deleted = false;
			await instagramAuth.save();

			// Update influencer's socialAccounts reference
			await Influencer.findByIdAndUpdate(influencerId, {
				"socialAccounts.instagram": instagramAuth._id,
			});
		}

		return res.redirect(`${baseUrl}/accounts?success=instagram&influencer=${influencerId}`);
	} catch (error) {
		console.error("Instagram OAuth callback error:", error.response?.data || error);
		return res.redirect(`${baseUrl}/accounts?error=${encodeURIComponent("Failed to connect Instagram account")}`);
	}
});

// Get Instagram account info for an influencer
export const getInstagramAccountInfo = catchAsyncErrors(async (req, res, next) => {
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

	const instagramAuth = await InstagramAuth.findOne({
		influencerId: influencerId,
		teamId: teamId,
		deleted: { $ne: true },
	}).sort({ createdAt: -1 });

	if (!instagramAuth) {
		return res.status(200).json({
			success: true,
			connected: false,
			accountInfo: null,
		});
	}

	// Try to fetch fresh account info
	try {
		const tokens = await ensureValidInstagramToken(influencerId, console);

		const accountInfoUrl = `https://graph.instagram.com/me`;
		const accountInfoParams = new URLSearchParams({
			fields: "id,username,account_type,media_count,followers_count,follows_count,profile_picture_url,biography",
			access_token: tokens.access_token,
		});

		const accountInfoResponse = await axios.get(`${accountInfoUrl}?${accountInfoParams.toString()}`);

		// Update stored account info
		instagramAuth.accountInfo = accountInfoResponse.data;
		await instagramAuth.save();

		res.status(200).json({
			success: true,
			connected: true,
			accountInfo: accountInfoResponse.data,
			tokenExpiresAt: tokens.expires_at,
		});
	} catch (error) {
		console.error("Error fetching Instagram account info:", error);
		// Return stored info if fresh fetch fails
		res.status(200).json({
			success: true,
			connected: true,
			accountInfo: instagramAuth.accountInfo,
		});
	}
});

// Disconnect Instagram account from influencer
export const disconnectInstagram = catchAsyncErrors(async (req, res, next) => {
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

	const instagramAuth = await InstagramAuth.findOne({
		influencerId: influencerId,
		teamId: teamId,
		deleted: { $ne: true },
	}).sort({ createdAt: -1 });

	if (!instagramAuth) {
		return next(new ErrorHandler("Instagram account not connected", 400));
	}

	// Soft delete the auth record
	instagramAuth.deleted = true;
	await instagramAuth.save();

	// Remove reference from influencer
	await Influencer.findByIdAndUpdate(influencerId, {
		"socialAccounts.instagram": null,
	});

	return res.status(200).json({
		success: true,
		message: "Instagram account disconnected",
	});
});
