import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import User from "@/backend/models/user";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

// Update user profile
handler.use(isAuthenticatedUser).put(async (req, res) => {
	await dbConnect();

	const { name } = req.body;

	if (!name || !name.trim()) {
		return res.status(400).json({
			success: false,
			message: "Name is required",
		});
	}

	const userId = req.user._id || req.user.id;

	const user = await User.findByIdAndUpdate(
		userId,
		{ name: name.trim() },
		{ new: true, runValidators: true }
	);

	if (!user) {
		return res.status(404).json({
			success: false,
			message: "User not found",
		});
	}

	res.status(200).json({
		success: true,
		message: "Profile updated successfully",
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
		},
	});
});

export default handler;
