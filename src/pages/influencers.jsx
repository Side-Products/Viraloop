import Head from "next/head";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import InfluencersComponent from "@/components/Influencers/InfluencersComponent";
import { PRODUCT_NAME } from "@/config/constants";

export default function Influencers({ user }) {
	return (
		<>
			<Head>
				<title>Influencers | {PRODUCT_NAME}</title>
			</Head>

			<DashboardLayout>
				<InfluencersComponent />
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
