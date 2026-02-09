import Head from "next/head";
import { useState } from "react";
import { PRODUCT_NAME } from "@/config/constants";

export default function AffiliatePage() {
	const onSignupClick = () => {
		window.location.href = "https://viraloop.promotekit.com";
	};

	return (
		<>
			<Head>
				<title>Affiliate Program | {PRODUCT_NAME}</title>
				<meta name="description" content="Join the Viraloop affiliate program and earn 30% lifetime commission on every referral." />
			</Head>

			<div className="min-h-screen bg-light-50 pt-32 pb-20">
				<div className="flex flex-col items-center max-w-5xl py-4 mx-auto gap-8 px-4">
					<div className="text-center">
						<div className="inline-block px-4 py-1 bg-primary-100 rounded-full mb-4">
							<p className="text-primary-700 font-medium">NEW: Track referrals in real-time</p>
						</div>
						<h1 className="text-5xl sm:text-6xl font-semibold text-neutral-900 mt-4">
							Earn 30% Lifetime
							<br />
							Commission
						</h1>
						<p className="text-neutral-500 mt-5 text-lg max-w-2xl mx-auto">
							Join our affiliate program and earn recurring commissions for every customer you refer. Get access to our affiliate dashboard with
							real-time tracking.
						</p>

						<ReferralSlider />

						<div className="flex flex-col items-center gap-3 mt-8">
							<button
								onClick={onSignupClick}
								className="group relative flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white rounded-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-primary-500 to-primary-400 shadow-lg shadow-primary-400/25 hover:shadow-xl hover:shadow-primary-400/30"
							>
								<span>Start earning today</span>
								<ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
							</button>
							<span className="text-neutral-500 text-sm">No credit card required</span>
						</div>

						<div className="flex flex-wrap gap-4 justify-center mt-6 text-neutral-500">
							<span className="flex items-center gap-2">
								<CheckCircle className="w-5 h-5 text-primary-400" />
								30% lifetime commission
							</span>
							<span className="flex items-center gap-2">
								<CheckCircle className="w-5 h-5 text-primary-400" />
								Real-time tracking
							</span>
							<span className="flex items-center gap-2">
								<CheckCircle className="w-5 h-5 text-primary-400" />
								Instant dashboard access
							</span>
						</div>
					</div>

					<BenefitSection />
					<EarningPotential />
					<HowItWorks />
					<FAQ />

					<div className="text-center mt-12 bg-white p-8 rounded-2xl w-full border border-light-300 shadow-sm">
						<h2 className="text-3xl font-bold mb-4 text-neutral-900">Ready to Start Earning?</h2>
						<p className="text-neutral-500 mb-6 max-w-2xl mx-auto">
							Join our affiliate program today and start earning 30% commission on every referral. Get instant access to your dashboard and
							promotional materials.
						</p>
						<button
							onClick={onSignupClick}
							className="bg-primary-400 text-white py-4 px-8 font-semibold text-lg hover:bg-primary-500 rounded-sm inline-block transition-colors"
						>
							Create your affiliate account
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

const ReferralSlider = () => {
	const [referrals, setReferrals] = useState(50);
	const avgSubscriptionValue = 39;
	const commissionRate = 0.3;
	const months = 12;

	const calculatePayout = (refs) => {
		return Math.round(refs * avgSubscriptionValue * commissionRate * months);
	};

	return (
		<div className="w-full max-w-4xl mx-auto mt-12 px-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
				<div>
					<div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full shadow-lg shadow-primary-500/30">
						<span className="text-white font-bold text-2xl">{referrals}</span>
						<span className="text-white/90 font-medium">referrals</span>
					</div>
				</div>
				<div className="text-center md:text-right">
					<p className="text-neutral-500 text-xs uppercase tracking-wider mb-2 font-semibold">PAYOUT</p>
					<p className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
						${calculatePayout(referrals).toLocaleString()}
					</p>
				</div>
			</div>

			<div className="relative py-4">
				<div className="absolute inset-0 flex items-center pointer-events-none">
					<div className="w-full h-2 bg-light-300 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-150 ease-out"
							style={{ width: `${((referrals - 10) / 990) * 100}%` }}
						/>
					</div>
				</div>
				<input
					type="range"
					min="10"
					max="1000"
					step="10"
					value={referrals}
					onChange={(e) => setReferrals(parseInt(e.target.value))}
					className="relative w-full appearance-none cursor-pointer slider-thumb bg-transparent"
				/>
			</div>

			<div className="flex justify-between text-neutral-500 text-sm font-medium">
				<span>10 referrals</span>
				<span>1,000 referrals</span>
			</div>

			<style jsx>{`
				.slider-thumb {
					border-radius: 9999px;
					background: transparent;
					outline: none;
				}

				.slider-thumb:focus {
					outline: none;
				}

				.slider-thumb::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: 28px;
					height: 28px;
					border-radius: 50%;
					background-color: #ff4f01 !important;
					background-image: none !important;
					cursor: grab;
					border: 5px solid #ffe0d0;
					box-shadow:
						0 4px 12px rgba(255, 79, 1, 0.5),
						0 0 0 1px rgba(255, 79, 1, 0.1);
					transition: all 0.2s ease;
					margin-top: -10px;
				}

				.slider-thumb::-webkit-slider-thumb:hover {
					transform: scale(1.1);
					box-shadow:
						0 6px 16px rgba(255, 79, 1, 0.6),
						0 0 0 1px rgba(255, 79, 1, 0.2);
				}

				.slider-thumb::-webkit-slider-thumb:active {
					cursor: grabbing;
					transform: scale(1.05);
				}

				.slider-thumb::-moz-range-thumb {
					width: 28px;
					height: 28px;
					border-radius: 50%;
					background-color: #ff4f01 !important;
					background-image: none !important;
					cursor: grab;
					border: 5px solid #ffe0d0;
					box-shadow:
						0 4px 12px rgba(255, 79, 1, 0.5),
						0 0 0 1px rgba(255, 79, 1, 0.1);
					transition: all 0.2s ease;
				}

				.slider-thumb::-moz-range-thumb:hover {
					transform: scale(1.1);
					box-shadow:
						0 6px 16px rgba(255, 79, 1, 0.6),
						0 0 0 1px rgba(255, 79, 1, 0.2);
				}

				.slider-thumb::-moz-range-thumb:active {
					cursor: grabbing;
					transform: scale(1.05);
				}

				.slider-thumb::-webkit-slider-runnable-track {
					height: 8px;
					border-radius: 9999px;
					background: transparent;
				}

				.slider-thumb::-moz-range-track {
					height: 8px;
					border-radius: 9999px;
					background: transparent;
				}
			`}</style>
		</div>
	);
};

const BenefitSection = () => {
	const benefits = [
		{
			title: "Real-Time Dashboard",
			description: "Track referrals, earnings, and performance metrics instantly",
			icon: "📊",
		},
		{
			title: "Marketing Resources",
			description: "Get banners, landing pages, and email templates",
			icon: "🎯",
		},
		{
			title: "Dedicated Support",
			description: "Personal affiliate manager to help you succeed",
			icon: "🤝",
		},
	];

	return (
		<div className="grid md:grid-cols-3 gap-8 w-full mt-16">
			{benefits.map((benefit, index) => (
				<div
					key={index}
					className="bg-white p-8 rounded-2xl text-center border border-light-300 shadow-sm"
				>
					<span className="text-4xl mb-4 block">{benefit.icon}</span>
					<h3 className="text-xl font-bold mb-2 text-neutral-900">{benefit.title}</h3>
					<p className="text-neutral-500">{benefit.description}</p>
				</div>
			))}
		</div>
	);
};

const EarningPotential = () => {
	return (
		<div className="w-full bg-white rounded-2xl p-8 mt-16 border border-light-300 shadow-sm">
			<h2 className="text-3xl font-bold text-center mb-8 text-neutral-900">Your Earning Potential</h2>
			<div className="grid md:grid-cols-3 gap-8 text-center">
				<div className="p-6">
					<div className="text-4xl font-bold text-primary-400">30%</div>
					<p className="text-neutral-500 mt-2">Lifetime Commission</p>
				</div>
				<div className="p-6">
					<div className="text-4xl font-bold text-primary-400">Up to $59/mo</div>
					<p className="text-neutral-500 mt-2">Per Subscription Sale</p>
				</div>
				<div className="p-6">
					<div className="text-4xl font-bold text-primary-400">$1,790+</div>
					<p className="text-neutral-500 mt-2">Potential Monthly Income</p>
				</div>
			</div>
		</div>
	);
};

const HowItWorks = () => {
	const steps = [
		{
			title: "Sign Up",
			description: "Create your free affiliate account",
			icon: "1️⃣",
		},
		{
			title: "Share",
			description: "Promote using your unique link",
			icon: "2️⃣",
		},
		{
			title: "Earn",
			description: "Get paid for every sale you refer",
			icon: "3️⃣",
		},
	];

	return (
		<div className="w-full mt-16">
			<h2 className="text-3xl font-bold text-center mb-8 text-neutral-900">How It Works</h2>
			<div className="grid md:grid-cols-3 gap-8">
				{steps.map((step, index) => (
					<div key={index} className="text-center">
						<div className="text-4xl mb-4">{step.icon}</div>
						<h3 className="text-xl font-bold mb-2 text-neutral-900">{step.title}</h3>
						<p className="text-neutral-500">{step.description}</p>
					</div>
				))}
			</div>
		</div>
	);
};

const FAQ = () => {
	const faqs = [
		{
			question: "How does the affiliate dashboard work?",
			answer: "Our real-time dashboard shows you all referral activity, including visits, signups, and earnings. Track your performance and optimize your campaigns with detailed analytics.",
		},
		{
			question: "How do I get paid?",
			answer: "We pay via PayPal, Stripe, or bank transfer.",
		},
		{
			question: "What is the commission structure?",
			answer: "You earn a flat 30% commission on all referrals, including recurring subscriptions. This is a lifetime commission - you'll earn as long as your referral remains a customer.",
		},
		{
			question: "Can I promote on social media?",
			answer: "Yes! We encourage promotion on all channels including social media, email, blogs, and YouTube. You'll get access to ready-made content for each platform.",
		},
	];

	return (
		<div className="w-full mt-16">
			<h2 className="text-3xl font-bold text-center mb-8 text-neutral-900">Frequently Asked Questions</h2>
			<div className="space-y-4">
				{faqs.map((faq, index) => (
					<div key={index} className="bg-white p-6 rounded-lg border border-light-300 shadow-sm">
						<h3 className="text-xl font-bold mb-2 text-neutral-900">{faq.question}</h3>
						<p className="text-neutral-500">{faq.answer}</p>
					</div>
				))}
			</div>
		</div>
	);
};

const ChevronRight = (props) => (
	<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
	</svg>
);

const CheckCircle = (props) => (
	<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
	</svg>
);
