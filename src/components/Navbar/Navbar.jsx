import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-light-50/80 backdrop-blur-md border-b border-light-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center gap-2">
						<Link href={isAuthenticated ? "/dashboard" : "/"}>
							<span className="text-xl font-bold text-dark-100 flex items-center justify-start">
								Viral<span className="text-primary-400 text-3xl mb-[-1px] flex">∞</span>p
							</span>
						</Link>
					</div>
					<div className="flex items-center gap-4">
						{isAuthenticated ? (
							<>
								<Link href="/dashboard" className="text-dark-300 hover:text-dark-100 transition-colors">
									Dashboard
								</Link>
								<button
									onClick={() => signOut({ callbackUrl: "/" })}
									className="btn btn-outline"
								>
									Logout
								</button>
							</>
						) : (
							<Link href="/login" className="btn btn-primary">
								Login
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
