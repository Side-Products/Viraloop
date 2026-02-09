import Head from "next/head";
import { PRODUCT_NAME, PRODUCT_URL, CONTACT_EMAIL } from "@/config/constants";

export default function TermsOfService() {
	return (
		<>
			<Head>
				<title>Terms of Service | {PRODUCT_NAME}</title>
				<meta name="description" content={`Terms of Service for ${PRODUCT_NAME} - Read our terms and conditions.`} />
			</Head>

			<main className="min-h-screen bg-light-50 pt-20">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
					{/* Header */}
					<div className="mb-12 border-b border-light-200 pb-8">
						<h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-3">
							Terms of Service
						</h1>
						<p className="text-neutral-500 text-sm">Last updated: February 7, 2026</p>
					</div>

					{/* Content */}
					<div className="space-y-8 text-neutral-600">
						<div className="bg-light-100 border border-light-200 rounded-lg p-6">
							<p className="text-base leading-relaxed text-neutral-600">
								These Terms of Service (&quot;Terms&quot;) govern your use of the services provided by {PRODUCT_NAME} (&quot;the
								Company,&quot; &quot;We,&quot; &quot;Us,&quot; or &quot;Our&quot;) through the website accessible at{" "}
								<a href={PRODUCT_URL} className="text-primary-500 hover:text-primary-600 underline">
									{PRODUCT_URL}
								</a>{" "}
								(&quot;the Service&quot;). By accessing or using the Service, you agree to be bound by these Terms.
							</p>
						</div>

						<div className="bg-light-100 border border-light-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-neutral-900 mb-3">Social Media Platform Terms</h3>
							<p className="text-base leading-relaxed text-neutral-600">
								By using our Service to post content to TikTok, Instagram, or YouTube, you agree to be bound by their respective Terms of Service.
								Our Service acts as an integration client for these platforms, and your use of platform-related features is subject to their terms and policies.
							</p>
						</div>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 1. Acceptance of Terms
							</h2>
							<p className="text-neutral-600 leading-relaxed">
								By using the Service, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, please do not
								use the Service.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 2. User Accounts and Registration
							</h2>
							<p className="text-neutral-600 leading-relaxed">
								To access certain features of the Service, you may be required to create an account. You agree to provide accurate, current, and
								complete information during the registration process and to update such information to keep it accurate, current, and complete.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 3. Use of the Service
							</h2>
							<p className="text-neutral-600 leading-relaxed mb-4">
								You agree to use the Service in accordance with all applicable laws and regulations. You also agree not to:
							</p>
							<ul className="space-y-2 ml-4 border-l-2 border-light-200 pl-6">
								<li className="text-neutral-600">Violate any applicable laws or regulations;</li>
								<li className="text-neutral-600">Interfere with or disrupt the integrity or performance of the Service;</li>
								<li className="text-neutral-600">Attempt to gain unauthorized access to the Service or its related systems or networks;</li>
								<li className="text-neutral-600">Use the Service for any illegal or unauthorized purpose;</li>
								<li className="text-neutral-600">
									Engage in any conduct that restricts or inhibits any other user from using or enjoying the Service;
								</li>
								<li className="text-neutral-600">Modify, adapt, or hack the Service;</li>
								<li className="text-neutral-600">Use any automated means to access the Service;</li>
								<li className="text-neutral-600">Impersonate any person or entity;</li>
								<li className="text-neutral-600">Collect or store personal information about other users without their express consent;</li>
								<li className="text-neutral-600">
									Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Service.
								</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 4. AI-Generated Content
							</h2>
							<p className="text-neutral-600 leading-relaxed mb-4">
								Our Service uses artificial intelligence to create virtual influencer personas and generate content. You acknowledge and agree that:
							</p>
							<ul className="space-y-2 ml-4 border-l-2 border-light-200 pl-6">
								<li className="text-neutral-600">AI-generated content is created programmatically and may not always be accurate or appropriate;</li>
								<li className="text-neutral-600">You are responsible for reviewing and approving all content before it is posted to your social media accounts;</li>
								<li className="text-neutral-600">Virtual influencer personas are fictional and should not be represented as real individuals;</li>
								<li className="text-neutral-600">You must comply with each social media platform&apos;s guidelines regarding AI-generated and synthetic content.</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 5. Intellectual Property
							</h2>
							<p className="text-neutral-600 leading-relaxed">
								The Service and its original content, features, and functionality are owned by the Company and are protected by international
								copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 6. User Content
							</h2>
							<p className="text-neutral-600 leading-relaxed mb-4">
								You retain ownership of any content you create or upload to the Service. However, by using the Service, you grant us a non-exclusive,
								worldwide, royalty-free license to use, store, and process your content solely for the purpose of providing the Service.
							</p>
							<p className="text-neutral-600 leading-relaxed">
								You are solely responsible for the content you create and post through our Service, including ensuring it does not violate any
								third-party rights or applicable laws.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 7. Subscription and Payments
							</h2>
							<p className="text-neutral-600 leading-relaxed mb-4">
								Some features of the Service require a paid subscription. By subscribing, you agree to:
							</p>
							<ul className="space-y-2 ml-4 border-l-2 border-light-200 pl-6">
								<li className="text-neutral-600">Pay all applicable fees as described at the time of purchase;</li>
								<li className="text-neutral-600">Provide accurate billing information;</li>
								<li className="text-neutral-600">Accept that subscriptions automatically renew unless cancelled before the renewal date;</li>
								<li className="text-neutral-600">Understand that refunds are handled on a case-by-case basis.</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 8. Limitation of Liability
							</h2>
							<p className="text-neutral-600 leading-relaxed">
								In no event shall the Company be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss
								of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses,
								resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third
								party on the Service; (iii) any content obtained from the Service; or (iv) unauthorized access, use, or alteration of your
								transmissions or content.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 9. Modifications to the Service
							</h2>
							<p className="text-neutral-600 leading-relaxed">
								The Company reserves the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or
								without notice. The Company shall not be liable to you or any third party for any modification, suspension, or discontinuance of
								the Service.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 10. Governing Law
							</h2>
							<p className="text-neutral-600 leading-relaxed">
								These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms will be
								resolved through binding arbitration or in the appropriate courts.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 11. Changes to these Terms
							</h2>
							<p className="text-neutral-600 leading-relaxed">
								The Company reserves the right, at its sole discretion, to modify or replace these Terms at any time. The updated Terms will be
								posted on this page, and your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> 12. Contact Us
							</h2>
							<p className="text-neutral-600 leading-relaxed mb-3">If you have any questions about these Terms, you can contact us:</p>
							<ul className="ml-4 border-l-2 border-light-200 pl-6">
								<li className="text-neutral-600">
									By email:{" "}
									<a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-500 hover:text-primary-600 underline">
										{CONTACT_EMAIL}
									</a>
								</li>
							</ul>
						</section>
					</div>
				</div>
			</main>
		</>
	);
}
