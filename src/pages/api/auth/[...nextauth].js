import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import User from "@/backend/models/user";
import Team from "@/backend/models/team";
import dbConnect from "@/lib/dbConnect";
const { v4: uuidv4 } = require("uuid");

export default async function auth(req, res) {
	return await NextAuth(req, res, getAuthOptions());
}

const getAuthOptions = () => ({
	adapter: MongoDBAdapter(clientPromise),
	session: {
		strategy: "jwt",
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
			clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
			httpOptions: {
				timeout: 80000,
			},
		}),
		CredentialsProvider({
			name: "Credentials",
			async authorize(credentials) {
				await dbConnect();
				const { email, password } = credentials;

				// Checks
				if (!email || !password) {
					throw new Error("Please enter email and password");
				}
				// Find user in db
				const user = await User.findOne({ email }).select("+password");
				if (!user) {
					throw new Error("Invalid email or password");
				}

				// Check if password is correct
				const isPasswordMatching = await user.comparePassword(password);
				if (!isPasswordMatching) {
					throw new Error("Invalid email or password");
				}

				// Create default team on user signup if not exists
				const team = await Team.findOne({ createdBy: user._id, isDefault: true });
				if (!team) {
					const apiKey = uuidv4();
					await Team.create({ name: "Default Team", createdBy: user._id, isDefault: true, apiKey });
				}
				return Promise.resolve(user);
			},
		}),
	],
	secret: process.env.JWT_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			user && (token.user = user);
			return Promise.resolve(token);
		},
		async session({ session, user, token }) {
			await dbConnect();
			const userFromDatabase = await User.findOne({ email: token.user.email });
			session.user = userFromDatabase;
			return Promise.resolve(session);
		},
	},
	events: {
		async createUser(message) {
			await dbConnect();
			// Find user in db
			const user = await User.findOne({ email: message.user.email });
			if (!user) {
				throw new Error("Invalid email or password");
			}
			user.role = "user";
			await user.save();
			// Create default team on user signup
			const team = await Team.findOne({ createdBy: user._id, isDefault: true });
			if (!team) {
				const apiKey = uuidv4();
				await Team.create({ name: "Default Team", createdBy: user._id, isDefault: true, apiKey });
			}
		},
		async signIn(event) {
			const { user, account, isNewUser } = event;

			if (isNewUser && account.provider === "google") {
				const _user = await User.findById(user.id);
				if (_user) {
					_user.emailVerified = true;
					await _user.save();
				}
			}
		},
	},
	pages: {
		signIn: "/login",
	},
});
