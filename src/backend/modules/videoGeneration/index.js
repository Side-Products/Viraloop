import Replicate from "replicate";
import { uploadVideo } from "@/backend/services/wasabiUploadService";

/**
 * Generate video using Kling v2.1 model via Replicate
 * @param {Object} options
 * @param {string} options.imageUrl - The source image URL
 * @param {string} options.prompt - The action prompt for video generation
 * @returns {Promise<Object>} Video URLs object
 */
export const useKlingViaReplicate = async ({ imageUrl, prompt }) => {
	console.log("\n--- useKlingViaReplicate START ---");
	console.log("Input params:", {
		imageUrl,
		prompt: prompt?.substring(0, 100) + (prompt?.length > 100 ? "..." : ""),
	});

	const apiKey = process.env.REPLICATE_API_TOKEN;

	if (!apiKey) {
		console.error("ERROR: Missing REPLICATE_API_TOKEN environment variable");
		throw new Error("Missing Replicate API key. Please set REPLICATE_API_TOKEN in environment variables.");
	}
	console.log("Replicate API key found:", apiKey ? `${apiKey.substring(0, 8)}...` : "NOT SET");

	const replicate = new Replicate({ auth: apiKey });

	const input = {
		prompt: prompt,
		start_image: imageUrl,
	};

	console.log("Replicate input config:", input);

	try {
		console.log("Calling Replicate API with model: kwaivgi/kling-v2.1");
		const startTime = Date.now();
		const output = await replicate.run("kwaivgi/kling-v2.1", { input });
		const duration = Date.now() - startTime;
		console.log(`Replicate API response received in ${duration}ms`);
		console.log("Replicate output:", output);

		if (!output) {
			console.error("ERROR: No output received from Replicate");
			throw new Error("No video generated from Replicate");
		}

		// Get the video URL from the output
		const videoUrl = output.url();
		console.log("Generated video URL:", videoUrl);

		// Download the video file
		console.log("Downloading generated video...");
		const response = await fetch(videoUrl);
		if (!response.ok) {
			console.error(`ERROR: Failed to download video. Status: ${response.status} ${response.statusText}`);
			throw new Error(`Failed to download generated video: ${response.statusText}`);
		}
		console.log("Video downloaded successfully");

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		console.log("Video buffer size:", buffer.length, "bytes");

		// Upload to Wasabi
		console.log("Uploading to Wasabi...");

		const uploadResult = await uploadVideo(buffer, {
			originalName: "influencer_video.mp4",
		});
		console.log("Wasabi upload response:", uploadResult);

		console.log("Final Wasabi URL:", uploadResult.publicUrl);
		console.log("--- useKlingViaReplicate SUCCESS ---\n");

		return {
			videoUrl: uploadResult.publicUrl,
			key: uploadResult.key,
			publicUrl: uploadResult.publicUrl,
		};
	} catch (error) {
		console.error("--- useKlingViaReplicate ERROR ---");
		console.error("Error name:", error.name);
		console.error("Error message:", error.message);
		console.error("Error stack:", error.stack);
		throw error;
	}
};

export default {
	useKlingViaReplicate,
};
