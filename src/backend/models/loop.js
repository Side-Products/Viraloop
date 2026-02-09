import mongoose from "mongoose";

const loopSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Loop name is required"],
			trim: true,
			maxLength: [100, "Loop name cannot exceed 100 characters"],
		},
		description: {
			type: String,
			trim: true,
			maxLength: [500, "Description cannot exceed 500 characters"],
		},
		influencerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Influencer",
			required: true,
		},
		// Platforms to post to
		platforms: [
			{
				type: String,
				enum: ["tiktok", "instagram", "youtube"],
			},
		],
		// Loop type
		type: {
			type: String,
			enum: ["one_time", "recurring", "loop"],
			default: "one_time",
			required: true,
		},
		// For one-time: specific datetime
		scheduledTime: {
			type: Date,
		},
		// For recurring: cron-like schedule
		recurring: {
			frequency: {
				type: String,
				enum: ["hourly", "daily", "weekly", "custom"],
			},
			// For weekly: which days (0-6, Sunday-Saturday)
			daysOfWeek: [
				{
					type: Number,
					min: 0,
					max: 6,
				},
			],
			// Time of day to post (HH:mm format)
			timeOfDay: {
				type: String,
				match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format"],
			},
			// Timezone
			timezone: {
				type: String,
				default: "UTC",
			},
			// For custom: interval in hours
			intervalHours: {
				type: Number,
				min: 1,
				max: 168, // Max 1 week
			},
		},
		// For loop: content queue configuration
		loop: {
			enabled: {
				type: Boolean,
				default: false,
			},
			// Hours between posts
			interval: {
				type: Number,
				min: 1,
				max: 168, // Max 1 week
			},
			// Content queue - posts to cycle through
			contentQueue: [
				{
					postId: {
						type: mongoose.Schema.Types.ObjectId,
						ref: "Post",
					},
					order: {
						type: Number,
					},
				},
			],
			// Current position in the queue
			currentIndex: {
				type: Number,
				default: 0,
			},
			// How many times the loop has completed
			loopCount: {
				type: Number,
				default: 0,
			},
			// Maximum number of loops (null = infinite)
			maxLoops: {
				type: Number,
				default: null,
			},
			// Auto-generate content flag
			autoGenerate: {
				enabled: { type: Boolean, default: false },
				scriptPrompt: { type: String },
				// How many posts to keep in queue
				queueSize: { type: Number, default: 5 },
			},
		},
		// Status
		status: {
			type: String,
			enum: ["active", "paused", "completed", "cancelled", "failed"],
			default: "active",
		},
		// Execution tracking
		lastExecutedAt: {
			type: Date,
		},
		nextExecutionAt: {
			type: Date,
		},
		// Execution history (last 10 executions)
		executionHistory: [
			{
				executedAt: { type: Date },
				postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
				platforms: [{ type: String }],
				success: { type: Boolean },
				error: { type: String },
			},
		],
		// Error handling
		failureCount: {
			type: Number,
			default: 0,
		},
		lastError: {
			type: String,
		},
		// Auto-pause after X consecutive failures
		maxFailures: {
			type: Number,
			default: 3,
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
	},
	{ timestamps: true }
);

// Indexes for efficient querying
loopSchema.index({ status: 1, nextExecutionAt: 1 });
loopSchema.index({ teamId: 1, status: 1 });
loopSchema.index({ influencerId: 1 });
loopSchema.index({ type: 1, status: 1 });

// Method to calculate next execution time
loopSchema.methods.calculateNextExecution = function () {
	const now = new Date();

	if (this.type === "one_time") {
		// One-time loops don't have a next execution after running
		if (this.lastExecutedAt) {
			this.status = "completed";
			this.nextExecutionAt = null;
		} else {
			this.nextExecutionAt = this.scheduledTime;
		}
	} else if (this.type === "recurring") {
		if (this.recurring.frequency === "hourly") {
			this.nextExecutionAt = new Date(now.getTime() + 60 * 60 * 1000);
		} else if (this.recurring.frequency === "daily") {
			const [hours, minutes] = (this.recurring.timeOfDay || "12:00").split(":").map(Number);
			const next = new Date(now);
			next.setHours(hours, minutes, 0, 0);
			if (next <= now) {
				next.setDate(next.getDate() + 1);
			}
			this.nextExecutionAt = next;
		} else if (this.recurring.frequency === "weekly") {
			const [hours, minutes] = (this.recurring.timeOfDay || "12:00").split(":").map(Number);
			const days = this.recurring.daysOfWeek || [1]; // Default to Monday
			const currentDay = now.getDay();
			const currentTime = now.getHours() * 60 + now.getMinutes();
			const targetTime = hours * 60 + minutes;

			// Find the next valid day
			let daysUntilNext = 7;
			for (const day of days) {
				let diff = day - currentDay;
				if (diff < 0) diff += 7;
				if (diff === 0 && currentTime >= targetTime) diff = 7;
				if (diff < daysUntilNext) daysUntilNext = diff;
			}

			const next = new Date(now);
			next.setDate(next.getDate() + daysUntilNext);
			next.setHours(hours, minutes, 0, 0);
			this.nextExecutionAt = next;
		} else if (this.recurring.frequency === "custom") {
			const intervalMs = (this.recurring.intervalHours || 24) * 60 * 60 * 1000;
			this.nextExecutionAt = new Date(now.getTime() + intervalMs);
		}
	} else if (this.type === "loop" && this.loop.enabled) {
		const intervalMs = (this.loop.interval || 24) * 60 * 60 * 1000;
		this.nextExecutionAt = new Date(now.getTime() + intervalMs);

		// Check if max loops reached
		if (this.loop.maxLoops && this.loop.loopCount >= this.loop.maxLoops) {
			this.status = "completed";
			this.nextExecutionAt = null;
		}
	}

	return this.nextExecutionAt;
};

// Method to record execution
loopSchema.methods.recordExecution = async function (postId, platforms, success, error = null) {
	// Add to history (keep last 10)
	this.executionHistory.unshift({
		executedAt: new Date(),
		postId,
		platforms,
		success,
		error,
	});
	if (this.executionHistory.length > 10) {
		this.executionHistory = this.executionHistory.slice(0, 10);
	}

	this.lastExecutedAt = new Date();

	if (!success) {
		this.failureCount += 1;
		this.lastError = error;

		// Auto-pause after max failures
		if (this.failureCount >= this.maxFailures) {
			this.status = "paused";
		}
	} else {
		this.failureCount = 0;
		this.lastError = null;

		// For loops, advance the queue
		if (this.type === "loop" && this.loop.enabled) {
			this.loop.currentIndex = (this.loop.currentIndex + 1) % this.loop.contentQueue.length;
			if (this.loop.currentIndex === 0) {
				this.loop.loopCount += 1;
			}
		}
	}

	// Calculate next execution
	this.calculateNextExecution();

	await this.save();
};

export default mongoose.models.Loop || mongoose.model("Loop", loopSchema);
