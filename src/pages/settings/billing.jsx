import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import SettingsLayout from "@/components/Settings/SettingsLayout";
import { TeamContext } from "@/store/TeamContextProvider";
import Pricing from "@/components/Pricing";
import { CreditCard, Check, Loader2 } from "lucide-react";

export async function getServerSideProps({ req }) {
	const session = await getSession({ req: req });
	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	return {
		props: { session },
	};
}

export default function BillingSettings() {
	const router = useRouter();
	const { data: session } = useSession();
	const { currentTeam } = useContext(TeamContext);
	const [isLoadingPortal, setIsLoadingPortal] = useState(false);
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [showErrorMessage, setShowErrorMessage] = useState(false);

	useEffect(() => {
		if (router.query.paymentsuccess === "true") {
			setShowSuccessMessage(true);
			toast.success("Payment successful!");
			router.replace("/settings/billing", undefined, { shallow: true });
		}
		if (router.query.paymentfailed === "true") {
			setShowErrorMessage(true);
			toast.error("Payment failed. Please try again.");
			router.replace("/settings/billing", undefined, { shallow: true });
		}
	}, [router.query]);

	const handleManageSubscription = async () => {
		if (!session?.user?.stripe_customer_id) {
			router.push("/pricing");
			return;
		}

		setIsLoadingPortal(true);
		try {
			const { data } = await axios.post("/api/stripe/create-portal-session");
			if (data.portalSessionUrl) {
				window.location.href = data.portalSessionUrl;
			}
		} catch (error) {
			console.error("Error opening billing portal:", error);
			toast.error("Failed to open billing portal");
		} finally {
			setIsLoadingPortal(false);
		}
	};

	// Get current plan name based on team's subscription
	const getCurrentPlanName = () => {
		if (!currentTeam) return "Free";

		// Check based on influencer limit
		if (currentTeam.influencerLimit === 1) return "Trial";
		if (currentTeam.influencerLimit === 5) return "Growth";
		if (currentTeam.influencerLimit === 15) return "Pro";
		if (currentTeam.influencerLimit === 50) return "Ultra";

		return "Free";
	};

	return (
		<SettingsLayout title="Billing Settings">
			{/* Header */}
			<div className="flex items-center gap-3 mb-8">
				<div className="p-3 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl border border-primary-200">
					<CreditCard className="w-6 h-6 text-primary-500" />
				</div>
				<div>
					<h1 className="text-xl font-semibold text-neutral-900">Billing</h1>
					<p className="text-neutral-500 text-sm">Manage your team's subscription and billing details</p>
				</div>
			</div>

			{/* Success Message */}
			{showSuccessMessage && (
				<div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl flex items-start gap-3">
					<Check className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
					<div>
						<p className="font-medium text-success-700">Payment successful!</p>
						<p className="text-sm text-success-600">Your subscription has been updated.</p>
					</div>
					<button onClick={() => setShowSuccessMessage(false)} className="ml-auto text-success-500 hover:text-success-600">
						<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			)}

			{/* Error Message */}
			{showErrorMessage && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
					<svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
					<div>
						<p className="font-medium text-red-700">Payment failed</p>
						<p className="text-sm text-red-600">There was an issue processing your payment. Please try again.</p>
					</div>
					<button onClick={() => setShowErrorMessage(false)} className="ml-auto text-red-500 hover:text-red-600">
						<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			)}

			{/* Current Plan Card */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-light-50 rounded-xl border border-light-200 mb-8">
				<div className="flex flex-wrap items-center gap-4 md:gap-8">
					<div>
						<span className="text-sm text-neutral-500">Team:</span>
						<span className="ml-2 text-sm font-medium text-primary-500">{currentTeam?.name || "—"}</span>
					</div>
					<div className="hidden md:block w-px h-6 bg-light-300" />
					<div>
						<span className="text-sm text-neutral-500">Plan:</span>
						<span className="ml-2 text-sm font-medium text-primary-500">{getCurrentPlanName()}</span>
					</div>
					<div className="hidden md:block w-px h-6 bg-light-300" />
					<div>
						<span className="text-sm text-neutral-500">Email:</span>
						<span className="ml-2 text-sm font-medium text-neutral-700">{session?.user?.email || "—"}</span>
					</div>
				</div>
				{session?.user?.stripe_customer_id && (
					<button
						onClick={handleManageSubscription}
						disabled={isLoadingPortal}
						className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
					>
						{isLoadingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
						Manage Subscription
					</button>
				)}
			</div>

			{/* Pricing Plans */}
			<Pricing isBillingPage={true} hideEnterprise={true} />

			{/* Usage Card */}
			{currentTeam && currentTeam.influencerLimit > 0 && (
				<div className="bg-white rounded-2xl border border-light-300 shadow-sm p-6 mt-8 mb-6">
					<h2 className="text-lg font-semibold text-neutral-900 mb-1">Usage This Month</h2>
					<p className="text-neutral-500 text-sm mb-6">Your current resource usage</p>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Images Usage */}
						<div className="bg-light-50 rounded-xl p-4">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-neutral-700">Images</span>
								<span className="text-sm text-neutral-500">
									{currentTeam.imagesUsedThisMonth || 0} / {currentTeam.imageLimit || 0}
								</span>
							</div>
							<div className="h-2 bg-light-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all"
									style={{
										width: `${Math.min(((currentTeam.imagesUsedThisMonth || 0) / (currentTeam.imageLimit || 1)) * 100, 100)}%`,
									}}
								/>
							</div>
						</div>

						{/* Videos Usage */}
						<div className="bg-light-50 rounded-xl p-4">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-neutral-700">Videos</span>
								<span className="text-sm text-neutral-500">
									{currentTeam.videosUsedThisMonth || 0} / {currentTeam.videoLimit || 0}
								</span>
							</div>
							<div className="h-2 bg-light-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-info-400 to-info-500 rounded-full transition-all"
									style={{
										width: `${Math.min(((currentTeam.videosUsedThisMonth || 0) / (currentTeam.videoLimit || 1)) * 100, 100)}%`,
									}}
								/>
							</div>
						</div>

						{/* Influencers Usage */}
						<div className="bg-light-50 rounded-xl p-4">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-neutral-700">Influencers</span>
								<span className="text-sm text-neutral-500">
									{currentTeam.influencerCount || 0} / {currentTeam.influencerLimit || 0}
								</span>
							</div>
							<div className="h-2 bg-light-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-warning-400 to-warning-500 rounded-full transition-all"
									style={{
										width: `${Math.min(((currentTeam.influencerCount || 0) / (currentTeam.influencerLimit || 1)) * 100, 100)}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Need Help Card */}
			<div className="bg-light-100 rounded-2xl p-6 text-center mt-8">
				<h3 className="text-lg font-semibold text-neutral-900 mb-2">Need help with billing?</h3>
				<p className="text-neutral-500 text-sm mb-4">Our support team is here to help with any billing questions.</p>
				<a
					href="mailto:hello@viraloop.io"
					className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
				>
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
					Contact Support
				</a>
			</div>
		</SettingsLayout>
	);
}
