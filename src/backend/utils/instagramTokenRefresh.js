import axios from "axios";
import InstagramAuth from "../models/instagramAuth.js";

// In-memory lock to prevent concurrent refreshes for the same auth record
const refreshLocks = new Map();

/**
 * Validates that a token response has all required fields
 * @param {Object} data - Token response from Instagram
 * @returns {boolean} - True if valid
 * @throws {Error} - If validation fails
 */
export const validateTokenResponse = (data) => {
	if (!data) {
		throw new Error("Empty response from Instagram");
	}
	if (!data.access_token) {
		throw new Error("Missing access_token in Instagram response");
	}
	if (!data.expires_in) {
		throw new Error("Missing expires_in in Instagram response");
	}
	if (data.token_type !== "bearer") {
		throw new Error(`Unexpected token_type: ${data.token_type}`);
	}
	return true;
};

/**
 * Enhances token data with calculated expiry timestamps
 * @param {Object} tokenData - Raw token data from Instagram API
 * @returns {Object} - Token data with added expiry fields
 */
export const enhanceTokensWithExpiry = (tokenData) => {
	const now = Date.now();
	return {
		...tokenData,
		expires_at: now + tokenData.expires_in * 1000,
		last_refreshed_at: now,
	};
};

/**
 * Checks if a token should be refreshed based on expiry time and age
 * @param {Object} tokens - Token object with expiry timestamps
 * @param {number} thresholdMs - How far in advance to refresh (default: 7 days)
 * @returns {boolean} - True if token should be refreshed
 */
export const shouldRefreshToken = (tokens, thresholdMs = 7 * 24 * 60 * 60 * 1000) => {
	if (!tokens || !tokens.access_token) {
		return true;
	}

	// If no expiry tracking, needs refresh to add expiry data
	if (!tokens.expires_at) {
		return true;
	}

	// Instagram requires tokens to be at least 24 hours old before refreshing
	if (tokens.last_refreshed_at) {
		const tokenAge = Date.now() - tokens.last_refreshed_at;
		const MIN_REFRESH_AGE = 24 * 60 * 60 * 1000; // 24 hours
		if (tokenAge < MIN_REFRESH_AGE) {
			return false; // Too soon to refresh
		}
	}

	// Refresh if token expires within threshold
	return Date.now() >= tokens.expires_at - thresholdMs;
};

/**
 * Checks token health and expiration status
 * @param {Object} tokens - Token object with expires_at
 * @param {number} thresholdMs - Warning threshold (default: 14 days)
 * @returns {Object} - { expired, expiringSoon, daysRemaining, canRefresh }
 */
export const checkTokenHealth = (tokens, thresholdMs = 14 * 24 * 60 * 60 * 1000) => {
	if (!tokens || !tokens.expires_at) {
		return {
			expired: false,
			expiringSoon: false,
			daysRemaining: null,
			canRefresh: false,
		};
	}

	const timeRemaining = tokens.expires_at - Date.now();
	const tokenAge = tokens.last_refreshed_at ? Date.now() - tokens.last_refreshed_at : Infinity;
	const MIN_REFRESH_AGE = 24 * 60 * 60 * 1000; // 24 hours

	return {
		expired: timeRemaining <= 0,
		expiringSoon: timeRemaining > 0 && timeRemaining <= thresholdMs,
		daysRemaining: Math.floor(timeRemaining / (24 * 60 * 60 * 1000)),
		canRefresh: tokenAge >= MIN_REFRESH_AGE, // Must be 24h+ old
	};
};

/**
 * Sleep helper for retry delays
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Exchanges a short-lived Instagram token for a long-lived token (60 days)
 * This should be called immediately after OAuth callback
 *
 * @param {string} shortLivedToken - The short-lived access token from OAuth
 * @param {Object} logger - Logger instance
 * @returns {Promise<Object>} - Long-lived token data with expiry timestamps
 */
export const exchangeForLongLivedToken = async (shortLivedToken, logger = console) => {
	try {
		logger.log("Exchanging short-lived Instagram token for long-lived token");

		const url = "https://graph.instagram.com/access_token";
		const params = new URLSearchParams({
			grant_type: "ig_exchange_token",
			client_secret: process.env.INSTAGRAM_OAUTH_CLIENT_SECRET,
			access_token: shortLivedToken,
		});

		const response = await axios.get(`${url}?${params.toString()}`, {
			timeout: 10000, // 10 second timeout
		});

		// Validate response
		validateTokenResponse(response.data);

		// Enhance with expiry timestamps
		const enhancedTokens = enhanceTokensWithExpiry(response.data);

		logger.log("Successfully exchanged for long-lived token");
		return enhancedTokens;
	} catch (error) {
		logger.error("Failed to exchange for long-lived token:", error.response?.data || error.message);
		throw error;
	}
};

/**
 * Internal function to perform the actual token refresh with retry logic
 * @private
 */
