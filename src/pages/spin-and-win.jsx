import React, { useState } from "react";
import Head from "next/head";
import { getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Confetti from "react-confetti";
import { PRODUCT_NAME } from "@/config/constants";
import DashboardLayout from "@/components/Layout/DashboardLayout";

const SpinTheWheel = dynamic(() => import("@/components/SpinTheWheel/SpinTheWheel"), { ssr: false });

export async function getServerSideProps(context) {
	const session = await getSession(context);

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	return {
		props: { session },
	};
}

const SpinAndWinPage = () => {
	const [showConfetti, setShowConfetti] = useState(false);

	return (
		<DashboardLayout>
			{showConfetti && <Confetti colors={["#ED6B2F", "#ff4f01", "#ffffff"]} />}
			<Head>
				<title>Spin & Win | {PRODUCT_NAME}</title>
			</Head>

			<div className="relative min-h-[calc(100vh-64px)] w-full bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden">
				<SpinTheWheel setShowConfetti={setShowConfetti} pillText={"Daily Rewards"} heading={"Spin & Win"} />
			</div>
		</DashboardLayout>
	);
};

export default SpinAndWinPage;
