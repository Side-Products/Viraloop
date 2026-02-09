import { useState, useContext, useEffect, useMemo } from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import SettingsLayout from "@/components/Settings/SettingsLayout";
import SendInviteModal from "@/components/Settings/SendInviteModal";
import { TeamContext } from "@/store/TeamContextProvider";
import { Users, UserPlus, Mail, Search, ChevronDown, Check, Loader2, Trash2, AlertTriangle, Plus, Key, Copy, Save } from "lucide-react";

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

export default function TeamSettings() {
	const router = useRouter();
	const { data: session } = useSession();
	const { currentTeam, teams, refreshTeams } = useContext(TeamContext);

	// Members state
	const [members, setMembers] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");

	// Invites state
	const [invites, setInvites] = useState([]);
	const [loadingInvites, setLoadingInvites] = useState(true);

	// Team state
	const [teamName, setTeamName] = useState("");
	const [originalTeamName, setOriginalTeamName] = useState("");
	const [isSavingTeam, setIsSavingTeam] = useState(false);

	// Create team state
	const [showCreateTeam, setShowCreateTeam] = useState(false);
	const [newTeamName, setNewTeamName] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	// Delete team state
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	// Invite modal state
	const [showInviteModal, setShowInviteModal] = useState(false);

	// Check for create query parameter to open modal
	useEffect(() => {
		if (router.query.create === "true") {
			setShowCreateTeam(true);
			// Remove the query parameter from URL without reload
			router.replace("/settings/team", undefined, { shallow: true });
		}
	}, [router.query.create]);

	// Check if user is admin/owner
	const isAdmin = useMemo(() => {
		if (!session?.user || !members.length) return false;
		const currentMember = members.find((m) => m.userId === session.user._id || m.userId === session.user.id);
		return currentMember?.role === "admin" || currentMember?.userId === currentTeam?.createdBy;
	}, [members, session, currentTeam]);

	// Filter members based on search and role
	const filteredMembers = useMemo(() => {
		return members.filter((member) => {
			const matchesSearch =
				member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesRole =
				roleFilter === "all" ||
				member.role === roleFilter ||
				(roleFilter === "owner" && member.userId === currentTeam?.createdBy);
			return matchesSearch && matchesRole;
		});
	}, [members, searchTerm, roleFilter, currentTeam?.createdBy]);

	// Pending invites
	const pendingInvites = useMemo(() => {
		return invites.filter((invite) => !invite.accepted);
	}, [invites]);

	// Check for unsaved team name changes
	const hasTeamChanges = teamName !== originalTeamName;

	// Fetch members
	useEffect(() => {
		const fetchMembers = async () => {
			if (!currentTeam?._id) return;
			setLoadingMembers(true);
			try {
				const res = await fetch(`/api/team/${currentTeam._id}/members`);
				const data = await res.json();
				if (data.success) {
					setMembers(data.members || []);
				}
			} catch (error) {
				console.error("Error fetching members:", error);
			} finally {
				setLoadingMembers(false);
			}
		};
		fetchMembers();
	}, [currentTeam?._id]);

	// Fetch invites
	const fetchInvites = async () => {
		if (!currentTeam?._id) return;
		setLoadingInvites(true);
		try {
			const res = await fetch(`/api/team/invites?teamId=${currentTeam._id}`);
			const data = await res.json();
			if (data.success) {
				setInvites(data.invites || []);
			}
		} catch (error) {
			console.error("Error fetching invites:", error);
		} finally {
			setLoadingInvites(false);
		}
	};

	useEffect(() => {
		fetchInvites();
	}, [currentTeam?._id]);

	// Initialize team name
	useEffect(() => {
		if (currentTeam) {
			setTeamName(currentTeam.name || "");
			setOriginalTeamName(currentTeam.name || "");
		}
	}, [currentTeam]);

	const handleSaveTeam = async () => {
		if (!teamName.trim()) {
			toast.error("Team name is required");
			return;
		}

		setIsSavingTeam(true);
		try {
			const res = await fetch(`/api/team/${currentTeam._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: teamName.trim() }),
			});
			const data = await res.json();
			if (data.success) {
				toast.success("Team updated successfully");
				setOriginalTeamName(teamName.trim());
				if (refreshTeams) refreshTeams();
			} else {
				toast.error(data.message || "Failed to update team");
			}
		} catch (error) {
			console.error("Error updating team:", error);
			toast.error("Failed to update team");
		} finally {
			setIsSavingTeam(false);
		}
	};

	const handleCreateTeam = async () => {
		if (!newTeamName.trim()) {
			toast.error("Team name is required");
			return;
		}

		setIsCreating(true);
		try {
			const res = await fetch("/api/team", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newTeamName.trim() }),
			});
			const data = await res.json();
			if (data.success) {
				toast.success("Team created successfully");
				setShowCreateTeam(false);
				setNewTeamName("");
				// Refresh teams and switch to the newly created team
				if (refreshTeams) refreshTeams(data.team?._id);
			} else {
				toast.error(data.message || "Failed to create team");
			}
		} catch (error) {
			console.error("Error creating team:", error);
			toast.error("Failed to create team");
		} finally {
			setIsCreating(false);
		}
	};

	const copyApiKey = async () => {
		if (currentTeam?.apiKey) {
			await navigator.clipboard.writeText(currentTeam.apiKey);
			toast.success("API Key copied to clipboard");
		}
	};

	const handleDeleteTeam = async () => {
		if (deleteConfirmText !== currentTeam?.name) {
			toast.error("Please type the team name correctly to confirm deletion");
			return;
		}

		setIsDeleting(true);
		try {
			const res = await fetch(`/api/team/${currentTeam._id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.success) {
				toast.success("Team deleted successfully");
				setShowDeleteConfirm(false);
				setDeleteConfirmText("");
				// Reload the page to refresh team context and switch to another team
				window.location.reload();
			} else {
				toast.error(data.message || "Failed to delete team");
			}
		} catch (error) {
			console.error("Error deleting team:", error);
			toast.error("Failed to delete team");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<SettingsLayout title="Team Settings">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
				<div className="flex items-center gap-3">
					<div className="p-3 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl border border-primary-200">
						<Users className="w-6 h-6 text-primary-500" />
					</div>
					<div>
						<h1 className="text-xl font-semibold text-neutral-900">Team Settings</h1>
						<p className="text-neutral-500 text-sm">Manage your team members, invites, and team information</p>
					</div>
				</div>
				<button
					onClick={() => setShowCreateTeam(true)}
					className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300"
				>
					<Plus className="w-4 h-4" />
					Create New Team
				</button>
			</div>

			{/* Team Members Section */}
			<div className="bg-white rounded-2xl border border-light-300 shadow-sm mb-6">
				<div className="p-6">
					<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-light-100 rounded-lg border border-light-200">
								<Users className="w-5 h-5 text-neutral-600" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-neutral-900">Team Members</h2>
								<p className="text-neutral-500 text-sm">
									{members.length > 0 ? `${members.length} member${members.length !== 1 ? "s" : ""}` : "No members yet"}
								</p>
							</div>
						</div>
						{isAdmin && (
							<button
								onClick={() => setShowInviteModal(true)}
								className="inline-flex items-center gap-2 px-4 py-2 bg-light-100 text-neutral-700 rounded-xl font-medium hover:bg-light-200 border border-light-200 transition-colors"
							>
								<UserPlus className="w-4 h-4" />
								Invite Members
							</button>
						)}
					</div>

					{/* Search and Filter */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="w-4 h-4 text-neutral-400" />
							</div>
							<input
								type="text"
								placeholder="Search by name or email"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-3 text-sm bg-light-50 border border-light-300 rounded-xl text-neutral-900 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
							/>
						</div>
						<div className="relative">
							<select
								value={roleFilter}
								onChange={(e) => setRoleFilter(e.target.value)}
								className="w-full px-4 py-3 text-sm bg-light-50 border border-light-300 rounded-xl text-neutral-900 outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all appearance-none cursor-pointer"
							>
								<option value="all">All Roles</option>
								<option value="admin">Admin</option>
								<option value="member">Member</option>
								<option value="owner">Owner</option>
							</select>
							<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<ChevronDown className="w-4 h-4 text-neutral-400" />
							</div>
						</div>
					</div>

					{/* Members Table */}
					{loadingMembers ? (
						<div className="flex items-center justify-center py-8">
							<div className="flex items-center gap-3 text-neutral-500">
								<Loader2 className="w-5 h-5 animate-spin" />
								<span className="text-sm">Loading members...</span>
							</div>
						</div>
					) : filteredMembers.length > 0 ? (
						<div className="overflow-hidden rounded-xl border border-light-200 bg-light-50">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="bg-light-100 border-b border-light-200">
											<th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
											<th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
											<th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
											<th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-light-200 bg-white">
										{filteredMembers.map((member) => (
											<tr key={member._id} className="hover:bg-light-50 transition-colors">
												<td className="px-6 py-4">
													<div className="flex items-center">
														{member.user?.image ? (
															<img
																src={member.user.image}
																alt={member.user?.name || "User"}
																className="w-8 h-8 rounded-full object-cover mr-3"
															/>
														) : (
															<div className="w-8 h-8 bg-primary-100 text-primary-500 border border-primary-200 rounded-full flex items-center justify-center mr-3">
																<span className="text-xs font-medium">{member.user?.name?.charAt(0).toUpperCase()}</span>
															</div>
														)}
														<span className="text-sm font-medium text-neutral-900">{member.user?.name}</span>
													</div>
												</td>
												<td className="px-6 py-4">
													<span className="text-sm text-neutral-600">{member.user?.email}</span>
												</td>
												<td className="px-6 py-4">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															member.userId === currentTeam?.createdBy
																? "bg-purple-100 text-purple-700 border border-purple-200"
																: member.role === "admin"
																	? "bg-blue-100 text-blue-700 border border-blue-200"
																	: "bg-green-100 text-green-700 border border-green-200"
														}`}
													>
														{member.userId === currentTeam?.createdBy ? "Owner" : member.role}
													</span>
												</td>
												<td className="px-6 py-4">
													<span className="text-sm text-neutral-500">
														{member.userId === currentTeam?.createdBy ? "Owner" : "-"}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="w-16 h-16 bg-light-100 rounded-full flex items-center justify-center mb-4">
								<Users className="w-8 h-8 text-neutral-400" />
							</div>
							<h3 className="text-lg font-medium text-neutral-700 mb-2">No members found</h3>
							<p className="text-sm text-neutral-500">Try adjusting your search or filter criteria</p>
						</div>
					)}
				</div>
			</div>

			{/* Team Invites Section */}
			<div className="bg-white rounded-2xl border border-light-300 shadow-sm mb-6">
				<div className="p-6">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2 bg-light-100 rounded-lg border border-light-200">
							<Mail className="w-5 h-5 text-neutral-600" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-neutral-900">Team Invites</h2>
							<p className="text-neutral-500 text-sm">Pending invitations to join your team</p>
						</div>
					</div>

					{loadingInvites ? (
						<div className="flex items-center justify-center py-8">
							<div className="flex items-center gap-3 text-neutral-500">
								<Loader2 className="w-5 h-5 animate-spin" />
								<span className="text-sm">Loading invites...</span>
							</div>
						</div>
					) : pendingInvites.length > 0 ? (
						<div className="overflow-hidden rounded-xl border border-light-200 bg-light-50">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="bg-light-100 border-b border-light-200">
											<th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
											<th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Invited by</th>
											<th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-light-200 bg-white">
										{pendingInvites.map((invite, index) => (
											<tr key={index} className="hover:bg-light-50 transition-colors">
												<td className="px-6 py-4">
													<span className="text-sm font-medium text-neutral-900">{invite.invitedUserEmail}</span>
												</td>
												<td className="px-6 py-4">
													<span className="text-sm text-neutral-600">{invite.inviterId?.name || "Unknown"}</span>
												</td>
												<td className="px-6 py-4">
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
														Pending
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="w-16 h-16 bg-light-100 rounded-full flex items-center justify-center mb-4">
								<Mail className="w-8 h-8 text-neutral-400" />
							</div>
							<h3 className="text-lg font-medium text-neutral-700 mb-2">No pending invites</h3>
							<p className="text-sm text-neutral-500">All invitations have been accepted or expired</p>
						</div>
					)}
				</div>
			</div>

			{/* Team Details and API Key Row */}
			<div className="flex flex-wrap gap-6 mb-6">
				{/* Team Details Card */}
				<div className="bg-white rounded-2xl border border-light-300 shadow-sm p-6 flex-1 min-w-[300px]">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2 bg-light-100 rounded-lg border border-light-200">
							<Users className="w-5 h-5 text-neutral-600" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-neutral-900">Team Details</h2>
							<p className="text-neutral-500 text-sm">Edit your team name</p>
						</div>
					</div>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-neutral-700 mb-1.5">Team name</label>
							<input
								type="text"
								value={teamName}
								onChange={(e) => setTeamName(e.target.value)}
								className="w-full px-4 py-2.5 bg-light-50 border border-light-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
								placeholder="Enter team name"
							/>
						</div>
						{hasTeamChanges && (
							<button
								onClick={handleSaveTeam}
								disabled={isSavingTeam}
								className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSavingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
								Save Changes
							</button>
						)}
					</div>
				</div>

				{/* API Key Card */}
				{currentTeam?.apiKey && (
					<div className="bg-white rounded-2xl border border-light-300 shadow-sm p-6 flex-1 min-w-[300px]">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-light-100 rounded-lg border border-light-200">
								<Key className="w-5 h-5 text-neutral-600" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-neutral-900">API Key</h2>
								<p className="text-neutral-500 text-xs">Use this key to access the API for your team</p>
							</div>
						</div>
						<div className="flex items-center justify-between bg-light-100 rounded-lg p-3 border border-light-200">
							<code className="text-sm text-neutral-700 font-mono break-all">{currentTeam.apiKey}</code>
							<button
								onClick={copyApiKey}
								className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors ml-2 flex-shrink-0"
							>
								<Copy className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}

				{/* Danger Zone Card */}
				{isAdmin && (
					<div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 flex-1 min-w-[300px]">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-red-50 rounded-lg border border-red-200">
								<AlertTriangle className="w-5 h-5 text-red-500" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-neutral-900">Danger Zone</h2>
								<p className="text-neutral-500 text-xs">Irreversible and destructive actions</p>
							</div>
						</div>
						<div className="space-y-3">
							{currentTeam?.isDefault ? (
								<p className="text-sm text-neutral-500">
									This is your default team and cannot be deleted. Create a new team and set it as default first if you wish to delete this one.
								</p>
							) : (
								<>
									<p className="text-sm text-neutral-600">
										Deleting a team will permanently remove all associated data including projects, members, and settings.
									</p>
									<button
										onClick={() => setShowDeleteConfirm(true)}
										className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium border border-red-200 hover:bg-red-100 transition-colors"
									>
										<Trash2 className="w-4 h-4" />
										Delete Team
									</button>
								</>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Create Team Modal */}
			{showCreateTeam && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
								<Plus className="w-6 h-6 text-primary-500" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-neutral-900">Create New Team</h3>
								<p className="text-sm text-neutral-500">Start a new workspace</p>
							</div>
						</div>

						<div className="mb-4">
							<label className="block text-sm font-medium text-neutral-700 mb-1.5">Team Name</label>
							<input
								type="text"
								value={newTeamName}
								onChange={(e) => setNewTeamName(e.target.value)}
								className="w-full px-4 py-2.5 bg-light-50 border border-light-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
								placeholder="Enter team name"
							/>
						</div>

						<div className="flex items-center gap-3">
							<button
								onClick={() => {
									setShowCreateTeam(false);
									setNewTeamName("");
								}}
								className="flex-1 px-4 py-2.5 bg-light-100 text-neutral-700 rounded-lg font-medium hover:bg-light-200 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleCreateTeam}
								disabled={!newTeamName.trim() || isCreating}
								className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
								Create Team
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Team Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
								<AlertTriangle className="w-6 h-6 text-red-500" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-neutral-900">Delete Team</h3>
								<p className="text-sm text-neutral-500">This action cannot be undone</p>
							</div>
						</div>

						<div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
							<p className="text-sm text-red-700">
								This will permanently delete <strong>{currentTeam?.name}</strong> and all associated data including projects, members, and settings.
							</p>
						</div>

						<div className="mb-4">
							<label className="block text-sm font-medium text-neutral-700 mb-1.5">
								Type <strong>{currentTeam?.name}</strong> to confirm
							</label>
							<input
								type="text"
								value={deleteConfirmText}
								onChange={(e) => setDeleteConfirmText(e.target.value)}
								className="w-full px-4 py-2.5 bg-light-50 border border-light-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all"
								placeholder="Enter team name"
							/>
						</div>

						<div className="flex items-center gap-3">
							<button
								onClick={() => {
									setShowDeleteConfirm(false);
									setDeleteConfirmText("");
								}}
								className="flex-1 px-4 py-2.5 bg-light-100 text-neutral-700 rounded-lg font-medium hover:bg-light-200 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteTeam}
								disabled={deleteConfirmText !== currentTeam?.name || isDeleting}
								className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
								Delete Team
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Send Invite Modal */}
			<SendInviteModal
				isOpen={showInviteModal}
				onClose={() => setShowInviteModal(false)}
				teamId={currentTeam?._id}
				onSuccess={fetchInvites}
			/>
		</SettingsLayout>
	);
}
