import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import Team from "@/backend/models/team";
import Member from "@/backend/models/member";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

// Get a specific team
handler.use(isAuthenticatedUser).get(async (req, res) => {
	await dbConnect();

	const { id: teamId } = req.query;
	const userId = req.user._id;

	// Check if user is a member of this team
	const member = await Member.findOne({ userId, teamId });
	if (!member) {
		return res.status(403).json({
			success: false,
			message: "You are not a member of this team",
		});
	}

	const team = await Team.findById(teamId);
	if (!team) {
		return res.status(404).json({
			success: false,
			message: "Team not found",
		});
	}

	res.status(200).json({
		success: true,
		team,
	});
});

// Update team
handler.use(isAuthenticatedUser).put(async (req, res) => {
	await dbConnect();

	const { id: teamId } = req.query;
	const userId = req.user._id;
	const { name } = req.body;

	// Check if user is admin of this team
	const member = await Member.findOne({ userId, teamId });
	if (!member || member.role !== "admin") {
		// Also check if user is the creator
		const team = await Team.findById(teamId);
		if (!team || team.createdBy.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: "You do not have permission to update this team",
			});
		}
	}

	if (!name || !name.trim()) {
		return res.status(400).json({
			success: false,
			message: "Team name is required",
		});
	}

	const team = await Team.findByIdAndUpdate(
		teamId,
		{ name: name.trim() },
		{ new: true, runValidators: true }
	);

	if (!team) {
		return res.status(404).json({
			success: false,
			message: "Team not found",
		});
	}

	res.status(200).json({
		success: true,
		team,
	});
});

// Delete team
handler.use(isAuthenticatedUser).delete(async (req, res) => {
	await dbConnect();

	const { id: teamId } = req.query;
	const userId = req.user._id;

	// Find the team
	const team = await Team.findById(teamId);
	if (!team) {
		return res.status(404).json({
			success: false,
			message: "Team not found",
		});
	}

	// Only the creator can delete the team
	if (team.createdBy.toString() !== userId.toString()) {
		return res.status(403).json({
			success: false,
			message: "Only the team owner can delete this team",
		});
	}

	// Prevent deletion of default team
	if (team.isDefault) {
		return res.status(400).json({
			success: false,
			message: "Default team cannot be deleted",
		});
	}

	// Delete all members of the team
	await Member.deleteMany({ teamId });

	// Delete the team
	await Team.findByIdAndDelete(teamId);

	res.status(200).json({
		success: true,
		message: "Team deleted successfully",
	});
});

export default handler;
