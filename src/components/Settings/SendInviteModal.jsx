import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X, Mail, UserPlus, Loader2, ChevronDown } from "lucide-react";

export default function SendInviteModal({ isOpen, onClose, teamId, onSuccess }) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("member");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email.trim()) {
			toast.error("Please enter an email address");
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) {
			toast.error("Please enter a valid email address");
			return;
		}

		setIsLoading(true);
		try {
			const res = await fetch("/api/team/invite", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					teamId,
					email: email.trim().toLowerCase(),
					role,
				}),
			});

			const data = await res.json();

			if (data.success) {
				toast.success(`Invitation sent to ${email}`);
				setEmail("");
				setRole("member");
				onClose();
				if (onSuccess) onSuccess();
			} else {
				toast.error(data.message || "Failed to send invitation");
			}
		} catch (error) {
			console.error("Error sending invite:", error);
			toast.error("Failed to send invitation");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setEmail("");
			setRole("member");
			onClose();
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
					onClick={handleClose}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-light-200">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
									<UserPlus className="w-5 h-5 text-primary-500" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-neutral-900">Invite Team Member</h3>
									<p className="text-sm text-neutral-500">Send an invitation to join your team</p>
								</div>
							</div>
							<button
								onClick={handleClose}
								disabled={isLoading}
								className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-light-100 rounded-lg transition-colors disabled:opacity-50"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="p-6">
							<div className="space-y-4">
								{/* Email Input */}
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<Mail className="w-4 h-4 text-neutral-400" />
										</div>
										<input
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="colleague@example.com"
											className="w-full pl-10 pr-4 py-2.5 bg-light-50 border border-light-300 rounded-xl text-neutral-900 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
											disabled={isLoading}
										/>
									</div>
								</div>

								{/* Role Select */}
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-1.5">Role</label>
									<div className="relative">
										<select
											value={role}
											onChange={(e) => setRole(e.target.value)}
											className="w-full px-4 py-2.5 bg-light-50 border border-light-300 rounded-xl text-neutral-900 outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all appearance-none cursor-pointer"
											disabled={isLoading}
										>
											<option value="member">Member - Can view and edit content</option>
											<option value="admin">Admin - Full access including team management</option>
										</select>
										<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
											<ChevronDown className="w-4 h-4 text-neutral-400" />
										</div>
									</div>
									<p className="mt-1.5 text-xs text-neutral-500">
										{role === "admin"
											? "Admins can manage team members, billing, and all settings."
											: "Members can view and create content but cannot manage team settings."}
									</p>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-3 mt-6">
								<button
									type="button"
									onClick={handleClose}
									disabled={isLoading}
									className="flex-1 px-4 py-2.5 bg-light-100 text-neutral-700 rounded-xl font-medium hover:bg-light-200 transition-colors disabled:opacity-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isLoading || !email.trim()}
									className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-xl font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											Sending...
										</>
									) : (
										<>
											<Mail className="w-4 h-4" />
											Send Invitation
										</>
									)}
								</button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
