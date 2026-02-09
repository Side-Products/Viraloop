import Head from "next/head";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { PRODUCT_NAME, SCHEDULE_FREQUENCIES } from "@/config/constants";

export default function Loops({ user }) {
	return (
		<>
			<Head>
				<title>Loops | {PRODUCT_NAME}</title>
			</Head>

			<DashboardLayout>
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-2xl font-bold text-neutral-900">Loops</h1>
							<p className="text-neutral-500 mt-1">Automate your posting with loops</p>
						</div>
						<button className="btn btn-primary flex items-center gap-2">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Create Loop
						</button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-neutral-500 text-sm">Active Loops</p>
									<p className="text-3xl font-bold text-neutral-900 mt-1">0</p>
								</div>
								<div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
							</div>
						</div>

						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-neutral-500 text-sm">Paused Loops</p>
									<p className="text-3xl font-bold text-neutral-900 mt-1">0</p>
								</div>
								<div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-neutral-500 text-sm">Posts This Week</p>
									<p className="text-3xl font-bold text-neutral-900 mt-1">0</p>
								</div>
								<div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center">
									<svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
							</div>
						</div>
					</div>

					{/* Empty State */}
					<div className="card p-12 text-center">
						<div className="w-16 h-16 bg-info-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-neutral-900 mb-2">No loops yet</h3>
						<p className="text-neutral-500 mb-6 max-w-md mx-auto">
							Create your first loop to automate posting. Choose from one-time, recurring, or loop modes for endless viral content.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button className="btn btn-primary">
								Create One-Time Loop
							</button>
							<button className="btn btn-secondary">
								Create Recurring Loop
							</button>
						</div>
					</div>

					{/* Loop Types Info */}
					<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="card p-6">
							<div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
								<svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<h4 className="font-semibold text-neutral-900 mb-2">One-Time</h4>
							<p className="text-neutral-500 text-sm">Post once at a specific date and time</p>
						</div>

						<div className="card p-6">
							<div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center mb-4">
								<svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							</div>
							<h4 className="font-semibold text-neutral-900 mb-2">Recurring</h4>
							<p className="text-neutral-500 text-sm">Post on a regular schedule - daily, weekly, or custom intervals</p>
						</div>

						<div className="card p-6">
							<div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center mb-4">
								<svg className="w-5 h-5 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h4 className="font-semibold text-neutral-900 mb-2">Infinite Loop</h4>
							<p className="text-neutral-500 text-sm">Cycle through a queue of posts indefinitely for endless content</p>
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
