"use client";
import { motion, useAnimation } from "framer-motion";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_TRANSITION = {
	duration: 0.6,
	opacity: { duration: 0.2 },
};

const PATH_VARIANTS = {
	normal: {
		pathLength: 1,
		opacity: 1,
	},
	animate: {
		opacity: [0, 1],
		pathLength: [0, 1],
	},
};

const GiftIcon = forwardRef(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
	const controls = useAnimation();
	const isControlledRef = useRef(false);

	useImperativeHandle(ref, () => {
		isControlledRef.current = true;

		return {
			startAnimation: () => controls.start("animate"),
			stopAnimation: () => controls.start("normal"),
		};
	});

	const handleMouseEnter = useCallback(
		(e) => {
			if (isControlledRef.current) {
				onMouseEnter?.(e);
			} else {
				controls.start("animate");
			}
		},
		[controls, onMouseEnter]
	);

	const handleMouseLeave = useCallback(
		(e) => {
			if (isControlledRef.current) {
				onMouseLeave?.(e);
			} else {
				controls.start("normal");
			}
		},
		[controls, onMouseLeave]
	);

	return (
		<div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
			<svg
				fill="none"
				height={size}
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				viewBox="0 0 24 24"
				width={size}
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M20 12v10H4V12" />
				<path d="M2 7h20v5H2z" />
				<motion.path animate={controls} d="M12 22V7" transition={DEFAULT_TRANSITION} variants={PATH_VARIANTS} />
				<motion.path
					animate={controls}
					d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"
					transition={DEFAULT_TRANSITION}
					variants={PATH_VARIANTS}
				/>
				<motion.path
					animate={controls}
					d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
					transition={DEFAULT_TRANSITION}
					variants={PATH_VARIANTS}
				/>
			</svg>
		</div>
	);
});

GiftIcon.displayName = "GiftIcon";

export { GiftIcon };
