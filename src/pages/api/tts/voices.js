import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";
import { getTTSVoices } from "@/backend/controllers/ttsController";

const handler = nc({ onError });
dbConnect();

handler.use(isAuthenticatedUser).get(getTTSVoices);

export default handler;
