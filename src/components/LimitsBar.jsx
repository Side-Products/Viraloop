import { useContext } from "react";
import { TeamContext } from "@/store/TeamContextProvider";
import Link from "next/link";

export default function LimitsBar() {
	const { currentTeam, loading, planInfo } = useContext(TeamContext);

	// Show skeleton loader while loading
	if (loading || !currentTeam?._id) {
		return (
			<div className="pt-2 animate-pulse">
				<div className="h-8 w-full bg-neutral-200 rounded-sm" />
			</div>
		);
	}

	const credits = currentTeam.credits || 0;
	const planName = planInfo.tier;
	const maxCredits = planInfo.maxCredits;
	const percentage = Math.min((credits / maxCredits) * 100, 100);

	// Show upgrade button if no credits
	if (credits <= 0) {
		return (
			<div className="pt-2">
				<Link href="/settings/billing" className="btn btn-primary w-full !text-xs !py-2 !px-3">
					<svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					Get Credits
				</Link>
			</div>
		);
	}

	// Determine color based on percentage
	const isLow = percentage <= 15;
	const isMedium = percentage > 15 && percentage <= 40;

	const progressColor = isLow ? "bg-error-500" : isMedium ? "bg-warning-500" : "bg-primary-500";
	const textColor = isLow ? "text-error-500" : isMedium ? "text-warning-500" : "text-primary-500";

	return (
		<div className="px-3 pt-3">
			<div className="flex items-center justify-between mb-1.5">
				<span className="text-xs text-neutral-500">Credits left</span>
				<span className={`text-xs font-medium ${textColor}`}>
					{credits}/{maxCredits}
				</span>
			</div>
			{/* Progress Bar */}
			<div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
				<div
					className={`h-full ${progressColor} rounded-full transition-all duration-300`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<div className="flex items-center justify-between mt-1.5">
				<span className="text-xs text-neutral-500">{planName} Plan</span>
				<Link href="/settings/billing" className="hover:underline text-xs text-primary-500 hover:text-primary-600 flex items-center gap-[2px]">
					<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					Upgrade
				</Link>
			</div>
		</div>
	);
}
