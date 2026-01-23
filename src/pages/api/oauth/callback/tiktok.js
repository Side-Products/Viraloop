import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { tiktokOauthCallback } from "@/backend/controllers/tiktokController";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

handler.get(async (req, res, next) => {
	await dbConnect();
	return tiktokOauthCallback(req, res, next);
});

export default handler;
