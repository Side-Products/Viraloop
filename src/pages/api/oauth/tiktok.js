import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { tiktokOauth } from "@/backend/controllers/tiktokController";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });

handler.use(isAuthenticatedUser).get(async (req, res, next) => {
	await dbConnect();
	return tiktokOauth(req, res, next);
});

export default handler;
