import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";
import { useNanoBananaProViaReplicate } from "@/backend/modules/imageGeneration";
import Member from "@/backend/models/member";
import { checkAndIncrementImageUsage } from "@/backend/middlewares/usageLimits";
import ErrorHandler from "@/backend/utils/errorHandler";

const handler = nc({ onError });
dbConnect();

// AI image generation endpoint using Nano Banana Pro model
handler.use(isAuthenticatedUser).post(async (req, res) => {
	const { prompt, imageInputs, outputFormat, dimension } = req.body;
	const userId = req.user._id;

	console.log("\n========== IMAGE GENERATION REQUEST ==========");
	console.log("Timestamp:", new Date().toISOString());
	console.log("User ID:", userId);
	console.log("Prompt (first 100 chars):", prompt?.substring(0, 100));
	console.log("Dimension:", dimension || "9:16 (default)");
	console.log("Reference images count:", imageInputs?.length || 0);
	console.log("Output format:", outputFormat || "jpg (default)");

	if (!prompt) {
		console.log("ERROR: Missing prompt");
		throw new ErrorHandler("Please enter a description for your influencer's appearance", 400, "invalid_input");
	}

	try {
		// Get user's current team
		console.log("Fetching user team membership...");
		const member = await Member.findOne({ userId }).populate("teamId");
		if (!member) {
			console.log("ERROR: User not in any team");
			throw new ErrorHandler("User is not a member of any team", 400, "no_team");
		}

		const teamId = member.teamId._id;
		console.log("Team ID:", teamId);
		console.log("Team name:", member.teamId.name);

		// Check team's monthly image limit
		console.log("Checking usage limits...");
		const usageCheck = await checkAndIncrementImageUsage(teamId);
		console.log("Usage check result:", {
			allowed: usageCheck.allowed,
			used: usageCheck.used,
			limit: usageCheck.limit,
			remaining: usageCheck.remaining,
		});

		if (!usageCheck.allowed) {
			console.log("ERROR: Usage limit reached");
			const limitMessage = usageCheck.limit === 0
				? "Your plan doesn't include image generation. Please upgrade to access this feature."
				: `Monthly image limit reached (${usageCheck.used}/${usageCheck.limit}). Please upgrade your plan.`;
			throw new ErrorHandler(limitMessage, 429, "usage_limit_reached");
		}

		// Generate image using Nano Banana Pro model
		// Default to 9:16 (portrait) for influencer creatives and scenes
		console.log("Starting image generation with Nano Banana Pro...");
		const startTime = Date.now();

		const imageUrls = await useNanoBananaProViaReplicate({
			textPrompt: prompt,
			dimension: dimension || "9:16",
			referenceImages: imageInputs || [],
			outputFormat: outputFormat || "jpg",
		});

		const duration = Date.now() - startTime;
		console.log("Image generation completed in", duration, "ms");
		console.log("Generated image URLs:", imageUrls);
		console.log("========== IMAGE GENERATION SUCCESS ==========\n");

		res.status(200).json({
			success: true,
			imageUrl: imageUrls[0], // Return the first (and typically only) image URL
			imageUrls, // Return all URLs in case multiple images are generated
			message: "Image generated successfully using Nano Banana Pro",
		});
	} catch (error) {
		console.log("========== IMAGE GENERATION ERROR ==========");
		console.error("Error name:", error.name);
		console.error("Error message:", error.message);
		console.error("Error status:", error.statusCode || error.response?.status);
		console.error("Error type:", error.errorType);
		console.error("Full error:", error);

		// If it's an ErrorHandler error (our custom error), return it properly to frontend
		if (error.statusCode && error.errorType) {
			console.log("Returning ErrorHandler error to frontend");
			return res.status(error.statusCode).json({
				success: false,
				message: error.message,
				errorType: error.errorType,
			});
		}

		// Check if it's a rate limit error from external API
		if (error.response?.status === 429) {
			console.log("Rate limit error detected from external API");
			return res.status(429).json({
				success: false,
				message: "Image generation service is busy. Please try again in a few moments.",
				errorType: "rate_limit",
			});
		}

		// Fallback to placeholder for other errors (API failures, network issues, etc.)
		try {
			console.log("Attempting fallback to placeholder image...");
			const seed = encodeURIComponent(prompt);
			const placeholderUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

			console.log("Fallback URL:", placeholderUrl);
			console.log("========== FALLBACK SUCCESS ==========\n");

			res.status(200).json({
				success: true,
				imageUrl: placeholderUrl,
				imageUrls: [placeholderUrl],
				message: "Fallback image generated (demo mode)",
				fallback: true,
			});
		} catch (fallbackError) {
			console.error("Fallback also failed:", fallbackError);
			console.log("========== COMPLETE FAILURE ==========\n");
			res.status(500).json({
				success: false,
				message: error.message || "Failed to generate image",
				errorType: "server_error",
			});
		}
	}
});

export default handler;
