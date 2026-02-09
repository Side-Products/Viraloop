import { useState, useContext, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";
import axios from "axios";
import { TeamContext } from "@/store/TeamContextProvider";
import { PRODUCT_NAME, PLAN_CONFIG } from "@/config/constants";
import DashboardLayout from "@/components/Layout/DashboardLayout";

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

export default function BillingPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const { currentTeam, loading: teamLoading } = useContext(TeamContext);
	const [isLoadingPortal, setIsLoadingPortal] = useState(false);
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [showErrorMessage, setShowErrorMessage] = useState(false);

	useEffect(() => {
		// Check for payment success/failure query params
		if (router.query.paymentsuccess === "true") {
			setShowSuccessMessage(true);
			// Clear the query param
			router.replace("/billing", undefined, { shallow: true });
		}
		if (router.query.paymentfailed === "true") {
			setShowErrorMessage(true);
			// Clear the query param
			router.replace("/billing", undefined, { shallow: true });
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
		} finally {
			setIsLoadingPortal(false);
		}
	};

	// Get current plan info from team limits
	const currentPlan = currentTeam?.influencerLimit > 0 ? "Active" : "No Active Plan";

	return (
		<DashboardLayout>
			<Head>
				<title>Billing - {PRODUCT_NAME}</title>
			</Head>

			<div className="max-w-4xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold text-neutral-900 mb-2">Billing</h1>
				<p className="text-neutral-500 mb-8">Manage your subscription and billing information</p>

				{/* Success Message */}
				{showSuccessMessage && (
					<div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl flex items-start gap-3">
						<svg className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
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
				<div className="bg-white rounded-2xl border border-light-300 shadow-sm p-6 mb-6">
					<div className="flex items-start justify-between">
						<div>
							<h2 className="text-lg font-semibold text-neutral-900 mb-1">Current Plan</h2>
							<p className="text-neutral-500 text-sm">Your current subscription plan</p>
						</div>
						<div className="text-right">
							<span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 text-sm font-medium rounded-full">
								{currentPlan}
							</span>
						</div>
					</div>

					{/* Team Limits */}
					{currentTeam && (
						<div className="mt-6 pt-6 border-t border-light-200">
							<h3 className="text-sm font-medium text-neutral-700 mb-4">Your Limits</h3>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="bg-light-50 rounded-xl p-4">
									<p className="text-2xl font-bold text-neutral-900">{currentTeam.influencerLimit || 0}</p>
									<p className="text-sm text-neutral-500">AI Influencers</p>
								</div>
								<div className="bg-light-50 rounded-xl p-4">
									<p className="text-2xl font-bold text-neutral-900">{currentTeam.imageLimit || 0}</p>
									<p className="text-sm text-neutral-500">Images / Month</p>
								</div>
								<div className="bg-light-50 rounded-xl p-4">
									<p className="text-2xl font-bold text-neutral-900">{currentTeam.videoLimit || 0}</p>
									<p className="text-sm text-neutral-500">Videos / Month</p>
								</div>
								<div className="bg-light-50 rounded-xl p-4">
									<p className="text-2xl font-bold text-neutral-900">{currentTeam.influencerLimit > 0 ? "1+" : "0"}</p>
									<p className="text-sm text-neutral-500">Social Platforms</p>
								</div>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="mt-6 pt-6 border-t border-light-200 flex flex-col sm:flex-row gap-3">
						<Link
							href="/pricing"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
						>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
							</svg>
							Upgrade Plan
						</Link>
						{session?.user?.stripe_customer_id && (
							<button
								onClick={handleManageSubscription}
								disabled={isLoadingPortal}
								className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-sm font-medium border border-light-300 hover:bg-light-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoadingPortal ? (
									<svg className="animate-spin h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								) : (
									<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								)}
								Manage Subscription
							</button>
						)}
					</div>
				</div>

				{/* Payment History Card */}
				<div className="bg-white rounded-2xl border border-light-300 shadow-sm p-6">
					<h2 className="text-lg font-semibold text-neutral-900 mb-1">Payment History</h2>
					<p className="text-neutral-500 text-sm mb-6">View your past invoices and payments</p>

					{session?.user?.stripe_customer_id ? (
						<button
							onClick={handleManageSubscription}
							disabled={isLoadingPortal}
							className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
						>
							View all invoices in Stripe
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
						</button>
					) : (
						<p className="text-neutral-500 text-sm">No payment history available. Subscribe to a plan to get started.</p>
					)}
				</div>

				{/* Need Help Card */}
				<div className="mt-6 bg-light-100 rounded-2xl p-6 text-center">
					<h3 className="text-lg font-semibold text-neutral-900 mb-2">Need help with billing?</h3>
					<p className="text-neutral-500 text-sm mb-4">Our support team is here to help with any billing questions.</p>
					<a
						href="mailto:hello@viraloop.io"
						className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
					>
						<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						Contact Support
					</a>
				</div>
			</div>
		</DashboardLayout>
	);
}
