import { motion } from "framer-motion";
import { CircleCheckIcon } from "@/components/ui/circle-check";

/**
 * Features Section Component for SEO Pages
 * Displays a grid of features with icons
 * Adapted for Viraloop's light theme
 */
export default function FeaturesSection({ section }) {
	const { title, content } = section;
	const features = content.features || [];

	return (
		<motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
			{title && <h2 className="text-3xl font-bold text-dark-100 mb-8 text-center">{title}</h2>}

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{features.map((feature, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: index * 0.1 }}
						className="bg-light-100 rounded-lg p-6 border border-light-300 hover:border-primary-500 transition group shadow-sm"
					>
						<div className="flex items-start space-x-4">
							<div className="flex-shrink-0">
								{feature.icon ? <div className="text-4xl">{feature.icon}</div> : <CircleCheckIcon size={32} className="text-primary-500" />}
							</div>
							<div>
								<h3 className="text-xl font-semibold text-dark-100 mb-2 group-hover:text-primary-500 transition">{feature.title}</h3>
								<p className="text-dark-400">{feature.description}</p>
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</motion.section>
	);
}
