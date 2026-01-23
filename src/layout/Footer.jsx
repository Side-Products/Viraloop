import Link from "next/link";
import { PRODUCT_NAME } from "@/config/constants";

const Footer = () => {
	return (
		<footer className="py-12 bg-light-100 border-t border-light-200">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="flex items-center gap-2">
						<Link href="/" className="flex items-center gap-2">
							<div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-lg">V</span>
							</div>
							<span className="text-lg font-bold text-dark-100">{PRODUCT_NAME}</span>
						</Link>
					</div>
					<div className="flex items-center gap-6 text-sm text-dark-400">
						<Link href="/privacy" className="hover:text-dark-200 transition-colors">
							Privacy
						</Link>
						<Link href="/terms" className="hover:text-dark-200 transition-colors">
							Terms
						</Link>
					</div>
					<p className="text-dark-400 text-sm">
						&copy; {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
