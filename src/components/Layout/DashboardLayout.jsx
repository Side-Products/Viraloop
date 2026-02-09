import { useState, useContext, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { TeamContext } from "@/store/TeamContextProvider";
import TeamSelector from "@/components/TeamSelector";
import { HomeIcon } from "@/components/ui/home";
import { SmilePlusIcon } from "@/components/ui/smile-plus";
import { PlusIcon } from "@/components/ui/plus";
import { FileStackIcon } from "@/components/ui/file-stack";
import { InfinityIcon } from "@/components/ui/infinity";
import { CalendarCheckIcon } from "@/components/ui/calendar-check";
import { InstagramIcon } from "@/components/ui/instagram";
import { ChartSplineIcon } from "@/components/ui/chart-spline";
import { SettingsIcon } from "@/components/ui/settings";
import { LogoutIcon } from "@/components/ui/logout";

export default function DashboardLayout({ children }) {
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { teams, currentTeam, onCurrentTeamChange, loading: teamsLoading } = useContext(TeamContext);

	// Icon refs for controlled animations
	const dashboardIconRef = useRef(null);
	const influencersIconRef = useRef(null);
	const createIconRef = useRef(null);
	const postsIconRef = useRef(null);
	const loopsIconRef = useRef(null);
	const calendarIconRef = useRef(null);
	const accountsIconRef = useRef(null);
	const analyticsIconRef = useRef(null);
	const settingsIconRef = useRef(null);
	const logoutIconRef = useRef(null);

	const isActive = (href) => router.pathname === href;

	const handleTeamChange = (selectedTeam) => {
		if (selectedTeam) {
			onCurrentTeamChange(selectedTeam);
			router.reload();
		}
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Mobile sidebar backdrop */}
			{sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 z-50 h-full w-56 bg-light-50 border-r border-neutral-200 transform transition-transform lg:translate-x-0 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center gap-3 px-6 h-16 border-b border-neutral-200">
						<Link href="/" className="cursor-pointer">
							<span className="text-xl font-bold text-dark-100 flex items-center justify-start">
								Viral<span className="text-primary-400 text-3xl mb-[-1px] flex">∞</span>p
							</span>
						</Link>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
						<Link
							href="/dashboard"
							className={`font-secondary text-sm font-regular flex items-center gap-3 px-3 py-2 rounded transition-colors cursor-pointer ${
								isActive("/dashboard") ? "bg-primary-200/70 text-primary-400" : "hover:bg-neutral-200/70 hover:text-dark-100"
							}`}
							onMouseEnter={() => dashboardIconRef.current?.startAnimation()}
							onMouseLeave={() => dashboardIconRef.current?.stopAnimation()}
						>
							<HomeIcon ref={dashboardIconRef} size={20} />
							<span className="font-medium">Dashboard</span>
						</Link>
						<Link
							href="/influencers"
							className={`font-secondary text-sm font-regular flex items-center gap-3 px-3 py-2 rounded transition-colors cursor-pointer ${
								isActive("/influencers") ? "bg-primary-200/70 text-primary-400" : "hover:bg-neutral-200/70 hover:text-dark-100"
							}`}
							onMouseEnter={() => influencersIconRef.current?.startAnimation()}
							onMouseLeave={() => influencersIconRef.current?.stopAnimation()}
						>
							<SmilePlusIcon ref={influencersIconRef} size={20} />
							<span className="font-medium">Influencers</span>
						</Link>
						<Link
							href="/create"
							className={`font-secondary text-sm font-regular flex items-center gap-3 px-3 py-2 rounded transition-colors cursor-pointer ${
								isActive("/create") ? "bg-primary-200/70 text-primary-400" : "hover:bg-neutral-200/70 hover:text-dark-100"
							}`}
							onMouseEnter={() => createIconRef.current?.startAnimation()}
							onMouseLeave={() => createIconRef.current?.stopAnimation()}
						>
							<PlusIcon ref={createIconRef} size={20} />
							<span className="font-medium">Create</span>
						</Link>
						<Link
							href="/posts"
							className={`font-secondary text-sm font-regular flex items-center gap-3 px-3 py-2 rounded transition-colors cursor-pointer ${
								isActive("/posts") ? "bg-primary-200/70 text-primary-400" : "hover:bg-neutral-200/70 hover:text-dark-100"
							}`}
							onMouseEnter={() => postsIconRef.current?.startAnimation()}
							onMouseLeave={() => postsIconRef.current?.stopAnimation()}
						>
							<FileStackIcon ref={postsIconRef} size={20} />
							<span className="font-medium">Posts</span>
						</Link>
						<Link
							href="/loops"
							className={`font-secondary text-sm font-regular flex items-center gap-3 px-3 py-2 rounded transition-colors cursor-pointer ${
								isActive("/loops") ? "bg-primary-200/70 text-primary-400" : "hover:bg-neutral-200/70 hover:text-dark-100"
							}`}
							onMouseEnter={() => loopsIconRef.current?.startAnimation()}
							onMouseLeave={() => loopsIconRef.current?.stopAnimation()}
						>
							<InfinityIcon ref={loopsIconRef} size={20} />
							<span className="font-medium">Loops</span>
						</Link>
						<Link
							href="/calendar"
							className={`font-secondary text-sm font-regular flex items-center gap-3 px-3 py-2 rounded transition-colors cursor-pointer ${
								isActive("/calendar") ? "bg-primary-200/70 text-primary-400" : "hover:bg-neutral-200/70 hover:text-dark-100"
							}`}
							onMouseEnter={() => calendarIconRef.current?.startAnimation()}
							onMouseLeave={() => calendarIconRef.current?.stopAnimation()}
						>
							<CalendarCheckIcon ref={calendarIconRef} size={20} />
							<span className="font-medium">Calendar</span>
						</Link>
						<Link
							href="/accounts"
							className={`font-secondary text-sm font-regular flex items-center gap-3 px-3 py-2 rounded transition-colors cursor-pointer ${
								isActive("/accounts") ? "bg-primary-200/70 text-primary-400" : "hover:bg-neutral-200/70 hover:text-dark-100"
							}`}
							onMouseEnter={() => accountsIconRef.current?.startAnimation()}
							onMouseLeave={() => accountsIconRef.current?.stopAnimation()}
						>
							<InstagramIcon ref={accountsIconRef} size={20} />
							<span className="font-medium">Accounts</span>
						</Link>
						<Link
							href="/analytics"
							className={`font-secondary text-sm font-regular flex items-center gap-3 px-3 py-2 rounded transition-colors cursor-pointer ${
								isActive("/analytics") ? "bg-primary-200/70 text-primary-400" : "hover:bg-neutral-200/70 hover:text-dark-100"
							}`}
							onMouseEnter={() => analyticsIconRef.current?.startAnimation()}
							onMouseLeave={() => analyticsIconRef.current?.stopAnimation()}
						>
							<ChartSplineIcon ref={analyticsIconRef} size={20} />
							<span className="font-medium">Analytics</span>
						</Link>
					</nav>

					{/* Bottom navigation */}
					<div className="px-3 py-4 border-t border-light-200 space-y-1 overflow-visible">
						{/* Team Dropdown */}
						<div className="pb-3 mb-2 border-b border-light-200 overflow-visible">
							<TeamSelector
								id="sidebar-team-selector"
								teams={teams}
								currentTeam={currentTeam}
								onTeamChange={handleTeamChange}
								isLoading={teamsLoading}
							/>
						</div>

						<Link
							href="/settings"
							className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
								isActive("/settings") ? "bg-primary-100 text-primary-700" : "text-dark-300 hover:bg-light-200 hover:text-dark-100"
							}`}
							onMouseEnter={() => settingsIconRef.current?.startAnimation()}
							onMouseLeave={() => settingsIconRef.current?.stopAnimation()}
						>
							<SettingsIcon ref={settingsIconRef} size={20} />
							<span className="font-medium">Settings</span>
						</Link>
						<button
							onClick={() => signOut({ callbackUrl: "/" })}
							className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:bg-error-100 hover:text-error-600 transition-colors w-full cursor-pointer"
							onMouseEnter={() => logoutIconRef.current?.startAnimation()}
							onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
						>
							<LogoutIcon ref={logoutIconRef} size={20} />
							<span className="font-medium">Logout</span>
						</button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="lg:pl-64 flex flex-col h-screen">
				{/* Top bar remains fixed, does not scroll with page content */}
				<div className="fixed left-0 right-0 lg:left-56 top-0 z-10 flex items-center gap-3 px-6 h-16 border-b border-neutral-200 bg-white"></div>
				{/* Page content */}
				<main className="flex-1 min-h-0 overflow-y-auto pt-16">{children}</main>
			</div>
		</div>
	);
}
