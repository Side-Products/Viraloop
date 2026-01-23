import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { instagramOauth } from "@/backend/controllers/instagramController";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

handler.use(isAuthenticatedUser).get(async (req, res, next) => {
	await dbConnect();
	return instagramOauth(req, res, next);
});

export default handler;
