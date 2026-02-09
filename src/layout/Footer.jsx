import Link from "next/link";
import { PRODUCT_NAME, SOCIAL_LINKS, CONTACT_EMAIL } from "@/config/constants";

const footerSections = [
	{
		title: "Company",
		links: [
			{ name: "Pricing", href: "/pricing" },
			{ name: "Terms of Use", href: "/terms" },
			{ name: "Privacy Policy", href: "/privacy" },
		],
	},
	{
		title: "Product",
		links: [
			{ name: "Dashboard", href: "/dashboard" },
			{ name: "Create Influencer", href: "/dashboard/influencers/create" },
			{ name: "My Posts", href: "/dashboard/posts" },
		],
	},
	{
		title: "Resources",
		links: [
			{ name: "Blog", href: "/blog" },
			{ name: "Help Center", href: "/help" },
			{ name: "Contact Us", href: `mailto:${CONTACT_EMAIL}` },
		],
	},
];

const Footer = () => {
	return (
		<footer className="relative bg-neutral-900 text-neutral-300 overflow-hidden">
			{/* Content */}
			<div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-12">
				{/* Top Row - Logo and Social Icons */}
				<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 sm:mb-12 pb-8 border-b border-neutral-700/30">
					{/* Logo */}
					<div className="mb-6 lg:mb-0">
						<Link href="/" aria-label="Home" className="inline-block">
							<span className="text-2xl font-bold text-white flex items-center justify-start">
								Viral<span className="text-primary-400 text-4xl mb-[-1px] flex">∞</span>p
							</span>
						</Link>
						{/* Copyright */}
						<p className="mt-2 text-xs text-neutral-500">© {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.</p>

						{/* Social Icons - Mobile */}
						<div className="flex items-center gap-4 mt-6 lg:hidden">
							<a
								href={SOCIAL_LINKS.twitter}
								target="_blank"
								rel="noopener noreferrer"
								className="text-neutral-500 hover:text-white transition-colors duration-200"
								aria-label="Follow us on X"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
								</svg>
							</a>
							<a
								href={SOCIAL_LINKS.instagram}
								target="_blank"
								rel="noopener noreferrer"
								className="text-neutral-500 hover:text-pink-500 transition-colors duration-200"
								aria-label="Follow us on Instagram"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
								</svg>
							</a>
							<a
								href={SOCIAL_LINKS.tiktok}
								target="_blank"
								rel="noopener noreferrer"
								className="text-neutral-500 hover:text-white transition-colors duration-200"
								aria-label="Follow us on TikTok"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
								</svg>
							</a>
							<a
								href={SOCIAL_LINKS.youtube}
								target="_blank"
								rel="noopener noreferrer"
								className="text-neutral-500 hover:text-red-500 transition-colors duration-200"
								aria-label="Subscribe on YouTube"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
								</svg>
							</a>
						</div>
					</div>

					{/* Social Icons - Desktop */}
					<div className="hidden lg:flex items-center gap-4">
						<a
							href={SOCIAL_LINKS.twitter}
							target="_blank"
							rel="noopener noreferrer"
							className="text-neutral-500 hover:text-white transition-colors duration-200"
							aria-label="Follow us on X"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						</a>
						<a
							href={SOCIAL_LINKS.instagram}
							target="_blank"
							rel="noopener noreferrer"
							className="text-neutral-500 hover:text-pink-500 transition-colors duration-200"
							aria-label="Follow us on Instagram"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
							</svg>
						</a>
						<a
							href={SOCIAL_LINKS.tiktok}
							target="_blank"
							rel="noopener noreferrer"
							className="text-neutral-500 hover:text-white transition-colors duration-200"
							aria-label="Follow us on TikTok"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
							</svg>
						</a>
						<a
							href={SOCIAL_LINKS.youtube}
							target="_blank"
							rel="noopener noreferrer"
							className="text-neutral-500 hover:text-red-500 transition-colors duration-200"
							aria-label="Subscribe on YouTube"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
							</svg>
						</a>
					</div>
				</div>

				{/* Main Grid Layout */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 mb-12">
					{/* Footer Sections */}
					{footerSections.map((section) => (
						<div key={section.title}>
							<h3 className="text-neutral-500 font-semibold mb-4 text-sm">{section.title}</h3>
							<ul className="space-y-3">
								{section.links.map((link) => (
									<li key={link.name}>
										{link.href.startsWith("mailto:") || link.href.startsWith("http") ? (
											<a
												href={link.href}
												target={link.href.startsWith("http") ? "_blank" : undefined}
												rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
												className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
											>
												{link.name}
											</a>
										) : (
											<Link href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors duration-200">
												{link.name}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>

			{/* Large Watermark Text - Behind content */}
			<div className="w-full flex justify-center items-center text-center pointer-events-none select-none overflow-hidden">
				<div
					className="font-black leading-none tracking-tighter w-full bg-gradient-to-b from-neutral-700/60 to-neutral-900 bg-clip-text text-transparent px-4"
					style={{
						WebkitTextStroke: "1px rgba(255,255,255,0.02)",
						fontSize: "clamp(5rem, 20vw, 22rem)",
					}}
				>
					VIRALOOP
				</div>
			</div>

			{/* Black overlay gradient from bottom to top */}
			<div className="absolute bottom-0 left-0 right-0 h-[80%] bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
		</footer>
	);
};

export default Footer;
