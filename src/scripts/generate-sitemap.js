#!/usr/bin/env node

/**
 * Generate Static Sitemap
 * Run with: node src/scripts/generate-sitemap.js
 *
 * Generates sitemap.xml and saves to public/ directory
 * Can be run manually or as part of build process
 * Adapted for Viraloop - AI Influencer Platform
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Import sitemap generator
const { generateSitemap } = require("../lib/pseo/core/sitemap-generator");

const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	green: "\x1b[32m",
	blue: "\x1b[34m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	cyan: "\x1b[36m",
};

function log(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

async function connectDatabase() {
	const mongoUri = process.env.MONGODB_URI;

	if (!mongoUri) {
		throw new Error("MONGODB_URI not found in environment variables");
	}

	log("\n🔌 Connecting to MongoDB...", "blue");
	await mongoose.connect(mongoUri);
	log("✅ Connected to MongoDB", "green");
}

async function disconnectDatabase() {
	await mongoose.disconnect();
	log("🔌 Disconnected from MongoDB\n", "blue");
}

async function main() {
	log("\n" + "=".repeat(60), "bright");
	log("  🗺️  VIRALOOP SITEMAP GENERATOR", "bright");
	log("=".repeat(60), "bright");

	try {
		// Connect to database
		await connectDatabase();

		// Generate sitemap
		log("\n📝 Generating sitemap...", "blue");
		const xml = await generateSitemap({
			baseUrl: "https://viraloop.io",
			includeStatic: true,
		});

		// Save to public directory
		const publicDir = path.join(process.cwd(), "public");
		const sitemapPath = path.join(publicDir, "sitemap.xml");

		// Ensure public directory exists
		if (!fs.existsSync(publicDir)) {
			fs.mkdirSync(publicDir, { recursive: true });
		}

		// Write sitemap file
		fs.writeFileSync(sitemapPath, xml, "utf-8");

		log("✅ Sitemap generated successfully!", "green");
		log(`\n📄 File saved to: ${sitemapPath}`, "cyan");

		// Count URLs in sitemap
		const urlMatches = xml.match(/<url>/g);
		const urlCount = urlMatches ? urlMatches.length : 0;
		const sizeInKB = (Buffer.byteLength(xml, "utf8") / 1024).toFixed(2);

		log(`\n📊 Statistics:`, "bright");
		log(`   URLs: ${urlCount}`, "cyan");
		log(`   Size: ${sizeInKB} KB`, "cyan");

		log(`\n🌐 Sitemap URL: https://viraloop.io/sitemap.xml`, "bright");

		log("\n" + "=".repeat(60), "bright");
		log("\n✅ Done! Sitemap is ready for deployment.", "green");

		// Disconnect
		await disconnectDatabase();

		process.exit(0);
	} catch (error) {
		log(`\n❌ Error: ${error.message}`, "red");
		console.error(error.stack);

		try {
			await disconnectDatabase();
		} catch (e) {
			// Ignore disconnect errors
		}

		process.exit(1);
	}
}

// Run the script
main();
