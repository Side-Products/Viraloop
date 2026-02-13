import nc from "next-connect";
import dbConnect from "@/lib/dbConnect";
import { getCreditHistory } from "@/backend/controllers/creditHistoryController";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import onError from "@/backend/middlewares/errors";

const handler = nc({ onError });
dbConnect();

handler.use(isAuthenticatedUser).get(getCreditHistory);

export default handler;
