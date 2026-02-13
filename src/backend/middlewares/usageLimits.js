import Team from "../models/team";
import { CREDITS_REQUIRED } from "@/config/constants";

/**
 * Check if team has sufficient credits for image generation
 * @param {string} teamId - The team ID
 * @returns {Object} { allowed: boolean, message?: string, credits, required }
 */
export const checkImageCredits = async (teamId) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return { allowed: false, message: "Team not found" };
	}

	const required = CREDITS_REQUIRED.IMAGE_GENERATION;
	if (team.credits < required) {
		return {
			allowed: false,
			message: `Insufficient credits. Image generation requires ${required} credits. You have ${team.credits}.`,
			credits: team.credits,
			required,
		};
	}

	return {
		allowed: true,
		credits: team.credits,
		required,
		remaining: team.credits - required,
	};
};

/**
 * Check if team has sufficient credits for video generation
 * @param {string} teamId - The team ID
 * @param {string} videoType - Video type (KLING, VEO_FAST, VEO_QUALITY)
 * @returns {Object} { allowed: boolean, message?: string, credits, required }
 */
export const checkVideoCredits = async (teamId, videoType = "KLING") => {
	const team = await Team.findById(teamId);
	if (!team) {
		return { allowed: false, message: "Team not found" };
	}

	const creditKey = `VIDEO_GENERATION_${videoType.toUpperCase()}`;
	const required = CREDITS_REQUIRED[creditKey] || CREDITS_REQUIRED.VIDEO_GENERATION_KLING;

	if (team.credits < required) {
		return {
			allowed: false,
			message: `Insufficient credits. Video generation requires ${required} credits. You have ${team.credits}.`,
			credits: team.credits,
			required,
		};
	}

	return {
		allowed: true,
		credits: team.credits,
		required,
		remaining: team.credits - required,
	};
};

/**
 * Check if team has sufficient credits for TTS generation
 * @param {string} teamId - The team ID
 * @returns {Object} { allowed: boolean, message?: string, credits, required }
 */
export const checkTTSCredits = async (teamId) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return { allowed: false, message: "Team not found" };
	}

	const required = CREDITS_REQUIRED.TTS_GENERATION;
	if (team.credits < required) {
		return {
			allowed: false,
			message: `Insufficient credits. TTS generation requires ${required} credit. You have ${team.credits}.`,
			credits: team.credits,
			required,
		};
	}

	return {
		allowed: true,
		credits: team.credits,
		required,
		remaining: team.credits - required,
	};
};

/**
 * Check if team has sufficient credits for influencer creation
 * @param {string} teamId - The team ID
 * @returns {Object} { allowed: boolean, message?: string, credits, required }
 */
export const checkInfluencerCredits = async (teamId) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return { allowed: false, message: "Team not found" };
	}

	const required = CREDITS_REQUIRED.INFLUENCER_CREATION;
	if (team.credits < required) {
		return {
			allowed: false,
			message: `Insufficient credits. Creating an influencer requires ${required} credits. You have ${team.credits}.`,
			credits: team.credits,
			required,
		};
	}

	return {
		allowed: true,
		credits: team.credits,
		required,
		remaining: team.credits - required,
	};
};

/**
 * Get current credit balance for a team
 * @param {string} teamId - The team ID
 * @returns {Object|null} Credit info or null if team not found
 */
export const getTeamCredits = async (teamId) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return null;
	}

	return {
		credits: team.credits,
		teamId: team._id,
	};
};

// Backwards compatibility aliases - these now check credits instead of incrementing usage
export const checkAndIncrementImageUsage = checkImageCredits;
export const checkAndIncrementVideoUsage = checkVideoCredits;
export const getTeamUsageStats = getTeamCredits;
