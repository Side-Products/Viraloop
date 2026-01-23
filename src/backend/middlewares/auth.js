import mongoose from "mongoose";
import { getSession } from "next-auth/react";
import catchAsyncErrors from "./catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import Team from "../models/team";
import Member from "../models/member";
import User from "../models/user";

const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	const session = await getSession({ req });

	if (!session) {
		return next(new ErrorHandler("Invalid credentials: Login first to access this resource", 401));
	}

	req.user = session.user;
	req.influencer = {
		_id: req?.body?.influencerId || req?.query?.influencerId || req?.params?.influencerId,
	};
	req.post = {
		_id: req?.body?.postId || req?.query?.postId || req?.params?.postId || req?.body?.id || req?.query?.id || req?.params?.id,
	};
	next();
});

const maybeAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	const session = await getSession({ req });

	if (session) {
		req.user = session.user;
		next();
	} else {
		next();
	}
});

const isMemberOfTeam = catchAsyncErrors(async (req, res, next) => {
	if (req.user.role === "admin") {
		next();
	} else {
		const userId = req.user._id || req.user.id;
		const teamId = req.body.teamId || req.query.teamId;

		if (!teamId) {
			return next(new ErrorHandler("Team ID is required", 400));
		}

		const teamInfo = await Team.aggregate([
			{
				$match: {
					_id: mongoose.Types.ObjectId(teamId),
				},
			},
			{
				$lookup: {
					from: "members",
					localField: "_id",
					foreignField: "teamId",
					as: "teamMembers",
				},
			},
			{
				$match: {
					"teamMembers.userId": mongoose.Types.ObjectId(userId),
				},
			},
		]);
		const isMember = teamInfo[0]?.teamMembers?.length > 0;
		if (!isMember) {
			return next(new ErrorHandler("You are not a member of this team", 401));
		}

		next();
	}
});

// Handling user roles
const authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource.`, 403));
		}
		next();
	};
};

// API Key middleware
const isValidApiKey = catchAsyncErrors(async (req, res, next) => {
	const apiKey = req.headers["x-api-key"] || req.query?.apiKey || req.body?.apiKey;
	if (!apiKey) {
		return next(new ErrorHandler("API Key is missing", 401));
	}

	const team = await Team.findOne({ apiKey: apiKey });
	if (!team) {
		return next(new ErrorHandler("No team found with this api key", 404));
	}

	req.body = { ...req.body, teamId: team._id.toString() };
	req.influencer = {
		_id: req?.body?.influencerId || req?.query?.influencerId || req?.params?.influencerId,
	};
	req.post = {
		_id: req?.body?.postId || req?.query?.postId || req?.params?.postId || req?.body?.id || req?.query?.id || req?.params?.id,
	};

	next();
});

const isAdmin = catchAsyncErrors(async (req, res, next) => {
	const accessKey = req.headers["x-admin-key"];
	if (!accessKey) {
		return next(new ErrorHandler("Admin Key is missing", 401));
	}

	const canAccess = accessKey === process.env.ADMIN_SECRET_KEY;
	if (!canAccess) {
		return next(new ErrorHandler("Invalid key", 404));
	}

	next();
});

const isValidApiKeyOrisAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	try {
		const session = await getSession({ req });
		if (!session) {
			throw Error("Not authenticated");
		}

		req.user = session.user;
		req.influencer = {
			_id: req?.body?.influencerId || req?.query?.influencerId || req?.params?.influencerId,
		};
		req.post = {
			_id: req?.body?.postId || req?.query?.postId || req?.params?.postId || req?.body?.id || req?.query?.id || req?.params?.id,
		};
		next();
	} catch (error) {
		const apiKey = req.headers["x-api-key"] || req.query?.apiKey || req.body?.apiKey;
		if (!apiKey) {
			return next(new ErrorHandler("API Key is missing", 401));
		}

		const team = await Team.findOne({ apiKey: apiKey });
		if (!team) {
			return next(new ErrorHandler("No team found with this api key", 404));
		}

		const adminMember = await Member.findOne({ teamId: team._id, role: "admin" });
		const user = await User.findOne({ _id: adminMember.userId });

		req.body = { ...req.body, teamId: team._id };
		req.user = user;
		req.team = team;
		req.influencer = {
			_id: req?.body?.influencerId || req?.query?.influencerId || req?.params?.influencerId,
		};
		req.post = {
			_id: req?.body?.postId || req?.query?.postId || req?.params?.postId || req?.body?.id || req?.query?.id || req?.params?.id,
		};
		next();
	}
});

const corsMiddleware = (req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	next();
};

export {
	isAuthenticatedUser,
	maybeAuthenticatedUser,
	isMemberOfTeam,
	authorizeRoles,
	isValidApiKey,
	isValidApiKeyOrisAuthenticatedUser,
	corsMiddleware,
	isAdmin,
};
