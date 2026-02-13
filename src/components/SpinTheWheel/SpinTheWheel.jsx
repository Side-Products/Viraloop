import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Wheel } from "react-custom-roulette";
import axios from "axios";
import Countdown from "react-countdown";
import { TeamContext } from "@/store/TeamContextProvider";
import GradientText from "@/components/SpinTheWheel/GradientText";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Particles from "@/components/SpinTheWheel/Particles";
import LightRays from "@/components/SpinTheWheel/LightRays";
import { ArrowBigRightDashIcon } from "@/components/ui/arrow-big-right-dash";

const BASE_PRIZES = ["1", "2", "3", "5", "10", "15", "20", "25", "30", "40", "50", "100"];

// Orange theme colors matching Viraloop brand
const WHEEL_COLORS = ["#ED6B2F", "#ff9460"];

const buildWheelData = (values) => values.map((v) => ({ option: v }));

const shuffleArray = (arr) => {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};

// Renderer callback with condition
const renderer = ({ hours, minutes, seconds, completed }) => {
	if (completed) {
		// Render a completed state
		return <span>00:00:00</span>;
	} else {
		// Pad hours, minutes, and seconds with leading zero if single digit
		const paddedHours = hours < 10 ? `0${hours}` : hours;
		const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
		return (
			<span>
				{paddedHours}:{paddedMinutes}:{paddedSeconds}
			</span>
		);
	}
};