const performTokenRefresh = async (auth, logger, maxRetries = 3) => {
	let lastError;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			logger.log(`Refreshing Instagram token for auth: ${auth._id} (attempt ${attempt}/${maxRetries})`);

			// Check if token is old enough to refresh (24h+)
			const tokenHealth = checkTokenHealth(auth.tokens);
			if (!tokenHealth.canRefresh) {
				throw new Error("Token is too new to refresh (must be at least 24 hours old)");
			}

			const url = "https://graph.instagram.com/refresh_access_token";
			const params = new URLSearchParams({
				grant_type: "ig_refresh_token",
				access_token: auth.tokens.access_token,
			});

			const response = await axios.get(`${url}?${params.toString()}`, {
				timeout: 10000, // 10 second timeout
			});

			// Validate response
			validateTokenResponse(response.data);

			// Enhance with expiry timestamps
			const enhancedTokens = enhanceTokensWithExpiry(response.data);

			// Update database
			auth.tokens = enhancedTokens;
			await auth.save();

			logger.log(`Successfully refreshed Instagram token for auth: ${auth._id}`);

			return enhancedTokens;
		} catch (error) {
			lastError = error;
			logger.error(`Failed to refresh Instagram token for auth: ${auth._id} (attempt ${attempt}/${maxRetries})`, error.response?.data || error.message);

			// If token is invalid/expired, don't retry
			if (error.response?.status === 400 || error.response?.status === 401) {
				logger.warn(`Marking Instagram auth ${auth._id} as deleted due to invalid token`);
				auth.deleted = true;
				await auth.save();
				throw error; // Don't retry for invalid tokens
			}

			// If rate limited, wait longer before retry
			if (error.response?.status === 429) {
				const retryAfter = error.response.headers["retry-after"] || 60;
				logger.warn(`Rate limited, waiting ${retryAfter} seconds before retry`);
				await sleep(retryAfter * 1000);
			} else if (attempt < maxRetries) {
				// Exponential backoff for other errors
				const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
				logger.log(`Waiting ${backoffMs}ms before retry`);
				await sleep(backoffMs);
			}
		}
	}

	// All retries failed
	throw lastError;
};

/**
 * Refreshes an Instagram access token
 * Uses mutex lock to prevent concurrent refresh attempts for the same auth record
 *
 * @param {Object|string} authOrId - InstagramAuth document or ID
 * @param {Object} logger - Logger instance (defaults to console)
 * @returns {Promise<Object>} - Updated token object with expiry timestamps
 * @throws {Error} - If refresh fails
 */
export const refreshInstagramToken = async (authOrId, logger = console) => {
	// Get auth document
	let auth;
	if (typeof authOrId === "string") {
		auth = await InstagramAuth.findById(authOrId);
		if (!auth) {
			throw new Error(`Instagram auth not found: ${authOrId}`);
		}
	} else {
		auth = authOrId;
	}

	const authId = auth._id.toString();

	// Check if already refreshing
	if (refreshLocks.has(authId)) {
		logger.log(`Token refresh already in progress for auth: ${authId}, waiting...`);
		await refreshLocks.get(authId);
		// Reload from DB to get updated tokens
		auth = await InstagramAuth.findById(authId);
		return auth.tokens;
	}

	// Create lock and perform refresh
	const refreshPromise = performTokenRefresh(auth, logger);
	refreshLocks.set(authId, refreshPromise);

	try {
		return await refreshPromise;
	} finally {
		refreshLocks.delete(authId);
	}
};

/**
 * Ensures a valid Instagram token is available for an influencer, refreshing if necessary
 * This should be called before making Instagram API requests
 *
 * @param {string} influencerId - Influencer ID
 * @param {Object} logger - Logger instance (defaults to console)
 * @returns {Promise<Object>} - Valid token object
 * @throws {Error} - If no auth found or refresh fails
 */
export const ensureValidInstagramToken = async (influencerId, logger = console) => {
	const auth = await InstagramAuth.findOne({ influencerId, deleted: { $ne: true } }).sort({ createdAt: -1 });

	if (!auth) {
		throw new Error(`No Instagram account connected for influencer: ${influencerId}`);
	}

	// Just-in-time refresh: Refresh if expires within 1 day and token is 24h+ old
	const tokenHealth = checkTokenHealth(auth.tokens, 24 * 60 * 60 * 1000); // 1 day threshold

	if (tokenHealth.expired) {
		throw new Error("Instagram token has expired. Please reconnect your account.");
	}

	if (tokenHealth.expiringSoon && tokenHealth.canRefresh) {
		logger.log(`Token expiring within 1 day for influencer: ${influencerId}, refreshing now...`);
		await refreshInstagramToken(auth, logger);

		// Reload to get updated tokens
		const updatedAuth = await InstagramAuth.findById(auth._id);
		return updatedAuth.tokens;
	}

	// Also trigger background refresh if token expires within 7 days and is refreshable
	const weekTokenHealth = checkTokenHealth(auth.tokens, 7 * 24 * 60 * 60 * 1000); // 7 days threshold
	if (weekTokenHealth.expiringSoon && weekTokenHealth.canRefresh) {
		logger.log(`Token expires within 7 days for influencer: ${influencerId}, triggering background refresh`);
		// Fire and forget - don't await
		refreshInstagramToken(auth, logger).catch((error) => {
			logger.error(`Background refresh failed for influencer: ${influencerId}`, error.message);
		});
	}

	return auth.tokens;
};
