import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { DeleteIcon } from "@/components/ui/delete";
import { PlayIcon } from "@/components/ui/play";
import { AudioLinesIcon } from "@/components/ui/audio-lines";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { PauseIcon } from "@/components/ui/pause";
import { FaMale, FaFemale } from "react-icons/fa";

export default function InfluencerCard({ influencer, viewMode = "grid", onDelete, onEdit }) {
	const router = useRouter();
	const [isPlaying, setIsPlaying] = useState(false);
	const [showVideo, setShowVideo] = useState(false);

	// Handle card click - navigate to detail page
	const handleCardClick = (e) => {
		// Don't navigate if clicking on action buttons
		if (e.target.closest("button")) return;
		router.push(`/influencers/${influencer._id}`);
	};

	// Handle video preview
	const handleVideoPreview = () => {
		if (influencer.videoPreview?.status === "completed" && influencer.videoPreview.videoUrl) {
			setShowVideo(!showVideo);
		}
	};

	// Get video status indicator
	const getVideoStatusIndicator = () => {
		if (!influencer.videoPreview) return null;

		switch (influencer.videoPreview.status) {
			case "pending":
				return { icon: "⏳", color: "text-yellow-500", label: "Video pending" };
			case "processing":
				return { icon: "🎬", color: "text-blue-500 animate-pulse", label: "Generating video..." };
			case "completed":
				return false;
			case "failed":
				return { icon: "❌", color: "text-red-500", label: "Video failed" };
			default:
				return null;
		}
	};

	// Format date
	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Format usage count
	const formatUsageCount = (count) => {
		if (count >= 1000) {
			return `${(count / 1000).toFixed(1)}k`;
		}
		return count.toString();
	};

	// Get gender from voice labels
	const gender = influencer.voice?.labels?.gender || "unknown";

	if (viewMode === "list") {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				onClick={handleCardClick}
				className="bg-white rounded-xl border border-light-300 p-4 hover:border-primary-300 hover:shadow-md transition-all duration-300 cursor-pointer"
			>
				<div className="flex items-center gap-4">
					{/* Influencer Image */}
					<div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
						<img src={influencer.imageUrl} alt={influencer.name} className="w-full h-full object-cover" />
					</div>

					{/* Influencer Info */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<h3 className="text-lg font-semibold text-dark-100 truncate">{influencer.name}</h3>
							<div className="flex items-center gap-1">
								{gender === "male" ? <FaMale className="w-4 h-4 text-blue-500" /> : <FaFemale className="w-4 h-4 text-pink-500" />}
								<span className="text-xs text-dark-400 capitalize">{gender}</span>
							</div>
						</div>

						{influencer.description && <p className="text-sm text-dark-400 truncate mb-2">{influencer.description}</p>}

						<div className="flex items-center gap-4 text-xs text-dark-400">
							<div className="flex items-center gap-1">
								<CalendarDaysIcon size={12} />
								{formatDate(influencer.createdAt)}
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						<button onClick={onDelete} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg transition-colors">
							<DeleteIcon size={16} />
						</button>
					</div>
				</div>
			</motion.div>
		);
	}

	// Grid view
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			onClick={handleCardClick}
			className="rounded-xl border border-light-300 overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all duration-300 group bg-white cursor-pointer"
		>
			{/* Influencer Image/Video - 9:16 Aspect Ratio */}
			<div className="relative aspect-[9/16] overflow-hidden">
				{showVideo && influencer.videoPreview?.status === "completed" && influencer.videoPreview.videoUrl ? (
					<video
						src={influencer.videoPreview.videoUrl}
						poster={influencer.imageUrl}
						autoPlay
						loop
						muted
						playsInline
						className="w-full h-full object-cover"
					/>
				) : (
					<img
						src={influencer.imageUrl}
						alt={influencer.name}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
					/>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

				{/* Gender Badge */}
				<div className="absolute top-3 left-3">
					<div className="flex items-center justify-center px-2 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
						{gender === "male" ? <FaMale className="w-3 h-3 text-blue-400" /> : <FaFemale className="w-3 h-3 text-pink-400" />}
						<span className="text-xs text-white capitalize font-medium ml-1">{gender}</span>
					</div>
				</div>

				{/* Video Status Badge */}
				{(() => {
					const videoStatus = getVideoStatusIndicator();
					return (
						videoStatus && (
							<div className="absolute top-3 right-3 z-50">
								<div
									className="w-7 h-7 flex items-center justify-center bg-black/70 backdrop-blur-md rounded-full border border-white/10 shadow-lg cursor-default"
									title={videoStatus.label}
								>
									<span className={`text-[10px] flex items-center justify-center ${videoStatus.color}`}>{videoStatus.icon}</span>
								</div>
							</div>
						)
					);
				})()}

				{/* Usage Count Badge */}
				{influencer.usageCount > 0 && (
					<div className="absolute top-12 left-3">
						<div className="px-2 py-1 bg-gradient-to-r from-primary-500/90 to-primary-600/90 backdrop-blur-md rounded-full border border-primary-400/30 shadow-lg">
							<span className="text-xs text-white font-bold">{formatUsageCount(influencer.usageCount)} uses</span>
						</div>
					</div>
				)}

				{/* Action Buttons Overlay */}
				{influencer.videoPreview?.status === "completed" && influencer.videoPreview.videoUrl && (
					<div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						{/* Video Preview Button */}
						<button
							onClick={handleVideoPreview}
							className="p-3 bg-primary-500/90 hover:bg-primary-500 text-white rounded-full backdrop-blur-sm border border-primary-400/30 shadow-lg hover:shadow-primary-400/50 transition-all duration-200 hover:scale-110"
							title={showVideo ? "Show image" : "Show video preview"}
						>
							{showVideo ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
						</button>
					</div>
				)}

				{/* Influencer Info - Overlay at Bottom */}
				<div className="absolute bottom-0 left-0 right-0 px-4 pt-20 pb-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
					<div className="flex items-end justify-between gap-2 mb-2">
						<div className="flex flex-col">
							<div className="flex items-start justify-between gap-2">
								<h3 className="text-lg font-semibold text-white truncate">{influencer.name}</h3>
							</div>
							{influencer.description && (
								<p className="text-xs text-neutral-300 line-clamp-2">
									{influencer.description.length > 15 ? influencer.description.slice(0, 15) + "..." : influencer.description}
								</p>
							)}
						</div>
						{/* Niche Badge */}
						{influencer.niche && (
							<div className="flex flex-wrap gap-1 mb-0.5">
								<span className="px-2 py-0.5 bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-xs text-primary-300 rounded-full border border-primary-500/20 capitalize">
									{influencer.niche}
								</span>
							</div>
						)}
					</div>

					{/* Tags */}
					{influencer.tags && influencer.tags.length > 0 && (
						<div className="flex flex-wrap gap-1 mb-3">
							{influencer.tags.slice(0, 3).map((tag, index) => (
								<span key={index} className="px-2 py-1 bg-white/10 text-xs text-white/80 rounded-full border border-white/10">
									{tag}
								</span>
							))}
							{influencer.tags.length > 3 && (
								<span className="px-2 py-1 bg-white/10 text-xs text-white/80 rounded-full border border-white/10">
									+{influencer.tags.length - 3}
								</span>
							)}
						</div>
					)}

					{/* Footer */}
					<div className="flex items-center justify-between text-xs text-neutral-300 pt-3 border-t border-white/20">
						{/* Voice Info */}
						<div className="flex items-center gap-2 text-neutral-300">
							<AudioLinesIcon size={16} />
							<span className="text-xs text-neutral-300">{influencer.voice?.name}</span>
							{influencer.voice?.labels?.accent && (
								<span className="text-[11px] text-neutral-400 capitalize">• {influencer.voice.labels.accent}</span>
							)}
						</div>

						<span className="text-[11px] text-neutral-400">{formatDate(influencer.createdAt)}</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
