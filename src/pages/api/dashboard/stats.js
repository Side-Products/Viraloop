import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import Member from "@/backend/models/member";
import Influencer from "@/backend/models/influencer";
import Post from "@/backend/models/post";
import Loop from "@/backend/models/loop";
import Team from "@/backend/models/team";
import ErrorHandler from "@/backend/utils/errorHandler";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

// Get dashboard stats
handler.use(isAuthenticatedUser).get(async (req, res) => {
	await dbConnect();

	const userId = req.user._id;

	// Get user's current team
	const member = await Member.findOne({ userId }).populate("teamId");
	if (!member) {
		return res.status(400).json({
			success: false,
			message: "User is not a member of any team",
		});
	}

	const teamId = member.teamId._id;
	const team = member.teamId;

	// Fetch all stats in parallel
	const [totalInfluencers, totalPosts, activeLoops] = await Promise.all([
		Influencer.countDocuments({ teamId, isActive: true }),
		Post.countDocuments({ teamId, isActive: true }),
		Loop.countDocuments({ teamId, status: "active" }),
	]);

	res.status(200).json({
		success: true,
		stats: {
			totalInfluencers,
			totalPosts,
			activeLoops,
			credits: team.credits || 0,
		},
	});
});

export default handler;
