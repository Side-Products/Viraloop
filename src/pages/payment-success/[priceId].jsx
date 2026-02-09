import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Confetti from "react-confetti";
import { PRODUCT_NAME } from "@/config/constants";
import { useSession } from "next-auth/react";
import { getSession } from "next-auth/react";

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

const PaymentSuccess = () => {
	const router = useRouter();
	const { priceId, team } = router.query;
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
	const [showConfetti, setShowConfetti] = useState(true);

	useEffect(() => {
		// Get window size for confetti
		const updateSize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		updateSize();
		window.addEventListener("resize", updateSize);

		// Stop confetti after 5 seconds
		const timer = setTimeout(() => {
			setShowConfetti(false);
		}, 5000);

		return () => {
			window.removeEventListener("resize", updateSize);
			clearTimeout(timer);
		};
	}, []);

	return (
		<>
			<Head>
				<title>Payment Successful - {PRODUCT_NAME}</title>
			</Head>

			{showConfetti && windowSize.width > 0 && (
				<Confetti
					width={windowSize.width}
					height={windowSize.height}
					recycle={false}
					numberOfPieces={500}
					colors={["#FF6B35", "#FF4F01", "#FFB800", "#10B981", "#3B82F6"]}
				/>
			)}

			<div className="min-h-screen bg-gradient-to-br from-light-50 via-primary-50/30 to-light-100 flex items-center justify-center px-4">
				<div className="max-w-lg w-full text-center">
					{/* Success Icon */}
					<div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-success-400 to-success-500 flex items-center justify-center shadow-lg shadow-success-400/30">
						<svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
						</svg>
					</div>

					{/* Success Message */}
					<h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
						Welcome to {PRODUCT_NAME}!
					</h1>
					<p className="text-lg text-neutral-500 mb-8">
						Your payment was successful. Your subscription is now active and you're ready to create amazing AI influencer content.
					</p>

					{/* What's Next Section */}
					<div className="bg-white rounded-2xl p-6 mb-8 border border-light-300 shadow-sm text-left">
						<h2 className="text-lg font-semibold text-neutral-900 mb-4">Here's what you can do now:</h2>
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
									<span className="text-primary-500 text-sm font-semibold">1</span>
								</div>
								<span className="text-neutral-500">Create your first AI influencer with a unique personality</span>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
									<span className="text-primary-500 text-sm font-semibold">2</span>
								</div>
								<span className="text-neutral-500">Generate engaging video content in minutes</span>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
									<span className="text-primary-500 text-sm font-semibold">3</span>
								</div>
								<span className="text-neutral-500">Connect your social accounts and start posting</span>
							</li>
						</ul>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/dashboard"
							className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-sm font-medium shadow-lg shadow-primary-400/25 hover:shadow-xl hover:shadow-primary-400/30 transition-all duration-300 transform hover:-translate-y-0.5"
						>
							<span>Go to Dashboard</span>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</Link>
						<Link
							href="/influencers"
							className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-neutral-900 rounded-sm font-medium border border-light-300 hover:bg-light-100 transition-all duration-300"
						>
							Create Your First Influencer
						</Link>
					</div>

					{/* Support Link */}
					<p className="mt-8 text-sm text-neutral-500">
						Need help getting started?{" "}
						<a href="mailto:hello@viraloop.io" className="text-primary-500 hover:text-primary-600 underline">
							Contact our support team
						</a>
					</p>
				</div>
			</div>
		</>
	);
};

export default PaymentSuccess;
