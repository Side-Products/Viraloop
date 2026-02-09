import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import getStripe from "@/utils/getStripe";
import { TeamContext } from "@/store/TeamContextProvider";
import { useSession } from "next-auth/react";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { PRODUCT_NAME } from "@/config/constants";

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

const Checkout = () => {
	const { currentTeam, loading: teamLoading } = useContext(TeamContext);
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const redirectToCheckout = async (stripePriceId, billingPeriod, isOneTime) => {
			if (status === "authenticated" && session && session.user) {
				setIsLoading(true);
				setError(null);

				try {
					const link = `/api/stripe/checkout-session`;
					const { data } = await axios.get(link, {
						params: {
							stripePriceId: stripePriceId,
							teamId: currentTeam?._id,
							billingPeriod: billingPeriod,
							isOneTime: isOneTime,
							referral: typeof window !== "undefined" ? window.promotekit_referral : undefined,
						},
					});
					const stripe = await getStripe();
					// Redirect to Stripe Checkout
					const result = await stripe.redirectToCheckout({ sessionId: data.id });

					if (result.error) {
						setError(result.error.message);
						setIsLoading(false);
					}
				} catch (error) {
					console.error("Checkout error:", error);
					setIsLoading(false);
					setError(error.response?.data?.error || error.message || "Something went wrong");
				}
			}
		};

		// Wait for team to be loaded before proceeding
		if (!teamLoading && currentTeam && currentTeam._id && router?.query?.priceId) {
			redirectToCheckout(router?.query?.priceId, router?.query?.billing || "monthly", router?.query?.isOneTime || "false");
		} else if (!teamLoading && !currentTeam?._id) {
			setIsLoading(false);
			setError("No team found. Please try again.");
		}
	}, [router, session, status, currentTeam, teamLoading]);

	return (
		<>
			<Head>
				<title>Checkout - {PRODUCT_NAME}</title>
			</Head>
			<div className="min-h-screen bg-light-50 flex justify-center items-center">
				{isLoading ? (
					<div className="flex flex-col items-center gap-4">
						<svg className="animate-spin h-10 w-10 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<p className="text-neutral-500">Redirecting to checkout...</p>
					</div>
				) : error ? (
					<div className="flex flex-col items-center gap-4 text-center px-4">
						<div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
							<svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-neutral-900">Checkout Error</h2>
						<p className="text-neutral-500 max-w-md">{error}</p>
						<button
							onClick={() => router.push("/pricing")}
							className="mt-4 px-6 py-3 bg-primary-400 text-white rounded-sm font-medium hover:bg-primary-500 transition-colors"
						>
							Back to Pricing
						</button>
					</div>
				) : null}
			</div>
		</>
	);
};

export default Checkout;
