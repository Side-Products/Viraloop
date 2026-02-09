import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Users } from "lucide-react";
import { PRODUCT_NAME } from "@/config/constants";

export async function getServerSideProps({ req, query }) {
	const session = await getSession({ req });

	// If not logged in, redirect to login with callback to this page
	if (!session) {
		const { invite, team } = query;
		const callbackUrl = `/join-team/accept-invite?invite=${invite}&team=${team}`;
		return {
			redirect: {
				destination: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
				permanent: false,
			},
		};
	}

	return {
		props: {
			session,
			inviteId: query.invite || null,
			teamId: query.team || null,
		},
	};
}

export default function AcceptInvite({ session, inviteId, teamId }) {
	const router = useRouter();
	const [status, setStatus] = useState("loading"); // loading, success, error
	const [message, setMessage] = useState("");
	const [teamName, setTeamName] = useState("");

	useEffect(() => {
		const acceptInvite = async () => {
			if (!inviteId || !teamId) {
				setStatus("error");
				setMessage("Invalid invitation link. Please check your email and try again.");
				return;
			}

			try {
				const res = await fetch("/api/team/accept-invite", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ inviteId, teamId }),
				});

				const data = await res.json();

				if (data.success) {
					setStatus("success");
					setTeamName(data.team?.name || "the team");
					setMessage(`You are now a member of ${data.team?.name || "the team"}!`);
				} else {
					setStatus("error");
					setMessage(data.message || "Failed to accept invitation");
				}
			} catch (error) {
				console.error("Error accepting invite:", error);
				setStatus("error");
				setMessage("An error occurred while accepting the invitation");
			}
		};

		acceptInvite();
	}, [inviteId, teamId]);

	return (
		<>
			<Head>
				<title>Accept Invitation - {PRODUCT_NAME}</title>
			</Head>

			<div className="min-h-screen bg-gradient-to-br from-light-50 via-white to-primary-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
					{status === "loading" && (
						<>
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
							</div>
							<h1 className="text-2xl font-bold text-neutral-900 mb-2">Accepting Invitation</h1>
							<p className="text-neutral-500">Please wait while we add you to the team...</p>
						</>
					)}

					{status === "success" && (
						<>
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<CheckCircle className="w-8 h-8 text-green-500" />
							</div>
							<h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome to the Team!</h1>
							<p className="text-neutral-500 mb-6">{message}</p>
							<div className="flex flex-col gap-3">
								<Link
									href="/dashboard"
									className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
								>
									<Users className="w-4 h-4" />
									Go to Dashboard
								</Link>
								<Link
									href="/settings/team"
									className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-light-100 text-neutral-700 rounded-xl font-medium hover:bg-light-200 transition-colors"
								>
									View Team Settings
								</Link>
							</div>
						</>
					)}

					{status === "error" && (
						<>
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<XCircle className="w-8 h-8 text-red-500" />
							</div>
							<h1 className="text-2xl font-bold text-neutral-900 mb-2">Invitation Error</h1>
							<p className="text-neutral-500 mb-6">{message}</p>
							<div className="flex flex-col gap-3">
								<Link
									href="/dashboard"
									className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
								>
									Go to Dashboard
								</Link>
								<p className="text-sm text-neutral-400">
									If you continue to have issues, please contact support.
								</p>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
}
