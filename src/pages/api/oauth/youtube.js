import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { youtubeOauth } from "@/backend/controllers/youtubeController";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

handler.use(isAuthenticatedUser).get(async (req, res, next) => {
	await dbConnect();
	return youtubeOauth(req, res, next);
});

export default handler;
