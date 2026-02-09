import mongoose from "mongoose";
import Influencer from "../models/influencer";
import InfluencerImage from "../models/influencerImage";
import Member from "../models/member";
import ErrorHandler from "@/backend/utils/errorHandler";
import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import { checkAndIncrementImageUsage } from "@/backend/middlewares/usageLimits";

// Get all images for an influencer
export const getInfluencerImages = catchAsyncErrors(async (req, res, next) => {
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

	// Verify influencer exists and belongs to team
	const influencer = await Influencer.findOne({ _id: id, teamId, isActive: true });
	if (!influencer) {
		return next(new ErrorHandler("Influencer not found", 404));
	}

	// Get all images for this influencer
	const images = await InfluencerImage.find({ influencerId: id, teamId }).sort({ isPrimary: -1, createdAt: -1 }).lean();

	res.status(200).json({
		success: true,
		images,
		count: images.length,
	});
});

// Create new image for an influencer
export const createInfluencerImage = catchAsyncErrors(async (req, res, next) => {
	const { id } = req.query;
	const { imageUrl, imagePrompt, referenceImages, dimension, isPrimary } = req.body;
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

	// Verify influencer exists and belongs to team
	const influencer = await Influencer.findOne({ _id: id, teamId, isActive: true });
	if (!influencer) {
		return next(new ErrorHandler("Influencer not found", 404));
	}

	// Check team's monthly image limit
	const usageCheck = await checkAndIncrementImageUsage(teamId);
	if (!usageCheck.allowed) {
		return res.status(429).json({
			success: false,
			message: usageCheck.message,
			limitReached: true,
			usage: {
				used: usageCheck.used,
				limit: usageCheck.limit,
				remaining: usageCheck.remaining,
			},
		});
	}

	// Validate required fields
	if (!imageUrl) {
		return next(new ErrorHandler("Image URL is required", 400));
	}

	// If setting as primary, unset any existing primary
	if (isPrimary) {
		await InfluencerImage.updateMany({ influencerId: id, isPrimary: true }, { isPrimary: false });

		// Also update the Influencer's imageUrl
		await Influencer.findByIdAndUpdate(id, { imageUrl, imagePrompt });
	}

	// Create the image record
	const image = await InfluencerImage.create({
		influencerId: id,
		imageUrl,
		publicUrl: imageUrl,
		imagePrompt,
		referenceImages: referenceImages || [],
		dimension: dimension || "9:16",
		isPrimary: isPrimary || false,
		status: "completed",
		completedAt: new Date(),
		userId,
		teamId,
	});

	res.status(201).json({
		success: true,
		image,
		message: "Image created successfully",
	});
});

// Update an image (set as primary, update metadata)
export const updateInfluencerImage = catchAsyncErrors(async (req, res, next) => {
	const { id, imageId } = req.query;
	const { isPrimary } = req.body;
	const userId = req.user._id;

	// Validate ObjectIds
	if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(imageId)) {
		return next(new ErrorHandler("Invalid ID provided", 400));
	}

	// Get user's current team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	// Find the image
	const image = await InfluencerImage.findOne({ _id: imageId, influencerId: id, teamId });
	if (!image) {
		return next(new ErrorHandler("Image not found", 404));
	}

	// If setting as primary
	if (isPrimary) {
		// Unset any existing primary
		await InfluencerImage.updateMany({ influencerId: id, isPrimary: true }, { isPrimary: false });

		// Set this image as primary
		image.isPrimary = true;
		await image.save();

		// Update the Influencer's main imageUrl
		await Influencer.findByIdAndUpdate(id, {
			imageUrl: image.imageUrl,
			imagePrompt: image.imagePrompt,
		});
	}

	res.status(200).json({
		success: true,
		image,
		message: isPrimary ? "Image set as primary successfully" : "Image updated successfully",
	});
});

// Delete an image
export const deleteInfluencerImage = catchAsyncErrors(async (req, res, next) => {
	const { id, imageId } = req.query;
	const userId = req.user._id;

	// Validate ObjectIds
	if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(imageId)) {
		return next(new ErrorHandler("Invalid ID provided", 400));
	}

	// Get user's current team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return next(new ErrorHandler("User is not a member of any team", 400));
	}

	const teamId = member.teamId._id;

	// Find the image
	const image = await InfluencerImage.findOne({ _id: imageId, influencerId: id, teamId });
	if (!image) {
		return next(new ErrorHandler("Image not found", 404));
	}

	// Don't allow deleting the primary image if it's the only image
	if (image.isPrimary) {
		const imageCount = await InfluencerImage.countDocuments({ influencerId: id, teamId });
		if (imageCount <= 1) {
			return next(new ErrorHandler("Cannot delete the only image. Generate another image first.", 400));
		}

		// Find another image to make primary
		const nextImage = await InfluencerImage.findOne({
			influencerId: id,
			teamId,
			_id: { $ne: imageId },
		}).sort({ createdAt: -1 });

		if (nextImage) {
			nextImage.isPrimary = true;
			await nextImage.save();

			// Update influencer's main imageUrl
			await Influencer.findByIdAndUpdate(id, {
				imageUrl: nextImage.imageUrl,
				imagePrompt: nextImage.imagePrompt,
			});
		}
	}

	// Delete the image record
	await InfluencerImage.findByIdAndDelete(imageId);

	res.status(200).json({
		success: true,
		message: "Image deleted successfully",
	});
});
