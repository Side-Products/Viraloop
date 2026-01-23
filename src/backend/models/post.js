import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Please enter a post title"],
			trim: true,
			maxLength: [200, "Title cannot exceed 200 characters"],
		},
		script: {
			type: String,
			required: [true, "Script is required"],
			trim: true,
			maxLength: [5000, "Script cannot exceed 5000 characters"],
		},
		actionPrompt: {
			type: String,
			trim: true,
			maxLength: [1000, "Action prompt cannot exceed 1000 characters"],
			default: "The influencer is speaking naturally, making engaging eye contact with the camera.",
		},
		// Scene configuration (optional background/environment)
		scenePrompt: {
			type: String,
			trim: true,
			maxLength: [1000, "Scene prompt cannot exceed 1000 characters"],
		},
		sceneImageUrl: {
			type: String,
		},
		sceneReferenceImages: [
			{
				type: String,
			},
		],
		influencerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Influencer",
			required: true,
		},
		// TTS generation stage
		tts: {
			status: {
				type: String,
				enum: ["pending", "processing", "completed", "failed"],
				default: "pending",
			},
			audioUrl: {
				type: String,
			},
			s3Key: {
				type: String,
			},
			duration: {
				type: Number, // Duration in seconds
			},
			error: {
				type: String,
			},
			completedAt: {
				type: Date,
			},
		},
		voiceSpeed: {
			type: Number,
			default: 1.25,
			min: 0.5,
			max: 2.0,
		},
		// Video generation stage (using Veo 3.1)
		video: {
			status: {
				type: String,
				enum: ["pending", "processing", "completed", "failed"],
				default: "pending",
			},
			videoUrl: {
				type: String,
			},
			s3Key: {
				type: String,
			},
			publicUrl: {
				type: String,
			},
			thumbnailUrl: {
				type: String,
			},
			taskId: {
				type: String, // KIE.ai/Veo task ID
			},
			duration: {
				type: Number, // Duration in seconds
			},
			error: {
				type: String,
			},
			completedAt: {
				type: Date,
			},
		},
		// Overall status
		overallStatus: {
			type: String,
			enum: ["draft", "pending", "processing", "completed", "failed", "posted"],
			default: "draft",
		},
		currentStage: {
			type: String,
			enum: ["tts", "video", "completed"],
			default: "tts",
		},
		progressPercentage: {
			type: Number,
			default: 0,
			min: 0,
			max: 100,
		},
		// Checkpoint for resuming failed jobs
		checkpoint: {
			stage: { type: String },
			canResume: { type: Boolean, default: false },
			lastCheckpointAt: { type: Date },
		},
		// Platform-specific metadata for posting
		platformMetadata: {
			tiktok: {
				caption: { type: String },
				hashtags: [{ type: String }],
				privacyLevel: {
					type: String,
					enum: ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY"],
					default: "PUBLIC_TO_EVERYONE",
				},
				allowComment: { type: Boolean, default: true },
				allowDuet: { type: Boolean, default: true },
				allowStitch: { type: Boolean, default: true },
			},
			instagram: {
				caption: { type: String },
				hashtags: [{ type: String }],
			},
			youtube: {
				title: { type: String },
				description: { type: String },
				tags: [{ type: String }],
				privacyStatus: {
					type: String,
					enum: ["public", "private", "unlisted"],
					default: "public",
				},
			},
		},
		// Posting status per platform
		postingStatus: {
			tiktok: {
				status: {
					type: String,
					enum: ["not_posted", "scheduled", "posting", "posted", "failed"],
					default: "not_posted",
				},
				postedAt: { type: Date },
				postUrl: { type: String },
				publishId: { type: String },
				error: { type: String },
			},
			instagram: {
				status: {
					type: String,
					enum: ["not_posted", "scheduled", "posting", "posted", "failed"],
					default: "not_posted",
				},
				postedAt: { type: Date },
				postUrl: { type: String },
				mediaId: { type: String },
				error: { type: String },
			},
			youtube: {
				status: {
					type: String,
					enum: ["not_posted", "scheduled", "posting", "posted", "failed"],
					default: "not_posted",
				},
				postedAt: { type: Date },
				postUrl: { type: String },
				videoId: { type: String },
				error: { type: String },
			},
		},
		// Analytics (populated after posting)
		analytics: {
			tiktok: {
				views: { type: Number, default: 0 },
				likes: { type: Number, default: 0 },
				comments: { type: Number, default: 0 },
				shares: { type: Number, default: 0 },
				lastSyncedAt: { type: Date },
			},
			instagram: {
				views: { type: Number, default: 0 },
				likes: { type: Number, default: 0 },
				comments: { type: Number, default: 0 },
				shares: { type: Number, default: 0 },
				lastSyncedAt: { type: Date },
			},
			youtube: {
				views: { type: Number, default: 0 },
				likes: { type: Number, default: 0 },
				comments: { type: Number, default: 0 },
				shares: { type: Number, default: 0 },
				lastSyncedAt: { type: Date },
			},
		},
		// Schedule reference
		scheduleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Schedule",
		},
		// Metadata
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: true,
		},
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
		viewCount: {
			type: Number,
			default: 0,
		},
		lastViewedAt: {
			type: Date,
		},
	},
	{ timestamps: true }
);

// Indexes for efficient querying
postSchema.index({ userId: 1, teamId: 1 });
postSchema.index({ influencerId: 1 });
postSchema.index({ overallStatus: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ scheduleId: 1 });

// Method to update progress based on current stage
postSchema.methods.updateProgress = async function () {
	const stageProgress = {
		tts: 25,
		video: 75,
		completed: 100,
	};
	this.progressPercentage = stageProgress[this.currentStage] || 0;
	await this.save();
};

// Method to increment view count
postSchema.methods.incrementView = async function () {
	this.viewCount += 1;
	this.lastViewedAt = new Date();
	await this.save();
};

export default mongoose.models.Post || mongoose.model("Post", postSchema);
