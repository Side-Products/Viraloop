import nc from "next-connect";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import Team from "@/backend/models/team";
import Member from "@/backend/models/member";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

// Create a new team
handler.use(isAuthenticatedUser).post(async (req, res) => {
	await dbConnect();

	const { name } = req.body;
	const userId = req.user._id;

	if (!name || !name.trim()) {
		return res.status(400).json({
			success: false,
			message: "Team name is required",
		});
	}

	// Generate API key for the team
	const apiKey = crypto.randomBytes(32).toString("hex");

	// Create the team
	const team = await Team.create({
		name: name.trim(),
		createdBy: userId,
		apiKey,
		isDefault: false,
	});

	// The Member record is created automatically via Team model's post-save hook

	res.status(201).json({
		success: true,
		team,
	});
});

// Get all teams for the authenticated user
handler.use(isAuthenticatedUser).get(async (req, res) => {
	await dbConnect();

	const userId = req.user._id;

	// Find all teams the user is a member of
	const members = await Member.find({ userId }).populate("teamId");

	// Extract teams from member records
	const teams = members
		.filter((member) => member.teamId) // Filter out any null teamIds
		.map((member) => ({
			_id: member.teamId._id,
			name: member.teamId.name,
			credits: member.teamId.credits || 0,
			isDefault: member.teamId.isDefault || false,
			role: member.role,
		}));

	res.status(200).json({
		success: true,
		teams,
	});
});

export default handler;
