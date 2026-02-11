import React, { Fragment, useState, useEffect, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTrialModal } from "@/store/TrialModalContextProvider";
import { TeamContext } from "@/store/TeamContextProvider";
import { subscriptionPlans, CURRENT_SUBSCRIPTION_VERSION } from "@/config/constants";
import { X, Check } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);

// Get trial plan details
const trialPlan = subscriptionPlans[CURRENT_SUBSCRIPTION_VERSION]?.trialSubscription?.monthly;

const CheckoutForm = ({ onSuccess, paymentIntentId, originalAmount, onAmountUpdate }) => {
	const stripe = useStripe();
	const elements = useElements();
	const [isLoading, setIsLoading] = useState(false);
	const [promoCode, setPromoCode] = useState("");
	const [promoCodeMessage, setPromoCodeMessage] = useState(null);
	const [promoCodeApplied, setPromoCodeApplied] = useState(false);
	const [isApplyingPromo, setIsApplyingPromo] = useState(false);
	const [discountedAmount, setDiscountedAmount] = useState(null);
	const [isFree, setIsFree] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		// Handle free trial claim (no payment needed)
		if (isFree) {
			onSuccess?.();
			window.location.href = `${window.location.origin}/payment-success/${trialPlan?.stripePriceId}?free=true`;
			return;
		}

		if (!stripe || !elements) {
			setIsLoading(false);
			return;
		}

		const { error, paymentIntent } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/payment-success/${trialPlan?.stripePriceId}`,
			},
			redirect: "if_required",
		});

		if (error) {
			if (error.type === "card_error" || error.type === "validation_error") {
				toast.error(error.message);
			} else {
				toast.error("An unexpected error occurred.");
			}
			setIsLoading(false);
		} else if (paymentIntent && paymentIntent.status === "succeeded") {
			onSuccess?.();
			window.location.href = `${window.location.origin}/payment-success/${trialPlan?.stripePriceId}`;
		} else {
			setIsLoading(false);
		}
	};

	const handlePromoCodeSubmit = async (e) => {
		e.preventDefault();
		setPromoCodeMessage(null);
		setIsApplyingPromo(true);

		if (!promoCode) {
			setPromoCodeMessage({ type: "error", text: "Please enter a promo code." });
			setIsApplyingPromo(false);
			return;
		}

		try {
			const response = await axios.post("/api/stripe/apply-promo-code", {
				promoCode,
				paymentIntentId,
				originalAmount,
			});
			if (response.data.success) {
				const message = response.data.isFree
					? "Promo code applied! Your trial is now free."
					: `Promo code applied! You save $${(response.data.discountAmount / 100).toFixed(2)}`;
				setPromoCodeMessage({
					type: "success",
					text: message,
					coupon: response.data.coupon,
				});
				setDiscountedAmount(response.data.discountedAmount);
				setIsFree(response.data.isFree);
				setPromoCodeApplied(true);
				onAmountUpdate?.(response.data.discountedAmount);
			} else {
				setPromoCodeMessage({ type: "error", text: response.data.message || "Failed to apply promo code." });
				setPromoCodeApplied(false);
			}
		} catch (error) {
			console.log("error:", error);
			setPromoCodeMessage({ type: "error", text: "An error occurred. Please try again." });
			setPromoCodeApplied(false);
		}
		setIsApplyingPromo(false);
	};

	useEffect(() => {
		setPromoCodeMessage(null);
		setPromoCodeApplied(false);
	}, [promoCode]);

	return (
		<form onSubmit={handleSubmit} className="w-full">
			{!isFree && (
				<>
					<PaymentElement
						id="payment-element"
						options={{
							layout: "tabs",
						}}
					/>

					{/* Terms text */}
					<p className="text-xs text-gray-400 mt-4 leading-relaxed">
						By providing your card information, you allow Viraloop to charge your card for this one-time payment in accordance with our
						terms.
					</p>
				</>
			)}

			{isFree && (
				<div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
					<p className="text-green-400 text-center font-medium">Your trial is free with this promo code!</p>
				</div>
			)}

			{/* Promo Code Input */}
			<div className="mt-4" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
				<label className="block text-sm font-normal text-neutral-400 mb-1">
					Promo Code <span className="ml-1 text-xs text-neutral-400">(Optional)</span>
				</label>
				<div className="flex rounded-md shadow-sm">
					<input
						type="text"
						name="promo-code"
						id="promo-code"
						className="flex-1 placeholder:text-sm placeholder:text-neutral-500 bg-neutral-800 text-white font-light border border-neutral-700 rounded-l-md px-3 py-2 text-[15px] focus:outline-none focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400/80"
						placeholder="Enter promo code"
						value={promoCode}
						onChange={(e) => setPromoCode(e.target.value)}
					/>
					<button
						type="button"
						className="px-4 bg-neutral-800 hover:bg-neutral-700 border border-l-0 border-neutral-700 text-white text-sm font-normal rounded-r-md transition-colors disabled:opacity-50"
						onClick={handlePromoCodeSubmit}
						disabled={isApplyingPromo || promoCodeApplied}
					>
						{isApplyingPromo ? (
							<svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						) : promoCodeApplied ? (
							<Check className="h-5 w-5 text-green-400" />
						) : (
							"Apply"
						)}
					</button>
				</div>
				{promoCodeMessage && (
					<div className="mt-2">
						<p className={`text-sm ${promoCodeMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
							{promoCodeMessage.text}
						</p>
						{promoCodeMessage?.coupon?.name && (
							<p className="text-sm text-gray-500 mt-0.5">{promoCodeMessage.coupon.name}</p>
						)}
					</div>
				)}
			</div>

			<button
				type="submit"
				disabled={isLoading || (!isFree && (!stripe || !elements))}
				className="mt-8 w-full bg-white hover:bg-black text-black hover:text-white py-4 rounded-lg font-medium text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
			>
				{isLoading ? (
					<>
						<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<span>Processing...</span>
					</>
				) : isFree ? (
					"Claim Free Trial"
				) : (
					"Pay Now"
				)}
			</button>
		</form>
	);
};

