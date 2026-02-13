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

const TRIAL_PRICE_ID = "price_1SyuIo480cIYlJtw77WJVmRe";

// Sparkle component for celebratory effect
const Sparkle = ({ style, delay }) => (
	<div
		className="absolute w-2 h-2 bg-primary-400 rounded-full animate-ping"
		style={{
			...style,
			animationDelay: `${delay}ms`,
			animationDuration: "1.5s",
		}}
	/>
);

const PaymentSuccess = () => {
	const router = useRouter();
	const { priceId, team } = router.query;
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
	const [showConfetti, setShowConfetti] = useState(true);
	const [mounted, setMounted] = useState(false);

	const isTrial = priceId === TRIAL_PRICE_ID;

	useEffect(() => {
		setMounted(true);

		const updateSize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		updateSize();
		window.addEventListener("resize", updateSize);

		const timer = setTimeout(() => {
			setShowConfetti(false);
		}, 6000);

		return () => {
			window.removeEventListener("resize", updateSize);
			clearTimeout(timer);
		};
	}, []);

	const steps = [
		{
			icon: (
				<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			),
			title: "Create your AI influencer",
			description: "Design a unique personality and appearance",
		},
		{
			icon: (
				<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
				</svg>
			),
			title: "Generate content",
			description: "Create videos and images in minutes",
		},
		{
			icon: (
				<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
				</svg>
			),
			title: "Share everywhere",
			description: "Auto-post to TikTok, Instagram & YouTube",
		},
	];

	const sparklePositions = [
		{ top: "-8px", left: "50%", transform: "translateX(-50%)" },
		{ top: "10%", right: "-12px" },
		{ top: "10%", left: "-12px" },
		{ bottom: "10%", right: "-8px" },
		{ bottom: "10%", left: "-8px" },
		{ bottom: "-8px", left: "50%", transform: "translateX(-50%)" },
	];

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
					numberOfPieces={400}
					colors={["#FFFFFF", "#ff4f01", "#ED6B2F", "#262626", "#404040"]}
					gravity={0.12}
				/>
			)}

			<div className="min-h-screen bg-gradient-to-b from-primary-50/50 via-white to-white flex items-center justify-center px-4 py-12 overflow-hidden">
				{/* Decorative background elements */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div
						className={`absolute top-20 left-[10%] w-72 h-72 bg-primary-200/30 rounded-full blur-3xl transition-all duration-1000 ${
							mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
						}`}
					/>
					<div
						className={`absolute bottom-20 right-[10%] w-96 h-96 bg-primary-100/40 rounded-full blur-3xl transition-all duration-1000 delay-300 ${
							mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
						}`}
					/>
				</div>

				<div
					className={`relative max-w-xl w-full transition-all duration-700 ${
						mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
					}`}
				>
					{/* Success Message */}
					<div className="text-center mb-10">
						<div
							className={`text-5xl mb-4 transition-all duration-500 ${
								mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
							}`}
							style={{ transitionDelay: "200ms" }}
						>
							🎉
						</div>
						<h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
							You're all set!
						</h1>
						<p className="text-neutral-500 text-lg">
							Welcome to {PRODUCT_NAME}.{" "}
							{isTrial ? "Your trial is now active." : "Your subscription is now active."}
						</p>
					</div>

					{/* Steps Card */}
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-neutral-100 shadow-xl shadow-neutral-900/5">
						<h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-5">
							Get Started
						</h2>
						<div className="space-y-3">
							{steps.map((step, index) => (
								<div
									key={index}
									className={`flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-100 transition-all duration-500 ${
										mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
									}`}
									style={{ transitionDelay: `${(index + 1) * 150}ms` }}
								>
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center flex-shrink-0 text-primary-500">
										{step.icon}
									</div>
									<div>
										<h3 className="font-semibold text-neutral-900 mb-0.5">{step.title}</h3>
										<p className="text-sm text-neutral-500">{step.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/influencers" className="btn btn-primary !text-base !px-6 !py-3.5">
							Create Your First Influencer
							<svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</Link>
						<Link href="/dashboard" className="btn btn-secondary !text-base !px-6 !py-3.5">
							Go to Dashboard
						</Link>
					</div>

					{/* Support Link */}
					<p className="mt-8 text-center text-sm text-neutral-400">
						Questions?{" "}
						<button
							onClick={() => window.$crisp?.push(["do", "chat:open"])}
							className="text-neutral-600 hover:text-primary-500 transition-colors underline-offset-2 hover:underline"
						>
							We're here to help
						</button>
					</p>
				</div>
			</div>
		</>
	);
};

export default PaymentSuccess;
