import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

// Get all pending invites for a team
// Note: TeamInvites model doesn't exist yet, so returning empty array
handler.use(isAuthenticatedUser).get(async (req, res) => {
	await dbConnect();

	const { id: teamId } = req.query;

	if (!teamId) {
		return res.status(400).json({
			success: false,
			message: "Team ID is required",
		});
	}

	// Return empty invites for now since TeamInvites model doesn't exist
	// TODO: Implement team invites when the model is created
	res.status(200).json({
		success: true,
		invites: [],
	});
});

export default handler;
