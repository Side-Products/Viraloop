import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { XMarkIcon, SparklesIcon, PhotoIcon, TrashIcon, ArrowUpTrayIcon, CheckIcon } from "@heroicons/react/24/outline";
import LoadingMessages from "./LoadingMessages";

export default function GenerateImageModal({ isOpen, onClose, influencerId, onSuccess, existingImages = [] }) {
	const [imagePrompt, setImagePrompt] = useState("");
	const [referenceFiles, setReferenceFiles] = useState([]); // Store { file, previewUrl } objects
	const [selectedExistingImages, setSelectedExistingImages] = useState([]);
	const [generatedImageUrl, setGeneratedImageUrl] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [selectedDimension, setSelectedDimension] = useState("9:16");
	const fileInputRef = useRef(null);

	const dimensionOptions = [
		{ value: "1:1", label: "1:1", icon: "square" },
		{ value: "9:16", label: "9:16", icon: "portrait" },
		{ value: "16:9", label: "16:9", icon: "landscape" },
	];

	// Toggle selection of existing image
	const toggleExistingImage = (imageUrl) => {
		setSelectedExistingImages((prev) => (prev.includes(imageUrl) ? prev.filter((url) => url !== imageUrl) : [...prev, imageUrl]));
	};

	// Get count of all reference images (local files + selected existing)
	const getAllReferenceCount = () => {
		return referenceFiles.length + selectedExistingImages.length;
	};

	// Get aspect ratio class based on dimension
	const getAspectRatioClass = (dimension) => {
		switch (dimension) {
			case "16:9":
				return "aspect-[16/9]";
			case "1:1":
				return "aspect-square";
			case "9:16":
			default:
				return "aspect-[9/16]";
		}
	};

	// Handle reference image selection (store locally, upload later)
	const handleReferenceSelect = (e) => {
		const files = e.target.files;
		if (!files) return;

		const newFiles = Array.from(files).map((file) => ({
			file,
			previewUrl: URL.createObjectURL(file),
		}));
		setReferenceFiles((prev) => [...prev, ...newFiles]);
	};

	// Remove a reference file and clean up blob URL
	const removeReferenceFile = (index) => {
		setReferenceFiles((prev) => {
			const fileToRemove = prev[index];
			if (fileToRemove?.previewUrl) {
				URL.revokeObjectURL(fileToRemove.previewUrl);
			}
			return prev.filter((_, i) => i !== index);
		});
	};

	// Get the oldest existing image as fallback reference
	const getOldestExistingImage = () => {
		const completedImages = existingImages.filter((img) => img.status === "completed");
		if (completedImages.length === 0) return null;
		// Sort by createdAt ascending (oldest first)
		const sorted = [...completedImages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
		return sorted[0]?.imageUrl || null;
	};

	// Handle generate image
	const handleGenerateImage = async () => {
		if (!imagePrompt.trim()) {
			toast.error("Please enter a description for the image");
			return;
		}

		setIsGenerating(true);
		try {
			// Upload reference files first
			const uploadedUrls = [];
			for (const { file } of referenceFiles) {
				try {
					const formData = new FormData();
					formData.append("file", file);

					const uploadResponse = await axios.post("/api/upload", formData, {
						headers: { "Content-Type": "multipart/form-data" },
					});

					if (uploadResponse.data.success) {
						uploadedUrls.push(uploadResponse.data.fileUrl);
					}
				} catch (error) {
					console.error("Error uploading reference image:", error);
					toast.error("Failed to upload reference image");
				}
			}

			// Always include the oldest existing image first for consistency
			const oldestImage = getOldestExistingImage();
			let imageInputs = [];

			// Add oldest image first if it exists
			if (oldestImage) {
				imageInputs.push(oldestImage);
			}

			// Add other selected references (avoiding duplicates with oldest)
			const otherReferences = [...uploadedUrls, ...selectedExistingImages].filter((url) => url !== oldestImage);
			imageInputs = [...imageInputs, ...otherReferences];

			const response = await axios.post("/api/generate-image", {
				prompt: `Create a photorealistic portrait of a beautiful/handsome person based on these instructions. The image should look like a professional photograph, NOT AI generated. Show a full body image of the person in a natural standing pose. IMPORTANT: Do NOT include any social media UI, app interfaces, Instagram layouts, story frames, overlays, buttons, icons, usernames, or text. Just the person in a clean, natural photograph with no digital overlays or frames. Description: ${imagePrompt}`,
				imageInputs,
				outputFormat: "jpg",
			});

			if (response.data.success) {
				setGeneratedImageUrl(response.data.imageUrl);
				toast.success("Image generated successfully!");
			}
		} catch (error) {
			console.error("Image generation error:", error);
			toast.error(error.response?.data?.message || "Failed to generate image");
		} finally {
			setIsGenerating(false);
		}
	};

	// Handle save image
	const handleSaveImage = async () => {
		if (!generatedImageUrl) {
			toast.error("Please generate an image first");
			return;
		}

		setIsSaving(true);
		try {
			const response = await axios.post(`/api/influencer/${influencerId}/images`, {
				imageUrl: generatedImageUrl,
				imagePrompt,
				dimension: selectedDimension,
			});

			if (response.data.success) {
				onSuccess(response.data.image);
				handleClose();
			}
		} catch (error) {
			console.error("Error saving image:", error);
			toast.error(error.response?.data?.message || "Failed to save image");
		} finally {
			setIsSaving(false);
		}
	};

	// Handle close
	const handleClose = () => {
		// Clean up blob URLs
		referenceFiles.forEach(({ previewUrl }) => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		});
		setImagePrompt("");
		setReferenceFiles([]);
		setSelectedExistingImages([]);
		setGeneratedImageUrl("");
		setSelectedDimension("9:16");
		onClose();
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
				onClick={handleClose}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="flex items-center justify-between px-8 py-4 border-b border-light-200">
						<h2 className="text-lg font-semibold text-dark-100">Generate New Image</h2>
						<button onClick={handleClose} className="p-2 hover:bg-light-100 rounded-lg transition-colors">
							<XMarkIcon className="w-5 h-5 text-dark-400" />
						</button>
					</div>

					{/* Content */}
					<div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Left - Form */}
							<div className="space-y-4 md:col-span-2">
								{/* Image Prompt */}
								<div>
									<label className="block text-sm font-semibold text-dark-100 mb-2">Visual Description</label>
									<textarea
										value={imagePrompt}
										onChange={(e) => setImagePrompt(e.target.value)}
										placeholder="Describe the image you want to generate (e.g., standing in a modern gym, wearing athletic clothes, confident smile)"
										className="input resize-none text-sm"
										rows={5}
									/>
								</div>

								{/* Reference Images */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<label className="text-sm font-semibold text-dark-100">Reference Images (Optional)</label>
										{/* Selected count - inline with heading */}
										{getAllReferenceCount() > 0 && (
											<p className="text-xs text-primary-600">
												{getAllReferenceCount()} reference image{getAllReferenceCount() > 1 ? "s" : ""} selected
											</p>
										)}
									</div>
									<div className="space-y-3">
										{/* Existing Images Selection */}
										{existingImages.filter((img) => img.status === "completed").length > 0 && (
											<div>
												<p className="text-xs text-dark-400 mb-2">Select from existing images:</p>
												<div className="flex flex-wrap gap-2 p-3 bg-light-50 rounded-lg border border-light-200">
													{existingImages
														.filter((img) => img.status === "completed")
														.map((image) => (
															<button
																key={image._id}
																onClick={() => toggleExistingImage(image.imageUrl)}
																className={`relative w-[70px] rounded overflow-hidden border-2 transition-all ${
																	selectedExistingImages.includes(image.imageUrl)
																		? "border-primary-500 ring-2 ring-primary-200"
																		: "border-transparent hover:border-light-400"
																}`}
															>
																<div className={getAspectRatioClass(image.dimension)}>
																	<img src={image.imageUrl} alt="Existing" className="w-full h-full object-cover" />
																</div>
																{selectedExistingImages.includes(image.imageUrl) && (
																	<div className="absolute inset-0 bg-primary-500/30 flex items-center justify-center">
																		<CheckIcon className="w-5 h-5 text-white" />
																	</div>
																)}
															</button>
														))}
												</div>
											</div>
										)}

										{/* Upload New */}
										<button
											onClick={() => fileInputRef.current?.click()}
											className="w-full py-3 px-4 border-2 border-dashed border-light-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 text-dark-400 hover:text-primary-500"
										>
											<ArrowUpTrayIcon className="w-5 h-5" />
											<span className="text-sm">Upload New Reference Images</span>
										</button>
										<input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleReferenceSelect} className="hidden" />

										{/* Selected Reference Image Previews */}
										{referenceFiles.length > 0 && (
											<div>
												<p className="text-xs text-dark-400 mb-2">Selected images:</p>
												<div className="flex flex-wrap gap-2">
													{referenceFiles.map(({ previewUrl }, index) => (
														<div key={index} className="relative w-14 h-14 rounded-lg overflow-hidden group">
															<img src={previewUrl} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
															<button
																onClick={() => removeReferenceFile(index)}
																className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
															>
																<TrashIcon className="w-4 h-4 text-white" />
															</button>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Dimension Selector & Generate Button */}
								<div className="flex items-center gap-3">
									{/* Dimension Selector */}
									<div className="flex items-center gap-1 p-1 bg-light-100 rounded-lg border border-light-200">
										{dimensionOptions.map((option) => (
											<button
												key={option.value}
												onClick={() => setSelectedDimension(option.value)}
												className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
													selectedDimension === option.value
														? "bg-white text-primary-600 shadow-sm border border-light-300"
														: "text-dark-400 hover:text-dark-200"
												}`}
											>
												{option.label}
											</button>
										))}
									</div>

									{/* Generate Button */}
									<button
										onClick={handleGenerateImage}
										disabled={isGenerating || !imagePrompt.trim()}
										className="btn btn-primary flex-1 py-3 disabled:opacity-50"
									>
										{isGenerating ? (
											<>
												<SparklesIcon className="w-5 h-5 animate-spin mr-2" />
												Generating...
											</>
										) : (
											<>
												<SparklesIcon className="w-5 h-5 mr-2" />
												Generate Image
											</>
										)}
									</button>
								</div>
							</div>

							{/* Right - Preview */}
							<div>
								<label className="block text-sm font-semibold text-dark-100 mb-2">Preview</label>
								<div
									className={`${getAspectRatioClass(selectedDimension)} max-h-[450px] bg-light-100 rounded-lg border border-light-300 overflow-hidden flex items-center justify-center transition-all duration-200`}
								>
									{generatedImageUrl ? (
										<img src={generatedImageUrl} alt="Generated" className="w-full h-full object-cover" />
									) : isGenerating ? (
										<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
											<LoadingMessages isActive={isGenerating} />
										</motion.div>
									) : (
										<div className="text-center p-8">
											<PhotoIcon className="w-12 h-12 text-dark-400 mx-auto mb-4" />
											<p className="text-sm text-dark-400">No image generated yet</p>
											<p className="text-xs text-dark-400 mt-1">Enter a description and click generate</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-light-200 bg-light-50">
						<button onClick={handleClose} className="btn bg-light-200 hover:bg-light-300 text-dark-100 px-4 py-2">
							Cancel
						</button>
						<button onClick={handleSaveImage} disabled={!generatedImageUrl || isSaving} className="btn btn-primary px-4 py-2 disabled:opacity-50">
							{isSaving ? "Saving..." : "Save Image"}
						</button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
