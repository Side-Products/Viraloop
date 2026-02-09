import React, { Fragment, useState, useEffect, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTrialModal } from "@/store/TrialModalContextProvider";
import { TeamContext } from "@/store/TeamContextProvider";
import { subscriptionPlans, CURRENT_SUBSCRIPTION_VERSION, PRICING_FEATURES } from "@/config/constants";
import { UsersIcon } from "@/components/ui/users";
import { Image, Video, Sparkles, Check, X } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);

// Get trial plan details
const trialPlan = subscriptionPlans[CURRENT_SUBSCRIPTION_VERSION]?.trialSubscription?.monthly;

const CheckoutForm = ({ onSuccess }) => {
	const stripe = useStripe();
	const elements = useElements();
	const [message, setMessage] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		setIsLoading(true);
		setMessage(null);

		const { error, paymentIntent } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/payment-success/${trialPlan?.stripePriceId}`,
			},
			redirect: "if_required",
		});

		if (error) {
			if (error.type === "card_error" || error.type === "validation_error") {
				setMessage(error.message);
			} else {
				setMessage("An unexpected error occurred.");
			}
			setIsLoading(false);
		} else if (paymentIntent && paymentIntent.status === "succeeded") {
			// Payment succeeded
			onSuccess?.();
			window.location.href = `${window.location.origin}/payment-success/${trialPlan?.stripePriceId}`;
		} else {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="w-full">
			<PaymentElement
				id="payment-element"
				options={{
					layout: "tabs",
				}}
			/>

			<button
				type="submit"
				disabled={isLoading || !stripe || !elements}
				className="mt-6 w-full bg-primary-400 hover:bg-primary-500 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? (
					<div className="flex justify-center items-center">
						<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</div>
				) : (
					"Pay $1 Now"
				)}
			</button>

			{message && <div className="mt-3 text-red-500 text-sm text-center">{message}</div>}
		</form>
	);
};

const TrialModal = () => {
	const { isTrialModalOpen, closeTrialModal, trialModalMessage } = useTrialModal();
	const { currentTeam } = useContext(TeamContext);
	const [clientSecret, setClientSecret] = useState("");
	const [isCreatingIntent, setIsCreatingIntent] = useState(false);

	useEffect(() => {
		const createPaymentIntent = async () => {
			if (isTrialModalOpen && !clientSecret && currentTeam?._id) {
				setIsCreatingIntent(true);
				try {
					const response = await axios.post("/api/stripe/create-payment-intent", {
						stripePriceId: trialPlan?.stripePriceId,
						teamId: currentTeam._id,
						amount: trialPlan?.price * 100, // Convert to cents
					});
					setClientSecret(response.data.clientSecret);
				} catch (error) {
					console.error("Error creating PaymentIntent:", error);
				}
				setIsCreatingIntent(false);
			}
		};

		createPaymentIntent();
	}, [isTrialModalOpen, currentTeam?._id]);

	// Reset client secret when modal closes
	useEffect(() => {
		if (!isTrialModalOpen) {
			setClientSecret("");
		}
	}, [isTrialModalOpen]);

	const trialFeatures = PRICING_FEATURES.trial;

	const renderFeatureIcon = (iconName) => {
		const iconClass = "w-4 h-4 text-primary-400 flex-shrink-0";
		switch (iconName) {
			case "influencer":
				return <UsersIcon size={16} className="text-primary-400 flex-shrink-0" />;
			case "image":
				return <Image className={iconClass} />;
			case "video":
				return <Video className={iconClass} />;
			default:
				return <Sparkles className={iconClass} />;
		}
	};

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
					<div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
							<Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
								{/* Header */}
								<div className="relative bg-gradient-to-r from-primary-400 to-primary-500 px-6 py-8 text-white">
									<button
										onClick={closeTrialModal}
										className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
									>
										<X className="w-6 h-6" />
									</button>

									<div className="text-center">
										<div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
											<Sparkles className="w-4 h-4" />
											Limited Time Offer
										</div>
										<h2 className="text-2xl font-bold mb-2">Try Viraloop for $1</h2>
										<p className="text-white/80 text-sm">
											{trialModalMessage || "Unlock AI-powered content creation with our trial plan"}
										</p>
									</div>
								</div>

								{/* Content */}
								<div className="px-6 py-6">
									{/* Trial Plan Details */}
									<div className="bg-light-100 rounded-xl p-4 mb-6">
										<div className="flex items-center justify-between mb-4">
											<div>
												<h3 className="font-semibold text-neutral-900">Trial Plan</h3>
												<p className="text-sm text-neutral-500">One-time payment</p>
											</div>
											<div className="text-right">
												<div className="text-2xl font-bold text-neutral-900">$1</div>
												<div className="text-xs text-neutral-500">USD</div>
											</div>
										</div>

										<div className="space-y-2">
											{trialFeatures?.highlights?.map((feature, index) => (
												<div key={index} className="flex items-center gap-2">
													{renderFeatureIcon(feature.icon)}
													<span className="text-sm text-neutral-700">{feature.text}</span>
												</div>
											))}
											{trialFeatures?.features?.map((feature, index) => (
												<div key={index} className="flex items-center gap-2">
													<Check className="w-4 h-4 text-success-500 flex-shrink-0" />
													<span className="text-sm text-neutral-600">{feature.text}</span>
												</div>
											))}
										</div>
									</div>

									{/* Stripe Payment Form */}
									{clientSecret && stripePromise ? (
										<Elements
											key={clientSecret}
											stripe={stripePromise}
											options={{
												clientSecret: clientSecret,
												appearance: {
													theme: "stripe",
													variables: {
														colorPrimary: "#8B5CF6",
														borderRadius: "8px",
													},
												},
											}}
										>
											<CheckoutForm onSuccess={closeTrialModal} />
										</Elements>
									) : (
										<div className="space-y-3">
											{/* Skeleton loader */}
											<div className="h-12 bg-light-200 animate-pulse rounded-lg"></div>
											<div className="flex gap-2">
												<div className="h-12 w-1/2 bg-light-200 animate-pulse rounded-lg"></div>
												<div className="h-12 w-1/2 bg-light-200 animate-pulse rounded-lg"></div>
											</div>
											<div className="h-12 bg-light-200 animate-pulse rounded-lg"></div>
											<div className="h-12 bg-primary-200 animate-pulse rounded-xl mt-4"></div>
										</div>
									)}

									{/* Trust badges */}
									<div className="mt-6 flex items-center justify-center gap-4 text-xs text-neutral-500">
										<div className="flex items-center gap-1">
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
												/>
											</svg>
											Secure payment
										</div>
										<div className="flex items-center gap-1">
											<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
												<path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
											</svg>
											Powered by Stripe
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
