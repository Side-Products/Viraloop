import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { getInfluencer, updateInfluencer, deleteInfluencer } from "@/backend/controllers/influencerController";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });
dbConnect();

handler.use(isAuthenticatedUser).get(getInfluencer);
handler.use(isAuthenticatedUser).put(updateInfluencer);
handler.use(isAuthenticatedUser).delete(deleteInfluencer);

export default handler;
