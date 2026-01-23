import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrashIcon, StarIcon, PlusIcon, XMarkIcon, ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const IMAGES_PER_PAGE = 4;

export default function ImageGallery({ images, loading, onSetPrimary, onDelete, onGenerateClick }) {
	const [selectedImage, setSelectedImage] = useState(null);
	const [currentPage, setCurrentPage] = useState(0);

	// Pagination
	const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
	const startIndex = currentPage * IMAGES_PER_PAGE;
	const paginatedImages = images.slice(startIndex, startIndex + IMAGES_PER_PAGE);

	const goToPrevPage = () => setCurrentPage((prev) => Math.max(0, prev - 1));
	const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));

	if (loading) {
		return (
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="aspect-[9/16] bg-light-200 rounded-lg animate-pulse" />
				))}
			</div>
		);
	}

	if (images.length === 0) {
		return (
			<div className="text-center py-8">
				<div className="w-16 h-16 bg-light-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<PlusIcon className="w-8 h-8 text-dark-400" />
				</div>
				<p className="text-dark-400 text-sm mb-4">No images yet. Generate your first image!</p>
				<button onClick={onGenerateClick} className="btn btn-primary">
					Generate Image
				</button>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				{paginatedImages.map((image) => (
					<motion.div
						key={image._id}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="relative aspect-[9/16] rounded-lg overflow-hidden group cursor-pointer bg-light-100"
						onClick={() => setSelectedImage(image)}
					>
						{/* Image */}
						{image.status === "completed" ? (
							<img src={image.imageUrl} alt="Influencer" className="w-full h-full object-cover" />
						) : image.status === "processing" || image.status === "pending" ? (
							<div className="w-full h-full flex flex-col items-center justify-center bg-light-100">
								<div className="spinner w-8 h-8 mb-2" />
								<span className="text-xs text-dark-400">Generating...</span>
							</div>
						) : (
							<div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
								<span className="text-red-500 text-xs">Failed</span>
							</div>
						)}

						{/* Primary Badge */}
						{image.isPrimary && (
							<div className="absolute top-2 left-2 z-10">
								<div className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
									<StarIconSolid className="w-3 h-3" />
									<span>Primary</span>
								</div>
							</div>
						)}

						{/* Hover Overlay */}
						<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
							{/* View Full */}
							<button
								onClick={(e) => {
									e.stopPropagation();
									setSelectedImage(image);
								}}
								className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
								title="View Full"
							>
								<ArrowsPointingOutIcon className="w-5 h-5" />
							</button>

							{/* Set as Primary */}
							{!image.isPrimary && image.status === "completed" && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										onSetPrimary(image._id);
									}}
									className="p-2 bg-white/20 hover:bg-yellow-500 rounded-full text-white transition-colors"
									title="Set as Primary"
								>
									<StarIcon className="w-5 h-5" />
								</button>
							)}

							{/* Delete */}
							<button
								onClick={(e) => {
									e.stopPropagation();
									onDelete(image._id);
								}}
								className="p-2 bg-white/20 hover:bg-red-500 rounded-full text-white transition-colors"
								title="Delete"
							>
								<TrashIcon className="w-5 h-5" />
							</button>
						</div>
					</motion.div>
				))}

				{/* Generate More Card - only show on last page or if less than 4 images */}
				{(currentPage === totalPages - 1 || images.length < IMAGES_PER_PAGE) && (
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						onClick={onGenerateClick}
						className="aspect-[9/16] rounded-lg border-2 border-dashed border-light-300 hover:border-primary-400 hover:bg-primary-50 transition-all flex flex-col items-center justify-center gap-2 text-dark-400 hover:text-primary-500"
					>
						<PlusIcon className="w-8 h-8" />
						<span className="text-sm font-medium">Generate</span>
					</motion.button>
				)}
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-4 mt-4">
					<button
						onClick={goToPrevPage}
						disabled={currentPage === 0}
						className="p-2 rounded-lg border border-light-300 hover:bg-light-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					>
						<ChevronLeftIcon className="w-5 h-5 text-dark-300" />
					</button>

					<div className="flex items-center gap-2">
						{Array.from({ length: totalPages }, (_, i) => (
							<button
								key={i}
								onClick={() => setCurrentPage(i)}
								className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
									currentPage === i
										? "bg-primary-500 text-white"
										: "bg-light-100 text-dark-300 hover:bg-light-200"
								}`}
							>
								{i + 1}
							</button>
						))}
					</div>

					<button
						onClick={goToNextPage}
						disabled={currentPage === totalPages - 1}
						className="p-2 rounded-lg border border-light-300 hover:bg-light-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					>
						<ChevronRightIcon className="w-5 h-5 text-dark-300" />
					</button>
				</div>
			)}

			{/* Full Image Modal */}
			<AnimatePresence>
				{selectedImage && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6"
						onClick={() => setSelectedImage(null)}
					>
						{/* Close Button - Fixed position */}
						<button
							onClick={() => setSelectedImage(null)}
							className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all"
						>
							<XMarkIcon className="w-6 h-6" />
						</button>

						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="relative flex flex-col items-center max-h-[90vh]"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Image Container */}
							<div className="relative max-h-[calc(90vh-80px)] overflow-hidden rounded-xl">
								<img
									src={selectedImage.imageUrl}
									alt="Influencer"
									className="max-h-[calc(90vh-80px)] max-w-full w-auto h-auto object-contain rounded-xl"
								/>
							</div>

							{/* Image Info - Below image */}
							<div className="w-full max-w-md mt-4 p-4 bg-white/10 backdrop-blur-md rounded-xl">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										{selectedImage.isPrimary && (
											<span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full flex items-center gap-1">
												<StarIconSolid className="w-3 h-3" />
												Primary
											</span>
										)}
										<span className="text-white/80 text-sm">{new Date(selectedImage.createdAt).toLocaleDateString()}</span>
									</div>
									<div className="flex items-center gap-2">
										{!selectedImage.isPrimary && (
											<button
												onClick={() => {
													onSetPrimary(selectedImage._id);
													setSelectedImage(null);
												}}
												className="px-3 py-1.5 bg-yellow-500/80 hover:bg-yellow-500 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
											>
												<StarIcon className="w-4 h-4" />
												Set Primary
											</button>
										)}
										<button
											onClick={() => {
												onDelete(selectedImage._id);
												setSelectedImage(null);
											}}
											className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
										>
											<TrashIcon className="w-4 h-4" />
											Delete
										</button>
									</div>
								</div>
								{selectedImage.imagePrompt && (
									<p className="text-white/70 text-xs line-clamp-2">{selectedImage.imagePrompt}</p>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
