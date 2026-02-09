import Head from "next/head";
import { PRODUCT_NAME, PRODUCT_URL, CONTACT_EMAIL } from "@/config/constants";

export default function PrivacyPolicy() {
	return (
		<>
			<Head>
				<title>Privacy Policy | {PRODUCT_NAME}</title>
				<meta name="description" content={`Privacy Policy for ${PRODUCT_NAME} - Learn how we collect, use, and protect your data.`} />
			</Head>

			<main className="min-h-screen bg-light-50 pt-20">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
					{/* Header */}
					<div className="mb-12 border-b border-light-200 pb-8">
						<h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-3">
							Privacy Policy
						</h1>
						<p className="text-neutral-500 text-sm">Last updated: February 7, 2026</p>
					</div>

					{/* Content */}
					<div className="prose prose-gray max-w-none space-y-8 text-neutral-600">
						<div className="bg-light-100 border border-light-200 rounded-lg p-6">
							<p className="text-base leading-relaxed text-neutral-600">
								This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use
								the Service and tells You about Your privacy rights and how the law protects You.
							</p>
							<p className="text-base leading-relaxed text-neutral-600 mt-4">
								We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of
								information in accordance with this Privacy Policy.
							</p>
						</div>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
								<span className="text-primary-500">—</span> Interpretation and Definitions
							</h2>
							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">Interpretation</h3>
							<p className="text-neutral-600 leading-relaxed">
								The words of which the initial letter is capitalized have meanings defined under the following conditions. The following
								definitions shall have the same meaning regardless of whether they appear in singular or in plural.
							</p>
							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">Definitions</h3>
							<p className="text-neutral-600 leading-relaxed mb-3">For the purposes of this Privacy Policy:</p>
							<ul className="space-y-3 ml-4 border-l-2 border-light-200 pl-6">
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Account</strong> means a unique account created for You to access our Service or parts of our
									Service.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Affiliate</strong> means an entity that controls, is controlled by or is under common control
									with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities
									entitled to vote for election of directors or other managing authority.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;,
									&quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to {PRODUCT_NAME}.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Cookies</strong> are small files that are placed on Your computer, mobile device or any other
									device by a website, containing the details of Your browsing history on that website among its many uses.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Device</strong> means any device that can access the Service such as a computer, a cellphone
									or a digital tablet.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Personal Data</strong> is any information that relates to an identified or identifiable
									individual.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Service</strong> refers to the Website.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Service Provider</strong> means any natural or legal person who processes the data on behalf
									of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to
									provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in
									analyzing how the Service is used.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Usage Data</strong> refers to data collected automatically, either generated by the use of
									the Service or from the Service infrastructure itself (for example, the duration of a page visit).
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Website</strong> refers to {PRODUCT_NAME}, accessible from{" "}
									<a href={PRODUCT_URL} className="text-primary-500 hover:text-primary-600 underline">
										{PRODUCT_URL}
									</a>
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">You</strong> means the individual accessing or using the Service, or the company, or other
									legal entity on behalf of which such individual is accessing or using the Service, as applicable.
								</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2 mt-12">
								<span className="text-primary-500">—</span> Collecting and Using Your Personal Data
							</h2>
							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">Types of Data Collected</h3>

							<h4 className="text-lg font-medium text-primary-500 mb-3 mt-4">Personal Data</h4>
							<p className="text-neutral-600 leading-relaxed mb-3">
								While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to
								contact or identify You. Personally identifiable information may include, but is not limited to:
							</p>
							<ul className="space-y-2 ml-4 border-l-2 border-light-200 pl-6 mb-6">
								<li className="text-neutral-600">Email address</li>
								<li className="text-neutral-600">First name and last name</li>
								<li className="text-neutral-600">Usage Data</li>
							</ul>

							<h4 className="text-lg font-medium text-primary-500 mb-3 mt-4">Usage Data</h4>
							<p className="text-neutral-600 leading-relaxed mb-3">Usage Data is collected automatically when using the Service.</p>
							<p className="text-neutral-600 leading-relaxed mb-3">
								Usage Data may include information such as Your Device&apos;s Internet Protocol address (e.g. IP address), browser type, browser
								version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device
								identifiers and other diagnostic data.
							</p>

							<h4 className="text-lg font-medium text-primary-500 mb-3 mt-4">Tracking Technologies and Cookies</h4>
							<p className="text-neutral-600 leading-relaxed mb-3">
								We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking
								technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service.
							</p>
							<ul className="space-y-3 ml-4 border-l-2 border-light-200 pl-6 mb-6">
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can
									instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept
									Cookies, You may not be able to use some parts of our Service.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">Web Beacons.</strong> Certain sections of our Service and our emails may contain small
									electronic files known as web beacons that permit the Company to count users who have visited those pages or opened an email.
								</li>
							</ul>
						</section>

						<section>
							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">Use of Your Personal Data</h3>
							<p className="text-neutral-600 leading-relaxed mb-3">The Company may use Personal Data for the following purposes:</p>
							<ul className="space-y-3 ml-4 border-l-2 border-light-200 pl-6 mb-6">
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">To provide and maintain our Service</strong>, including to monitor the usage of our Service.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">To manage Your Account:</strong> to manage Your registration as a user of the Service.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">For the performance of a contract:</strong> the development, compliance and undertaking of
									the purchase contract for the products, items or services You have purchased.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">To contact You:</strong> To contact You by email regarding updates or informative
									communications related to the functionalities, products or contracted services.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">To provide You</strong> with news, special offers and general information about other goods,
									services and events which we offer.
								</li>
								<li className="text-neutral-600 leading-relaxed">
									<strong className="text-neutral-900">To manage Your requests:</strong> To attend and manage Your requests to Us.
								</li>
							</ul>

							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">Retention of Your Personal Data</h3>
							<p className="text-neutral-600 leading-relaxed mb-3">
								The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We
								will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.
							</p>

							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">Delete Your Personal Data</h3>
							<p className="text-neutral-600 leading-relaxed mb-3">
								You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.
							</p>
							<p className="text-neutral-600 leading-relaxed mb-6">
								You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the
								account settings section. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.
							</p>

							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">Security of Your Personal Data</h3>
							<p className="text-neutral-600 leading-relaxed mb-6">
								The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method
								of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We
								cannot guarantee its absolute security.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2 mt-12">
								<span className="text-primary-500">—</span> Social Media Platform Integration
							</h2>

							<div className="bg-light-100 border border-light-200 rounded-lg p-6">
								<p className="text-base leading-relaxed text-neutral-600">
									Our Service integrates with TikTok, Instagram, and YouTube to enable content posting to these platforms. By connecting your
									accounts, you agree to their respective terms of service and privacy policies.
								</p>
							</div>

							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">Information We Access</h3>
							<p className="text-neutral-600 leading-relaxed mb-3">
								When you connect your social media accounts to our Service, we may access the following information:
							</p>
							<ul className="space-y-2 ml-4 border-l-2 border-light-200 pl-6 mb-6">
								<li className="text-neutral-600">Your account profile information (username, profile picture)</li>
								<li className="text-neutral-600">Your account authentication tokens</li>
								<li className="text-neutral-600">Content posting permissions</li>
								<li className="text-neutral-600">Basic analytics and engagement data</li>
							</ul>

							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">How We Use This Data</h3>
							<p className="text-neutral-600 leading-relaxed mb-3">We use the information obtained from social media platforms to:</p>
							<ul className="space-y-2 ml-4 border-l-2 border-light-200 pl-6 mb-6">
								<li className="text-neutral-600">Post content to your connected accounts on your behalf</li>
								<li className="text-neutral-600">Display your account information within our Service</li>
								<li className="text-neutral-600">Manage and schedule content posts</li>
								<li className="text-neutral-600">Provide posting status and basic analytics</li>
							</ul>

							<h3 className="text-xl font-medium text-neutral-900 mb-3 mt-6">Data Deletion</h3>
							<p className="text-neutral-600 leading-relaxed mb-6">
								You can disconnect your social media accounts at any time through your account settings. Upon disconnection, we will delete all
								stored authentication tokens and related data within 30 days.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2 mt-12">
								<span className="text-primary-500">—</span> Children&apos;s Privacy
							</h2>
							<p className="text-neutral-600 leading-relaxed mb-6">
								Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from
								anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal
								Data, please contact Us.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2 mt-12">
								<span className="text-primary-500">—</span> Links to Other Websites
							</h2>
							<p className="text-neutral-600 leading-relaxed mb-6">
								Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be
								directed to that third party&apos;s site. We strongly advise You to review the Privacy Policy of every site You visit.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2 mt-12">
								<span className="text-primary-500">—</span> Changes to this Privacy Policy
							</h2>
							<p className="text-neutral-600 leading-relaxed mb-6">
								We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this
								page. You are advised to review this Privacy Policy periodically for any changes.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2 mt-12">
								<span className="text-primary-500">—</span> Contact Us
							</h2>
							<p className="text-neutral-600 leading-relaxed mb-3">If you have any questions about this Privacy Policy, You can contact us:</p>
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
