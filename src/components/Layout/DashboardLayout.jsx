import { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { PRODUCT_NAME } from "@/config/constants";
import { TeamContext } from "@/store/TeamContextProvider";

const navigation = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
				/>
			</svg>
		),
	},
	{
		name: "Influencers",
		href: "/influencers",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
		),
	},
	{
		name: "Posts",
		href: "/posts",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
				/>
			</svg>
		),
	},
	{
		name: "Schedule",
		href: "/schedule",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
	{
		name: "Accounts",
		href: "/accounts",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
				/>
			</svg>
		),
	},
	{
		name: "Analytics",
		href: "/analytics",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
				/>
			</svg>
		),
	},
];

const bottomNavigation = [
	{
		name: "Settings",
		href: "/settings",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		),
	},
];

export default function DashboardLayout({ children }) {
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { teams, currentTeam, onCurrentTeamChange, loading: teamsLoading } = useContext(TeamContext);

	const isActive = (href) => router.pathname === href;

	const handleTeamChange = (e) => {
		const selectedTeam = teams.find((team) => team._id === e.target.value);
		if (selectedTeam) {
			onCurrentTeamChange(selectedTeam);
			// Refresh the page to reload data for the new team
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
						<span className="text-xl font-bold text-dark-100 flex items-center justify-start">
							Viral<span className="text-primary-400 text-3xl mb-[-1px] flex">∞</span>p
						</span>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
						{navigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={`font-secondary text-sm font-regular flex items-center gap-3 px-3 py-2 rounded transition-colors ${
									isActive(item.href) ? "bg-primary-200/70 text-primary-400" : "hover:bg-neutral-200/70 hover:text-dark-100"
								}`}
							>
								{item.icon}
								<span className="font-medium">{item.name}</span>
							</Link>
						))}
					</nav>

					{/* Bottom navigation */}
					<div className="px-3 py-4 border-t border-light-200 space-y-1">
						{/* Team Dropdown */}
						<div className="pb-3 mb-2 border-b border-light-200">
							<label className="text-xs font-medium text-dark-400 mb-1 block">Team</label>
							{teamsLoading ? (
								<div className="w-full h-9 bg-light-100 rounded-lg animate-pulse"></div>
							) : (
								<select
									value={currentTeam?._id || ""}
									onChange={handleTeamChange}
									className="w-full px-3 py-2 text-xs font-medium text-dark-100 bg-light-100 border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent cursor-pointer hover:bg-light-200 transition-colors appearance-none !pr-8"
									style={{
										backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
										backgroundRepeat: "no-repeat",
										backgroundPosition: "right 0.5rem center",
										backgroundSize: "1.25rem",
									}}
								>
									{teams.map((team) => (
										<option key={team._id} value={team._id}>
											{team.name}
										</option>
									))}
								</select>
							)}
						</div>

						{bottomNavigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
									isActive(item.href) ? "bg-primary-100 text-primary-700" : "text-dark-300 hover:bg-light-200 hover:text-dark-100"
								}`}
							>
								{item.icon}
								<span className="font-medium">{item.name}</span>
							</Link>
						))}
						<button
							onClick={() => signOut({ callbackUrl: "/" })}
							className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:bg-error-100 hover:text-error-600 transition-colors w-full"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
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
