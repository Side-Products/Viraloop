import Head from "next/head";
import Link from "next/link";
import { PRODUCT_NAME } from "@/config/constants";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import { IoVideocamOutline } from "react-icons/io5";

export default function Home() {
	return (
		<>
			<Head>
				<title>{PRODUCT_NAME} - AI Influencers That Make Viral Videos on Loop</title>
				<meta
					name="description"
					content="Create AI influencers and generate viral videos automatically. Post to TikTok, Instagram, and YouTube on autopilot."
				/>
			</Head>

			<div className="min-h-screen bg-gradient-to-br from-light-50 via-primary-50 to-light-100">

				{/* Hero Section */}
				<main className="pb-20 px-4 min-h-screen flex justify-center items-center">
					<div className="max-w-5xl mx-auto text-center">
						<div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
							</span>
							Now with Veo 3.1 Video Generation
						</div>

						<h1 className="text-5xl md:text-7xl font-bold text-dark-100 leading-tight mb-6 tracking-tight">
							Create your own AI Influencers
							<div className="text-7xl">
								Make <span className="gradient-text"> Viral Videos </span>
								on L
								<span className="text-primary-400 text-[80px] inline-block align-middle" style={{ marginBottom: "0px" }}>
									∞
								</span>
								p
							</div>
						</h1>

						<p className="font-secondary text-lg max-w-2xl mx-auto mb-10">
							AI-powered influencers that generate and auto-post viral content to{" "}
							<FaTiktok className="inline" style={{ verticalAlign: "-0.1em", color: "#00f2ea" }} />
							<FaTiktok
								className="inline"
								style={{ verticalAlign: "-0.1em", color: "#ff0050", marginLeft: "-0.9em", opacity: 0.8 }}
							/> TikTok, <FaInstagram className="inline" style={{ color: "#E4405F", verticalAlign: "-0.1em" }} /> Instagram, and{" "}
							<FaYoutube className="inline text-xl" style={{ color: "#FF0000", verticalAlign: "-0.15em" }} /> YouTube automatically. Set it up
							once, go viral forever.
						</p>

						<div className="flex flex-col sm:flex-row gap-6 justify-center mt-20">
							<Link href="/register" className="btn btn-primary !text-base !px-5 !py-3">
								<IoVideocamOutline className="w-7 h-7 mr-5" />
								Watch Demo Video
							</Link>
							<Link href="/register" className="btn btn-outline !text-base !px-5 !py-3">
								<img src="/google.png" alt="Google" className="w-7 h-7 mr-5" />
								Start free with Google
							</Link>
						</div>
					</div>
				</main>

				{/* Features Section */}
				<section className="py-20 bg-light-50">
					<div className="max-w-6xl mx-auto px-4">
						<h2 className="text-3xl md:text-4xl font-bold text-center text-dark-100 mb-12">Everything You Need to Go Viral</h2>

						<div className="grid md:grid-cols-3 gap-8">
							<div className="card p-6">
								<div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
									<svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
								</div>
								<h3 className="text-xl font-semibold text-dark-100 mb-2">AI Influencer Creation</h3>
								<p className="text-dark-400">
									Generate unique AI influencers with custom looks, voices, and personalities. Perfect for any niche.
								</p>
							</div>

							<div className="card p-6">
								<div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mb-4">
									<svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<h3 className="text-xl font-semibold text-dark-100 mb-2">Veo 3.1 Video Generation</h3>
								<p className="text-dark-400">
									Create stunning talking videos with the latest AI technology. Natural lip-sync and realistic movements.
								</p>
							</div>

							<div className="card p-6">
								<div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center mb-4">
									<svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								</div>
								<h3 className="text-xl font-semibold text-dark-100 mb-2">Loop Posting</h3>
								<p className="text-dark-400">Set up once and let it run forever. Automatically post to all platforms on your schedule.</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-primary-500">
					<div className="max-w-4xl mx-auto px-4 text-center">
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Create Your First AI Influencer?</h2>
						<p className="text-primary-100 text-lg mb-8">Join thousands of creators using Viraloop to build their social media empire.</p>
						<Link
							href="/register"
							className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors"
						>
							Get Started Free
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</Link>
					</div>
				</section>
			</div>
		</>
	);
}
