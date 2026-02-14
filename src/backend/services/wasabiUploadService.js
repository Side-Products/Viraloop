const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const path = require("path");

/**
 * Wasabi Upload Service for Viraloop
 *
 * Configuration (Environment Variables):
 * - WASABI_ACCESS_KEY_ID: Your Wasabi access key
 * - WASABI_SECRET_ACCESS_KEY: Your Wasabi secret key
 * - WASABI_BUCKET_NAME: The bucket name (e.g., "viraloop-assets")
 * - WASABI_REGION: The region (default: "us-east-1")
 * - WASABI_CDN_URL: Optional CDN URL (e.g., "https://cdn.viraloop.io")
 */

// Predefined folders for organizing content
const FOLDERS = {
	INFLUENCERS: "influencers",
	POSTS: "posts",
	VIDEOS: "videos",
	THUMBNAILS: "thumbnails",
	AUDIO: "audio",
	AVATARS: "avatars",
	BRAND_ASSETS: "brand-assets",
	TEMP: "temp",
};

// Content type mappings
const CONTENT_TYPES = {
	// Images
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	// Videos
	".mp4": "video/mp4",
	".webm": "video/webm",
	".mov": "video/quicktime",
	".avi": "video/x-msvideo",
	// Audio
	".mp3": "audio/mpeg",
	".wav": "audio/wav",
	".m4a": "audio/mp4",
	".ogg": "audio/ogg",
	// Documents
	".pdf": "application/pdf",
	".json": "application/json",
};

// Singleton client instance
let wasabiClient = null;

/**
 * Get or create the Wasabi S3 client
 */
const getWasabiClient = () => {
	if (wasabiClient) return wasabiClient;

	const credentials = {
		accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
		secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
	};

	if (!credentials.accessKeyId || !credentials.secretAccessKey) {
		throw new Error("Wasabi credentials not found. Set WASABI_ACCESS_KEY_ID and WASABI_SECRET_ACCESS_KEY in environment.");
	}

	const region = process.env.WASABI_REGION || "us-east-1";

	wasabiClient = new S3Client({
		region,
		endpoint: `https://s3.${region}.wasabisys.com`,
		credentials,
		forcePathStyle: false,
		maxAttempts: 3,
	});

	return wasabiClient;
};

/**
 * Get content type from file extension
 */
const getContentType = (fileName) => {
	const ext = path.extname(fileName).toLowerCase();
	return CONTENT_TYPES[ext] || "application/octet-stream";
};

/**
 * Generate a unique filename with timestamp
 */
const generateFileName = (originalName, prefix = "") => {
	const timestamp = Date.now();
	const ext = path.extname(originalName);
	const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, "_");
	const uniqueId = Math.random().toString(36).substring(2, 8);

	if (prefix) {
		return `${prefix}_${timestamp}_${uniqueId}${ext}`;
	}
	return `${baseName}_${timestamp}_${uniqueId}${ext}`;
};

/**
 * Get the public URL for an uploaded file
 */
const getPublicUrl = (key) => {
	const bucketName = process.env.WASABI_BUCKET_NAME;
	const region = process.env.WASABI_REGION || "us-east-1";

	// Use CDN URL if configured, otherwise use Wasabi direct URL
	if (process.env.WASABI_CDN_URL) {
		return `${process.env.WASABI_CDN_URL}/${key}`;
	}

	return `https://s3.${region}.wasabisys.com/${bucketName}/${key}`;
};

/**
 * Core upload function - uploads a buffer to Wasabi
 * @param {Buffer} buffer - File buffer to upload
 * @param {string} fileName - Name of the file
 * @param {string} folder - Folder path (use FOLDERS constants)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Upload result with URLs
 */
const uploadBuffer = async (buffer, fileName, folder = "", options = {}) => {
	const bucketName = process.env.WASABI_BUCKET_NAME;

	if (!bucketName) {
		throw new Error("WASABI_BUCKET_NAME environment variable is not set");
	}

	const client = getWasabiClient();
	const key = folder ? `${folder}/${fileName}` : fileName;
	const contentType = options.contentType || getContentType(fileName);

	const uploadParams = {
		Bucket: bucketName,
		Key: key,
		Body: buffer,
		ContentType: contentType,
		...options.extraParams,
	};

	try {
		const result = await client.send(new PutObjectCommand(uploadParams));
		console.log(`[Wasabi] Uploaded: ${key} (${buffer.length} bytes)`);

		const publicUrl = getPublicUrl(key);

		// Generate presigned URL if requested
		let presignedUrl = null;
		if (options.generatePresignedUrl !== false) {
			presignedUrl = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucketName, Key: key }), {
				expiresIn: options.presignedUrlExpiry || 604800, // 7 days default
			});
		}

		return {
			success: true,
			publicUrl,
			presignedUrl,
			key,
			bucket: bucketName,
			etag: result.ETag,
			contentType,
			size: buffer.length,
		};
	} catch (error) {
		console.error(`[Wasabi] Upload failed for ${key}:`, error.message);
		throw error;
	}
};

