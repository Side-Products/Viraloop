import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import Member from "@/backend/models/member";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

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
