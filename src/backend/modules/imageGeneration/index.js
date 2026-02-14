import { uploadInfluencerImage } from "@/backend/services/wasabiUploadService";

/**
 * Poll for task completion from Kie.ai API
 * @param {string} taskId - The task ID to poll
 * @param {string} apiKey - The API key for authentication
 * @param {number} maxAttempts - Maximum polling attempts (default: 60)
 * @param {number} interval - Polling interval in ms (default: 3000)
 * @returns {Promise<object>} The completed task data
 */
const pollTaskStatus = async (taskId, apiKey, maxAttempts = 120, interval = 3000) => {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		console.log(`Polling attempt ${attempt}/${maxAttempts} for task ${taskId}`);

		const response = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to query task status: ${response.status} ${response.statusText}`);
		}

		const result = await response.json();

		if (result.code !== 200) {
			throw new Error(`Task query failed: ${result.msg}`);
		}

		const { state, resultJson, failCode, failMsg } = result.data;

		if (state === "success") {
			console.log("Task completed successfully");
			return result.data;
		}

		if (state === "fail") {
			throw new Error(`Task failed: ${failMsg || failCode || "Unknown error"}`);
		}

		// Still waiting, continue polling
		console.log(`Task state: ${state}, waiting ${interval}ms...`);
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	throw new Error(`Task timed out after ${maxAttempts} attempts`);
};

/**
 * Generate image using Google's Nano Banana Pro model via Kie.ai API
 * @param {Object} options
 * @param {string} options.textPrompt - The text prompt for image generation
 * @param {string} options.dimension - Aspect ratio: "9:16", "16:9", or "1:1"
 * @param {string[]} options.referenceImages - Array of reference image URLs
 * @param {string} options.outputFormat - Output format: "jpg" or "png"
 * @returns {Promise<string[]>} Array of generated image URLs
 */
export const useNanoBananaProViaReplicate = async ({ textPrompt, dimension = "9:16", referenceImages = [], outputFormat = "jpg" }) => {
	console.log("\n--- useNanoBananaProViaKieAI START ---");
	console.log("Input params:", {
		textPrompt: textPrompt?.substring(0, 100) + (textPrompt?.length > 100 ? "..." : ""),
		dimension,
		referenceImagesCount: referenceImages?.length || 0,
		outputFormat,
	});

	const apiKey = process.env.KIE_AI_API_KEY;

	if (!apiKey) {
		console.error("ERROR: Missing KIE_AI_API_KEY environment variable");
		throw new Error("Missing Kie.ai API key. Please set KIE_AI_API_KEY in environment variables.");
	}
	console.log("Kie.ai API key found:", apiKey ? `${apiKey.substring(0, 8)}...` : "NOT SET");

	// Map dimension to aspect ratio format for Nano Banana Pro
	const aspectRatio = dimension === "9:16" ? "9:16" : dimension === "16:9" ? "16:9" : "1:1";

	const requestBody = {
		model: "nano-banana-pro",
		input: {
			prompt: textPrompt,
			aspect_ratio: aspectRatio,
			resolution: "2K",
			output_format: outputFormat,
			image_input: referenceImages && referenceImages.length > 0 ? referenceImages : [],
		},
	};

	console.log("Kie.ai request config:", {
		...requestBody,
		input: {
			...requestBody.input,
			prompt: requestBody.input.prompt?.substring(0, 100) + (requestBody.input.prompt?.length > 100 ? "..." : ""),
		},
	});

	try {
		// Step 1: Create the generation task
		console.log("Creating task via Kie.ai API...");
		const startTime = Date.now();

		const createResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(requestBody),
		});

		if (!createResponse.ok) {
			const errorText = await createResponse.text();
			console.error("Create task failed:", createResponse.status, errorText);
			throw new Error(`Failed to create task: ${createResponse.status} ${createResponse.statusText}`);
		}

		const createResult = await createResponse.json();
		console.log("Create task response:", createResult);

		if (createResult.code !== 200) {
			throw new Error(`Task creation failed: ${createResult.msg}`);
		}

		const taskId = createResult.data.taskId;
		console.log("Task created with ID:", taskId);

		// Step 2: Poll for task completion
		const taskData = await pollTaskStatus(taskId, apiKey);
		const duration = Date.now() - startTime;
		console.log(`Task completed in ${duration}ms`);

		// Step 3: Extract image URL from result
		const resultJson = JSON.parse(taskData.resultJson);
		console.log("Result JSON:", resultJson);

		if (!resultJson.resultUrls || resultJson.resultUrls.length === 0) {
			throw new Error("No image URLs in result");
		}

		const imageUrl = resultJson.resultUrls[0];
		console.log("Generated image URL:", imageUrl);

		// Step 4: Download the generated image
		console.log("Downloading generated image...");
		const response = await fetch(imageUrl);
		if (!response.ok) {
			console.error(`ERROR: Failed to download image. Status: ${response.status} ${response.statusText}`);
			throw new Error(`Failed to download generated image: ${response.statusText}`);
		}
		console.log("Image downloaded successfully");

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		console.log("Image buffer size:", buffer.length, "bytes");

		// Step 5: Upload to Wasabi
		console.log("Uploading to Wasabi...");

		const uploadResult = await uploadInfluencerImage(buffer, {
			originalName: `image.${outputFormat}`,
		});
		console.log("Wasabi upload response:", uploadResult);

		console.log("Final Wasabi URL:", uploadResult.publicUrl);
		console.log("--- useNanoBananaProViaKieAI SUCCESS ---\n");

		return [uploadResult.publicUrl];
	} catch (error) {
		console.error("--- useNanoBananaProViaKieAI ERROR ---");
		console.error("Error name:", error.name);
		console.error("Error message:", error.message);
		console.error("Error stack:", error.stack);
		throw error;
	}
};

export default {
	useNanoBananaProViaReplicate,
};
