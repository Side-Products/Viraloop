import "@/styles/globals.css";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { wrapper } from "@/redux/redux-store";
import { Toaster } from "sonner";
import Head from "next/head";
import Layout from "@/layout/Layout";
import TeamContextProvider from "@/store/TeamContextProvider";

function MyApp({ Component, ...rest }) {
	const { store, props } = wrapper.useWrappedStore(rest);
	const { pageProps } = props;

	return (
		<>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#ff4f01" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Script data-website-id="dfid_V6vE8sG9i5sRj5gvyQ7Yj" data-domain="viraloop.io" src="/js/script.js" strategy="afterInteractive"></Script>

			<SessionProvider session={pageProps.session}>
				<TeamContextProvider>
					<Provider store={store}>
						<Layout>
							<Component {...pageProps} />
						</Layout>
						<Toaster
							position="top-right"
							toastOptions={{
								style: {
									background: "#ffffff",
									color: "#1f2937",
									border: "1px solid #e5e7eb",
								},
							}}
						/>
					</Provider>
				</TeamContextProvider>
			</SessionProvider>
		</>
	);
}

export default MyApp;
