import Head from "next/head";
import { useState, useContext, useCallback, useEffect } from "react";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { PRODUCT_NAME } from "@/config/constants";
import { TeamContext } from "@/store/TeamContextProvider";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";

// Day component
const CalendarDay = ({ day, currentMonth, posts, onDayClick }) => {
	const dayPosts = posts.filter((post) => {
		try {
			if (post.scheduledTime && isSameDay(new Date(post.scheduledTime), day)) {
				return true;
			}
			if (post.postedAt && isSameDay(new Date(post.postedAt), day)) {
				return true;
			}
			return false;
		} catch (error) {
			return false;
		}
	});

	const isCurrentMonth = isSameMonth(day, currentMonth);
	const isTodayDate = isToday(day);
	const isFirstDayOfMonth = day.getDate() === 1;

	// Count posts by status
	const postCounts = {
		posted: dayPosts.filter((post) => post.status === "posted").length,
		scheduled: dayPosts.filter((post) => post.status === "scheduled").length,
		failed: dayPosts.filter((post) => post.status === "failed").length,
	};

	const totalItems = dayPosts.length;

	const handleClick = () => {
		if (totalItems > 0) {
			onDayClick(day, dayPosts);
		}
	};

	return (
		<div
			onClick={handleClick}
			className={`min-h-[100px] p-2 border-b border-neutral-200 transition-colors
				${isCurrentMonth ? "bg-white" : "bg-neutral-50"}
				${totalItems > 0 ? "cursor-pointer hover:bg-primary-50" : ""}
				${isTodayDate ? "ring-2 ring-primary-400 ring-inset" : ""}
			`}
		>
			<div
				className={`text-xs mb-1 font-medium
				${isCurrentMonth ? "text-neutral-700" : "text-neutral-400"}
				${isTodayDate ? "text-primary-600" : ""}
			`}
			>
				{isFirstDayOfMonth ? (
					<div className="flex flex-col">
						<span className="text-primary-500 text-[10px]">{format(day, "MMM")}</span>
						<span>{format(day, "d")}</span>
					</div>
				) : (
					format(day, "d")
				)}
			</div>

			{totalItems > 0 && (
				<div className="space-y-1 mt-1">
					{postCounts.posted > 0 && (
						<div className="bg-success-100 text-success-700 rounded px-1.5 py-0.5 text-[10px] flex items-center justify-between">
							<span>Posted</span>
							<span className="font-bold">{postCounts.posted}</span>
						</div>
					)}
					{postCounts.scheduled > 0 && (
						<div className="bg-warning-100 text-warning-700 rounded px-1.5 py-0.5 text-[10px] flex items-center justify-between">
							<span>Scheduled</span>
							<span className="font-bold">{postCounts.scheduled}</span>
						</div>
					)}
					{postCounts.failed > 0 && (
						<div className="bg-error-100 text-error-700 rounded px-1.5 py-0.5 text-[10px] flex items-center justify-between">
							<span>Failed</span>
							<span className="font-bold">{postCounts.failed}</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

// Month component
const CalendarMonth = ({ month, posts, onDayClick }) => {
	const firstDay = startOfMonth(month);
	const lastDay = endOfMonth(month);
	const days = eachDayOfInterval({ start: firstDay, end: lastDay });

	return (
		<div className="grid grid-cols-7 border border-neutral-200 rounded-lg overflow-hidden">
			{/* Day headers */}
			{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
				<div key={day} className="px-2 py-2 text-center text-xs font-medium bg-neutral-100 text-neutral-600 border-b border-neutral-200">
					{day}
				</div>
			))}

			{/* Empty cells for days before the start of the month */}
			{Array.from({ length: firstDay.getDay() }).map((_, index) => (
				<div key={`empty-start-${index}`} className="bg-neutral-50 border-b border-neutral-200 min-h-[100px]"></div>
			))}

			{/* Calendar days */}
			{days.map((day) => (
				<CalendarDay key={day.toString()} day={day} currentMonth={month} posts={posts} onDayClick={onDayClick} />
			))}

			{/* Empty cells for days after the end of the month */}
			{Array.from({ length: 6 - lastDay.getDay() }).map((_, index) => (
				<div key={`empty-end-${index}`} className="bg-neutral-50 border-b border-neutral-200 min-h-[100px]"></div>
			))}
		</div>
	);
};

// Post Modal component
const PostModal = ({ isOpen, onClose, date, posts }) => {
	if (!isOpen || !date) return null;

	const platformIcons = {
		youtube: "text-red-500",
		tiktok: "text-neutral-900",
		instagram: "text-pink-500",
		twitter: "text-sky-500",
		x: "text-neutral-900",
		facebook: "text-blue-600",
		linkedin: "text-blue-700",
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
			<div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
				<div className="p-4 border-b border-neutral-200 flex justify-between items-center">
					<div>
						<h2 className="text-lg font-semibold text-neutral-900">{format(date, "MMMM d, yyyy")}</h2>
						<p className="text-sm text-neutral-500">
							{posts.length} post{posts.length !== 1 ? "s" : ""}
						</p>
					</div>
					<button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 rounded-lg hover:bg-neutral-100">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
					{posts.map((post) => (
						<div
							key={post._id}
							className={`p-3 rounded-lg border ${
								post.status === "posted"
									? "bg-success-50 border-success-200"
									: post.status === "scheduled"
										? "bg-warning-50 border-warning-200"
										: "bg-error-50 border-error-200"
							}`}
						>
							<div className="flex items-start justify-between">
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-neutral-900 truncate">
										{post.metadata?.title || post.metadata?.caption || "Untitled Post"}
									</p>
									<div className="flex items-center gap-2 mt-1">
										<span className={`text-xs capitalize ${platformIcons[post.platform] || "text-neutral-600"}`}>{post.platform}</span>
										<span className="text-xs text-neutral-400">|</span>
										<span
											className={`text-xs capitalize ${
												post.status === "posted" ? "text-success-600" : post.status === "scheduled" ? "text-warning-600" : "text-error-600"
											}`}
										>
											{post.status}
										</span>
									</div>
									<p className="text-xs text-neutral-500 mt-1">
										{post.status === "posted" && post.postedAt
											? `Posted at ${format(new Date(post.postedAt), "h:mm a")}`
											: post.scheduledTime
												? `Scheduled for ${format(new Date(post.scheduledTime), "h:mm a")}`
												: ""}
									</p>
								</div>
								{post.postUrl && post.status === "posted" && (
									<a
										href={post.postUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary-500 hover:text-primary-600 text-xs flex items-center gap-1"
									>
										View
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									</a>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default function Calendar({ user }) {
	const { currentTeam } = useContext(TeamContext);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedDay, setSelectedDay] = useState(null);
	const [selectedDayPosts, setSelectedDayPosts] = useState([]);

	// Fetch posts for the current month
	const fetchPosts = useCallback(async () => {
		if (!currentTeam?._id || !currentTeam?.apiKey) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			const startDate = startOfMonth(currentDate);
			const endDate = endOfMonth(currentDate);

			const response = await fetch(`/api/posts/calendar?apiKey=${currentTeam.apiKey}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					teamId: currentTeam._id,
					startDate: startDate.toISOString(),
					endDate: endDate.toISOString(),
				}),
			});

			const data = await response.json();
			if (data.success) {
				setPosts(data.posts || []);
			}
		} catch (error) {
			console.error("Error fetching posts:", error);
		} finally {
			setLoading(false);
		}
	}, [currentTeam?._id, currentTeam?.apiKey, currentDate]);

	useEffect(() => {
		fetchPosts();
	}, [fetchPosts]);

	const goToPreviousMonth = () => {
		setCurrentDate(subMonths(currentDate, 1));
	};

	const goToNextMonth = () => {
		setCurrentDate(addMonths(currentDate, 1));
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	const handleDayClick = (day, dayPosts) => {
		setSelectedDay(day);
		setSelectedDayPosts(dayPosts);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	return (
		<>
			<Head>
				<title>Calendar | {PRODUCT_NAME}</title>
			</Head>

			<DashboardLayout>
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-2xl font-bold text-neutral-900">Calendar</h1>
							<p className="text-neutral-500 mt-1">View your scheduled and posted content</p>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={goToPreviousMonth}
								className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
							>
								<svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<button onClick={goToToday} className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium">
								Today
							</button>
							<button onClick={goToNextMonth} className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
								<svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					</div>

					{/* Current Month Title */}
					<div className="mb-4">
						<h2 className="text-xl font-semibold text-neutral-900">{format(currentDate, "MMMM yyyy")}</h2>
					</div>

					{/* Calendar */}
					{loading ? (
						<div className="flex justify-center items-center h-64">
							<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
						</div>
					) : (
						<CalendarMonth month={currentDate} posts={posts} onDayClick={handleDayClick} />
					)}

					{/* Legend */}
					<div className="mt-6 flex items-center gap-6">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-success-500"></div>
							<span className="text-sm text-neutral-600">Posted</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-warning-500"></div>
							<span className="text-sm text-neutral-600">Scheduled</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-error-500"></div>
							<span className="text-sm text-neutral-600">Failed</span>
						</div>
					</div>
				</div>

				{/* Post Modal */}
				<PostModal isOpen={modalOpen} onClose={closeModal} date={selectedDay} posts={selectedDayPosts} />
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
