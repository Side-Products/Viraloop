import Head from "next/head";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { PRODUCT_NAME } from "@/config/constants";

export default function Posts({ user }) {
	return (
		<>
			<Head>
				<title>Posts | {PRODUCT_NAME}</title>
			</Head>

			<DashboardLayout>
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-2xl font-bold text-neutral-900">Posts</h1>
							<p className="text-neutral-500 mt-1">Create and manage your video posts</p>
						</div>
						<button className="btn btn-primary flex items-center gap-2">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Create Post
						</button>
					</div>

					{/* Filters */}
					<div className="flex flex-wrap items-center gap-4 mb-6">
						<div className="flex-1 min-w-[200px] max-w-md">
							<div className="relative">
								<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
								<input
									type="text"
									placeholder="Search posts..."
									className="input !pl-10"
								/>
							</div>
						</div>
						<select className="input w-auto !pr-8">
							<option value="">All Status</option>
							<option value="draft">Draft</option>
							<option value="processing">Processing</option>
							<option value="completed">Completed</option>
							<option value="posted">Posted</option>
							<option value="failed">Failed</option>
						</select>
						<select className="input w-auto !pr-8">
							<option value="createdAt">Newest First</option>
							<option value="title">Title A-Z</option>
							<option value="viewCount">Most Views</option>
						</select>
					</div>

					{/* Empty State */}
					<div className="card p-12 text-center">
						<div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-neutral-900 mb-2">No posts yet</h3>
						<p className="text-neutral-500 mb-6 max-w-md mx-auto">
							Create your first video post with an AI influencer. Posts can be auto-published to TikTok, Instagram, and YouTube.
						</p>
						<button className="btn btn-primary">
							Create Your First Post
						</button>
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
