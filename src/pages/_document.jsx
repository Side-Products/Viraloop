import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				{/* Favicons */}
				<link rel="icon" href="/favicon/favicon.ico" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
				<link rel="manifest" href="/favicon/site.webmanifest" />
				<meta name="theme-color" content="#ED6B2F" />

				{/* Fonts */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

				{/* PromoteKit Affiliate Tracking */}
				<script async src="https://cdn.promotekit.com/promotekit.js" data-promotekit="19a3f122-6fe9-4c04-874e-ecbbba19705d"></script>
			</Head>
			<body className="bg-light-50 text-neutral-900">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
