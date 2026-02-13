import { useContext } from "react";
import { TeamContext } from "@/store/TeamContextProvider";
import Link from "next/link";

const ProgressBar = ({ used, limit, label }) => {
	const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
	const isNearLimit = percentage >= 80;
	const isAtLimit = percentage >= 100;

	return (
		<div className="space-y-1">
			<div className="flex justify-between text-xs">
				<span className="text-neutral-500">{label}</span>
				<span className={`font-medium ${isAtLimit ? "text-error-500" : isNearLimit ? "text-warning-500" : "text-neutral-600"}`}>
					{used}/{limit === 0 ? "0" : limit}
				</span>
			</div>
			<div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-300 ${
						isAtLimit ? "bg-error-500" : isNearLimit ? "bg-warning-500" : "bg-primary-400"
					}`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
};

export default function LimitsBar() {
	const { currentTeam, loading } = useContext(TeamContext);

	if (loading || !currentTeam?._id) {
		return null;
	}

	const { influencersCount = 0, influencerLimit = 0, imagesUsedThisMonth = 0, imageLimit = 0, videosUsedThisMonth = 0, videoLimit = 0 } = currentTeam;

	// Don't show if no limits are set (free tier with no access)
	const hasAnyLimit = influencerLimit > 0 || imageLimit > 0 || videoLimit > 0;

	if (!hasAnyLimit) {
		return (
			<div className="py-2">
				<Link href="/settings/billing" className="btn btn-primary w-full !text-xs !py-2 !px-3">
					<svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					Upgrade Plan
				</Link>
			</div>
		);
	}

	return (
		<div className="px-3 py-3 space-y-3">
			<ProgressBar used={influencersCount} limit={influencerLimit} label="Influencers" />
			<ProgressBar used={imagesUsedThisMonth} limit={imageLimit} label="Images" />
			<ProgressBar used={videosUsedThisMonth} limit={videoLimit} label="Videos" />
		</div>
	);
}
