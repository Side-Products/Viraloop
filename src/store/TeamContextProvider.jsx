import { useState, useEffect, createContext, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getTeamPlanInfo } from "@/utils/Helpers";

const DEFAULT_TEAM = {
	_id: "",
	name: "",
	credits: 0,
	isDefault: false,
	role: "member",
};

const DEFAULT_CONTEXT = {
	teams: [],
	currentTeam: DEFAULT_TEAM,
	setCurrentTeam: () => {},
	onCurrentTeamChange: () => {},
	loading: true,
};

export const TeamContext = createContext(DEFAULT_CONTEXT);

function TeamContextProvider({ children }) {
	const { data: session, status } = useSession();
	const [teams, setTeams] = useState([]);
	const [currentTeam, setCurrentTeam] = useState(DEFAULT_TEAM);
	const [loading, setLoading] = useState(true);

	// Fetch teams when session is available
	useEffect(() => {
		const fetchTeams = async () => {
			if (status !== "authenticated") {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/team");
				const data = await response.json();

				if (data.success && data.teams.length > 0) {
					setTeams(data.teams);

					// Check localStorage for previously selected team
					const storedTeamId = localStorage.getItem("selectedTeam");
					const teamFound = data.teams.find((team) => team._id === storedTeamId);

					if (storedTeamId && teamFound) {
						setCurrentTeam(teamFound);
					} else {
						// Default to first team
						setCurrentTeam(data.teams[0]);
						localStorage.setItem("selectedTeam", data.teams[0]._id);
					}
				}
			} catch (error) {
				console.error("Failed to fetch teams:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchTeams();
	}, [status]);

	const onCurrentTeamChange = useCallback((team) => {
		if (team) {
			setCurrentTeam(team);
			localStorage.setItem("selectedTeam", team._id);
		}
	}, []);

	// Refresh teams and optionally switch to a specific team
	const refreshTeams = useCallback(async (switchToTeamId = null) => {
		try {
			const response = await fetch("/api/team");
			const data = await response.json();

			if (data.success && data.teams.length > 0) {
				setTeams(data.teams);

				// If a specific team ID is provided, switch to it
				if (switchToTeamId) {
					const newTeam = data.teams.find((team) => team._id === switchToTeamId);
					if (newTeam) {
						setCurrentTeam(newTeam);
						localStorage.setItem("selectedTeam", newTeam._id);
					}
				}
			}
		} catch (error) {
			console.error("Failed to refresh teams:", error);
		}
	}, []);

	// Computed plan info from current team
	const planInfo = useMemo(() => getTeamPlanInfo(currentTeam), [currentTeam]);

	const contextValue = useMemo(
		() => ({
			teams,
			setTeams,
			currentTeam,
			setCurrentTeam: onCurrentTeamChange,
			onCurrentTeamChange,
			refreshTeams,
			loading,
			planInfo,
		}),
		[teams, currentTeam, onCurrentTeamChange, refreshTeams, loading, planInfo]
	);

	return <TeamContext.Provider value={contextValue}>{children}</TeamContext.Provider>;
}

export default TeamContextProvider;
