import Head from "next/head";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import InfluencerDetail from "@/components/Influencers/InfluencerDetail";
import { PRODUCT_NAME } from "@/config/constants";

export default function InfluencerDetailPage({ user }) {
	return (
		<>
			<Head>
				<title>Influencer Details | {PRODUCT_NAME}</title>
			</Head>

			<DashboardLayout>
				<InfluencerDetail />
			</DashboardLayout>
		</>
	);
}

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
		props: {
			user: session.user,
		},
	};
}