/**
 * Upload a file from local filesystem
 */
const uploadFile = async (filePath, fileName, folder = "", options = {}) => {
	if (!fs.existsSync(filePath)) {
		throw new Error(`File not found: ${filePath}`);
	}

	const buffer = fs.readFileSync(filePath);
	return uploadBuffer(buffer, fileName || path.basename(filePath), folder, options);
};

/**
 * Upload from a URL (downloads and re-uploads to Wasabi)
 */
const uploadFromUrl = async (sourceUrl, fileName, folder = "", options = {}) => {
	console.log(`[Wasabi] Downloading from: ${sourceUrl}`);

	const response = await fetch(sourceUrl);
	if (!response.ok) {
		throw new Error(`Failed to download from URL: ${response.status} ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	return uploadBuffer(buffer, fileName, folder, options);
};

/**
 * Delete a file from Wasabi
 */
const deleteFile = async (key) => {
	const bucketName = process.env.WASABI_BUCKET_NAME;
	const client = getWasabiClient();

	try {
		await client.send(
			new DeleteObjectCommand({
				Bucket: bucketName,
				Key: key,
			})
		);
		console.log(`[Wasabi] Deleted: ${key}`);
		return { success: true, key };
	} catch (error) {
		console.error(`[Wasabi] Delete failed for ${key}:`, error.message);
		throw error;
	}
};

/**
 * Get a presigned URL for an existing file
 */
const getPresignedUrl = async (key, expiresIn = 604800) => {
	const bucketName = process.env.WASABI_BUCKET_NAME;
	const client = getWasabiClient();

	return getSignedUrl(client, new GetObjectCommand({ Bucket: bucketName, Key: key }), { expiresIn });
};

// ============================================
// Convenience methods for specific content types
// ============================================

/**
 * Upload an influencer image
 */
const uploadInfluencerImage = async (buffer, options = {}) => {
	const fileName = generateFileName(options.originalName || "image.jpg", "influencer");
	return uploadBuffer(buffer, fileName, FOLDERS.INFLUENCERS, options);
};

/**
 * Upload a post image/video
 */
const uploadPostMedia = async (buffer, options = {}) => {
	const fileName = generateFileName(options.originalName || "post.jpg", "post");
	return uploadBuffer(buffer, fileName, FOLDERS.POSTS, options);
};

/**
 * Upload a video file
 */
const uploadVideo = async (buffer, options = {}) => {
	const fileName = generateFileName(options.originalName || "video.mp4", "video");
	return uploadBuffer(buffer, fileName, FOLDERS.VIDEOS, options);
};

/**
 * Upload a thumbnail
 */
const uploadThumbnail = async (buffer, options = {}) => {
	const fileName = generateFileName(options.originalName || "thumb.jpg", "thumb");
	return uploadBuffer(buffer, fileName, FOLDERS.THUMBNAILS, options);
};

/**
 * Upload audio file
 */
const uploadAudio = async (buffer, options = {}) => {
	const fileName = generateFileName(options.originalName || "audio.mp3", "audio");
	return uploadBuffer(buffer, fileName, FOLDERS.AUDIO, options);
};

module.exports = {
	// Core functions
	uploadBuffer,
	uploadFile,
	uploadFromUrl,
	deleteFile,
	getPresignedUrl,
	getPublicUrl,

	// Convenience methods
	uploadInfluencerImage,
	uploadPostMedia,
	uploadVideo,
	uploadThumbnail,
	uploadAudio,

	// Utilities
	getWasabiClient,
	generateFileName,
	getContentType,

	// Constants
	FOLDERS,
	CONTENT_TYPES,

	// Legacy exports (for backward compatibility)
	uploadBufferToWasabi: uploadBuffer,
	uploadFileToWasabi: uploadFile,
	createWasabiClient: getWasabiClient,
};
