/** @type {import('tailwindcss').Config} */

// Light mode primary colors (Orange theme - #ED6B2F)
const primaryColors = {
	50: "#FFF8F5",
	100: "#FFF0E8",
	200: "#FFE0D0",
	300: "#FFCAB0",
	400: "#ff4f01", // Primary orange
	500: "#ED6B2F",
	600: "#ED6B2F",
	700: "#D24304",
	800: "#7C310F",
	900: "#5E250B",
	950: "#3D1707",
};

module.exports = {
	mode: "jit",
	content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}", "./src/layout/**/*.{js,ts,jsx,tsx}"],
	// Light mode by default (no darkMode class)
	theme: {
		extend: {
			animation: {
				text: "text 5s ease infinite",
				shimmer: "shimmer 4s linear infinite",
				pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				spin: "spin 1s linear infinite",
			},
			keyframes: {
				text: {
					"0%, 100%": {
						"background-size": "200% 200%",
						"background-position": "left center",
					},
					"50%": {
						"background-size": "200% 200%",
						"background-position": "right center",
					},
				},
				shimmer: {
					from: { backgroundPosition: "0 0" },
					to: { backgroundPosition: "-200% 0" },
				},
			},
			colors: {
				primary: primaryColors,
				// Light mode backgrounds
				light: {
					50: "#ffffff", // Pure white - main background
					100: "#f9fafb", // Very light gray - card background
					200: "#f3f4f6", // Light gray - secondary background
					300: "#e5e7eb", // Border color
					400: "#d1d5db", // Muted elements
					500: "#9ca3af", // Placeholder text
					600: "#6b7280", // Secondary text
					700: "#4b5563", // Primary text muted
					800: "#374151", // Primary text
					900: "#1f2937", // Headings
				},
				// Dark text colors for light mode
				dark: {
					100: "#1f2937",
					200: "#374151",
					300: "#4b5563",
					400: "#6b7280",
					500: "#9ca3af",
				},
				// Status colors
				success: {
					50: "#f0fdf4",
					100: "#dcfce7",
					200: "#bbf7d0",
					300: "#86efac",
					400: "#4ade80",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
				},
				warning: {
					50: "#fffbeb",
					100: "#fef3c7",
					200: "#fde68a",
					300: "#fcd34d",
					400: "#fbbf24",
					500: "#f59e0b",
					600: "#d97706",
				},
				error: {
					50: "#fef2f2",
					100: "#fee2e2",
					200: "#fecaca",
					300: "#fca5a5",
					400: "#f87171",
					500: "#ef4444",
					600: "#dc2626",
					700: "#b91c1c",
				},
				info: {
					50: "#eff6ff",
					100: "#dbeafe",
					200: "#bfdbfe",
					300: "#93c5fd",
					400: "#60a5fa",
					500: "#3b82f6",
					600: "#2563eb",
				},
			},
			fontFamily: {
				primary: ["Degular", "sans-serif"],
				inter: ["Inter", "sans-serif"],
				secondary: ["Inter", "sans-serif"],
				sans: ["Degular", "sans-serif"],
			},
			boxShadow: {
				sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
				DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
				md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
				lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
				xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
			},
			borderRadius: {
				sm: "0.25rem",
				DEFAULT: "0.375rem",
				md: "0.5rem",
				lg: "0.75rem",
				xl: "1rem",
				"2xl": "1.5rem",
			},
		},
	},
	plugins: [require("@tailwindcss/forms")],
};
