import React from 'react';
import { Stack } from '@mui/material';
import GoTripAIButton from './GoTripAIButton';
import GoTripAIWindow from './GoTripAIWindow';
import { GoTripAIProvider, useGoTripAI } from './GoTripAIProvider';

const GoTripAILauncher = () => {
	const { isOpen, toggleOpen } = useGoTripAI();
	return <GoTripAIButton isOpen={isOpen} onToggle={toggleOpen} />;
};

/**
 * Single mount point for the whole GoTrip AI experience — replaces the old
 * `<Chat />` floating "Online Chat" widget everywhere it was rendered.
 * GoTripAIProvider calls the shared state hook exactly once so the launcher
 * and the window (siblings here) always agree on open/closed state,
 * conversation history, etc.
 */
const GoTripAI = () => {
	return (
		<GoTripAIProvider>
			<Stack className="gt-ai-root" component="div">
				<GoTripAILauncher />
				<GoTripAIWindow />
			</Stack>
		</GoTripAIProvider>
	);
};

export default GoTripAI;
