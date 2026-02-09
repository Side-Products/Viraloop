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
	700: "#E65512",
	800: "#7C310F",
	900: "#5E250B",
	950: "#3D1707",
};

module.exports = {
    darkMode: ["class"],
    mode: "jit",
	content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}", "./src/layout/**/*.{js,ts,jsx,tsx}"],
	// Light mode by default (no darkMode class)
	theme: {
    	extend: {
    		animation: {
    			text: 'text 5s ease infinite',
    			shimmer: 'shimmer 4s linear infinite',
    			pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    			spin: 'spin 1s linear infinite',
    			'scroll-left': 'scroll-left linear infinite',
    			'scroll-right': 'scroll-right linear infinite'
    		},
    		keyframes: {
    			text: {
    				'0%, 100%': {
    					'background-size': '200% 200%',
    					'background-position': 'left center'
    				},
    				'50%': {
    					'background-size': '200% 200%',
    					'background-position': 'right center'
    				}
    			},
    			shimmer: {
    				from: {
    					backgroundPosition: '0 0'
    				},
    				to: {
    					backgroundPosition: '-200% 0'
    				}
    			},
    			'scroll-left': {
    				'0%': {
    					transform: 'translateX(0)'
    				},
    				'100%': {
    					transform: 'translateX(-50%)'
    				}
    			},
    			'scroll-right': {
    				'0%': {
    					transform: 'translateX(-50%)'
    				},
    				'100%': {
    					transform: 'translateX(0)'
    				}
    			}
    		},
    		colors: {
    			primary: primaryColors,
    			light: {
    				'50': '#ffffff',
    				'100': '#f9fafb',
    				'200': '#f3f4f6',
    				'300': '#e5e7eb',
    				'400': '#d1d5db',
    				'500': '#9ca3af',
    				'600': '#6b7280',
    				'700': '#4b5563',
    				'800': '#374151',
    				'900': '#1f2937'
    			},
    			dark: {
    				'100': '#1f2937',
    				'200': '#374151',
    				'300': '#4b5563',
    				'400': '#6b7280',
    				'500': '#9ca3af'
    			},
    			success: {
    				'50': '#f0fdf4',
    				'100': '#dcfce7',
    				'200': '#bbf7d0',
    				'300': '#86efac',
    				'400': '#4ade80',
    				'500': '#22c55e',
    				'600': '#16a34a',
    				'700': '#15803d'
    			},
    			warning: {
    				'50': '#fffbeb',
    				'100': '#fef3c7',
    				'200': '#fde68a',
    				'300': '#fcd34d',
    				'400': '#fbbf24',
    				'500': '#f59e0b',
    				'600': '#d97706'
    			},
    			error: {
    				'50': '#fef2f2',
    				'100': '#fee2e2',
    				'200': '#fecaca',
    				'300': '#fca5a5',
    				'400': '#f87171',
    				'500': '#ef4444',
    				'600': '#dc2626',
    				'700': '#b91c1c'
    			},
    			info: {
    				'50': '#eff6ff',
    				'100': '#dbeafe',
    				'200': '#bfdbfe',
    				'300': '#93c5fd',
    				'400': '#60a5fa',
    				'500': '#3b82f6',
    				'600': '#2563eb'
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		fontFamily: {
    			primary: [
    				'Degular',
    				'sans-serif'
    			],
    			secondary: [
    				'Inter',
    				'sans-serif'
    			],
    			inter: [
    				'Inter',
    				'sans-serif'
    			],
    			sans: [
    				'Degular',
    				'sans-serif'
    			]
    		},
    		boxShadow: {
    			sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    			DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    			md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    			lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    			xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
	plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
};
