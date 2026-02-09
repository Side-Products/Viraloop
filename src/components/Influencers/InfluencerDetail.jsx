import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@/components/ui/arrow-left";
import { DeleteIcon } from "@/components/ui/delete";
import { VolumeIcon } from "@/components/ui/volume";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { UserIcon } from "@/components/ui/user";
import { SparklesIcon } from "@/components/ui/sparkles";
import { PlayIcon } from "@/components/ui/play";
import { PauseIcon } from "@/components/ui/pause";
import { Tag } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import ImageGallery from "./ImageGallery";
import GenerateImageModal from "./GenerateImageModal";

export default function InfluencerDetail() {
	const router = useRouter();
	const { id } = router.query;

	const [influencer, setInfluencer] = useState(null);
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingImages, setLoadingImages] = useState(true);
	const [showGenerateModal, setShowGenerateModal] = useState(false);
	const [showVideo, setShowVideo] = useState(false);
	const [deleting, setDeleting] = useState(false);

	// Fetch influencer data
	const fetchInfluencer = async () => {
		if (!id) return;

		try {
			setLoading(true);
			const response = await axios.get(`/api/influencer/${id}`);
			if (response.data.success) {
				setInfluencer(response.data.influencer);
			}
		} catch (error) {
			console.error("Error fetching influencer:", error);
			toast.error("Failed to load influencer");
			router.push("/influencers");
		} finally {
			setLoading(false);
		}
	};

	// Fetch influencer images
	const fetchImages = async () => {
		if (!id) return;

		try {
			setLoadingImages(true);
			const response = await axios.get(`/api/influencer/${id}/images`);
			if (response.data.success) {
				setImages(response.data.images);
			}
		} catch (error) {
			console.error("Error fetching images:", error);
		} finally {
			setLoadingImages(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchInfluencer();
			fetchImages();
		}
	}, [id]);

	// Handle delete influencer
	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this influencer? This action cannot be undone.")) return;

		try {
			setDeleting(true);
			const response = await axios.delete(`/api/influencer/${id}`);
			if (response.data.success) {
				toast.success("Influencer deleted successfully");
				router.push("/influencers");
			}
		} catch (error) {
			console.error("Error deleting influencer:", error);
			toast.error("Failed to delete influencer");
		} finally {
			setDeleting(false);
		}
	};

	// Handle image created
	const handleImageCreated = (newImage) => {
		setImages((prev) => [newImage, ...prev]);
		setShowGenerateModal(false);
		toast.success("Image created successfully");
	};

	// Handle set primary
	const handleSetPrimary = async (imageId) => {
		try {
			const response = await axios.put(`/api/influencer/${id}/images/${imageId}`, { isPrimary: true });
			if (response.data.success) {
				// Update images list
				setImages((prev) =>
					prev.map((img) => ({
						...img,
						isPrimary: img._id === imageId,
					}))
				);
				// Update influencer's main image
				const primaryImage = images.find((img) => img._id === imageId);
				if (primaryImage) {
					setInfluencer((prev) => ({
						...prev,
						imageUrl: primaryImage.imageUrl,
					}));
				}
				toast.success("Primary image updated");
			}
		} catch (error) {
			console.error("Error setting primary image:", error);
			toast.error("Failed to set primary image");
		}
	};

	// Handle delete image
	const handleDeleteImage = async (imageId) => {
		if (!confirm("Are you sure you want to delete this image?")) return;

		try {
			const response = await axios.delete(`/api/influencer/${id}/images/${imageId}`);
			if (response.data.success) {
				setImages((prev) => prev.filter((img) => img._id !== imageId));
				// Refresh influencer to get updated primary image
				fetchInfluencer();
				toast.success("Image deleted successfully");
			}
		} catch (error) {
			console.error("Error deleting image:", error);
			toast.error(error.response?.data?.message || "Failed to delete image");
		}
	};

	// Format date
	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	// Get gender from voice labels
	const gender = influencer?.voice?.labels?.gender || "unknown";

	if (loading) {
		return (
			<div className="p-6">
				<div className="flex justify-center items-center py-20">
					<div className="spinner w-8 h-8"></div>
				</div>
			</div>
		);
	}

	if (!influencer) {
		return (
			<div className="p-6">
				<div className="card p-12 text-center">
					<div className="text-dark-400 mx-auto mb-4 flex justify-center">
						<UserIcon size={64} />
					</div>
					<h3 className="text-xl font-semibold text-dark-100 mb-2">Influencer not found</h3>
					<button onClick={() => router.push("/influencers")} className="btn btn-primary mt-4">
						Back to Influencers
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<button onClick={() => router.push("/influencers")} className="p-2 hover:bg-light-200 rounded-lg transition-all duration-200 text-dark-400">
						<ArrowLeftIcon size={20} />
					</button>
					<div>
						<h1 className="text-xl sm:text-2xl font-semibold text-dark-100 tracking-tight">{influencer.name}</h1>
						<p className="text-dark-400 text-sm mt-1">Influencer Details</p>
					</div>
				</div>
				<button onClick={handleDelete} disabled={deleting} className="btn bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 flex items-center">
					<DeleteIcon size={16} className="mr-2" />
					{deleting ? "Deleting..." : "Delete"}
				</button>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Primary Image/Video */}
				<div className="lg:col-span-1">
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
						{/* Image/Video Container */}
						<div className="relative aspect-[9/16] bg-light-100">
							{showVideo && influencer.videoPreview?.status === "completed" && influencer.videoPreview.videoUrl ? (
								<video src={influencer.videoPreview.videoUrl} autoPlay loop muted className="w-full h-full object-cover" />
							) : (
								<img src={influencer.imageUrl} alt={influencer.name} className="w-full h-full object-cover" />
							)}

							{/* Video toggle button */}
							{influencer.videoPreview?.status === "completed" && influencer.videoPreview.videoUrl && (
								<button
									onClick={() => setShowVideo(!showVideo)}
									className="absolute bottom-4 right-4 p-3 bg-black/70 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
								>
									{showVideo ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
								</button>
							)}

							{/* Video status indicator */}
							{influencer.videoPreview?.status === "processing" && (
								<div className="absolute top-4 right-4 px-3 py-1.5 bg-blue-500/90 text-white text-xs rounded-full animate-pulse">
									Generating video...
								</div>
							)}
						</div>

						{/* Info */}
						<div className="p-4 space-y-4">
							{/* Niche Badge */}
							<div className="flex items-center gap-2">
								<span className="px-3 py-1 bg-primary-100 text-primary-600 text-sm rounded-full capitalize font-medium">
									{influencer.niche}
								</span>
								<div className="flex items-center gap-1 px-2 py-1 bg-light-100 rounded-full">
									{gender === "male" ? <FaMale className="w-3 h-3 text-blue-500" /> : <FaFemale className="w-3 h-3 text-pink-500" />}
									<span className="text-xs text-dark-400 capitalize">{gender}</span>
								</div>
							</div>

							{/* Description */}
							{influencer.description && <p className="text-sm text-dark-400">{influencer.description}</p>}

							{/* Persona */}
							{influencer.persona && (
								<div>
									<h4 className="text-xs font-semibold text-dark-300 uppercase tracking-wide mb-1">Persona</h4>
									<p className="text-sm text-dark-400">{influencer.persona}</p>
								</div>
							)}

							{/* Voice Info */}
							<div className="flex items-center gap-2 text-sm text-dark-400">
								<VolumeIcon size={16} />
								<span>{influencer.voice?.name}</span>
								{influencer.voice?.labels?.accent && <span className="text-dark-300">• {influencer.voice.labels.accent}</span>}
							</div>

							{/* Tags */}
							{influencer.tags && influencer.tags.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{influencer.tags.map((tag, index) => (
										<span key={index} className="px-2 py-1 bg-light-100 text-xs text-dark-400 rounded-full">
											{tag}
										</span>
									))}
								</div>
							)}

							{/* Date */}
							<div className="flex items-center gap-2 text-xs text-dark-400 pt-2 border-t border-light-200">
								<CalendarDaysIcon size={16} />
								<span>Created {formatDate(influencer.createdAt)}</span>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Right Column - Image Gallery & More */}
				<div className="lg:col-span-2 space-y-6">
					{/* Image Gallery Section */}
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-dark-100">Image Gallery</h2>
							<button onClick={() => setShowGenerateModal(true)} className="btn btn-primary px-4 py-2 flex items-center">
								<SparklesIcon size={16} className="mr-2" />
								Generate Image
							</button>
						</div>

						<ImageGallery
							images={images}
							loading={loadingImages}
							onSetPrimary={handleSetPrimary}
							onDelete={handleDeleteImage}
							onGenerateClick={() => setShowGenerateModal(true)}
						/>
					</motion.div>

					{/* Video Gallery Section - Coming Soon */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="card p-6 bg-light-50"
					>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-dark-100">Video Gallery</h2>
							<span className="px-3 py-1 bg-dark-100 text-white text-xs rounded-full">Coming Soon</span>
						</div>
						<p className="text-sm text-dark-400">Generate and manage multiple video variations of your influencer.</p>
					</motion.div>

					{/* Connected Accounts Section */}
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-dark-100">Connected Accounts</h2>
							<button onClick={() => router.push("/accounts")} className="text-sm text-primary-500 hover:text-primary-600">
								Manage Accounts →
							</button>
						</div>
						<p className="text-sm text-dark-400">
							Connect social media accounts to this influencer for auto-posting.{" "}
							<button onClick={() => router.push("/accounts")} className="text-primary-500 hover:underline">
								Go to Accounts page
							</button>{" "}
							to connect.
						</p>
					</motion.div>
				</div>
			</div>

			{/* Generate Image Modal */}
			<GenerateImageModal
				isOpen={showGenerateModal}
				onClose={() => setShowGenerateModal(false)}
				influencerId={id}
				onSuccess={handleImageCreated}
				existingImages={images}
			/>
		</div>
	);
}
