import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/chevron-right";

/**
 * CTA Section Component
 * Modern, engaging call-to-action section with gradient background
 * Customized for Viraloop - AI Influencer Platform
 */
export default function CTASection() {
	return (
		<section className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-28 max-w-6xl">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 rounded-3xl p-8 md:p-12 lg:p-16"
			>
				{/* Animated background pattern */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
				</div>

				{/* Decorative blobs */}
				<div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-700/20 rounded-full blur-3xl"></div>

				<div className="relative z-10 text-center">
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						whileInView={{ scale: 1, opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
					>
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">Ready to Create Your AI Influencer?</h2>
						<p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
							Start creating AI influencers that post automatically to TikTok, Instagram, and YouTube with Viraloop
						</p>
					</motion.div>

					<motion.div
						initial={{ y: 20, opacity: 0 }}
						whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.4 }}
						className="flex flex-col sm:flex-row items-center justify-center gap-4"
					>
						<Link
							href="/influencers"
							className="group relative inline-flex items-center px-8 py-4 bg-white text-primary-600 hover:text-primary-600 font-bold rounded-xl hover:bg-light-100 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 overflow-hidden"
						>
							<span className="relative z-10 flex items-center">
								Create AI Influencer
								<ChevronRightIcon size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
							</span>
							<div className="absolute inset-0 bg-gradient-to-r from-white to-light-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
						</Link>

						<Link
							href="/pricing"
							className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 hover:border-white/40"
						>
							View Pricing
							<svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</Link>
					</motion.div>

					{/* Trust indicators */}
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.6 }}
						className="mt-10 flex flex-wrap items-center sm:justify-center justify-start gap-6 text-white/80 text-sm"
					>
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							<span>Instant Access</span>
						</div>
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							<span>No credit card required to sign up</span>
						</div>

						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							<span>Cancel anytime</span>
						</div>
					</motion.div>
				</div>
			</motion.div>
		</section>
	);
}
