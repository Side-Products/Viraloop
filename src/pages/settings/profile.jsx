import { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import { toast } from "sonner";
import { Crisp } from "crisp-sdk-web";
import SettingsLayout from "@/components/Settings/SettingsLayout";
import { User, MessageCircle, Check, Loader2 } from "lucide-react";

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
		props: { session },
	};
}

export default function ProfileSettings() {
	const { data: session } = useSession();

	// Profile state
	const [name, setName] = useState("");
	const [originalName, setOriginalName] = useState("");
	const [email, setEmail] = useState("");
	const [isSavingProfile, setIsSavingProfile] = useState(false);

	// Check if there are unsaved changes
	const hasChanges = name !== originalName;

	// Initialize form values
	useEffect(() => {
		if (session?.user) {
			setName(session.user.name || "");
			setOriginalName(session.user.name || "");
			setEmail(session.user.email || "");
		}
	}, [session]);

	const handleSaveProfile = async () => {
		if (!name.trim()) {
			toast.error("Name is required");
			return;
		}

		setIsSavingProfile(true);
		try {
			const res = await fetch("/api/user/update", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim() }),
			});
			const data = await res.json();
			if (data.success) {
				toast.success("Profile updated successfully");
				setOriginalName(name.trim());
			} else {
				toast.error(data.message || "Failed to update profile");
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error("Failed to update profile");
		} finally {
			setIsSavingProfile(false);
		}
	};

	return (
		<SettingsLayout title="Profile Settings">
			{/* Profile Information */}
			<div className="bg-white rounded-2xl border border-light-300 shadow-sm p-6 mb-6">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
						<User className="w-5 h-5 text-primary-500" />
					</div>
					<div>
						<h2 className="text-lg font-semibold text-neutral-900">Profile Information</h2>
						<p className="text-sm text-neutral-500">Your personal details</p>
					</div>
				</div>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-4 py-2.5 bg-light-50 border border-light-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
							placeholder="Enter your name"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
						<input
							type="email"
							value={email}
							disabled
							className="w-full px-4 py-2.5 bg-light-100 border border-light-300 rounded-lg text-neutral-500 cursor-not-allowed"
						/>
						<p className="text-xs text-neutral-400 mt-1">Email cannot be changed</p>
					</div>
					{hasChanges && (
						<div className="pt-2">
							<button
								onClick={handleSaveProfile}
								disabled={isSavingProfile}
								className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
								Save Changes
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Help Card */}
			<div className="bg-light-100 rounded-2xl p-6 text-center">
				<h3 className="text-lg font-semibold text-neutral-900 mb-2">Need help?</h3>
				<p className="text-neutral-500 text-sm mb-4">Our support team is here to assist you with any questions.</p>
				<button
					onClick={() => Crisp.chat.open()}
					className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
				>
					<MessageCircle className="w-5 h-5" />
					Contact Support
				</button>
			</div>
		</SettingsLayout>
	);
}
