import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { HomeIcon } from "@/components/ui/home";
import { UsersIcon } from "@/components/ui/users";
import { UserIcon } from "@/components/ui/user";
import { CircleDollarSignIcon } from "@/components/ui/circle-dollar-sign";
import { SparklesIcon } from "@/components/ui/sparkles";
import { LogoutIcon } from "@/components/ui/logout";

export default function Navbar() {
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Icon refs for controlled animations
	const dashboardIconRef = useRef(null);
	const teamIconRef = useRef(null);
	const billingIconRef = useRef(null);
	const profileIconRef = useRef(null);
	const spinIconRef = useRef(null);
	const logoutIconRef = useRef(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 pt-4 px-4">
			<div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-md rounded-full pl-6 pr-3 shadow-sm border border-white/50">
				<div className="flex justify-between items-center h-14">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<Link href={isAuthenticated ? "/dashboard" : "/"}>
							<span className="text-xl font-bold text-dark-100 flex items-center justify-start">
							Viral<span className="text-primary-400 text-[28px] mb-[-1px] flex">∞</span>p
							</span>
						</Link>
					</div>

					{/* Center Navigation Links */}
					<div className="hidden md:flex items-center gap-8 font-secondary text-sm">
						<Link href="/" className="text-dark-100 hover:text-primary-500 transition-colors font-medium">
							Home
						</Link>
						<Link href="/affiliate" className="text-dark-100 hover:text-primary-500 transition-colors font-medium">
							Affiliate
						</Link>
						<Link href="/pricing" className="text-dark-100 hover:text-primary-500 transition-colors font-medium">
							Pricing
						</Link>
						<Link href="/blog" className="text-dark-100 hover:text-primary-500 transition-colors font-medium">
							Blog
						</Link>
					</div>

					{/* Right Side */}
					<div className="flex items-center gap-4">
						{isAuthenticated ? (
							<div className="relative" ref={dropdownRef}>
								<button
									onClick={() => setDropdownOpen(!dropdownOpen)}
									className="flex items-center gap-2 bg-transparent rounded-full pl-4 pr-1 py-1 hover:bg-gray-100 transition-colors"
								>
									<span className="text-dark-100 text-sm font-medium">
										{session?.user?.name?.split(" ")[0] || "User"}
									</span>
									<img
										src={session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "User")}&background=random`}
										alt={session?.user?.name || "User"}
										className="w-8 h-8 rounded-full object-cover"
										referrerPolicy="no-referrer"
									/>
								</button>

								{/* Dropdown Menu */}
								{dropdownOpen && (
									<div className="absolute right-0 mt-2 w-56 bg-neutral-900 rounded-xl shadow-xl py-2 z-50">
										{/* Menu Items */}
										<div>
											<Link
												href="/dashboard"
												className="flex items-center gap-3 px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors text-sm cursor-pointer"
												onClick={() => setDropdownOpen(false)}
												onMouseEnter={() => dashboardIconRef.current?.startAnimation()}
												onMouseLeave={() => dashboardIconRef.current?.stopAnimation()}
											>
												<HomeIcon ref={dashboardIconRef} size={20} />
												Dashboard
											</Link>
											<Link
												href="/settings/team"
												className="flex items-center gap-3 px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors text-sm cursor-pointer"
												onClick={() => setDropdownOpen(false)}
												onMouseEnter={() => teamIconRef.current?.startAnimation()}
												onMouseLeave={() => teamIconRef.current?.stopAnimation()}
											>
												<UsersIcon ref={teamIconRef} size={20} />
												Team
											</Link>
											<Link
												href="/settings/billing"
												className="flex items-center gap-3 px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors text-sm cursor-pointer"
												onClick={() => setDropdownOpen(false)}
												onMouseEnter={() => billingIconRef.current?.startAnimation()}
												onMouseLeave={() => billingIconRef.current?.stopAnimation()}
											>
												<CircleDollarSignIcon ref={billingIconRef} size={20} />
												Billing
											</Link>
											<Link
												href="/settings/profile"
												className="flex items-center gap-3 px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors text-sm cursor-pointer"
												onClick={() => setDropdownOpen(false)}
												onMouseEnter={() => profileIconRef.current?.startAnimation()}
												onMouseLeave={() => profileIconRef.current?.stopAnimation()}
											>
												<UserIcon ref={profileIconRef} size={20} />
												Profile
											</Link>
											<Link
												href="/spin"
												className="flex items-center gap-3 px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors text-sm cursor-pointer"
												onClick={() => setDropdownOpen(false)}
												onMouseEnter={() => spinIconRef.current?.startAnimation()}
												onMouseLeave={() => spinIconRef.current?.stopAnimation()}
											>
												<SparklesIcon ref={spinIconRef} size={20} />
												Spin & Win
											</Link>
										</div>

										{/* Logout */}
										<div className="pt-1 border-t border-neutral-700/30 mt-1">
											<button
												onClick={() => signOut({ callbackUrl: "/" })}
												className="flex items-center gap-3 px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors text-sm w-full cursor-pointer"
												onMouseEnter={() => logoutIconRef.current?.startAnimation()}
												onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
											>
												<LogoutIcon ref={logoutIconRef} size={20} />
												Logout
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<Link
								href="/login"
								className="btn btn-primary !px-5 !py-2 !rounded-full"
							>
								Login
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
