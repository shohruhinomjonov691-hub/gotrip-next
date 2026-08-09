import React, { createContext, useContext } from 'react';
import { useGoTripAIState, GoTripAIStateValue } from './useGoTripAI';

const GoTripAIContext = createContext<GoTripAIStateValue | null>(null);

/** Calls useGoTripAIState exactly once and shares it via context, so the launcher button and the window (mounted as siblings) always agree on open/closed, active conversation, etc. */
export const GoTripAIProvider = ({ children }: { children: React.ReactNode }) => {
	const state = useGoTripAIState();
	return <GoTripAIContext.Provider value={state}>{children}</GoTripAIContext.Provider>;
};

/** The hook every GoTripAI component actually calls. Must be used inside <GoTripAIProvider>. */
export const useGoTripAI = (): GoTripAIStateValue => {
	const ctx = useContext(GoTripAIContext);
	if (!ctx) throw new Error('useGoTripAI must be used within a GoTripAIProvider');
	return ctx;
};

export default GoTripAIProvider;
