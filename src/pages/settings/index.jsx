import { getSession } from "next-auth/react";

// Redirect /settings to /settings/team
export async function getServerSideProps({ req }) {
	const session = await getSession({ req: req });
	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	return {
		redirect: {
			destination: "/settings/team",
			permanent: false,
		},
	};
}

export default function SettingsIndex() {
	// This component won't render due to redirect
	return null;
}
