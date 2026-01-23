import dbConnect from "@/lib/dbConnect";
import User from "@/backend/models/user";
import Team from "@/backend/models/team";
const { v4: uuidv4 } = require("uuid");

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ success: false, message: "Method not allowed" });
	}

	try {
		await dbConnect();

		const { name, email, password } = req.body;

		// Validate input
		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "Please provide name, email, and password",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists with this email",
			});
		}

		// Create user
		const user = await User.create({
			name,
			email,
			password,
			image: "",
			emailVerified: true,
		});

		// Create default team for new user
		const apiKey = uuidv4();
		await Team.create({
			name: "Default Team",
			createdBy: user._id,
			isDefault: true,
			apiKey,
		});

		res.status(200).json({
			success: true,
			message: "Registered successfully",
		});
	} catch (error) {
		console.error("Registration error:", error);

		// Handle mongoose validation errors
		if (error.name === "ValidationError") {
			const message = Object.values(error.errors).map((val) => val.message)[0];
			return res.status(400).json({
				success: false,
				message,
			});
		}

		// Handle duplicate key error
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: "User already exists with this email",
			});
		}

		res.status(500).json({
			success: false,
			message: error.message || "Internal server error",
		});
	}
}
