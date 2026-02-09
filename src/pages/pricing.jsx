import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { PRODUCT_NAME } from "@/config/constants";
import Pricing from "@/components/Pricing";

export default function PricingPage() {
	return (
		<>
			<Head>
				<title>Pricing - {PRODUCT_NAME}</title>
				<meta name="description" content={`Simple, transparent pricing for ${PRODUCT_NAME}. Choose the perfect plan for your AI influencer journey.`} />
			</Head>

			<div className="min-h-screen bg-gradient-to-br from-light-50 via-primary-50/30 to-light-100">
				<div className="max-w-7xl mx-auto px-2 sm:px-4 py-16 sm:py-24">
					<PricingSection />
				</div>

				<div className="max-w-3xl mx-auto px-4 pb-20">
					<FAQ />
				</div>
			</div>
		</>
	);
}

function PricingSection() {
	return (
		<div className="w-full">
			{/* Header */}
			<div className="mx-auto max-w-screen-lg text-center mb-12 mt-8">
				<motion.span
					className="inline-block px-4 py-1.5 bg-primary-100 text-primary-600 text-sm font-medium rounded-full mb-4"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
				>
					SIMPLE, TRANSPARENT PRICING
				</motion.span>

				<motion.h1
					className="mb-4 text-3xl md:text-6xl tracking-tight font-bold text-neutral-900"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					Choose the Perfect Plan for Your<br/><span className="text-primary-400">AI Influencers</span>
				</motion.h1>

				{/* Social proof section */}
				<div className="flex flex-col items-center justify-center text-center mb-8 mt-2">
					<p className="text-neutral-500 text-base italic mb-8">
						Get 2 months free on yearly pricing. You can cancel your subscription anytime.
					</p>

					<div className="flex flex-col items-center gap-4">
						{/* Avatar stack with stars */}
						<div className="flex items-center gap-4">
							<div className="flex -space-x-3">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div
										key={i}
										className="w-10 h-10 rounded-full border-2 border-white bg-light-200 overflow-hidden shadow-sm"
									>
										<img
											src={`/pricing/${i}.jpg`}
											alt={`Creator ${i}`}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.target.style.display = "none";
											}}
										/>
									</div>
								))}
							</div>

							{/* 5 Stars */}
							<div className="flex items-center gap-1">
								{[1, 2, 3, 4, 5].map((i) => (
									<svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
							</div>
						</div>

						{/* Trust text */}
						<p className="text-neutral-500 text-sm">
							Trusted by <span className="text-neutral-700 font-semibold">2,500+</span> creators
						</p>
					</div>
				</div>
			</div>

			<Pricing />
		</div>
	);
}

function FAQ() {
	const faqs = [
		{
			question: "How does Viraloop work?",
			answer:
				"Viraloop uses advanced AI to create virtual influencers and generate engaging video content. Simply create your AI influencer, write or generate a script, and our AI handles the rest - creating professional videos with realistic lip-sync and natural movements.",
		},
		{
			question: "Can I customize my AI influencers?",
			answer:
				"Absolutely! You can customize every aspect of your AI influencers including their appearance, voice, personality, and niche. Our platform offers extensive customization options to match your brand and target audience.",
		},
		{
			question: "How many images and videos can I create per month?",
			answer:
				"The number of images and videos you can create depends on your subscription plan. Trial allows 1 image and 1 video. Starter allows 15 images and 15 videos/month, Growth allows 50 each, Influencer allows 150 each, and Business offers unlimited content.",
		},
		{
			question: "Can I cancel my subscription anytime?",
			answer:
				"Yes, you can cancel your subscription at any time. There are no long-term commitments or cancellation fees.",
		},
		{
			question: "Which social platforms are supported?",
			answer:
				"We support TikTok, Instagram Reels, and YouTube Shorts. You can automatically post to any or all of these platforms based on your subscription plan.",
		},
		{
			question: "What is Loop Posting?",
			answer:
				"Loop Posting is our automated scheduling feature that continuously posts content on your behalf. Set it up once and let it run forever - your AI influencer will keep posting new content on your schedule.",
		},
		{
			question: "Can I monetize content created with Viraloop?",
			answer:
				"Yes! You fully own the rights to all content created with Viraloop. You can monetize your videos on any platform that accepts AI-generated content.",
		},
		{
			question: "Do you offer a trial?",
			answer:
				"Yes! For just $1 (one-time payment), you can try the platform with 1 AI influencer, 1 image, and 1 video. This lets you experience the platform before committing to a subscription.",
		},
	];

	return (
		<div className="max-w-3xl mx-auto">
			<div className="text-center mb-12">
				<motion.h2
					className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
				>
					Frequently Asked <span className="text-primary-400">Questions</span>
				</motion.h2>
				<motion.p
					className="text-neutral-500 max-w-2xl mx-auto"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					Everything you need to know about Viraloop
				</motion.p>
			</div>

			<div className="bg-white rounded-2xl p-8 border border-light-300 shadow-sm">
				<div className="space-y-4">
					{faqs.map((faq, index) => (
						<motion.div
							key={index}
							className="bg-light-100 rounded-xl overflow-hidden"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.3, delay: index * 0.05 }}
						>
							<details className="group">
								<summary className="flex justify-between items-center cursor-pointer py-4 px-6 text-left focus:outline-none">
									<span className="font-medium text-lg text-neutral-900">{faq.question}</span>
									<div className="w-8 h-8 rounded-full bg-light-200 flex items-center justify-center transition-transform duration-300 group-open:rotate-180">
										<svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</div>
								</summary>
								<div className="px-6 pb-4">
									<div className="pt-2 text-neutral-500 border-t border-light-300">{faq.answer}</div>
								</div>
							</details>
						</motion.div>
					))}
				</div>
			</div>

			{/* CTA Section */}
			<div className="mt-12 bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl p-8 text-white shadow-lg">
				<div className="flex flex-col md:flex-row items-center justify-between gap-8">
					<div>
						<h3 className="text-2xl font-bold mb-2">Ready to create your AI influencers?</h3>
						<p className="text-white/80">Start your viral content journey today</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-4">
						<Link
							href="#"
							onClick={(e) => {
								e.preventDefault();
								window.scrollTo({ top: 0, behavior: "smooth" });
							}}
							className="bg-white text-primary-500 hover:bg-light-100 py-3 px-6 rounded-sm font-medium transition-all duration-300 whitespace-nowrap text-center shadow-md hover:shadow-lg"
						>
							Get Started Today
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
