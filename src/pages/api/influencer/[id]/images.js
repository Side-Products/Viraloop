import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";
import { getInfluencerImages, createInfluencerImage } from "@/backend/controllers/influencerImageController";

const handler = nc({ onError });

// GET /api/influencer/[id]/images - Get all images for an influencer
handler.use(isAuthenticatedUser).get(async (req, res, next) => {
	await dbConnect();
	return getInfluencerImages(req, res, next);
});

// POST /api/influencer/[id]/images - Create a new image for an influencer
handler.use(isAuthenticatedUser).post(async (req, res, next) => {
	await dbConnect();
	return createInfluencerImage(req, res, next);
});

export default handler;
