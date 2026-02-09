import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import Member from "@/backend/models/member";
import User from "@/backend/models/user";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

// Get all members of a team
handler.use(isAuthenticatedUser).get(async (req, res) => {
	await dbConnect();

	const { id: teamId } = req.query;

	if (!teamId) {
		return res.status(400).json({
			success: false,
			message: "Team ID is required",
		});
	}

	// Find all members of this team
	const members = await Member.find({ teamId }).lean();

	// Get user details for each member
	const memberIds = members.map((m) => m.userId);
	const users = await User.find({ _id: { $in: memberIds } })
		.select("name email image")
		.lean();

	// Create a map of users by ID
	const userMap = users.reduce((acc, user) => {
		acc[user._id.toString()] = user;
		return acc;
	}, {});

	// Combine member and user data
	const membersWithUsers = members.map((member) => ({
		_id: member._id,
		userId: member.userId,
		teamId: member.teamId,
		role: member.role,
		createdAt: member.createdAt,
		user: userMap[member.userId.toString()] || null,
	}));

	res.status(200).json({
		success: true,
		members: membersWithUsers,
	});
});

export default handler;
