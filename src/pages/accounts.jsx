import { useState, useEffect, useCallback, useContext } from "react";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { PRODUCT_NAME } from "@/config/constants";
import { TeamContext } from "@/store/TeamContextProvider";

const platformConfig = {
	tiktok: {
		name: "TikTok",
		description: "Connect your TikTok account to auto-post videos",
		icon: (
			<svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
				<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
			</svg>
		),
		color: "bg-black",
		textColor: "text-white",
	},
	instagram: {
		name: "Instagram",
		description: "Connect your Instagram Business account for Reels",
		icon: (
			<svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
			</svg>
		),
		color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
		textColor: "text-white",
	},
	youtube: {
		name: "YouTube",
		description: "Connect your YouTube channel for Shorts",
		icon: (
			<svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
				<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
			</svg>
		),
		color: "bg-red-600",
		textColor: "text-white",
	},
};

export default function Accounts({ user }) {
	const router = useRouter();
	const { currentTeam } = useContext(TeamContext);
	const [influencers, setInfluencers] = useState([]);
	const [selectedInfluencer, setSelectedInfluencer] = useState(null);
	const [accounts, setAccounts] = useState({
		youtube: { connected: false },
		tiktok: { connected: false },
		instagram: { connected: false },
	});
	const [loadingInfluencers, setLoadingInfluencers] = useState(true);
	const [loadingAccounts, setLoadingAccounts] = useState(false);
	const [connecting, setConnecting] = useState(null);
	const [disconnecting, setDisconnecting] = useState(null);

	// Handle URL params for success/error messages
	useEffect(() => {
		const { success, error, influencer } = router.query;
		if (success) {
			toast.success(`Successfully connected ${success} account!`);
			// Clean up URL
			router.replace("/accounts", undefined, { shallow: true });
		}
		if (error) {
			toast.error(decodeURIComponent(error));
			router.replace("/accounts", undefined, { shallow: true });
		}
		if (influencer && influencers.length > 0) {
			const inf = influencers.find((i) => i._id === influencer);
			if (inf) {
				setSelectedInfluencer(inf);
			}
		}
	}, [router.query, influencers]);

	// Fetch influencers for the team
	useEffect(() => {
		const fetchInfluencers = async () => {
			if (!currentTeam?._id) return;

			// Reset state when team changes
			setSelectedInfluencer(null);
			setInfluencers([]);
			setLoadingInfluencers(true);

			try {
				const res = await fetch(`/api/influencer?teamId=${currentTeam._id}`);
				const data = await res.json();
				if (data.success) {
					setInfluencers(data.influencers || []);
					// Auto-select first influencer
					if (data.influencers?.length > 0) {
						setSelectedInfluencer(data.influencers[0]);
					}
				}
			} catch (error) {
				console.error("Error fetching influencers:", error);
				toast.error("Failed to load influencers");
			} finally {
				setLoadingInfluencers(false);
			}
		};

		fetchInfluencers();
	}, [currentTeam?._id]);

	// Fetch accounts for selected influencer
	const fetchAccounts = useCallback(async () => {
		if (!selectedInfluencer?._id) return;

		setLoadingAccounts(true);
		try {
			const res = await fetch(`/api/influencer/${selectedInfluencer._id}/accounts`);
			const data = await res.json();
			if (data.success) {
				setAccounts(data.accounts);
			}
		} catch (error) {
			console.error("Error fetching accounts:", error);
		} finally {
			setLoadingAccounts(false);
		}
	}, [selectedInfluencer?._id]);

	useEffect(() => {
		fetchAccounts();
	}, [fetchAccounts]);

	const handleConnect = async (platform) => {
		if (!selectedInfluencer?._id) {
			toast.error("Please select an influencer first");
			return;
		}

		setConnecting(platform);
		try {
			const res = await fetch(`/api/oauth/${platform}?influencerId=${selectedInfluencer._id}`);
			const data = await res.json();
			if (data.success && data.url) {
				window.location.href = data.url;
			} else {
				toast.error(data.message || `Failed to initiate ${platform} connection`);
			}
		} catch (error) {
			console.error(`Error connecting ${platform}:`, error);
			toast.error(`Failed to connect ${platform}`);
		} finally {
			setConnecting(null);
		}
	};

	const handleDisconnect = async (platform) => {
		if (!selectedInfluencer?._id) return;

		if (!confirm(`Are you sure you want to disconnect ${platformConfig[platform].name}?`)) {
			return;
		}

		setDisconnecting(platform);
		try {
			const res = await fetch(`/api/influencer/${selectedInfluencer._id}/accounts/${platform}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.success) {
				toast.success(`${platformConfig[platform].name} disconnected`);
				fetchAccounts();
			} else {
				toast.error(data.message || "Failed to disconnect");
			}
		} catch (error) {
			console.error(`Error disconnecting ${platform}:`, error);
			toast.error("Failed to disconnect");
		} finally {
			setDisconnecting(null);
		}
	};

	const renderAccountCard = (platformId) => {
		const config = platformConfig[platformId];
		const account = accounts[platformId];
		const isConnected = account?.connected;

		return (
			<div key={platformId} className="card p-6">
				<div className="flex items-start gap-4">
					<div className={`w-14 h-14 ${config.color} rounded-xl flex items-center justify-center ${config.textColor}`}>{config.icon}</div>
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-neutral-900">{config.name}</h3>
						<p className="text-neutral-500 text-sm mt-1">{config.description}</p>
					</div>
				</div>

				<div className="mt-6 pt-4 border-t border-light-200">
					{loadingAccounts ? (
						<div className="flex items-center justify-center py-2">
							<div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
						</div>
					) : isConnected ? (
						<div className="space-y-3">
							{/* Connected Account Info */}
							<div className="flex items-center gap-3">
								{account.thumbnailUrl || account.avatarUrl || account.profilePictureUrl ? (
									<img
										src={account.thumbnailUrl || account.avatarUrl || account.profilePictureUrl}
										alt="Profile"
										className="w-10 h-10 rounded-full object-cover"
									/>
								) : (
									<div className="w-10 h-10 bg-light-200 rounded-full flex items-center justify-center">
										<span className="text-neutral-500 text-sm font-medium">
											{(account.channelName || account.username || account.displayName || "U").charAt(0).toUpperCase()}
										</span>
									</div>
								)}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-neutral-900 truncate">
										{account.channelName || account.displayName || account.username || "Connected"}
									</p>
									{account.username && account.displayName && account.username !== account.displayName && (
										<p className="text-xs text-neutral-500">@{account.username}</p>
									)}
									{(account.subscriberCount || account.followerCount || account.followersCount) && (
										<p className="text-xs text-neutral-500">
											{parseInt(account.subscriberCount || account.followerCount || account.followersCount).toLocaleString()} followers
										</p>
									)}
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-success-600 flex items-center gap-1">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									Connected
								</span>
								<button
									onClick={() => handleDisconnect(platformId)}
									disabled={disconnecting === platformId}
									className="btn btn-secondary text-sm text-error-600 border-error-200 hover:bg-error-50"
								>
									{disconnecting === platformId ? "Disconnecting..." : "Disconnect"}
								</button>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-between">
							<span className="text-sm text-neutral-500">Not connected</span>
							<button
								onClick={() => handleConnect(platformId)}
								disabled={connecting === platformId || !selectedInfluencer}
								className="btn btn-secondary text-sm"
							>
								{connecting === platformId ? "Connecting..." : "Connect"}
							</button>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<>
			<Head>
				<title>Connected Accounts | {PRODUCT_NAME}</title>
			</Head>

			<DashboardLayout>
				<div className="p-6">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-2xl font-bold text-neutral-900">Connected Accounts</h1>
						<p className="text-neutral-500 mt-1">Connect social media accounts for each influencer to enable auto-posting</p>
					</div>

					{/* Influencer Selector */}
					<div className="mb-8">
						<label className="block text-sm font-medium text-neutral-600 mb-3">Select Influencer</label>
						{loadingInfluencers ? (
							<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div key={i} className="aspect-[9/16] bg-neutral-300/60 rounded-xl animate-pulse"></div>
								))}
							</div>
						) : influencers.length === 0 ? (
							<div className="card p-8 text-center">
								<div className="w-16 h-16 bg-light-200 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
								</div>
								<p className="text-neutral-500 text-sm">
									No influencers found.{" "}
									<a href="/influencers" className="text-primary-400 hover:underline">
										Create one first
									</a>
								</p>
							</div>
						) : (
							<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
								{influencers.map((inf) => (
									<button
										key={inf._id}
										onClick={() => setSelectedInfluencer(inf)}
										className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all group ${
											selectedInfluencer?._id === inf._id
												? "border-primary-400 shadow-lg shadow-primary-200 ring-2 ring-primary-200"
												: "border-transparent hover:border-primary-200 hover:shadow-md"
										}`}
									>
										{/* Background Image */}
										{inf.imageUrl ? (
											<img
												src={inf.imageUrl}
												alt={inf.name}
												className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											/>
										) : (
											<div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
												<span className="text-white text-4xl font-bold">{inf.name?.charAt(0).toUpperCase()}</span>
											</div>
										)}

										{/* Gradient Overlay */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

										{/* Selected Checkmark */}
										{selectedInfluencer?._id === inf._id && (
											<div className="absolute top-2 right-2 z-10">
												<div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
													<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
											</div>
										)}

										{/* Niche Badge */}
										{inf.niche && (
											<div className="absolute top-1 left-2 z-10">
												<span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] text-white rounded-full capitalize">
													{inf.niche}
												</span>
											</div>
										)}

										{/* Info Overlay at Bottom */}
										<div className="absolute bottom-0 left-0 right-0 p-3">
											<h4 className="font-semibold text-white text-sm truncate">{inf.name}</h4>
											{inf.description && <p className="text-[11px] text-white/70 line-clamp-2">{inf.description}</p>}
										</div>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Platform Cards */}
					{selectedInfluencer && (
						<div>
							<div className="flex items-center gap-3 mb-4">
								<h2 className="text-lg font-semibold text-neutral-900">Connected Accounts for</h2>
								<div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-full">
									{selectedInfluencer.imageUrl ? (
										<img src={selectedInfluencer.imageUrl} alt={selectedInfluencer.name} className="w-6 h-6 rounded-full object-cover" />
									) : (
										<div className="w-6 h-6 bg-primary-400 rounded-full flex items-center justify-center">
											<span className="text-white text-xs font-medium">{selectedInfluencer.name?.charAt(0).toUpperCase()}</span>
										</div>
									)}
									<span className="text-sm font-medium text-primary-700">{selectedInfluencer.name}</span>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{Object.keys(platformConfig).map((platformId) => renderAccountCard(platformId))}
							</div>
						</div>
					)}

					{/* Info Card */}
					<div className="mt-8 card p-6 bg-info-50 border-info-200">
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg className="w-5 h-5 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<h4 className="font-medium text-info-800">Per-Influencer Connections</h4>
								<p className="text-info-700 text-sm mt-1">
									Each influencer can have their own connected social accounts. This allows you to post content to different channels for each
									influencer persona you create.
								</p>
							</div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession(context);

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	return {
		props: {
			user: session.user,
		},
	};
}
