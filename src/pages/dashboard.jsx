import Head from "next/head";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { PRODUCT_NAME } from "@/config/constants";

export default function Dashboard({ user }) {
	const [stats, setStats] = useState({
		totalInfluencers: 0,
		totalPosts: 0,
		activeSchedules: 0,
		credits: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch("/api/dashboard/stats");
				const data = await response.json();
				if (data.success) {
					setStats(data.stats);
				}
			} catch (error) {
				console.error("Failed to fetch dashboard stats:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	return (
		<>
			<Head>
				<title>Dashboard | {PRODUCT_NAME}</title>
			</Head>

			<DashboardLayout>
				<div className="p-6">
					<div className="mb-8">
						<h1 className="text-2xl font-bold text-dark-100">Welcome back, {user?.name || "Creator"}!</h1>
						<p className="text-dark-400 mt-1">Here&apos;s what&apos;s happening with your AI influencers</p>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-dark-400 text-sm">Total Influencers</p>
									<p className="text-3xl font-bold text-dark-100 mt-1">
										{loading ? <span className="animate-pulse">—</span> : stats.totalInfluencers}
									</p>
								</div>
								<div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-dark-400 text-sm">Total Posts</p>
									<p className="text-3xl font-bold text-dark-100 mt-1">
										{loading ? <span className="animate-pulse">—</span> : stats.totalPosts}
									</p>
								</div>
								<div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-dark-400 text-sm">Active Schedules</p>
									<p className="text-3xl font-bold text-dark-100 mt-1">
										{loading ? <span className="animate-pulse">—</span> : stats.activeSchedules}
									</p>
								</div>
								<div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-dark-400 text-sm">Credits</p>
									<p className="text-3xl font-bold text-dark-100 mt-1">
										{loading ? <span className="animate-pulse">—</span> : stats.credits}
									</p>
								</div>
								<div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="mb-8">
						<h2 className="text-lg font-semibold text-dark-100 mb-4">Quick Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<a href="/influencers" className="card p-4 hover:border-primary-300 transition-colors cursor-pointer group">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
										<svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
									</div>
									<div>
										<p className="font-medium text-dark-100">Create Influencer</p>
										<p className="text-sm text-dark-400">Generate a new AI influencer</p>
									</div>
								</div>
							</a>

							<a href="/posts" className="card p-4 hover:border-primary-300 transition-colors cursor-pointer group">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center group-hover:bg-success-200 transition-colors">
										<svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
									</div>
									<div>
										<p className="font-medium text-dark-100">Create Post</p>
										<p className="text-sm text-dark-400">Generate a new video post</p>
									</div>
								</div>
							</a>

							<a href="/accounts" className="card p-4 hover:border-primary-300 transition-colors cursor-pointer group">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center group-hover:bg-info-200 transition-colors">
										<svg className="w-5 h-5 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
										</svg>
									</div>
									<div>
										<p className="font-medium text-dark-100">Connect Accounts</p>
										<p className="text-sm text-dark-400">Link your social media</p>
									</div>
								</div>
							</a>
						</div>
					</div>

					{/* Getting Started */}
					<div className="card p-6">
						<h2 className="text-lg font-semibold text-dark-100 mb-4">Getting Started</h2>
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
								<div>
									<p className="font-medium text-dark-100">Create your first AI influencer</p>
									<p className="text-sm text-dark-400">Generate a unique AI character with custom appearance and voice</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="w-8 h-8 bg-light-300 text-dark-300 rounded-full flex items-center justify-center text-sm font-medium">2</div>
								<div>
									<p className="font-medium text-dark-300">Connect your social accounts</p>
									<p className="text-sm text-dark-400">Link TikTok, Instagram, and YouTube for auto-posting</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="w-8 h-8 bg-light-300 text-dark-300 rounded-full flex items-center justify-center text-sm font-medium">3</div>
								<div>
									<p className="font-medium text-dark-300">Create and schedule posts</p>
									<p className="text-sm text-dark-400">Generate videos and set up automatic posting schedules</p>
								</div>
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
