import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import onError from "@/backend/middlewares/errors";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import { getWheelStatus } from "@/backend/controllers/wheelController";

const handler = nc({ onError });

handler.use(async (req, res, next) => {
	await dbConnect();
	next();
});

handler.use(isAuthenticatedUser).get(getWheelStatus);

export default handler;
