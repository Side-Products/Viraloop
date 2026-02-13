import Team from "../models/team";
import CreditHistory from "../models/creditHistory";
import ErrorHandler from "../utils/errorHandler";

/**
 * Decrement credits from a team and record the spending
 * @param {Object} params - Parameters for credit deduction
 * @param {string} params.teamId - The team ID
 * @param {number} params.creditsRequired - Number of credits to deduct
 * @param {string} params.userId - The user ID performing the action
 * @param {Function} params.next - Express next function for error handling
 * @param {string} [params.influencerId] - Optional influencer ID for tracking
 * @param {string} [params.postId] - Optional post ID for tracking
 * @param {string} [params.platform] - Optional platform for tracking (tiktok, instagram, youtube)
 * @param {string} [params.spendingType] - Type of spending (image_generation, video_generation, etc.)
 * @returns {Promise<Object>} Result with creditsUsed
 */
export const decrementCredits = async ({
	teamId,
	creditsRequired,
	userId,
	next,
	influencerId = null,
	postId = null,
	platform = null,
	spendingType = null,
}) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return next(new ErrorHandler("Team not found", 404));
	}

	if (team.credits < creditsRequired) {
		return next(
			new ErrorHandler(
				`Insufficient credits. You need ${creditsRequired} credits but have ${team.credits}. Please purchase more credits to continue.`,
				400,
				"insufficient_credits"
			)
		);
	}

	team.credits -= creditsRequired;
	await team.save();

	// Create spending record
	if (creditsRequired > 0) {
		await CreditHistory.create({
			userId,
			teamId,
			credits: -creditsRequired, // Negative for spending
			amount_total: 0,
			type: "spending",
			influencerId,
			postId,
			platform,
			spendingType,
		});
	}

	return { creditsUsed: creditsRequired };
};

/**
 * Check if a team has sufficient credits for an operation
 * @param {string} teamId - The team ID
 * @param {number} creditsRequired - Number of credits needed
 * @returns {Promise<Object>} Result with allowed status and message
 */
export const checkCredits = async (teamId, creditsRequired) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return { allowed: false, message: "Team not found" };
	}

	if (team.credits < creditsRequired) {
		return {
			allowed: false,
			message: `Insufficient credits. You need ${creditsRequired} credits but have ${team.credits}.`,
			credits: team.credits,
			required: creditsRequired,
		};
	}

	return {
		allowed: true,
		credits: team.credits,
		required: creditsRequired,
		remaining: team.credits - creditsRequired,
	};
};

/**
 * Get the current credit balance for a team
 * @param {string} teamId - The team ID
 * @returns {Promise<Object|null>} Credit balance info or null if team not found
 */
export const getTeamCreditBalance = async (teamId) => {
	const team = await Team.findById(teamId);
	if (!team) {
		return null;
	}

	return {
		credits: team.credits,
		teamId: team._id,
	};
};
