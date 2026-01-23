import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { createInfluencer, getAllInfluencers } from "@/backend/controllers/influencerController";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });
dbConnect();

handler.use(isAuthenticatedUser).post(createInfluencer);
handler.use(isAuthenticatedUser).get(getAllInfluencers);

export default handler;
