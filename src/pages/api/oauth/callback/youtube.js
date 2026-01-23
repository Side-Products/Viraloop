import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { youtubeOauthCallback } from "@/backend/controllers/youtubeController";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

handler.get(async (req, res, next) => {
	await dbConnect();
	return youtubeOauthCallback(req, res, next);
});

export default handler;
