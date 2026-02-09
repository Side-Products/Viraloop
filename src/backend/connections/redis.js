const { createClient } = require("redis");

const PREFIX = "VIRALOOP";
let redis = global.redis;

const redisConnect = async () => {
	// Skip Redis connection during build time or if Redis host is not configured
	const redisHost = process.env.NODE_ENV == "development" ? process.env.DEV_REDIS_HOST : process.env.REDIS_HOST;
	if (!redisHost || process.env.NEXT_PHASE === "phase-production-build") {
		return null;
	}

	if (!global.redis && !global.redis?.isOpen) {
		const cfg = {
			socket: {
				host: redisHost,
				port: process.env.NODE_ENV == "development" ? process.env.DEV_REDIS_PORT : process.env.REDIS_PORT,
				tls:
					process.env.NODE_ENV == "development"
						? process.env.DEV_REDIS_TLS === "true"
							? true
							: undefined
						: process.env.REDIS_TLS === "true"
							? true
							: undefined,
			},
			password: process.env.NODE_ENV == "development" ? (process.env.DEV_REDIS_PASSWORD ?? undefined) : (process.env.REDIS_PASSWORD ?? undefined),
			username: process.env.NODE_ENV == "development" ? (process.env.DEV_REDIS_USERNAME ?? undefined) : (process.env.REDIS_USERNAME ?? undefined),
			pingInterval: 1000,
		};

		try {
			redis = global.redis = createClient(cfg);
			if (!global.redis.isOpen) {
				console.log("Redis client is not connected. Connecting now...");
				await global.redis.connect();
			}
		} catch (err) {
			console.warn("Redis connection failed (may be unavailable during build):", err.message);
			return null;
		}

		global.redis.on("connect", () => {
			console.info("Redis CONNECTED.");
		});

		global.redis.on("ready", () => {
			console.info("Redis READY.");
		});

		global.redis.on("error", (err) => {
			console.error("Redis Connection Error:", err);
		});

		global.redis.on("end", () => {
			console.warn("Redis END");
		});

		global.redis.on("reconnecting", () => {
			console.warn("Redis RECONNECTING");
		});
	}

	return global.redis;
};

const redisGet = async (key) => {
	try {
		await redisConnect();
		if (global.redis && global.redis.isOpen) {
			return await global.redis.get(PREFIX + "_" + key);
		}
	} catch (error) {
		console.error("Cache error:", error);
		return null;
	}
};

const redisSet = async (key, value, expiry) => {
	try {
		await redisConnect();
		if (global.redis && global.redis.isOpen) {
			return await global.redis.set(PREFIX + "_" + key, value, expiry);
		}
	} catch (error) {
		console.error("Cache error:", error);
		return null;
	}
};

const redisDelete = async (key) => {
	try {
		await redisConnect();
		if (global.redis && global.redis.isOpen) {
			return await global.redis.del(PREFIX + "_" + key);
		}
	} catch (error) {
		console.error("Cache error:", error);
		return null;
	}
};

module.exports = { redis: global.redis, redisConnect, redisGet, redisSet, redisDelete };
