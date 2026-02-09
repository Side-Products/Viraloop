import React, { createContext, useState, useContext } from "react";

const TrialModalContext = createContext();

export const TrialModalProvider = ({ children }) => {
	const [isTrialModalOpen, setTrialModalOpen] = useState(false);
	const [trialModalMessage, setTrialModalMessage] = useState("");

	const openTrialModal = (message = "") => {
		setTrialModalMessage(message);
		setTrialModalOpen(true);
	};

	const closeTrialModal = () => {
		setTrialModalOpen(false);
		setTrialModalMessage("");
	};

	return (
		<TrialModalContext.Provider value={{ isTrialModalOpen, setTrialModalOpen, openTrialModal, closeTrialModal, trialModalMessage }}>
			{children}
		</TrialModalContext.Provider>
	);
};

export const useTrialModal = () => useContext(TrialModalContext);
