import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon } from "@/components/ui/sparkles";

const defaultMessages = [
	"Creating your AI influencer...",
	"Making your digital persona...",
	"Crafting your virtual creator...",
	"Building your AI personality...",
	"Designing your influencer...",
	"Bringing your vision to life...",
	"Making magic happen...",
	"Assembling your AI star...",
];

export default function LoadingMessages({
	isActive,
	messages = defaultMessages,
	interval = 2500,
	className = "",
	showLoader = true,
	showSubtext = true,
	showProgressDots = true,
	icon: Icon = SparklesIcon,
}) {
	const [messageIndex, setMessageIndex] = useState(0);

	useEffect(() => {
		let timer;
		if (isActive) {
			timer = setInterval(() => {
				setMessageIndex((prev) => (prev + 1) % messages.length);
			}, interval);
		} else {
			setMessageIndex(0);
		}
		return () => clearInterval(timer);
	}, [isActive, messages.length, interval]);

	return (
		<div className={`flex flex-col items-center justify-center ${className}`}>
			{/* Animated loader */}
			{showLoader && (
				<div className="relative w-28 h-28 mb-6">
					{/* Outer glow effect */}
					<motion.div
						animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
						transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
						className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400/20 to-primary-400/20 blur-xl"
					/>

					{/* Outer rotating ring with gradient */}
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
						className="absolute inset-0 rounded-full"
						style={{
							background: "conic-gradient(from 0deg, transparent, rgba(249, 115, 22, 0.8), rgba(251, 146, 60, 0.6), transparent)",
						}}
					/>

					{/* Second counter-rotating ring */}
					<motion.div
						animate={{ rotate: -360 }}
						transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
						className="absolute inset-1 rounded-full"
						style={{
							background: "conic-gradient(from 180deg, transparent, rgba(234, 88, 12, 0.5), transparent, rgba(249, 115, 22, 0.5), transparent)",
						}}
					/>

					{/* Inner glowing circle */}
					<motion.div
						animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
						transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
						className="absolute inset-3 rounded-full bg-gradient-to-br from-white via-orange-50 to-orange-100 shadow-lg"
					/>

					{/* Center icon container with glow */}
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							animate={{
								y: [0, -4, 0],
								scale: [1, 1.1, 1],
							}}
							transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
							className="relative"
						>
							{/* Icon glow */}
							<motion.div
								animate={{ opacity: [0.5, 0.8, 0.5] }}
								transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
								className="absolute inset-0 blur-md"
							>
								<Icon size={36} className="text-primary-400" />
							</motion.div>
							{/* Main icon */}
							<Icon size={36} className="text-primary-500 relative z-10" />
						</motion.div>
					</div>
				</div>
			)}

			{/* Rotating text messages */}
			<AnimatePresence mode="wait">
				<motion.p
					key={messageIndex}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.3 }}
					className="text-sm font-medium text-primary-600 mb-2"
				>
					{messages[messageIndex]}
				</motion.p>
			</AnimatePresence>

			{/* Subtext */}
			{showSubtext && <p className="text-xs text-dark-400">This may take a few moments</p>}

			{/* Progress dots */}
			{showProgressDots && (
				<div className="flex gap-1.5 mt-4">
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
							transition={{
								duration: 1,
								repeat: Infinity,
								delay: i * 0.2,
								ease: "easeInOut",
							}}
							className="w-2 h-2 rounded-full bg-primary-400"
						/>
					))}
				</div>
			)}
		</div>
	);
}
