import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { PRODUCT_NAME } from "@/config/constants";
import { User, Users, CreditCard } from "lucide-react";

const settingsNav = [
	{
		name: "Team",
		href: "/settings/team",
		icon: Users,
		description: "Manage your workspace",
	},
	{
		name: "Profile",
		href: "/settings/profile",
		icon: User,
		description: "Your personal information",
	},
	{
		name: "Billing",
		href: "/settings/billing",
		icon: CreditCard,
		description: "Plans and payments",
	},
];

export default function SettingsLayout({ children, title = "Settings" }) {
	const router = useRouter();

	const isActive = (href) => router.pathname === href;

	return (
		<DashboardLayout>
			<Head>
				<title>{title} - {PRODUCT_NAME}</title>
			</Head>

			<div className="px-6 py-8">
				{/* Header */}
				<h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
				<p className="text-neutral-500 mb-6">Manage your account, team, and preferences</p>

				{/* Navigation Tabs */}
				<div className="border-b border-light-300 mb-8">
					<nav className="flex gap-1 -mb-px">
						{settingsNav.map((item) => {
							const Icon = item.icon;
							const active = isActive(item.href);
							return (
								<Link
									key={item.name}
									href={item.href}
									className={`group flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
										active
											? "border-primary-400 text-primary-500"
											: "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-light-400"
									}`}
								>
									<Icon className={`w-4 h-4 ${active ? "text-primary-500" : "text-neutral-400 group-hover:text-neutral-600"}`} />
									{item.name}
								</Link>
							);
						})}
					</nav>
				</div>

				{/* Page Content */}
				{children}
			</div>
		</DashboardLayout>
	);
}
