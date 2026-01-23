import Replicate from "replicate";
import aws from "aws-sdk";

const getCurrentTimestamp = () => {
	return Date.now();
};

const uploadVideoToAWS_S3 = async function (fileBuffer, fileName) {
	const s3 = new aws.S3({
		accessKeyId: process.env.SES_S3_AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.SES_S3_AWS_SECRET_ACCESS_KEY,
	});

	const params = {
		Bucket: process.env.AWS_BUCKET_NAME || "viraloop-assets",
		Key: `videos/${fileName}`,
		Body: fileBuffer,
		ContentType: "video/mp4",
	};

	return new Promise((resolve, reject) => {
		s3.upload(params, (error, data) => {
			if (error) {
				console.log("Error uploading video to S3", error);
				reject(error);
			} else {
				resolve(data);
			}
		});
	});
};

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

		// Upload to S3
		const fileName = `influencer_video_${getCurrentTimestamp()}.mp4`;
		console.log("Uploading to S3:", { fileName, bucket: process.env.AWS_BUCKET_NAME });

		const uploadedVideo = await uploadVideoToAWS_S3(buffer, fileName);
		console.log("S3 upload response:", uploadedVideo);

		// Construct the S3 URL
		const bucketName = process.env.AWS_BUCKET_NAME || "viraloop-assets";
		const s3Url = `https://${bucketName}.s3.amazonaws.com/videos/${fileName}`;
		console.log("Final S3 URL:", s3Url);
		console.log("--- useKlingViaReplicate SUCCESS ---\n");

		return {
			videoUrl: s3Url,
			key: `videos/${fileName}`,
			publicUrl: s3Url,
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
