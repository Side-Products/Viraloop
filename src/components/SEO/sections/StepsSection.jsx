import { motion } from "framer-motion";

/**
 * Steps Section Component for SEO Pages
 * Displays a numbered sequence of steps
 * Adapted for Viraloop's light theme
 */
export default function StepsSection({ section }) {
	const { title, content } = section;
	const steps = content.steps || [];

	return (
		<motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
			{title && <h2 className="text-3xl font-bold text-dark-100 mb-8 text-start">{title}</h2>}

			<div className="max-w-3xl mr-auto space-y-8">
				{steps.map((step, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: index * 0.1 }}
						className="flex items-start space-x-6"
					>
						{/* Step Number */}
						<div className="flex-shrink-0">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
								{index + 1}
							</div>
						</div>

						{/* Step Content */}
						<div className="flex-1">
							<h3 className="text-2xl font-semibold text-dark-100 mb-2">{step.title || step.name}</h3>
							<p className="text-dark-300 leading-relaxed">{step.description || step.text}</p>

							{step.tips && step.tips.length > 0 && (
								<ul className="mt-3 space-y-2">
									{step.tips.map((tip, tipIndex) => (
										<li key={tipIndex} className="text-dark-400 text-sm flex items-start">
											<span className="text-primary-500 mr-2">•</span>
											{tip}
										</li>
									))}
								</ul>
							)}
						</div>
					</motion.div>
				))}
			</div>
		</motion.section>
	);
}
