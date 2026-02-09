"use client";
import { motion, useAnimation } from "framer-motion";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

const LinkIcon = forwardRef(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
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
				<motion.g
					animate={controls}
					initial="normal"
					variants={{
						normal: { x: 0, y: 0 },
						animate: { x: [0, -1, 0], y: [0, 1, 0], transition: { duration: 0.4 } },
					}}
				>
					<path d="M9 17H7A5 5 0 0 1 7 7h2" />
				</motion.g>
				<motion.g
					animate={controls}
					initial="normal"
					variants={{
						normal: { x: 0, y: 0 },
						animate: { x: [0, 1, 0], y: [0, -1, 0], transition: { duration: 0.4 } },
					}}
				>
					<path d="M15 7h2a5 5 0 1 1 0 10h-2" />
				</motion.g>
				<line x1="8" x2="16" y1="12" y2="12" />
			</svg>
		</div>
	);
});

LinkIcon.displayName = "LinkIcon";

export { LinkIcon };
