import mongoose from "mongoose";
import Influencer from "../models/influencer";
import InfluencerImage from "../models/influencerImage";
import InfluencerVideo from "../models/influencerVideo";
import Member from "../models/member";
import ErrorHandler from "@/backend/utils/errorHandler";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import { useKlingViaReplicate } from "@/backend/modules/videoGeneration";

// Generate video preview using Kling via Replicate
const generateInfluencerVideoPreview = async (influencer, imageUrl, actionPrompt, primaryImageId = null) => {
	// Create InfluencerVideo record with pending status
	const influencerVideo = await InfluencerVideo.create({
		influencerId: influencer._id,
		sourceImageId: primaryImageId,
		sourceImageUrl: imageUrl,
		actionPrompt,
		status: "pending",
		isPrimary: true,
		userId: influencer.userId,
		teamId: influencer.teamId,
	});

	try {
		// Ensure videoPreview object exists and update status to processing
		if (!influencer.videoPreview) {
			influencer.videoPreview = {};
		}
		influencer.videoPreview.status = "processing";
		influencer.markModified("videoPreview");
		await influencer.save();

		// Update InfluencerVideo status to processing
		influencerVideo.status = "processing";
		await influencerVideo.save();

		console.log("Starting influencer video generation with Kling:", {
			influencerId: influencer._id,
			influencerVideoId: influencerVideo._id,
			imageUrl,
			actionPrompt,
		});

		// Generate video using Kling
		const videoResult = await useKlingViaReplicate({
			imageUrl,
			prompt: actionPrompt,
		});

		// Update influencer with video URL
		influencer.videoPreview.status = "completed";
		influencer.videoPreview.videoUrl = videoResult.publicUrl;
		influencer.videoPreview.s3Key = videoResult.key;
		influencer.videoPreview.publicUrl = videoResult.publicUrl;
		influencer.videoPreview.completedAt = new Date();
		influencer.markModified("videoPreview");
		await influencer.save();

		// Update InfluencerVideo record
		influencerVideo.status = "completed";
		influencerVideo.videoUrl = videoResult.publicUrl;
		influencerVideo.s3Key = videoResult.key;
		influencerVideo.publicUrl = videoResult.publicUrl;
		influencerVideo.completedAt = new Date();
		await influencerVideo.save();

		console.log("Influencer video generation with Kling completed successfully:", {
			influencerId: influencer._id,
			influencerVideoId: influencerVideo._id,
			videoUrl: videoResult.publicUrl,
		});

		return videoResult;
	} catch (error) {
		console.error("Error generating influencer video preview with Kling:", error);

		// Ensure videoPreview object exists and update error status
		if (!influencer.videoPreview) {
			influencer.videoPreview = {};
		}
		influencer.videoPreview.status = "failed";
		influencer.videoPreview.error = error.message;
		influencer.markModified("videoPreview");
		await influencer.save();

		// Update InfluencerVideo record with error
		influencerVideo.status = "failed";
		influencerVideo.error = error.message;
		await influencerVideo.save();

		throw error;
	}
};

// Create new influencer
export const createInfluencer = catchAsyncErrors(async (req, res, next) => {
	const { name, description, persona, niche, imageUrl, imagePrompt, voice, tags } = req.body;
	const userId = req.user._id;

	// Get user's current team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	// Validate required fields
	if (!name || !imageUrl || !voice) {
		return next(new ErrorHandler("Please provide all required fields", 400));
	}

	// Validate voice object
	if (!voice.voice_id || !voice.name) {
		return next(new ErrorHandler("Please provide complete voice information", 400));
	}

	const influencer = await Influencer.create({
		name,
		description,
		persona,
		niche,
		imageUrl,
		imagePrompt,
		voice,
		tags: tags || [],
		userId,
		teamId,
		videoPreview: {
			status: "pending",
		},
	});

	// Create InfluencerImage record for the primary image
	const primaryImage = await InfluencerImage.create({
		influencerId: influencer._id,
		imageUrl,
		publicUrl: imageUrl,
		imagePrompt,
		status: "completed",
		completedAt: new Date(),
		isPrimary: true,
		userId,
		teamId,
	});

	// Default action prompt for video generation
	const defaultActionPrompt =
		"The influencer is talking naturally with facial expressions, slight head movements, and engaging eye contact with the camera. Speaking in an energetic and authentic style.";

	// Start video generation in the background using Kling
	generateInfluencerVideoPreview(influencer, imageUrl, defaultActionPrompt, primaryImage._id)
		.then(() => {
			console.log("Influencer video generation completed successfully for influencer:", influencer._id);
		})
		.catch((error) => {
			console.error("Influencer video generation failed for influencer:", influencer._id, error);
		});

	res.status(201).json({
		success: true,
		influencer,
		message: "Influencer created successfully. Video preview is being generated.",
	});
});

