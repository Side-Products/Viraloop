import "dotenv/config";
import mongoose from "mongoose";
import scheduleCreditsCron from "./scheduleCredits.js";

// Connect to MongoDB first
async function connectDB() {
	try {
		console.log("Connecting to MongoDB...");
		await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/viraloop", {
			serverSelectionTimeoutMS: 30000, // 30 seconds timeout
			maxPoolSize: 10,
		});
		console.log("✅ Connected to MongoDB successfully");
		return true;
	} catch (error) {
		console.error("❌ MongoDB connection failed:", error.message);
		console.error("Make sure MongoDB is running and MONGODB_URI is set in .env file");
		return false;
	}
}

// Start cron jobs after DB connection
async function startCronJobs() {
	const connected = await connectDB();

	if (!connected) {
		console.error("Cannot start cron jobs without database connection");
		process.exit(1);
	}

	console.log("\n========== VIRALOOP CRON JOBS ==========");
	console.log("Starting cron jobs...");

	scheduleCreditsCron.start();

	console.log("✅ All cron jobs started successfully");
	console.log("==========================================\n");
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
	console.log("\n⏹️  Shutting down cron jobs...");

	scheduleCreditsCron.stop();

	await mongoose.connection.close();
	console.log("✅ Cron jobs stopped. Goodbye!");
	process.exit(0);
});

// Start the application
startCronJobs().catch((error) => {
	console.error("Fatal error starting cron jobs:", error);
	process.exit(1);
});
