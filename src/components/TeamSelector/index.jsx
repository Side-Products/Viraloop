import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { Check, ChevronsUpDown, Building2, PlusCircle, Loader2 } from "lucide-react";

const TeamSelector = ({ teams, currentTeam, onTeamChange, isLoading, id }) => {
	const router = useRouter();

	if (!teams?.length && !isLoading) return null;

	const handleCreateTeam = (e) => {
		e.preventDefault();
		e.stopPropagation();
		router.push("/settings/team?create=true");
	};

	return (
		<Listbox value={currentTeam} onChange={onTeamChange}>
			{({ open }) => (
				<div id={id} className="relative w-full">
					<Listbox.Button
						className={`
							relative w-full cursor-pointer rounded-lg bg-white py-2.5 pl-3 pr-10 text-left
							border border-neutral-200 hover:border-neutral-300 transition-all duration-200
							focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
							focus-visible:ring-offset-2 focus-visible:ring-offset-white
							${open ? "border-primary-500" : ""}
						`}
					>
						<div className="flex items-center gap-2">
							{isLoading ? (
								<Loader2 className="h-4 w-4 text-neutral-500 animate-spin" />
							) : (
								<Building2 className="h-4 w-4 text-neutral-500" />
							)}
							<span className="block truncate text-xs font-medium text-neutral-800">
								{isLoading ? "Loading teams..." : currentTeam?.name || "Select Team"}
							</span>
						</div>
						<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<ChevronsUpDown
								className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
								aria-hidden="true"
							/>
						</span>
					</Listbox.Button>

					<Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
						<Listbox.Options
							static
							className="absolute z-[1000] bottom-full mb-2 max-h-[280px] w-full overflow-auto rounded-lg bg-white
								border border-neutral-200 pb-1 shadow-lg focus:outline-none"
						>
							{/* Create New Team Button */}
							<div className="px-2 py-1.5 sticky top-0 z-10 bg-white border-b border-neutral-200">
								<button
									onClick={handleCreateTeam}
									className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-primary-500 hover:text-primary-600
										rounded-md hover:bg-neutral-100 transition-colors duration-200"
								>
									<PlusCircle className="h-4 w-4" />
									<span>Create New Team</span>
								</button>
							</div>

							{/* Team List */}
							<div className="py-1">
								{teams.map((team) => (
									<Listbox.Option
										key={team._id}
										value={team}
										className={({ active }) => `
											relative cursor-pointer select-none py-2 pl-8 pr-4 mx-1 rounded-md text-xs
											${active ? "bg-primary-500 text-white" : "text-neutral-700"}
											${currentTeam?._id === team._id && !active ? "bg-neutral-100" : ""}
										`}
									>
										{({ selected, active }) => (
											<>
												<span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{team.name}</span>
												{selected ? (
													<span
														className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
															active ? "text-white" : "text-primary-500"
														}`}
													>
														<Check className="h-4 w-4" aria-hidden="true" />
													</span>
												) : null}
												{team.role && (
													<span
														className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
															active ? "text-white/80" : "text-neutral-500"
														}`}
													>
														<span className="text-[10px]">{team.role}</span>
													</span>
												)}
											</>
										)}
									</Listbox.Option>
								))}
							</div>
						</Listbox.Options>
					</Transition>
				</div>
			)}
		</Listbox>
	);
};

export default TeamSelector;
