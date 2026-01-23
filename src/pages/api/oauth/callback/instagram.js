import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { instagramOauthCallback } from "@/backend/controllers/instagramController";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

handler.get(async (req, res, next) => {
	await dbConnect();
	return instagramOauthCallback(req, res, next);
});

export default handler;
