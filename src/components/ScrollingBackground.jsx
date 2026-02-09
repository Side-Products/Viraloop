// Sample images for the scrolling rows
const row1Images = [
	"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop",
];

const row2Images = [
	"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&h=600&fit=crop",
];

const row3Images = [
	"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=600&fit=crop",
	"https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400&h=600&fit=crop",
];

const ScrollingRow = ({ images, direction = "right", duration = "25s" }) => {
	const duplicatedImages = [...images, ...images, ...images];

	return (
		<div
			className={`flex gap-2 will-change-transform ${direction === "right" ? "animate-scroll-right" : "animate-scroll-left"}`}
			style={{ animationDuration: duration }}
		>
			{duplicatedImages.map((src, index) => (
				<div key={index} className="flex-shrink-0 w-28 h-44 sm:w-32 sm:h-52 rounded-xl overflow-hidden">
					<img
						alt="AI Influencer"
						loading={index < 8 ? "eager" : "lazy"}
						width={128}
						height={208}
						className="w-full h-full object-cover opacity-[0.1]"
						src={src}
					/>
				</div>
			))}
		</div>
	);
};

/**
 * Scrolling Background Component
 * @param {Object} props
 * @param {boolean} props.fadeTop - Whether to fade at the top (default: false)
 * @param {boolean} props.fadeBottom - Whether to fade at the bottom (default: true)
 */
export default function ScrollingBackground({ fadeTop = false, fadeBottom = true }) {
	// Build gradient based on props
	let gradient;
	if (fadeTop && fadeBottom) {
		gradient = "linear-gradient(to bottom, white 0%, transparent 20%, transparent 50%, rgba(255,255,255,0.6) 80%, rgba(255,255,255,0.85) 100%)";
	} else if (fadeTop) {
		gradient = "linear-gradient(to bottom, white 0%, transparent 20%, transparent 100%)";
	} else if (fadeBottom) {
		gradient = "linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(255,255,255,0.8) 70%, white 100%)";
	} else {
		gradient = "none";
	}

	return (
		<div className="absolute inset-0 overflow-hidden">
			<div className="relative h-full">
				{/* Gradient overlay */}
				<div
					className="absolute inset-0 z-10 pointer-events-none"
					style={{ background: gradient }}
				></div>

				{/* Slanted container for scrolling rows */}
				<div
					className="absolute space-y-2 pt-16"
					style={{
						transform: "rotate(-8deg) scale(1.3)",
						transformOrigin: "top center",
						width: "140%",
						left: "-20%",
						top: "-10%"
					}}
				>
					<ScrollingRow images={row1Images} direction="right" duration="30s" />
					<ScrollingRow images={row2Images} direction="left" duration="35s" />
					<ScrollingRow images={row3Images} direction="right" duration="28s" />
				</div>
			</div>
		</div>
	);
}