// Get all influencers for a team
export const getAllInfluencers = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const { page = 1, limit = 12, search, niche, sortBy = "createdAt", sortOrder = "desc", teamId: queryTeamId } = req.query;

	let teamId;

	if (queryTeamId) {
		// Verify user is a member of the specified team
		const member = await Member.findOne({ userId, teamId: queryTeamId });
		if (!member) {
			return next(new ErrorHandler("User is not a member of this team", 403));
		}
		teamId = queryTeamId;
	} else {
		// Get user's first team membership
		const member = await Member.findOne({ userId }).populate("teamId");
		if (!member) {
			return next(new ErrorHandler("User is not a member of any team", 400));
		}
		teamId = member.teamId._id;
	}

	// Build query
	let query = { teamId, isActive: true };

	// Add search filter
	if (search) {
		query.$or = [
			{ name: { $regex: search, $options: "i" } },
			{ description: { $regex: search, $options: "i" } },
			{ persona: { $regex: search, $options: "i" } },
			{ tags: { $in: [new RegExp(search, "i")] } },
		];
	}

	// Add niche filter
	if (niche) {
		query.niche = niche;
	}

	// Build sort object
	const sortObj = {};
	sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

	// Calculate pagination
	const skip = (page - 1) * limit;

	// Get influencers with pagination
	const influencers = await Influencer.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).populate("userId", "name email").lean();

	// Get total count for pagination
	const totalInfluencers = await Influencer.countDocuments(query);
	const totalPages = Math.ceil(totalInfluencers / limit);

	res.status(200).json({
		success: true,
		influencers,
		pagination: {
			currentPage: parseInt(page),
			totalPages,
			totalInfluencers,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		},
	});
});

// Get single influencer
export const getInfluencer = catchAsyncErrors(async (req, res, next) => {
	const { id } = req.query;
	const userId = req.user._id;

	// Validate ObjectId
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return next(new ErrorHandler("Invalid influencer ID", 400));
	}

	// Get user's current team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	// Find influencer
	const influencer = await Influencer.findOne({ _id: id, teamId, isActive: true }).populate("userId", "name email").lean();

	if (!influencer) {
		return next(new ErrorHandler("Influencer not found", 404));
	}

	res.status(200).json({
		success: true,
		influencer,
	});
});

// Update influencer
export const updateInfluencer = catchAsyncErrors(async (req, res, next) => {
	const { id } = req.query;
	const { name, description, persona, niche, imageUrl, imagePrompt, voice, tags, platforms } = req.body;
	const userId = req.user._id;

	// Validate ObjectId
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return next(new ErrorHandler("Invalid influencer ID", 400));
	}

	// Get user's current team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	// Find influencer
	let influencer = await Influencer.findOne({ _id: id, teamId, isActive: true });
	if (!influencer) {
		return next(new ErrorHandler("Influencer not found", 404));
	}

	// Update fields
	const updateData = {};
	if (name !== undefined) updateData.name = name;
	if (description !== undefined) updateData.description = description;
	if (persona !== undefined) updateData.persona = persona;
	if (niche !== undefined) updateData.niche = niche;
	if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
	if (imagePrompt !== undefined) updateData.imagePrompt = imagePrompt;
	if (voice !== undefined) {
		// Validate voice object
		if (!voice.voice_id || !voice.name) {
			return next(new ErrorHandler("Please provide complete voice information", 400));
		}
		updateData.voice = voice;
	}
	if (tags !== undefined) updateData.tags = tags;
	if (platforms !== undefined) updateData.platforms = platforms;

	influencer = await Influencer.findByIdAndUpdate(id, updateData, {
		new: true,
		runValidators: true,
	}).populate("userId", "name email");

	res.status(200).json({
		success: true,
		influencer,
		message: "Influencer updated successfully",
	});
});

// Delete influencer (soft delete)
export const deleteInfluencer = catchAsyncErrors(async (req, res, next) => {
	const { id } = req.query;
	const userId = req.user._id;

	// Validate ObjectId
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return next(new ErrorHandler("Invalid influencer ID", 400));
	}

	// Get user's current team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	// Find and soft delete influencer
	const influencer = await Influencer.findOneAndUpdate({ _id: id, teamId, isActive: true }, { isActive: false }, { new: true });

	if (!influencer) {
		return next(new ErrorHandler("Influencer not found", 404));
	}

	res.status(200).json({
		success: true,
		message: "Influencer deleted successfully",
	});
});

// Increment influencer usage
export const incrementInfluencerUsage = catchAsyncErrors(async (req, res, next) => {
	const { id } = req.query;
	const userId = req.user._id;

	// Validate ObjectId
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return next(new ErrorHandler("Invalid influencer ID", 400));
	}

	// Get user's current team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	// Find influencer and increment usage
	const influencer = await Influencer.findOne({ _id: id, teamId, isActive: true });
	if (!influencer) {
		return next(new ErrorHandler("Influencer not found", 404));
	}

	await influencer.incrementUsage();

	res.status(200).json({
		success: true,
		message: "Influencer usage incremented",
		usageCount: influencer.usageCount,
	});
});
