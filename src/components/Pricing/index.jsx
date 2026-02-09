import { useState, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { TeamContext } from "@/store/TeamContextProvider";
import { PLAN_CONFIG } from "@/config/constants";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import { UsersIcon } from "@/components/ui/users";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { RefreshCWIcon } from "@/components/ui/refresh-cw";
import { ChartBarIncreasingIcon } from "@/components/ui/chart-bar-increasing";
import { CursorClickIcon } from "@/components/ui/cursor-click";
import { Video, Code, Building, Info, Image, Headphones, Check } from "lucide-react";

const Pricing = ({ isBillingPage = false, hideEnterprise = false }) => {
	const [billingPeriod, setBillingPeriod] = useState("monthly");
	const router = useRouter();
	const { data: session, status } = useSession();
	const { currentTeam } = useContext(TeamContext);
	const iconRefs = {
		trial: useRef(null),
		growth: useRef(null),
		pro: useRef(null),
		ultra: useRef(null),
	};

	const getPlanPrice = (planConfig) => {
		if (!planConfig?.subscription) return { price: 0, originalPrice: null, pricePerYear: null, priceId: "", isMonthlyOnly: false, isOneTime: false };

		const sub = planConfig.subscription;
		// Trial plan is one-time, others have monthly/annual
		const isOneTime = sub.monthly?.isOneTime || false;
		const isMonthlyOnly = !sub.annual && !isOneTime;

		if (isOneTime || billingPeriod === "monthly" || isMonthlyOnly) {
			return {
				price: sub.monthly?.price || 0,
				originalPrice: sub.monthly?.originalPrice || null,
				priceId: sub.monthly?.stripePriceId || "",
				isMonthlyOnly,
				isOneTime,
			};
		} else {
			return {
				price: sub.annual?.price || 0,
				originalPrice: sub.annual?.originalPrice || null,
				pricePerYear: sub.annual?.pricePerYear,
				priceId: sub.annual?.stripePriceId || "",
				isMonthlyOnly: false,
				isOneTime: false,
			};
		}
	};

	// Check if a plan is the current plan
	const isCurrentPlan = (planKey) => {
		if (!currentTeam || !isBillingPage) return false;
		const planConfig = PLAN_CONFIG[planKey];
		if (!planConfig?.subscription?.monthly) return false;
		// Match by influencer limit
		return currentTeam.influencerLimit === planConfig.subscription.monthly.influencers;
	};

	const handleSelectPlan = (planKey) => {
		const planConfig = PLAN_CONFIG[planKey];
		if (!planConfig) return;

		const priceInfo = getPlanPrice(planConfig);

		if (status === "authenticated" && session?.user) {
			// Redirect to checkout with the price ID
			if (priceInfo.priceId) {
				const checkoutUrl = `/checkout?priceId=${priceInfo.priceId}&billing=${billingPeriod}${priceInfo.isOneTime ? "&isOneTime=true" : ""}`;
				router.push(checkoutUrl);
			} else {
				// If no price ID configured, show an alert or redirect to dashboard
				console.warn("No Stripe price ID configured for plan:", planKey);
				router.push("/dashboard");
			}
		} else {
			// Pass priceId to login so it can redirect to checkout after auth
			const loginUrl = `/login?redirect=checkout&priceId=${priceInfo.priceId}&billing=${billingPeriod}${priceInfo.isOneTime ? "&isOneTime=true" : ""}`;
			router.push(loginUrl);
		}
	};

	const renderFeatureIcon = (iconName) => {
		const iconClass = "w-4 h-4 text-neutral-500 flex-shrink-0";

		switch (iconName) {
			case "influencer":
				return <UsersIcon size={16} className="text-neutral-500 flex-shrink-0" />;
			case "image":
				return <Image className={iconClass} />;
			case "video":
				return <Video className={iconClass} />;
			case "platform":
				return <Building className={iconClass} />;
			case "schedule":
				return <CalendarDaysIcon size={16} className="text-neutral-500 flex-shrink-0" />;
			case "support":
				return <Headphones className={iconClass} />;
			case "loop":
				return <RefreshCWIcon size={16} className="text-neutral-500 flex-shrink-0" />;
			case "analytics":
				return <ChartBarIncreasingIcon size={16} className="text-neutral-500 flex-shrink-0" />;
			case "api":
				return <Code className={iconClass} />;
			case "whitelabel":
				return <Building className={iconClass} />;
			case "custom":
				return <Code className={iconClass} />;
			default:
				return <Info className={iconClass} />;
		}
	};

	const renderPricingCard = (planKey, index) => {
		const planConfig = PLAN_CONFIG[planKey];
		if (!planConfig) return null;

		const features = planConfig.features;
		const isHighlighted = planConfig.highlighted;
		const isBestForStarting = planKey === "growth";
		const priceInfo = getPlanPrice(planConfig);
		const isPlanCurrent = isCurrentPlan(planKey);

		return (
			<motion.div
				key={planKey}
				className="relative"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5, delay: index * 0.1 }}
			>
				{/* Badge for highlighted plan */}
				{isHighlighted && planConfig.badge && (
					<div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-400 to-primary-500 text-center py-1.5 px-4 text-sm font-medium text-white z-10 rounded-full whitespace-nowrap shadow-lg">
						{planConfig.badge}
					</div>
				)}

				{/* Badge for "Best for Starting Out" plan */}
				{isBestForStarting && (
					<div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-success-500 to-success-600 text-center py-1.5 px-4 text-sm font-medium text-white z-10 rounded-full whitespace-nowrap shadow-lg">
						BEST FOR STARTING OUT
					</div>
				)}

				<div
					className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 h-full ${
						isHighlighted
							? "border-2 border-primary-400"
							: isBestForStarting
							? "border-2 border-dashed border-success-400"
							: "border border-light-300"
					}`}
				>
					<div className="p-6">
						{/* Plan name and description */}
						<h3 className="text-2xl font-bold text-neutral-900">{planConfig.name}</h3>
						<p className="mt-1 text-neutral-500 text-sm">{planConfig.description}</p>

						{/* Pricing */}
						<div className="mt-4 flex items-baseline gap-2">
							{priceInfo.originalPrice && (
								<span className="text-xl text-neutral-500 line-through">${priceInfo.originalPrice}</span>
							)}
							<span className="text-4xl font-bold text-neutral-900">${priceInfo.price}</span>
							<span className="text-neutral-500 text-sm">{priceInfo.isOneTime ? "one-time" : "/month"}</span>
						</div>

						{/* Billing note */}
						{billingPeriod === "annual" && priceInfo.pricePerYear ? (
							<div className="mt-1 text-neutral-400 text-xs">billed ${priceInfo.pricePerYear} yearly</div>
						) : billingPeriod === "annual" && priceInfo.isMonthlyOnly ? (
							<div className="mt-1 text-neutral-400 text-xs">monthly only</div>
						) : null}

						{/* CTA Button */}
						{isPlanCurrent ? (
							<div className="mt-6 w-full py-3 px-4 flex items-center justify-center gap-2 bg-success-100 text-success-700 border border-success-200 rounded-xl font-medium">
								<Check className="w-4 h-4" />
								<span className="text-sm font-medium">Current Plan</span>
							</div>
						) : (
							<button
								onClick={() => handleSelectPlan(planKey)}
								onMouseEnter={() => iconRefs[planKey]?.current?.startAnimation()}
								onMouseLeave={() => iconRefs[planKey]?.current?.stopAnimation()}
								className={`btn mt-6 w-full !py-3 !px-4 hover:scale-105 ${isHighlighted ? "btn-primary" : "btn-secondary"}`}
							>
								<CursorClickIcon ref={iconRefs[planKey]} size={20} className="mr-2" />
								<span className="text-sm font-medium tracking-wide">Select Plan</span>
							</button>
						)}

						{/* Highlighted Features */}
						<div className="mt-6 space-y-3">
							{features.highlights?.map((item, idx) => (
								<div key={idx} className="flex items-center gap-3">
									{renderFeatureIcon(item.icon)}
									<span className="text-neutral-700 text-sm flex-1">{item.text}</span>
									{item.platforms && (
										<span className="inline-flex items-center gap-1">
											{item.platforms.includes("tiktok") && (
												<span className="relative">
													<FaTiktok className="w-4.5 h-4.5" style={{ color: "#00f2ea" }} />
													<FaTiktok className="w-4.5 h-4.5 absolute top-0 left-0" style={{ color: "#ff0050", marginLeft: "-2px", opacity: 0.8 }} />
												</span>
											)}
											{item.platforms.includes("instagram") && <FaInstagram className="w-4.5 h-4.5" style={{ color: "#E4405F" }} />}
											{item.platforms.includes("youtube") && <FaYoutube className="w-5 h-5" style={{ color: "#FF0000" }} />}
										</span>
									)}
								</div>
							))}
						</div>

						{/* Divider */}
						<div className="my-5 border-t border-light-300"></div>

						{/* Features Header */}
						<p className="font-medium text-neutral-700 text-sm mb-4">
							{features.inheritFrom ? `Everything in ${features.inheritFrom}, plus:` : "What's included:"}
						</p>

						{/* Features List */}
						<ul className="space-y-2.5">
							{features.features?.map((item, featureIndex) => (
								<li key={featureIndex} className="flex items-center gap-3">
									{renderFeatureIcon(item.icon)}
									<span className="text-neutral-500 text-sm flex-1">{item.text}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</motion.div>
		);
	};

	return (
		<section className="relative">
			{/* Billing period selector */}
			<div className="flex flex-col items-center justify-center">
				<div className="relative w-fit">
					{/* Save badge positioned above the Yearly button */}
					<div className="absolute -top-9 left-1/2 translate-x-[10%] flex flex-col items-center">
						<span className="bg-gradient-to-r from-success-500 to-success-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-success-500/20 whitespace-nowrap">
							Save up to 51%
						</span>
						{/* Arrow pointing down */}
						<div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-success-500"></div>
					</div>

					<div className="bg-light-200 rounded-full p-1.5 shadow-inner">
						<div className="flex items-center">
							<button
								type="button"
								className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
									billingPeriod === "monthly"
										? "bg-white text-neutral-900 shadow-md"
										: "text-neutral-500 hover:text-neutral-700"
								}`}
								onClick={() => setBillingPeriod("monthly")}
							>
								Monthly
							</button>

							<button
								type="button"
								className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
									billingPeriod === "annual"
										? "bg-white text-neutral-900 shadow-md"
										: "text-neutral-500 hover:text-neutral-700"
								}`}
								onClick={() => setBillingPeriod("annual")}
							>
								Yearly
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Pricing cards - 4 columns */}
			<div className="w-full mt-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
					{["trial", "growth", "pro", "ultra"].map((planKey, index) => renderPricingCard(planKey, index))}
				</div>
			</div>

			{/* Value proposition text */}
			<div className="mt-12 text-center">
				<h3 className="text-xl md:text-2xl font-bold text-neutral-900">Create viral content in minutes, not hours</h3>
				<p className="mt-2 text-neutral-500 text-sm md:text-base">
					Save thousands on production costs and grow your audience faster.
				</p>
			</div>

			{/* Trust badges */}
			<div className="mt-10 text-center">
				<div className="flex flex-wrap justify-center gap-4">
					<div className="inline-flex items-center gap-2 bg-light-100 border border-light-300 px-4 py-2 rounded-full">
						<svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
						<span className="text-neutral-500 text-sm">100% content ownership</span>
					</div>
					<div className="inline-flex items-center gap-2 bg-light-100 border border-light-300 px-4 py-2 rounded-full">
						<svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
						<span className="text-neutral-500 text-sm">Cancel anytime</span>
					</div>
					<div className="inline-flex items-center gap-2 bg-light-100 border border-light-300 px-4 py-2 rounded-full">
						<svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
							/>
						</svg>
						<span className="text-neutral-500 text-sm">Secure payment via Stripe</span>
					</div>
				</div>
			</div>

			{/* Enterprise section */}
			{!hideEnterprise && !isBillingPage && (
				<div className="mt-16 w-full">
					<div className="bg-gradient-to-r from-light-100 to-light-50 rounded-2xl p-8 border border-light-300">
						<div className="flex flex-col md:flex-row items-start justify-between gap-8">
							<div>
								<h3 className="text-2xl font-bold mb-3 text-neutral-900">Enterprise</h3>
								<p className="text-neutral-500 max-w-xl">
									Need a custom solution? We offer tailored plans for teams with specific requirements, advanced
									features, and dedicated support.
								</p>
								<ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
									<li className="flex items-center">
										<svg className="w-5 h-5 text-success-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-neutral-500 text-sm">Custom Limits</span>
									</li>
									<li className="flex items-center">
										<svg className="w-5 h-5 text-success-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-neutral-500 text-sm">Custom Pricing</span>
									</li>
									<li className="flex items-center">
										<svg className="w-5 h-5 text-success-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-neutral-500 text-sm">Dedicated Support</span>
									</li>
									<li className="flex items-center">
										<svg className="w-5 h-5 text-success-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-neutral-500 text-sm">Custom Integrations</span>
									</li>
								</ul>
							</div>
							<div className="w-full md:w-auto">
								<a
									href="mailto:enterprise@viraloop.io"
									className="w-full md:w-auto inline-flex group relative overflow-hidden bg-neutral-900 hover:bg-neutral-800 text-white py-3 px-6 rounded-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
								>
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
									<div className="relative flex items-center justify-center gap-2">
										<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											/>
										</svg>
										<span className="text-sm font-medium tracking-wide">Contact Sales</span>
									</div>
								</a>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
};

export default Pricing;
