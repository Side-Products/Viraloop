import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";
import { updateInfluencerImage, deleteInfluencerImage } from "@/backend/controllers/influencerImageController";

const handler = nc({ onError });

// PUT /api/influencer/[id]/images/[imageId] - Update an image (set as primary)
handler.use(isAuthenticatedUser).put(async (req, res, next) => {
	await dbConnect();
	return updateInfluencerImage(req, res, next);
});

// DELETE /api/influencer/[id]/images/[imageId] - Delete an image
handler.use(isAuthenticatedUser).delete(async (req, res, next) => {
	await dbConnect();
	return deleteInfluencerImage(req, res, next);
});

export default handler;
