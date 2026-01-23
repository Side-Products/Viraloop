import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";
import { useNanoBananaProViaReplicate } from "@/backend/modules/imageGeneration";
import Member from "@/backend/models/member";

const handler = nc({ onError });
dbConnect();

// AI image generation endpoint using Nano Banana Pro model
handler.use(isAuthenticatedUser).post(async (req, res) => {
	const { prompt, imageInputs, outputFormat, dimension } = req.body;
	const userId = req.user._id;

	if (!prompt) {
		return res.status(400).json({
			success: false,
			message: "Prompt is required",
		});
	}

	try {
		// Get user's current team
		const member = await Member.findOne({ userId }).populate("teamId");
		if (!member) {
			return res.status(400).json({
				success: false,
				message: "User is not a member of any team",
			});
		}

		// Generate image using Nano Banana Pro model
		// Default to 9:16 (portrait) for influencer creatives and scenes
		const imageUrls = await useNanoBananaProViaReplicate({
			textPrompt: prompt,
			dimension: dimension || "9:16",
			referenceImages: imageInputs || [],
			outputFormat: outputFormat || "jpg",
		});

		res.status(200).json({
			success: true,
			imageUrl: imageUrls[0], // Return the first (and typically only) image URL
			imageUrls, // Return all URLs in case multiple images are generated
			message: "Image generated successfully using Nano Banana Pro",
		});
	} catch (error) {
		console.error("Image generation error:", error);

		// Fallback to placeholder for development/demo purposes
		try {
			const seed = encodeURIComponent(prompt);
			const placeholderUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

			res.status(200).json({
				success: true,
				imageUrl: placeholderUrl,
				imageUrls: [placeholderUrl],
				message: "Fallback image generated (demo mode)",
				fallback: true,
			});
		} catch (fallbackError) {
			res.status(500).json({
				success: false,
				message: error.message || "Failed to generate image",
			});
		}
	}
});

export default handler;
