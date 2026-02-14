import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { regenerateVideoPreview } from "@/backend/controllers/influencerController";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });
dbConnect();

handler.use(isAuthenticatedUser).post(regenerateVideoPreview);

export default handler;
