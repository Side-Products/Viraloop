import axios from "axios";
import absoluteUrl from "next-absolute-url";
import TiktokAuth from "../models/tiktokAuth";
import Influencer from "../models/influencer";
import Member from "../models/member";
import ErrorHandler from "@/backend/utils/errorHandler";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";

// TikTok OAuth - Initiate OAuth flow
export const tiktokOauth = catchAsyncErrors(async (req, res, next) => {
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

	try {
		const { origin } = absoluteUrl(req);
		const redirectUri = `${origin}/api/oauth/callback/tiktok`;

		const csrfState = Math.random().toString(36).substring(2) + "_" + influencerId;

		// Create pending auth record with influencerId
		await TiktokAuth.create({
			userId: userId,
			teamId: teamId,
			influencerId: influencerId,
			csrfState: csrfState,
			deleted: true, // Mark as deleted until OAuth completes
		});

		let url = "https://www.tiktok.com/v2/auth/authorize/";

		const params = new URLSearchParams({
			client_key: process.env.TIKTOK_CLIENT_KEY,
			scope: "user.info.basic,user.info.profile,user.info.stats,video.publish,video.upload",
			response_type: "code",
			redirect_uri: redirectUri,
			state: csrfState,
		});

		url += "?" + params.toString();

		res.status(200).json({ success: true, url });
	} catch (error) {
		console.error("Error during TikTok OAuth:", error);
		return next(new ErrorHandler("Error initiating TikTok OAuth", 400));
	}
});

// TikTok OAuth Callback - Handle OAuth callback
export const tiktokOauthCallback = catchAsyncErrors(async (req, res, next) => {
	const { code, scopes, state, error, error_description } = req.query;

	const { origin } = absoluteUrl(req);

	if (error) {
		console.error("TikTok OAuth error:", error, error_description);
		return res.redirect(`${origin}/accounts?error=${encodeURIComponent(error_description || error)}`);
	}

	// Find the pending auth record by state
	const tiktokAuth = await TiktokAuth.findOne({ csrfState: state }).sort({ createdAt: -1 });
	if (!tiktokAuth) {
		return res.redirect(`${origin}/accounts?error=${encodeURIComponent("OAuth session expired. Please try again.")}`);
	}

	const influencerId = tiktokAuth.influencerId;

	try {
		// Save code and scopes
		tiktokAuth.code = code;
		tiktokAuth.scopes = scopes;
		await tiktokAuth.save();

		// Exchange code for tokens
		const redirectUri = `${origin}/api/oauth/callback/tiktok`;

		const headers = {
			"Content-Type": "application/x-www-form-urlencoded",
		};

		const params = new URLSearchParams({
			client_key: process.env.TIKTOK_CLIENT_KEY,
			client_secret: process.env.TIKTOK_CLIENT_SECRET,
			code: code,
			grant_type: "authorization_code",
			redirect_uri: redirectUri,
		});

		const response = await axios.post("https://open.tiktokapis.com/v2/oauth/token/", params, { headers });

		if (!response.data || !response.data.access_token) {
			throw new Error("Invalid token response from TikTok");
		}

		// Enhance tokens with expiry timestamps
		const tokens = {
			access_token: response.data.access_token,
			refresh_token: response.data.refresh_token,
			expires_in: response.data.expires_in,
			refresh_expires_in: response.data.refresh_expires_in,
			access_token_expires_at: Date.now() + response.data.expires_in * 1000,
			refresh_token_expires_at: Date.now() + response.data.refresh_expires_in * 1000,
			last_refreshed_at: Date.now(),
		};

		tiktokAuth.tokens = tokens;
		tiktokAuth.deleted = false;
		await tiktokAuth.save();

		// Fetch user info
		try {
			const userInfoResponse = await axios.get(
				"https://open.tiktokapis.com/v2/user/info/?fields=display_name,username,avatar_url,bio_description,video_count,follower_count,likes_count",
				{
					headers: {
						Authorization: `Bearer ${tokens.access_token}`,
					},
				}
			);

			if (userInfoResponse.data?.data?.user) {
				tiktokAuth.userInfo = userInfoResponse.data.data.user;
				await tiktokAuth.save();
			}
		} catch (userInfoError) {
			console.error("Error fetching TikTok user info:", userInfoError);
			// Continue anyway - tokens are valid
		}

		// Update influencer's socialAccounts reference
		await Influencer.findByIdAndUpdate(influencerId, {
			"socialAccounts.tiktok": tiktokAuth._id,
		});

		return res.redirect(`${origin}/accounts?success=tiktok&influencer=${influencerId}`);
	} catch (error) {
		console.error("Error in TikTok OAuth callback:", error.response?.data || error.message);

		// Clean up failed auth record
		await TiktokAuth.findByIdAndDelete(tiktokAuth._id);

		return res.redirect(`${origin}/accounts?error=${encodeURIComponent("Failed to connect TikTok account. Please try again.")}`);
	}
});

// Get TikTok account info for an influencer
export const getTiktokAccountInfo = catchAsyncErrors(async (req, res, next) => {
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

	const tiktokAuth = await TiktokAuth.findOne({
		influencerId: influencerId,
		teamId: teamId,
		deleted: { $ne: true },
	}).sort({ createdAt: -1 });

	if (!tiktokAuth) {
		return res.status(200).json({
			success: true,
			connected: false,
			accountInfo: null,
		});
	}

	res.status(200).json({
		success: true,
		connected: true,
		accountInfo: tiktokAuth.userInfo,
	});
});

// Disconnect TikTok account from influencer
export const disconnectTiktok = catchAsyncErrors(async (req, res, next) => {
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

	const tiktokAuth = await TiktokAuth.findOne({
		influencerId: influencerId,
		teamId: teamId,
		deleted: { $ne: true },
	}).sort({ createdAt: -1 });

	if (!tiktokAuth) {
		return next(new ErrorHandler("TikTok account not connected", 400));
	}

	// Revoke the access token on TikTok's side
	try {
		if (tiktokAuth.tokens?.access_token) {
			const params = new URLSearchParams({
				client_key: process.env.TIKTOK_CLIENT_KEY,
				client_secret: process.env.TIKTOK_CLIENT_SECRET,
				token: tiktokAuth.tokens.access_token,
			});

			await axios.post("https://open.tiktokapis.com/v2/oauth/revoke/", params, {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			});
		}
	} catch (error) {
		console.error("Error revoking TikTok token:", error.response?.data || error.message);
		// Continue with deletion even if revocation fails
	}

	// Soft delete the auth record
	tiktokAuth.deleted = true;
	await tiktokAuth.save();

	// Remove reference from influencer
	await Influencer.findByIdAndUpdate(influencerId, {
		"socialAccounts.tiktok": null,
	});

	return res.status(200).json({
		success: true,
		message: "TikTok account disconnected",
	});
});
