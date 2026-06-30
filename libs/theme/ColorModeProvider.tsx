import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createMaterialTheme } from '../../scss/MaterialTheme';

export type ColorMode = 'light' | 'dark';

interface ColorModeContextValue {
	mode: ColorMode;
	setMode: (mode: ColorMode) => void;
	toggleMode: () => void;
}

const STORAGE_KEY = 'gotrip-theme';

const ColorModeContext = createContext<ColorModeContextValue>({
	mode: 'light',
	setMode: () => undefined,
	toggleMode: () => undefined,
});

const isColorMode = (value: string | null): value is ColorMode => value === 'light' || value === 'dark';

const getSystemMode = (): ColorMode => {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialMode = (): ColorMode => {
	if (typeof window === 'undefined') return 'light';
	const stored = window.localStorage.getItem(STORAGE_KEY);
	return isColorMode(stored) ? stored : getSystemMode();
};

const applyDocumentMode = (mode: ColorMode) => {
	if (typeof document === 'undefined') return;
	document.documentElement.dataset.theme = mode;
	document.documentElement.style.colorScheme = mode;
};

export const ColorModeProvider = ({ children }: { children: React.ReactNode }) => {
	const [mode, setModeState] = useState<ColorMode>('light');

	useEffect(() => {
		const nextMode = getInitialMode();
		setModeState(nextMode);
		applyDocumentMode(nextMode);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (isColorMode(stored)) return;

		const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
		if (!mediaQuery) return;

		const handleSystemChange = (event: MediaQueryListEvent) => {
			const nextMode: ColorMode = event.matches ? 'dark' : 'light';
			setModeState(nextMode);
			applyDocumentMode(nextMode);
		};

		mediaQuery.addEventListener?.('change', handleSystemChange);
		return () => mediaQuery.removeEventListener?.('change', handleSystemChange);
	}, []);

	const setMode = useCallback((nextMode: ColorMode) => {
		setModeState(nextMode);
		applyDocumentMode(nextMode);
		if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, nextMode);
	}, []);

	const toggleMode = useCallback(() => {
		setMode(mode === 'dark' ? 'light' : 'dark');
	}, [mode, setMode]);

	const theme = useMemo(() => createTheme(createMaterialTheme(mode)), [mode]);
	const contextValue = useMemo(() => ({ mode, setMode, toggleMode }), [mode, setMode, toggleMode]);

	return (
		<ColorModeContext.Provider value={contextValue}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
};

export const useColorMode = () => useContext(ColorModeContext);
