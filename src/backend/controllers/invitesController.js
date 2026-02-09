import dbConnect from "@/lib/dbConnect";
import TeamInvites from "@/backend/models/teamInvites";
import Team from "@/backend/models/team";
import Member from "@/backend/models/member";
import User from "@/backend/models/user";
import { sendEmailViaAWS_SES } from "@/backend/modules/email";
import { getInvitationEmailTemplate } from "@/backend/modules/email/template/invitation";
import { PRODUCT_NAME, PRODUCT_URL } from "@/config/constants";

// Send team invite email
export const sendTeamInviteEmail = async (req, res) => {
	try {
		await dbConnect();

		const { teamId, email, role = "member" } = req.body;
		const inviterId = req.user._id;

		if (!teamId || !email) {
			return res.status(400).json({
				success: false,
				message: "Team ID and email are required",
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				message: "Please provide a valid email address",
			});
		}

		// Get team details
		const team = await Team.findById(teamId);
		if (!team) {
			return res.status(404).json({
				success: false,
				message: "Team not found",
			});
		}

		// Check if user is admin of this team
		const member = await Member.findOne({ userId: inviterId, teamId });
		if (!member || (member.role !== "admin" && team.createdBy.toString() !== inviterId.toString())) {
			return res.status(403).json({
				success: false,
				message: "Only team admins can send invites",
			});
		}

		// Check if user is already a member
		const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
		if (existingUser) {
			const existingMember = await Member.findOne({ userId: existingUser._id, teamId });
			if (existingMember) {
				return res.status(400).json({
					success: false,
					message: "This user is already a member of this team",
				});
			}
		}

		// Check if invite already exists and is pending
		const existingInvite = await TeamInvites.findOne({
			teamId,
			invitedUserEmail: email.toLowerCase().trim(),
			accepted: false,
		});

		if (existingInvite) {
			return res.status(400).json({
				success: false,
				message: "An invite has already been sent to this email",
			});
		}

		// Get inviter details
		const inviter = await User.findById(inviterId);

		// Create invite
		const invite = await TeamInvites.create({
			inviterId,
			teamId,
			invitedUserEmail: email.toLowerCase().trim(),
			role: role || "member",
		});

		// Generate invite link
		const inviteLink = `${PRODUCT_URL}/join-team/accept-invite?invite=${invite._id}&team=${teamId}`;

		// Send email
		const emailBody = getInvitationEmailTemplate({
			inviterName: inviter.name || "A team member",
			teamName: team.name,
			inviteLink,
		});

		await sendEmailViaAWS_SES({
			emailBody,
			emailSubject: `You've been invited to join ${team.name} on ${PRODUCT_NAME}`,
			emailTo: email.toLowerCase().trim(),
		});

		res.status(200).json({
			success: true,
			message: "Invite sent successfully",
			invite,
		});
	} catch (error) {
		console.error("Error sending team invite:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to send invite",
		});
	}
};

// Accept team invite
export const acceptTeamInvite = async (req, res) => {
	try {
		await dbConnect();

		const { inviteId, teamId } = req.body;
		const userId = req.user._id;
		const userEmail = req.user.email;

		if (!inviteId || !teamId) {
			return res.status(400).json({
				success: false,
				message: "Invite ID and Team ID are required",
			});
		}

		// Find the invite
		const invite = await TeamInvites.findById(inviteId);
		if (!invite) {
			return res.status(404).json({
				success: false,
				message: "Invite not found",
			});
		}

		// Check if invite is for this team
		if (invite.teamId.toString() !== teamId) {
			return res.status(400).json({
				success: false,
				message: "Invalid invite for this team",
			});
		}

		// Check if invite email matches user email
		if (invite.invitedUserEmail.toLowerCase() !== userEmail.toLowerCase()) {
			return res.status(403).json({
				success: false,
				message: "This invite was sent to a different email address",
			});
		}

		// Check if invite is already accepted
		if (invite.accepted) {
			return res.status(400).json({
				success: false,
				message: "This invite has already been accepted",
			});
		}

		// Check if user is already a member
		const existingMember = await Member.findOne({ userId, teamId });
		if (existingMember) {
			return res.status(400).json({
				success: false,
				message: "You are already a member of this team",
			});
		}

		// Create member record
		await Member.create({
			userId,
			teamId,
			role: invite.role || "member",
		});

		// Mark invite as accepted
		invite.accepted = true;
		await invite.save();

		// Get team details
		const team = await Team.findById(teamId);

		res.status(200).json({
			success: true,
			message: "Successfully joined the team",
			team,
		});
	} catch (error) {
		console.error("Error accepting team invite:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to accept invite",
		});
	}
};

// Get team invites
export const getTeamInvites = async (req, res) => {
	try {
		await dbConnect();

		const { teamId } = req.query;

		if (!teamId) {
			return res.status(400).json({
				success: false,
				message: "Team ID is required",
			});
		}

		// Get all pending invites for this team
		const invites = await TeamInvites.find({ teamId, accepted: false })
			.populate("inviterId", "name email")
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			invites,
		});
	} catch (error) {
		console.error("Error getting team invites:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to get invites",
		});
	}
};

// Cancel/delete team invite
export const cancelTeamInvite = async (req, res) => {
	try {
		await dbConnect();

		const { inviteId } = req.body;
		const userId = req.user._id;

		if (!inviteId) {
			return res.status(400).json({
				success: false,
				message: "Invite ID is required",
			});
		}

		// Find the invite
		const invite = await TeamInvites.findById(inviteId);
		if (!invite) {
			return res.status(404).json({
				success: false,
				message: "Invite not found",
			});
		}

		// Check if user is admin of this team
		const member = await Member.findOne({ userId, teamId: invite.teamId });
		const team = await Team.findById(invite.teamId);

		if (!member || (member.role !== "admin" && team.createdBy.toString() !== userId.toString())) {
			return res.status(403).json({
				success: false,
				message: "Only team admins can cancel invites",
			});
		}

		// Delete the invite
		await TeamInvites.findByIdAndDelete(inviteId);

		res.status(200).json({
			success: true,
			message: "Invite cancelled successfully",
		});
	} catch (error) {
		console.error("Error cancelling team invite:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to cancel invite",
		});
	}
};