const SpinTheWheel = ({ setShowConfetti, pillText, heading, showCredits = true, displayParticles = true, displayLightRays = false }) => {
	const [mustSpin, setMustSpin] = useState(false);
	const [prizeNumber, setPrizeNumber] = useState(0);
	const [wheelStatus, setWheelStatus] = useState(null);
	const [wheelData, setWheelData] = useState(buildWheelData(shuffleArray(BASE_PRIZES)));
	const [showWinOverlay, setShowWinOverlay] = useState(false);
	const [winAmount, setWinAmount] = useState(null);

	const { currentTeam } = useContext(TeamContext);
	const router = useRouter();
	const { status } = useSession();
	const arrowIconRef = useRef(null);

	const fetchWheelStatus = useCallback(async () => {
		if (!currentTeam?._id || status === "unauthenticated" || !currentTeam?._id) return;
		try {
			const { data } = await axios.get(`/api/wheel/status?teamId=${currentTeam._id}`);
			setWheelStatus(data);
		} catch (error) {
			console.error("Error fetching wheel status:", error);
		}
	}, [currentTeam, status]);

	useEffect(() => {
		const initialFetch = async () => {
			if (!currentTeam?._id || status === "unauthenticated" || !currentTeam?._id) return;
			await fetchWheelStatus();
		};
		initialFetch();
	}, [currentTeam, fetchWheelStatus, status]);

	const handleSpinClick = async () => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}
		if (!currentTeam?._id) {
			router.push("/spin-and-win");
			return;
		}
		if (!router.pathname.startsWith("/spin-and-win")) {
			router.push("/spin-and-win");
			return;
		}
		try {
			const { data } = await axios.post(`/api/wheel/spin?teamId=${currentTeam._id}`);
			// Compute index from current shuffled order using prize value
			const index = wheelData.findIndex((p) => p.option === String(data.prize));
			setPrizeNumber(index >= 0 ? index : 0);
			setWinAmount(data.prize);
			setMustSpin(true);
		} catch (error) {
			console.error("Error spinning the wheel:", error);
		}
	};

	const canSpin = () => {
		if (!wheelStatus || !wheelStatus.lastWheelSpin) {
			return true;
		}
		const lastSpin = new Date(wheelStatus.lastWheelSpin);
		const now = new Date();
		const diff = now.getTime() - lastSpin.getTime();
		const hours = diff / (1000 * 60 * 60);
		return hours >= 24;
	};

	return (
		<>
			{displayParticles && (
				<div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
					<Particles
						particleColors={["#ED6B2F", "#ff4f01"]}
						particleCount={400}
						particleSpread={20}
						speed={0.1}
						particleBaseSize={150}
						moveParticlesOnHover={false}
						alphaParticles={true}
						disableRotation={false}
						sizeRandomness={1.4}
						cameraDistance={15}
					/>
				</div>
			)}

			{displayLightRays && (
				<div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }}>
					<LightRays
						raysOrigin="top-center"
						raysColor="#ED6B2F"
						raysSpeed={1.5}
						lightSpread={0.5}
						rayLength={1.2}
						fadeDistance={1.0}
						followMouse={true}
						mouseInfluence={0.2}
						noiseAmount={0.2}
						distortion={0.05}
						className="custom-rays"
					/>
				</div>
			)}

			<div className="flex flex-col items-center h-full w-full z-20 relative">
				<div className="w-full mx-auto">
					<header className="text-center pt-6">
						<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-600 border border-primary-200">
							{pillText}
						</span>
						<GradientText colors={["#ff4f01", "#ED6B2F", "#ff8c42"]} animationSpeed={3} showBorder={false} className="custom-class">
							{heading}
						</GradientText>

						<p className="mt-1 text-neutral-500 text-sm sm:text-[15px]">Spin once every 24 hours and win bonus credits for your team</p>
					</header>

					<div className="relative w-full mt-2 flex flex-col items-center justify-center">
						<div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-4">
							<div id="spin-wheel-container">
								<Wheel
									mustStartSpinning={mustSpin}
									prizeNumber={prizeNumber}
									data={wheelData}
									onStopSpinning={() => {
										setMustSpin(false);
										setShowConfetti?.(true);
										setTimeout(() => setShowConfetti?.(false), 5000);
										fetchWheelStatus();
										setShowWinOverlay(true);
									}}
									backgroundColors={WHEEL_COLORS}
									textColors={["#ffffff"]}
									outerBorderColor={"#1f2937"}
									outerBorderWidth={5}
									innerBorderColor={"#1f2937"}
									innerBorderWidth={5}
									radiusLineColor={"#7C310F"}
									radiusLineWidth={2}
									fontSize={18}
									pointerProps={{
										src: "data:image/png;base64,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",
										style: {
											filter: "hue-rotate(180deg) brightness(10) contrast(0.7)",
										},
									}}
								/>
							</div>
							<div className="w-full flex flex-col items-center">
								{/* Show upgrade message if user doesn't have valid subscription */}
								{wheelStatus && !wheelStatus.hasValidSubscription ? (
									<div className="mt-6 mb-4 w-full max-w-lg text-center">
										<div className="rounded-xl border border-primary-200 bg-primary-50 p-6 shadow-sm">
											<div className="flex items-center justify-center gap-2 mb-3">
												<svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
													/>
												</svg>
												<h3 className="text-lg font-semibold text-neutral-900">Upgrade to Spin & Win</h3>
											</div>
											<p className="text-sm text-neutral-600 mb-4">
												Spin & Win is exclusively available for Growth, Pro, and Ultra subscribers. Upgrade your plan to spin
												the wheel daily and win bonus credits!
											</p>
											<Link
												href="/settings/billing"
												className="btn btn-primary !text-base !px-5 !py-3"
												onMouseEnter={() => arrowIconRef.current?.startAnimation()}
												onMouseLeave={() => arrowIconRef.current?.stopAnimation()}
											>
												Upgrade Now
												<ArrowBigRightDashIcon ref={arrowIconRef} size={24} className="ml-2" />
											</Link>
										</div>
									</div>
								) : canSpin() ? (
									<div className="mt-6 mb-4 w-full max-w-xs">
										<button
											onClick={handleSpinClick}
											disabled={mustSpin}
											className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<div className="text-sm font-medium tracking-wide">
												{mustSpin ? (
													<div className="flex items-center justify-center">
														<svg
															className="animate-spin h-4 w-4 mr-2"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
														>
															<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
															<path
																className="opacity-75"
																fill="currentColor"
																d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
															></path>
														</svg>
														Spinning...
													</div>
												) : status === "unauthenticated" ? (
													"Spin the Wheel"
												) : !currentTeam?._id ? (
													"Go to Spin & Win page"
												) : (
													"Spin the Wheel"
												)}
											</div>
										</button>
									</div>
								) : (
									<div className="mt-4 text-center">
										<p className="text-neutral-500 text-sm">Next spin available in</p>
										<div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700">
											<Countdown
												date={new Date(wheelStatus.lastWheelSpin).getTime() + 24 * 60 * 60 * 1000}
												onComplete={() => window.location.reload()}
												renderer={renderer}
											/>
										</div>
									</div>
								)}
								{showCredits && wheelStatus?.hasValidSubscription && (
									<div className="mt-6 grid grid-cols-2 gap-3 w-full">
										<div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
											<p className="text-xs text-neutral-500">Credits Won</p>
											<p className="mt-1 text-2xl font-semibold text-neutral-900">{wheelStatus?.creditsWon || 0}</p>
										</div>
										<div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
											<p className="text-xs text-neutral-500">Total Credits</p>
											<p className="mt-1 text-2xl font-semibold text-neutral-900">{wheelStatus?.credits || 0}</p>
										</div>
									</div>
								)}
							</div>

							{showWinOverlay && (
								<div
									className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
									onClick={() => setShowWinOverlay(false)}
								>
									<div
										className="relative mx-4 max-w-2xl w-full rounded-2xl border border-primary-200 bg-white p-10 shadow-2xl"
										onClick={(e) => e.stopPropagation()}
									>
										<div className="text-center">
											<div className="text-sm font-medium text-primary-600 tracking-wider uppercase">You won</div>
											<div className="mt-2 text-5xl sm:text-6xl font-extrabold leading-tight">
												<span className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
													{winAmount ?? wheelData[prizeNumber]?.option}
												</span>
												<span className="ml-3 text-neutral-900">Credits!</span>
											</div>
											<p className="mt-3 text-neutral-500">These credits have been added to your team balance.</p>
											<div className="mt-8 flex justify-center">
												<button
													onClick={() => setShowWinOverlay(false)}
													className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
												>
													OK
												</button>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default SpinTheWheel;
