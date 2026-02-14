import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { NICHES } from "@/config/constants";
import { UserIcon } from "@/components/ui/user";
import { PlusIcon } from "@/components/ui/plus";
import { SearchIcon } from "@/components/ui/search";
import CreateInfluencer from "./CreateInfluencer";
import InfluencerCard from "./InfluencerCard";

export default function InfluencersComponent() {
	const [influencers, setInfluencers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [selectedNiche, setSelectedNiche] = useState("");
	const [viewMode, setViewMode] = useState("grid");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalInfluencers: 0,
	});

	// Fetch influencers
	const fetchInfluencers = async (page = 1) => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: page.toString(),
				limit: "12",
				search: searchTerm,
				sortBy,
				sortOrder,
			});

			if (selectedNiche) {
				params.append("niche", selectedNiche);
			}

			const response = await axios.get(`/api/influencer?${params}`);

			if (response.data.success) {
				setInfluencers(response.data.influencers);
				setPagination(response.data.pagination);
			}
		} catch (error) {
			console.error("Error fetching influencers:", error);
			toast.error("Failed to load influencers");
		} finally {
			setLoading(false);
		}
	};

	// Initial load and refetch on filter changes
	useEffect(() => {
		fetchInfluencers();
	}, [searchTerm, sortBy, sortOrder, selectedNiche]);

	// Handle delete influencer
	const handleDeleteInfluencer = async (influencerId) => {
		if (!confirm("Are you sure you want to delete this influencer?")) return;

		try {
			const response = await axios.delete(`/api/influencer/${influencerId}`);
			if (response.data.success) {
				toast.success("Influencer deleted successfully");
				fetchInfluencers(pagination.currentPage);
			}
		} catch (error) {
			console.error("Error deleting influencer:", error);
			toast.error("Failed to delete influencer");
		}
	};

	// Handle influencer creation success
	const handleInfluencerCreated = () => {
		setShowCreateForm(false);
		fetchInfluencers();
		toast.success("Influencer created successfully!");
	};

// Handle pagination
	const handlePageChange = (page) => {
		fetchInfluencers(page);
	};

	// Sort options
	const sortOptions = [
		{ value: "createdAt", label: "Date Created" },
		{ value: "name", label: "Name" },
		{ value: "usageCount", label: "Usage Count" },
		{ value: "lastUsedAt", label: "Last Used" },
	];

	return (
		<div className="p-6">
			{showCreateForm ? (
				// Create Influencer Form
				<div>
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-light-200 rounded-lg transition-all duration-200">
								<svg className="w-5 h-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
								</svg>
							</button>
							<div>
								<h1 className="text-xl sm:text-2xl font-semibold text-dark-100 tracking-tight">Create AI Influencer</h1>
								<p className="text-dark-400 text-sm mt-1">Create and customize your AI influencer</p>
							</div>
						</div>
					</div>
					<CreateInfluencer isOpen={true} onClose={() => setShowCreateForm(false)} onSuccess={handleInfluencerCreated} inline={true} />
				</div>
			) : (
				<>
					{/* Header */}
					<div className="mb-6 sm:mb-8">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div className="flex items-center gap-3">
								<div className="p-2 sm:p-3 bg-primary-100 rounded-xl text-primary-500">
									<UserIcon size={24} />
								</div>
								<div>
									<h1 className="text-xl sm:text-2xl font-semibold text-dark-100 tracking-tight">AI Influencers</h1>
									<p className="text-dark-400 text-sm mt-1">Create and manage your AI influencers</p>
								</div>
							</div>
							<button onClick={() => setShowCreateForm(true)} className="btn btn-primary px-4 sm:px-6 py-2 sm:py-2.5 flex items-center">
								<PlusIcon size={16} className="mr-2" />
								<span className="text-xs sm:text-sm font-medium whitespace-nowrap">Create Influencer</span>
							</button>
						</div>
					</div>

					{/* Search and Filters */}
					<div className="mb-6 space-y-4">
						<div className="flex flex-col sm:flex-row gap-4">
							{/* Search */}
							<div className="relative flex-1">
								<SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 z-10 pointer-events-none" />
								<input
									type="text"
									placeholder="Search influencers..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="input !pl-10"
								/>
							</div>

							{/* Filters */}
							<div className="flex gap-2">
								{/* Niche Filter */}
								<select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)} className="input w-auto !pr-8">
									<option value="">All Niches</option>
									{NICHES.map((niche) => (
										<option key={niche.value} value={niche.value}>
											{niche.label}
										</option>
									))}
								</select>

								{/* Sort */}
								<select
									value={`${sortBy}-${sortOrder}`}
									onChange={(e) => {
										const [field, order] = e.target.value.split("-");
										setSortBy(field);
										setSortOrder(order);
									}}
									className="input w-auto !pr-8"
								>
									{sortOptions.map((option) => (
										<optgroup key={option.value} label={option.label}>
											<option value={`${option.value}-desc`}>{option.label} (Newest)</option>
											<option value={`${option.value}-asc`}>{option.label} (Oldest)</option>
										</optgroup>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Influencers Grid/List */}
					{loading && influencers.length === 0 ? (
						<div className="flex justify-center items-center py-20">
							<div className="spinner w-8 h-8"></div>
						</div>
					) : influencers.length === 0 ? (
						<div className="card p-12 text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
								<UserIcon size={32} />
							</div>
							<h3 className="text-xl font-semibold text-dark-100 mb-2">No influencers yet</h3>
							<p className="font-secondary text-sm text-neutral-500 mb-6 max-w-md mx-auto">
								Create your first AI influencer to start generating viral videos. Each influencer has a unique look, voice, and personality.
							</p>
							<button onClick={() => setShowCreateForm(true)} className="btn btn-primary flex items-center">
								<PlusIcon size={16} className="mr-2" />
								Create Your First Influencer
							</button>
						</div>
					) : (
						<>
							<div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6" : "space-y-4"}>
								{influencers.map((influencer) => (
									<InfluencerCard
										key={influencer._id}
										influencer={influencer}
										viewMode={viewMode}
										onDelete={() => handleDeleteInfluencer(influencer._id)}
										onEdit={(influencer) => {
											console.log("Edit influencer:", influencer);
										}}
									/>
								))}
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="flex justify-center mt-8">
									<div className="flex gap-2">
										<button
											onClick={() => handlePageChange(pagination.currentPage - 1)}
											disabled={!pagination.hasPrevPage}
											className="px-3 py-2 bg-white border border-light-300 rounded-lg text-dark-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-100 transition-all duration-200"
										>
											Previous
										</button>

										{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
											<button
												key={page}
												onClick={() => handlePageChange(page)}
												className={`px-3 py-2 rounded-lg transition-all duration-200 ${
													page === pagination.currentPage
														? "bg-primary-500 text-white"
														: "bg-white border border-light-300 text-dark-100 hover:bg-light-100"
												}`}
											>
												{page}
											</button>
										))}

										<button
											onClick={() => handlePageChange(pagination.currentPage + 1)}
											disabled={!pagination.hasNextPage}
											className="px-3 py-2 bg-white border border-light-300 rounded-lg text-dark-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-100 transition-all duration-200"
										>
											Next
										</button>
									</div>
								</div>
							)}
						</>
					)}
				</>
			)}
		</div>
	);
}