const TrialModal = () => {
	const { isTrialModalOpen, closeTrialModal, trialModalMessage } = useTrialModal();
	const { currentTeam } = useContext(TeamContext);
	const [clientSecret, setClientSecret] = useState("");
	const [displayAmount, setDisplayAmount] = useState(trialPlan?.price || 1);

	useEffect(() => {
		const createPaymentIntent = async () => {
			if (isTrialModalOpen && !clientSecret && currentTeam?._id) {
				try {
					const response = await axios.post("/api/stripe/create-payment-intent", {
						stripePriceId: trialPlan?.stripePriceId,
						teamId: currentTeam._id,
						amount: trialPlan?.price * 100,
					});
					setClientSecret(response.data.clientSecret);
				} catch (error) {
					console.error("Error creating PaymentIntent:", error);
				}
			}
		};

		createPaymentIntent();
	}, [isTrialModalOpen, currentTeam?._id]);

	useEffect(() => {
		if (!isTrialModalOpen) {
			setClientSecret("");
			setDisplayAmount(trialPlan?.price || 1);
		}
	}, [isTrialModalOpen]);

	const features = [
		{ icon: "🤖", text: "1 AI Influencer" },
		{ icon: "🎨", text: "1 Image Generation" },
		{ icon: "🎬", text: "1 Video Creation" },
		{ icon: "📱", text: "1 Social Platform" },
	];

	return (
		<Transition appear show={isTrialModalOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={closeTrialModal}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-[95vw] sm:max-w-6xl min-h-[85vh] transform overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl transition-all flex relative">
								{/* Close button - top right */}
								<button
									onClick={closeTrialModal}
									className="absolute top-6 right-6 z-10 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
								>
									<X className="w-6 h-6" />
								</button>

								{/* Left Side - Payment Form */}
								<div className="flex-1 bg-neutral-900 px-12 py-14 text-white flex flex-col justify-center items-center">
									<div className="w-full max-w-md">
										<h2 className="text-3xl font-medium text-white mb-3">Start Your Trial</h2>
										<p className="text-neutral-400 text-base mb-10">
											{trialModalMessage || "Get instant access to AI content creation tools."}
										</p>

										{/* Payment Form */}
										{clientSecret && stripePromise ? (
											<Elements
												key={clientSecret}
												stripe={stripePromise}
												options={{
													clientSecret: clientSecret,
													appearance: {
														theme: "night",
														variables: {
															colorPrimary: "#f97316",
															colorBackground: "#171717",
															colorText: "#ffffff",
															colorDanger: "#ef4444",
															fontFamily: "Inter, system-ui, sans-serif",
															borderRadius: "10px",
															spacingUnit: "4px",
														},
														rules: {
															".Input": {
																backgroundColor: "#262626",
																border: "1px solid #404040",
																boxShadow: "none",
																padding: "12px 14px",
																fontSize: "15px",
																color: "#ffffff",
															},
															".Input:focus": {
																border: "1px solid #f97316",
																boxShadow: "0 0 0 2px rgba(249, 115, 22, 0.2)",
															},
															".Input::placeholder": {
																color: "#737373",
															},
															".Label": {
																fontWeight: "500",
																fontSize: "14px",
																marginBottom: "8px",
																color: "#a3a3a3",
															},
															".Tab": {
																backgroundColor: "#262626",
																border: "1px solid #404040",
																color: "#a3a3a3",
															},
															".Tab--selected": {
																backgroundColor: "#404040",
																border: "1px solid #525252",
																color: "#ffffff",
															},
														},
													},
												}}
											>
												<CheckoutForm
													onSuccess={closeTrialModal}
													paymentIntentId={clientSecret.split("_secret_")[0]}
													originalAmount={trialPlan?.price * 100}
													onAmountUpdate={(amountInCents) => setDisplayAmount(amountInCents / 100)}
												/>
											</Elements>
										) : (
											<div className="space-y-4">
												<div className="h-12 bg-neutral-800 animate-pulse rounded-lg"></div>
												<div className="flex gap-4">
													<div className="h-12 flex-1 bg-neutral-800 animate-pulse rounded-lg"></div>
													<div className="h-12 flex-1 bg-neutral-800 animate-pulse rounded-lg"></div>
												</div>
												<div className="h-12 bg-neutral-800 animate-pulse rounded-lg"></div>
												<div className="h-14 bg-neutral-700 animate-pulse rounded-lg"></div>
											</div>
										)}

										{/* Trust indicators */}
										<div className="mt-8 flex items-center gap-8 text-neutral-500">
											<div className="flex items-center gap-2">
												<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
													<path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V8.26l7-3.89v8.63z" />
												</svg>
												<span className="text-sm">Secure Payment</span>
											</div>
											<div className="flex items-center gap-2">
												<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
													<path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
												</svg>
												<span className="text-sm">Powered by Stripe</span>
											</div>
										</div>
									</div>
								</div>

								{/* Right Side - Plan Details */}
								<div className="w-[460px] bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 px-10 py-10 relative overflow-hidden text-white flex flex-col justify-center">
									{/* Decorative elements */}
									<div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
									<div className="absolute bottom-0 left-0 w-56 h-56 bg-orange-400/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

									<div className="relative">
										{/* Plan Header */}
										<div className="flex items-center justify-between mb-6">
											<h3 className="text-2xl font-semibold text-white">Trial Plan</h3>
											<span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full">
												SPECIAL
											</span>
										</div>

										{/* Price */}
										<div className="mb-6 pb-6 border-b border-white/20">
											<div className="flex items-baseline gap-2">
												{displayAmount === 0 ? (
													<span className="text-5xl font-bold text-white">FREE</span>
												) : (
													<>
														<span className="text-5xl font-bold text-white">
															${displayAmount % 1 === 0 ? displayAmount : displayAmount.toFixed(2)}
														</span>
														<span className="text-lg text-white/70">one-time</span>
													</>
												)}
											</div>
											<p className="text-sm text-white/70 mt-2">
												{displayAmount === 0 ? "No payment required" : "No subscription required"}
											</p>
										</div>

										{/* Features List */}
										<div className="space-y-3">
											{features.map((feature, index) => (
												<div key={index} className="flex items-center gap-3">
													<div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
														<span className="text-lg">{feature.icon}</span>
													</div>
													<span className="text-sm font-medium text-white">{feature.text}</span>
												</div>
											))}
										</div>

										{/* Benefits */}
										<div className="mt-6 pt-5 border-t border-white/20 space-y-2.5">
											<div className="flex items-center gap-2">
												<Check className="w-4 h-4 text-white" />
												<span className="text-sm text-white/90">Instant access after payment</span>
											</div>
											<div className="flex items-center gap-2">
												<Check className="w-4 h-4 text-white" />
												<span className="text-sm text-white/90">No hidden fees or charges</span>
											</div>
											<div className="flex items-center gap-2">
												<Check className="w-4 h-4 text-white" />
												<span className="text-sm text-white/90">Upgrade anytime for more</span>
											</div>
										</div>

										{/* Total */}
										<div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium text-white/80">Total</span>
												<div className="text-right">
													<span className="text-2xl font-bold text-white">
														{displayAmount === 0
															? "FREE"
															: `$${displayAmount % 1 === 0 ? displayAmount : displayAmount.toFixed(2)}`}
													</span>
													<p className="text-xs text-white/60">
														{displayAmount === 0 ? "No payment required" : "One-time payment"}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default TrialModal;
