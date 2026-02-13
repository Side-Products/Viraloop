import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { NICHES } from "@/config/constants";
import { XIcon } from "@/components/ui/x";
import { ArrowLeftIcon } from "@/components/ui/arrow-left";
import { ArrowRightIcon } from "@/components/ui/arrow-right";
import { UserIcon } from "@/components/ui/user";
import { SparklesIcon } from "@/components/ui/sparkles";
import { VolumeIcon } from "@/components/ui/volume";
import { CheckIcon } from "@/components/ui/check";
import { PlayIcon } from "@/components/ui/play";
import { PauseIcon } from "@/components/ui/pause";
import { SearchIcon } from "@/components/ui/search";
import { Image } from "lucide-react";
import LoadingMessages from "./LoadingMessages";
import { useTrialModal } from "@/store/TrialModalContextProvider";

const STEPS = [
	{ id: 1, title: "Generate Image", description: "Create your influencer's appearance" },
	{ id: 2, title: "Select Voice", description: "Choose the perfect voice" },
	{ id: 3, title: "Review & Create", description: "Finalize your influencer" },
];

export default function CreateInfluencer({ isOpen, onClose, onSuccess, inline = false }) {
	const [currentStep, setCurrentStep] = useState(1);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [voices, setVoices] = useState([]);
	const { openTrialModal } = useTrialModal();

	// Form data
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		persona: "",
		niche: "",
		imagePrompt: "",
		imageUrl: "",
		referenceImages: [],
		voice: null,
		tags: [],
	});

	// Improvement prompt state
	const [improvementPrompt, setImprovementPrompt] = useState("");

	// Fetch TTS voices
	const getTTSVoices = async () => {
		try {
			const res = await fetch("/api/tts/voices");
			const resJson = await res.json();
			if (resJson.success) {
				setVoices(resJson.voices);
			}
		} catch (error) {
			console.error("Error fetching voices:", error);
		}
	};

	// Reset form when modal opens and fetch voices
	useEffect(() => {
		if (isOpen) {
			setCurrentStep(1);
			setFormData({
				name: "",
				description: "",
				persona: "",
				niche: "",
				imagePrompt: "",
				imageUrl: "",
				referenceImages: [],
				voice: null,
				tags: [],
			});
			setImprovementPrompt("");
			getTTSVoices();
		}
	}, [isOpen]);

	// Handle step navigation
	const goToNextStep = () => {
		if (currentStep < STEPS.length) {
			setCurrentStep(currentStep + 1);
		}
	};

	const goToPrevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	// Handle image generation
	const handleGenerateImage = async () => {
		if (!formData.imagePrompt.trim()) {
			toast.error("Please enter a description for your influencer's appearance");
			return;
		}

		setIsGenerating(true);
		try {
			const response = await axios.post(
				"/api/generate-image",
				{
					prompt: `Create a realistic image of a beautiful/handsome person based on these instructions. The image should look like a high-quality natural photograph, NOT AI generated. IMPORTANT: Do NOT include any social media UI, app interfaces, Instagram layouts, story frames, overlays, buttons, icons, usernames, or text. Just the person in a clean, natural photograph with no digital overlays or frames. Description: ${formData.imagePrompt}`,
					imageInputs: formData.referenceImages,
					outputFormat: "jpg",
				},
				{
					// Don't throw on 4xx errors - we handle them gracefully
					validateStatus: (status) => status < 500,
				}
			);

			// Handle error responses (4xx status codes)
			if (!response.data.success) {
				const errorType = response.data.errorType;
				const errorMessage = response.data.message;

				// Check for credit/usage limit errors - show TrialModal
				if (errorType === "usage_limit_reached" || errorType === "insufficient_credits" || response.status === 429 || response.status === 402) {
					// Show the trial modal instead of just a toast
					if (onClose) onClose(); // Close the create modal first
					openTrialModal(errorMessage || "You need credits to generate images. Purchase credits to continue.");
				} else {
					toast.error(errorMessage || "Image generation failed. Using demo image instead.");
					const placeholderUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(formData.imagePrompt)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
					setFormData((prev) => ({
						...prev,
						imageUrl: placeholderUrl,
					}));
				}
				return;
			}

			// Success
			setFormData((prev) => ({
				...prev,
				imageUrl: response.data.imageUrl,
			}));
			toast.success("Image generated successfully");
		} catch (error) {
			// Only catches network errors and 5xx server errors
			console.error("Image generation error:", error);
			toast.error("Failed to connect to image generation service. Please try again.");
			const placeholderUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(formData.imagePrompt)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
			setFormData((prev) => ({
				...prev,
				imageUrl: placeholderUrl,
			}));
		} finally {
			setIsGenerating(false);
		}
	};

	// Handle image improvement
	const handleImproveImage = async () => {
		if (!improvementPrompt.trim()) {
			toast.error("Please describe what changes you'd like to make");
			return;
		}

		if (!formData.imageUrl) {
			toast.error("Please generate an image first before making improvements");
			return;
		}

		setIsGenerating(true);
		try {
			const response = await axios.post("/api/generate-image", {
				prompt: `${improvementPrompt}. Maintain the overall style and character from the reference image. IMPORTANT: Do NOT include any social media UI, app interfaces, Instagram layouts, story frames, overlays, buttons, icons, usernames, or text. Just the person in a clean, natural photograph.`,
				imageInputs: [formData.imageUrl],
				outputFormat: "jpg",
			});

			if (response.data.success) {
				setFormData((prev) => ({
					...prev,
					imageUrl: response.data.imageUrl,
				}));
				setImprovementPrompt("");
				toast.success("Image improved successfully");
			}
		} catch (error) {
			console.error("Image improvement error:", error);
			// Check if it's a credit/usage limit error and show the trial modal
			const errorType = error.response?.data?.errorType;
			if (errorType === "usage_limit_reached" || errorType === "insufficient_credits" || error.response?.status === 402) {
				if (onClose) onClose(); // Close the create modal first
				openTrialModal(error.response?.data?.message || "You need credits to generate images. Purchase credits to continue.");
			} else {
				toast.error(error.response?.data?.message || "Failed to improve image");
			}
		} finally {
			setIsGenerating(false);
		}
	};

	// Handle voice selection
	const handleVoiceSelect = (voice) => {
		setFormData((prev) => ({
			...prev,
			voice: {
				voice_id: voice.voice_id,
				name: voice.name,
				labels: voice.labels,
				preview_url: voice.preview_url,
			},
		}));
	};

	// Handle form submission
	const handleSubmit = async () => {
		if (!formData.name.trim()) {
			toast.error("Please enter a name for your influencer");
			return;
		}
		if (!formData.imageUrl) {
			toast.error("Please generate an image for your influencer");
			return;
		}
		if (!formData.voice) {
			toast.error("Please select a voice for your influencer");
			return;
		}
		if (!formData.niche) {
			toast.error("Please select a niche for your influencer");
			return;
		}

		setIsCreating(true);
		try {
			// Clean up form data - remove empty optional fields to avoid validation errors
			const cleanedData = { ...formData };
			if (!cleanedData.description?.trim()) delete cleanedData.description;
			if (!cleanedData.persona?.trim()) delete cleanedData.persona;

			const response = await axios.post("/api/influencer", cleanedData);

			if (response.data.success) {
				toast.success("Influencer created successfully!");
				onSuccess();
			}
		} catch (error) {
			console.error("Influencer creation error:", error);
			toast.error(error.response?.data?.message || "Failed to create influencer");
		} finally {
			setIsCreating(false);
		}
	};

	// Check if current step is valid
	const isStepValid = () => {
		switch (currentStep) {
			case 1:
				return formData.imageUrl && formData.imagePrompt.trim();
			case 2:
				return formData.voice;
			case 3:
				return formData.name.trim() && formData.niche;
			default:
				return false;
		}
	};

	if (!isOpen) return null;

	const formContent = (
		<>
			{!inline && (
				<div className="flex items-center justify-between px-8 py-6 border-b border-light-300">
					<div>
						<h2 className="text-2xl font-semibold text-dark-100 mb-1">Create AI Influencer</h2>
						<p className="text-sm text-dark-400">{STEPS[currentStep - 1].description}</p>
					</div>
					<button onClick={onClose} className="p-2.5 hover:bg-light-200 rounded-lg transition-all duration-200 group">
						<XIcon size={20} className=" text-dark-400 group-hover:text-dark-100 transition-colors" />
					</button>
				</div>
			)}

			{/* Progress Steps */}
			<div className="px-8 py-5 bg-light-100 border-b border-light-300">
				<div className="flex items-center w-full">
					{STEPS.map((step, index) => (
						<div key={step.id} className="flex items-center flex-1">
							<div className="flex items-center gap-3 flex-shrink-0">
								<div
									className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
										currentStep > step.id
											? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30"
											: currentStep === step.id
												? "border-primary-500 text-primary-500 bg-primary-50"
												: "border-light-400 text-dark-400 bg-light-200"
									}`}
								>
									{currentStep > step.id ? <CheckIcon size={20} /> : <span className="text-sm font-semibold">{step.id}</span>}
								</div>
								<div className="hidden sm:block whitespace-nowrap">
									<div className={`text-sm font-medium transition-colors ${currentStep >= step.id ? "text-dark-100" : "text-dark-400"}`}>
										{step.title}
									</div>
								</div>
							</div>
							{index < STEPS.length - 1 && (
								<div className="flex-1 mx-3 sm:mx-6 h-0.5 bg-light-300 rounded-full overflow-hidden">
									<div className={`h-full transition-all duration-500 ${currentStep > step.id ? "bg-primary-500 w-full" : "w-0"}`} />
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Content */}
			<div className="px-8 py-6">
				<AnimatePresence mode="wait">
					{/* Step 1: Generate Image */}
					{currentStep === 1 && (
						<motion.div
							key="step1"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-6"
						>
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* Left Column: Form Controls */}
								<div className="space-y-6 lg:col-span-2">
									<div>
										<label className="block text-sm font-semibold text-dark-100 mb-3">Visual Appearance Description</label>
										<textarea
											value={formData.imagePrompt}
											onChange={(e) => setFormData((prev) => ({ ...prev, imagePrompt: e.target.value }))}
											placeholder={`Describe your influencer's appearance (e.g., Young adult, fitness coach, wearing a blue t-shirt, friendly smile).\nAlso, describe the surrounding environment and the background of the image.`}
											className="input resize-none text-[13px] font-secondary placeholder:text-[13px]"
											rows={6}
										/>
									</div>

									{/* Reference Images Upload */}
									<div>
										<label className="block text-sm font-semibold text-dark-100 mb-3">Reference Images (Optional)</label>
										<div className="space-y-3">
											<input
												type="file"
												id="reference-images-upload"
												accept="image/*"
												multiple
												onChange={async (e) => {
													const files = Array.from(e.target.files || []);

													if (files.length > 14) {
														toast.error("Maximum 14 reference images allowed");
														e.target.value = "";
														return;
													}

													const MAX_FILE_SIZE = 15 * 1024 * 1024;
													for (const file of files) {
														if (file.size > MAX_FILE_SIZE) {
															toast.error(`${file.name} is too large. Each file must be under 15 MB`);
															e.target.value = "";
															return;
														}
													}

													const base64Images = await Promise.all(
														files.map((file) => {
															return new Promise((resolve) => {
																const reader = new FileReader();
																reader.onload = (e) => resolve(e.target.result);
																reader.readAsDataURL(file);
															});
														})
													);

													setFormData((prev) => ({
														...prev,
														referenceImages: base64Images,
													}));

													e.target.value = "";
												}}
												className="hidden"
											/>

											<label
												htmlFor="reference-images-upload"
												className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-light-100 hover:bg-light-200 border border-light-300 rounded-xl cursor-pointer transition-all duration-200 group"
											>
												<Image className="w-5 h-5 text-dark-400 transition-colors" />
												<span className="text-sm font-medium text-dark-300 group-hover:text-dark-100 transition-colors">
													{formData.referenceImages.length > 0
														? `${formData.referenceImages.length} image${formData.referenceImages.length > 1 ? "s" : ""} selected`
														: "Choose Reference Images"}
												</span>
											</label>

											<p className="text-xs text-dark-400">Upload up to 14 reference images (max 15 MB each).</p>

											{formData.referenceImages.length > 0 && (
												<div className="flex flex-wrap gap-2 rounded-lg">
													{formData.referenceImages.map((imageUrl, index) => (
														<div key={index} className="relative group">
															<div className="w-20 h-20 rounded-lg overflow-hidden border border-light-300 group-hover:border-primary-300 transition-colors">
																<img src={imageUrl} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
															</div>
															<button
																onClick={() => {
																	setFormData((prev) => ({
																		...prev,
																		referenceImages: prev.referenceImages.filter((_, i) => i !== index),
																	}));
																}}
																className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
															>
																×
															</button>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Right Column: Generated Image Preview */}
								<div className="lg:col-span-1 flex flex-col space-y-3">
									<label className="block text-sm font-semibold text-dark-100">Generated Influencer</label>

									<div className="bg-light-100 rounded-lg border border-light-300 overflow-hidden flex-1 flex items-center justify-center min-h-[300px]">
										{formData.imageUrl ? (
											<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full p-3">
												<div className="relative w-full h-full group">
													<img
														src={formData.imageUrl}
														alt="Generated influencer"
														className="w-full h-full object-contain rounded-lg border-2 border-primary-300 shadow-lg"
													/>
												</div>
											</motion.div>
										) : isGenerating ? (
											<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8">
												<LoadingMessages isActive={isGenerating} />
											</motion.div>
										) : (
											<div className="flex flex-col items-center justify-center p-8">
												<UserIcon size={48} className="text-dark-400 mb-4" />
												<p className="text-sm text-dark-400">No influencer generated yet</p>
												<p className="text-xs text-dark-400 mt-1">Click "Generate Image" to create</p>
											</div>
										)}
									</div>

									{formData.imageUrl && (
										<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
											<label className="block text-xs font-semibold text-dark-100">Improve This Image</label>
											<div className="flex gap-2">
												<input
													type="text"
													value={improvementPrompt}
													onChange={(e) => setImprovementPrompt(e.target.value)}
													placeholder="e.g., Make them smile more..."
													className="input flex-1 text-sm"
													onKeyDown={(e) => {
														if (e.key === "Enter" && improvementPrompt.trim() && !isGenerating) {
															handleImproveImage();
														}
													}}
												/>
												<button
													onClick={handleImproveImage}
													disabled={isGenerating || !improvementPrompt.trim()}
													className="btn btn-primary px-3"
												>
													<SparklesIcon size={16} />
												</button>
											</div>
										</motion.div>
									)}
								</div>
							</div>

							<div className="flex justify-center pt-2">
								<button
									onClick={handleGenerateImage}
									disabled={isGenerating || !formData.imagePrompt.trim()}
									className="btn btn-primary px-8 py-3 disabled:opacity-50"
								>
									{isGenerating ? (
										<>
											<SparklesIcon size={20} className=" animate-spin mr-2" />
											Generating...
										</>
									) : (
										<>
											<SparklesIcon size={20} className=" mr-2" />
											Generate Image
										</>
									)}
								</button>
							</div>
						</motion.div>
					)}

					{/* Step 2: Select Voice */}
					{currentStep === 2 && (
						<motion.div
							key="step2"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-6"
						>
							<div>
								<h3 className="text-lg font-medium text-dark-100 mb-4">Choose a voice for your influencer</h3>

								{voices.length > 0 ? (
									<VoiceDropList voices={voices} selectedVoice={formData.voice} setSelectedVoice={handleVoiceSelect} />
								) : (
									<div className="flex items-center justify-center py-8">
										<div className="text-dark-400">Loading voices...</div>
									</div>
								)}
							</div>
						</motion.div>
					)}

					{/* Step 3: Review & Create */}
					{currentStep === 3 && (
						<motion.div
							key="step3"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-6"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-semibold text-dark-100 mb-3">Influencer Name *</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
										placeholder="Enter influencer name"
										className="input"
									/>
								</div>

								<div>
									<label className="block text-sm font-semibold text-dark-100 mb-3">Niche *</label>
									<select
										value={formData.niche}
										onChange={(e) => setFormData((prev) => ({ ...prev, niche: e.target.value }))}
										className="input !pr-8"
									>
										<option value="">Select a niche</option>
										{NICHES.map((niche) => (
											<option key={niche.value} value={niche.value}>
												{niche.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-semibold text-dark-100 mb-3">Description (Optional)</label>
								<textarea
									value={formData.description}
									onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
									placeholder="Brief description of your influencer"
									className="input resize-none"
									rows={2}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-dark-100 mb-3">Persona (Optional)</label>
								<textarea
									value={formData.persona}
									onChange={(e) => setFormData((prev) => ({ ...prev, persona: e.target.value }))}
									placeholder="e.g., Fitness coach, motivational speaker, health enthusiast"
									className="input resize-none"
									rows={2}
								/>
							</div>

							{/* Preview */}
							<div className="bg-light-100 rounded-lg p-6 border border-light-300">
								<h4 className="text-lg font-medium text-dark-100 mb-4">Preview</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<p className="text-sm text-dark-400 mb-2">Appearance</p>
										<img
											src={formData.imageUrl}
											alt="Influencer preview"
											className="w-full aspect-square object-cover rounded-lg border border-light-300"
										/>
									</div>

									<div>
										<p className="text-sm text-dark-400 mb-2">Voice</p>
										<div className="bg-white rounded-lg p-3 border border-light-300">
											<div className="flex items-center gap-2 mb-2">
												<VolumeIcon size={16} className=" text-primary-500" />
												<span className="font-medium text-dark-100">{formData.voice?.name}</span>
											</div>
											<div className="text-sm text-dark-400">
												{formData.voice?.labels &&
													Object.entries(formData.voice.labels).map(([key, value]) => (
														<span
															key={key}
															className="inline-block bg-light-200 text-dark-300 px-2 py-1 rounded-full text-xs mr-2 mb-1"
														>
															{value}
														</span>
													))}
											</div>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between px-8 py-6 border-t border-light-300 bg-light-100">
				<button
					onClick={goToPrevStep}
					disabled={currentStep === 1}
					className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-light-200 disabled:opacity-40 disabled:cursor-not-allowed text-dark-100 rounded-lg border border-light-300 transition-all duration-200"
				>
					<ArrowLeftIcon size={16} />
					<span className="font-medium">Previous</span>
				</button>

				<div className="flex items-center gap-2 text-sm font-medium text-dark-300">
					<span className="text-primary-500">Step {currentStep}</span>
					<span className="text-dark-400">of {STEPS.length}</span>
				</div>

				{currentStep < STEPS.length ? (
					<button onClick={goToNextStep} disabled={!isStepValid()} className="btn btn-primary px-6 py-2.5 disabled:opacity-40">
						<span>Next</span>
						<ArrowRightIcon size={16} className=" ml-2" />
					</button>
				) : (
					<button
						onClick={handleSubmit}
						disabled={!isStepValid() || isCreating}
						className="btn bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 disabled:opacity-40"
					>
						{isCreating ? (
							<>
								<SparklesIcon size={20} className=" animate-spin mr-2" />
								Creating...
							</>
						) : (
							<>
								<CheckIcon className="w-5 h-5 mr-2" />
								Create Influencer
							</>
						)}
					</button>
				)}
			</div>
		</>
	);

	if (inline) {
		return <div className="bg-white rounded-2xl border border-light-300 shadow-sm overflow-hidden">{formContent}</div>;
	}

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				className="bg-white rounded-2xl border border-light-300 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
			>
				{formContent}
			</motion.div>
		</div>
	);
}

// VoiceDropList component for voice selection
const VoiceDropList = ({ voices, selectedVoice, setSelectedVoice }) => {
	const [playing, setPlaying] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const audioRef = useRef(null);

	const filteredVoices = voices.filter(
		(voice) =>
			voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			Object.values(voice.labels || {}).some((label) => label.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const handleVoiceClick = (voice) => {
		setSelectedVoice(voice);
	};

	const handlePlayClick = (voice) => {
		try {
			if (playing === voice.voice_id) {
				audioRef.current.pause();
				setPlaying(null);
			} else {
				if (audioRef.current) {
					audioRef.current.pause();
				}
				audioRef.current = new Audio(voice.preview_url);
				audioRef.current.play().catch((err) => console.error("Error playing audio:", err));
				audioRef.current.onended = () => setPlaying(null);
				setPlaying(voice.voice_id);
			}
		} catch (error) {
			console.error("Error handling audio playback:", error);
		}
	};

	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!selectedVoice && voices?.length > 0) {
			setSelectedVoice(voices[0]);
		}
	}, [voices, selectedVoice, setSelectedVoice]);

	return (
		<div className="rounded-xl shadow-lg bg-white border border-light-300 overflow-hidden flex flex-col h-96">
			{/* Search */}
			<div className="p-4 border-b border-light-300 bg-light-100">
				<div className="relative">
					<SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
					<input
						type="text"
						placeholder="Search voices..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="input !pl-10"
					/>
				</div>
			</div>

			{/* Voice List */}
			<div className="overflow-y-auto flex-grow">
				{filteredVoices.length === 0 ? (
					<div className="text-center py-8 text-dark-400">No voices matching "{searchTerm}"</div>
				) : (
					filteredVoices.map((voice) => (
						<div
							className={`flex items-center py-3.5 px-4 border-b border-light-300 hover:bg-light-100 cursor-pointer transition-all duration-200 ${
								selectedVoice?.voice_id === voice.voice_id ? "bg-primary-50 border-l-4 border-l-primary-500" : ""
							}`}
							onClick={() => handleVoiceClick(voice)}
							key={voice.voice_id}
						>
							<button
								className="mr-4 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-full p-1 transition-colors duration-200"
								onClick={(e) => {
									e.stopPropagation();
									handlePlayClick(voice);
								}}
							>
								{playing === voice.voice_id ? (
									<PauseIcon size={24} className=" text-primary-500" />
								) : (
									<PlayIcon size={24} className=" text-primary-500" />
								)}
							</button>
							<div className="flex-grow">
								<div className="font-bold text-md text-dark-100">{voice.name}</div>
								<div className="flex flex-wrap mt-1 text-xs">
									{Object.entries(voice.labels || {}).map(([key, value]) => (
										<span key={key} className="bg-light-200 text-dark-400 px-2 py-1 rounded-full text-xs mr-2 mb-2">
											{value}
										</span>
									))}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
