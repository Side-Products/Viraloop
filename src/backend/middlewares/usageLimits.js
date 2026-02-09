import Team from "../models/team";

/**
 * Check if we need to reset the monthly usage counters
 * Resets if the current month is different from the usagePeriodStart month
 */
const shouldResetUsage = (usagePeriodStart) => {
	if (!usagePeriodStart) return true;

	const now = new Date();
	const periodStart = new Date(usagePeriodStart);

	// Reset if we're in a different month or year
	return now.getMonth() !== periodStart.getMonth() || now.getFullYear() !== periodStart.getFullYear();
};

/**
 * Reset monthly usage counters for a team
 */
const resetMonthlyUsage = async (teamId) => {
	await Team.findByIdAndUpdate(teamId, {
		imagesUsedThisMonth: 0,
		videosUsedThisMonth: 0,
		usagePeriodStart: new Date(),
	});
};

/**
 * Check if team can generate an image and increment usage if allowed
 * @param {string} teamId - The team ID
 * @returns {Object} { allowed: boolean, message?: string, remaining?: number }
 */
export const checkAndIncrementImageUsage = async (teamId) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return { allowed: false, message: "Team not found" };
	}

	// Check if we need to reset monthly usage
	if (shouldResetUsage(team.usagePeriodStart)) {
		await resetMonthlyUsage(teamId);
		// Reload team with reset values
		const updatedTeam = await Team.findById(teamId);
		team.imagesUsedThisMonth = updatedTeam.imagesUsedThisMonth;
		team.usagePeriodStart = updatedTeam.usagePeriodStart;
	}

	const imageLimit = team.imageLimit || 0;
	const imagesUsed = team.imagesUsedThisMonth || 0;

	// Check if team has no image access (no subscription)
	if (imageLimit === 0) {
		return {
			allowed: false,
			message: "No active subscription. Please upgrade to generate images.",
			limit: 0,
			used: imagesUsed,
			remaining: 0,
		};
	}

	// Check if limit is reached
	if (imagesUsed >= imageLimit) {
		return {
			allowed: false,
			message: `Monthly image limit reached (${imageLimit} images). Please upgrade your plan for more.`,
			limit: imageLimit,
			used: imagesUsed,
			remaining: 0,
		};
	}

	// Increment usage
	await Team.findByIdAndUpdate(teamId, {
		$inc: { imagesUsedThisMonth: 1 },
	});

	return {
		allowed: true,
		limit: imageLimit,
		used: imagesUsed + 1,
		remaining: imageLimit - imagesUsed - 1,
	};
};

/**
 * Check if team can generate a video and increment usage if allowed
 * @param {string} teamId - The team ID
 * @returns {Object} { allowed: boolean, message?: string, remaining?: number }
 */
export const checkAndIncrementVideoUsage = async (teamId) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return { allowed: false, message: "Team not found" };
	}

	// Check if we need to reset monthly usage
	if (shouldResetUsage(team.usagePeriodStart)) {
		await resetMonthlyUsage(teamId);
		// Reload team with reset values
		const updatedTeam = await Team.findById(teamId);
		team.videosUsedThisMonth = updatedTeam.videosUsedThisMonth;
		team.usagePeriodStart = updatedTeam.usagePeriodStart;
	}

	const videoLimit = team.videoLimit || 0;
	const videosUsed = team.videosUsedThisMonth || 0;

	// Check if team has no video access (no subscription)
	if (videoLimit === 0) {
		return {
			allowed: false,
			message: "No active subscription. Please upgrade to generate videos.",
			limit: 0,
			used: videosUsed,
			remaining: 0,
		};
	}

	// Check if limit is reached
	if (videosUsed >= videoLimit) {
		return {
			allowed: false,
			message: `Monthly video limit reached (${videoLimit} videos). Please upgrade your plan for more.`,
			limit: videoLimit,
			used: videosUsed,
			remaining: 0,
		};
	}

	// Increment usage
	await Team.findByIdAndUpdate(teamId, {
		$inc: { videosUsedThisMonth: 1 },
	});

	return {
		allowed: true,
		limit: videoLimit,
		used: videosUsed + 1,
		remaining: videoLimit - videosUsed - 1,
	};
};

/**
 * Get current usage stats for a team
 * @param {string} teamId - The team ID
 * @returns {Object} Usage statistics
 */
export const getTeamUsageStats = async (teamId) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return null;
	}

	// Check if we need to reset monthly usage
	if (shouldResetUsage(team.usagePeriodStart)) {
		await resetMonthlyUsage(teamId);
		return {
			images: {
				used: 0,
				limit: team.imageLimit || 0,
				remaining: team.imageLimit || 0,
			},
			videos: {
				used: 0,
				limit: team.videoLimit || 0,
				remaining: team.videoLimit || 0,
			},
			periodStart: new Date(),
		};
	}

	return {
		images: {
			used: team.imagesUsedThisMonth || 0,
			limit: team.imageLimit || 0,
			remaining: Math.max(0, (team.imageLimit || 0) - (team.imagesUsedThisMonth || 0)),
		},
		videos: {
			used: team.videosUsedThisMonth || 0,
			limit: team.videoLimit || 0,
			remaining: Math.max(0, (team.videoLimit || 0) - (team.videosUsedThisMonth || 0)),
		},
		periodStart: team.usagePeriodStart,
	};
};
