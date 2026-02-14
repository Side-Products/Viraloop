import { useMemo } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "./Footer";
import CrispChat from "@/components/Crisp";

const Layout = ({ children }) => {
	const router = useRouter();

	// Pages where navbar should be hidden (dashboard pages use their own layout)
	const hideNavbar = useMemo(() => {
		return (
			router.pathname.startsWith("/dashboard") ||
			router.pathname.startsWith("/influencers") ||
			router.pathname.startsWith("/posts") ||
			router.pathname.startsWith("/loops") ||
			router.pathname.startsWith("/calendar") ||
			router.pathname.startsWith("/schedule") ||
			router.pathname.startsWith("/accounts") ||
			router.pathname.startsWith("/analytics") ||
			router.pathname.startsWith("/settings") ||
			router.pathname.startsWith("/spin-and-win")
		);
	}, [router.pathname]);

	// Pages where footer should be shown
	const showFooter = useMemo(() => {
		return (
			["/", "/pricing", "/privacy", "/terms", "/about"].includes(router.pathname) ||
			router.pathname.startsWith("/blog")
		);
	}, [router.pathname]);

	return (
		<div className="min-h-screen bg-light-50 text-dark-100">
			{!hideNavbar && <Navbar />}
			<main>{children}</main>
			{showFooter && <Footer />}
			<CrispChat />
		</div>
	);
};

export default Layout;
