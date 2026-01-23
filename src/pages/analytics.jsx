import Head from "next/head";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { PRODUCT_NAME } from "@/config/constants";

export default function Analytics({ user }) {
	return (
		<>
			<Head>
				<title>Analytics | {PRODUCT_NAME}</title>
			</Head>

			<DashboardLayout>
				<div className="p-6">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-2xl font-bold text-dark-100">Analytics</h1>
						<p className="text-dark-400 mt-1">Track performance across all your connected platforms</p>
					</div>

					{/* Overview Stats */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-dark-400 text-sm">Total Views</p>
									<p className="text-3xl font-bold text-dark-100 mt-1">0</p>
									<p className="text-success-600 text-sm mt-1">+0% this week</p>
								</div>
								<div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-dark-400 text-sm">Total Likes</p>
									<p className="text-3xl font-bold text-dark-100 mt-1">0</p>
									<p className="text-success-600 text-sm mt-1">+0% this week</p>
								</div>
								<div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-dark-400 text-sm">Total Comments</p>
									<p className="text-3xl font-bold text-dark-100 mt-1">0</p>
									<p className="text-success-600 text-sm mt-1">+0% this week</p>
								</div>
								<div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-dark-400 text-sm">Total Shares</p>
									<p className="text-3xl font-bold text-dark-100 mt-1">0</p>
									<p className="text-success-600 text-sm mt-1">+0% this week</p>
								</div>
								<div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
									</svg>
								</div>
							</div>
						</div>
					</div>

					{/* Platform Breakdown */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
						{/* TikTok */}
						<div className="card p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
									<svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
										<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
									</svg>
								</div>
								<h3 className="font-semibold text-dark-100">TikTok</h3>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-dark-400 text-sm">Views</span>
									<span className="font-medium text-dark-100">0</span>
								</div>
								<div className="flex justify-between">
									<span className="text-dark-400 text-sm">Likes</span>
									<span className="font-medium text-dark-100">0</span>
								</div>
								<div className="flex justify-between">
									<span className="text-dark-400 text-sm">Comments</span>
									<span className="font-medium text-dark-100">0</span>
								</div>
							</div>
						</div>

						{/* Instagram */}
						<div className="card p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
									<svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
										<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
									</svg>
								</div>
								<h3 className="font-semibold text-dark-100">Instagram</h3>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-dark-400 text-sm">Views</span>
									<span className="font-medium text-dark-100">0</span>
								</div>
								<div className="flex justify-between">
									<span className="text-dark-400 text-sm">Likes</span>
									<span className="font-medium text-dark-100">0</span>
								</div>
								<div className="flex justify-between">
									<span className="text-dark-400 text-sm">Comments</span>
									<span className="font-medium text-dark-100">0</span>
								</div>
							</div>
						</div>

						{/* YouTube */}
						<div className="card p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
									<svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
										<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
									</svg>
								</div>
								<h3 className="font-semibold text-dark-100">YouTube</h3>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-dark-400 text-sm">Views</span>
									<span className="font-medium text-dark-100">0</span>
								</div>
								<div className="flex justify-between">
									<span className="text-dark-400 text-sm">Likes</span>
									<span className="font-medium text-dark-100">0</span>
								</div>
								<div className="flex justify-between">
									<span className="text-dark-400 text-sm">Comments</span>
									<span className="font-medium text-dark-100">0</span>
								</div>
							</div>
						</div>
					</div>

					{/* Empty State for Chart */}
					<div className="card p-12 text-center">
						<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-dark-100 mb-2">No data yet</h3>
						<p className="text-dark-400 mb-6 max-w-md mx-auto">
							Start posting content to see your analytics here. We&apos;ll track views, likes, comments, and shares across all connected platforms.
						</p>
						<a href="/posts" className="btn btn-primary">
							Create Your First Post
						</a>
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
