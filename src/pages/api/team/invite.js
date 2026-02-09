import nc from "next-connect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import { sendTeamInviteEmail } from "@/backend/controllers/invitesController";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

handler.use(isAuthenticatedUser).post(sendTeamInviteEmail);

export default handler;
